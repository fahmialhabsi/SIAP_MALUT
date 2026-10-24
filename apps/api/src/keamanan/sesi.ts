/**
 * Sesi masuk: token acak dikirim lewat kuki httpOnly; yang disimpan hanya hash SHA-256 token (tabel sesi).
 * Pengguna efektif = persona demo bila admin sedang berpindah tampilan (hanya mode demo), selain itu akun asli.
 */
import { createHash, randomBytes } from 'node:crypto';
import { and, eq, gt } from 'drizzle-orm';
import type { Db } from '../db/klien.js';
import { pengguna, peranIzin, sesi } from '../db/schema.js';
import { adalahIzin, type Izin } from './izin.js';

export const NAMA_KUKI = 'siap_sesi';
export const TTL_SESI_JAM = 12;

export interface Akun {
  id: string;
  username: string;
  nama: string;
  peran: string;
  pejabatId: string | null;
}

export interface PenggunaAktif {
  /** Akun yang masuk (nyata). */
  asli: Akun;
  /** Akun yang dipakai untuk hak akses: persona demo bila ada, selain itu sama dengan asli. */
  efektif: Akun;
  izin: ReadonlySet<Izin>;
  /** Izin akun asli (dipakai untuk fitur demo agar admin dapat kembali dari persona). */
  izinAsli: ReadonlySet<Izin>;
  idHashSesi: string;
  sebagaiPersona: boolean;
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function buatToken(): string {
  return randomBytes(32).toString('base64url');
}

export async function izinPeran(db: Pick<Db, 'select'>, peran: string): Promise<Set<Izin>> {
  const baris = await db
    .select({ izin: peranIzin.izin })
    .from(peranIzin)
    .where(eq(peranIzin.peran, peran));
  return new Set(baris.map((b) => b.izin).filter(adalahIzin));
}

const kolomAkun = {
  id: pengguna.id,
  username: pengguna.username,
  nama: pengguna.nama,
  peran: pengguna.peran,
  pejabatId: pengguna.pejabatId,
  aktif: pengguna.aktif,
};

export async function buatSesi(
  db: Pick<Db, 'insert'>,
  penggunaId: string,
  opsi: {
    ip?: string | undefined;
    agen?: string | undefined;
    sekarang?: Date;
    ttlJam?: number;
  } = {},
): Promise<{ token: string; kedaluwarsa: Date }> {
  const token = buatToken();
  const sekarang = opsi.sekarang ?? new Date();
  const kedaluwarsa = new Date(sekarang.getTime() + (opsi.ttlJam ?? TTL_SESI_JAM) * 3_600_000);
  await db.insert(sesi).values({
    idHash: hashToken(token),
    penggunaId,
    kedaluwarsa,
    ip: opsi.ip ?? null,
    agen: opsi.agen?.slice(0, 200) ?? null,
  });
  return { token, kedaluwarsa };
}

/** Mencari sesi yang masih berlaku beserta pengguna dan izinnya. `null` bila tidak sah. */
export async function cariSesi(
  db: Db,
  token: string,
  sekarang: Date = new Date(),
): Promise<PenggunaAktif | null> {
  const idHash = hashToken(token);
  const [baris] = await db
    .select({ penggunaId: sesi.penggunaId, personaId: sesi.personaId })
    .from(sesi)
    .where(and(eq(sesi.idHash, idHash), gt(sesi.kedaluwarsa, sekarang)));
  if (!baris) return null;

  const [asli] = await db.select(kolomAkun).from(pengguna).where(eq(pengguna.id, baris.penggunaId));
  if (!asli || !asli.aktif) return null;

  let efektif = asli;
  if (baris.personaId) {
    const [persona] = await db
      .select(kolomAkun)
      .from(pengguna)
      .where(eq(pengguna.id, baris.personaId));
    if (persona?.aktif) efektif = persona;
  }
  const ringkas = ({ aktif: _aktif, ...sisa }: typeof asli): Akun => sisa;
  const izinAsli = await izinPeran(db, asli.peran);
  return {
    asli: ringkas(asli),
    efektif: ringkas(efektif),
    izin: efektif === asli ? izinAsli : await izinPeran(db, efektif.peran),
    izinAsli,
    idHashSesi: idHash,
    sebagaiPersona: efektif !== asli,
  };
}

export async function hapusSesi(db: Pick<Db, 'delete'>, idHash: string): Promise<void> {
  await db.delete(sesi).where(eq(sesi.idHash, idHash));
}

export async function aturPersona(
  db: Pick<Db, 'update'>,
  idHash: string,
  personaId: string | null,
): Promise<void> {
  await db.update(sesi).set({ personaId }).where(eq(sesi.idHash, idHash));
}
