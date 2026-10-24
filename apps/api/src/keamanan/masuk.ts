/**
 * Proses masuk dengan pembatasan percobaan (KB-041): 5 kegagalan beruntun mengunci akun 15 menit.
 * Semua kejadian dicatat di log audit; kata sandi tidak pernah dicatat. Pesan galat sama untuk
 * pengguna tak dikenal dan sandi salah (mencegah penelusuran nama pengguna).
 */
import { eq } from 'drizzle-orm';
import { catatAudit } from '../db/audit.js';
import type { Db } from '../db/klien.js';
import { hashSandi, periksaSandi } from '../db/sandi.js';
import { pengguna } from '../db/schema.js';
import { buatSesi, type Akun } from './sesi.js';
import { izinPeran } from './sesi.js';

export const MAKS_GAGAL = 5;
export const KUNCI_MENIT = 15;

let hashPalsu: Promise<string> | undefined;
const ambilHashPalsu = () => (hashPalsu ??= hashSandi('hash-palsu-agar-waktu-sama'));

export interface PermintaanMasuk {
  username: string;
  sandi: string;
  ip?: string | undefined;
  agen?: string | undefined;
  reqId?: string | undefined;
  sekarang?: Date;
}

export type HasilMasuk =
  | { ok: true; token: string; kedaluwarsa: Date; akun: Akun; izin: string[] }
  | { ok: false; kode: 'kredensial_salah' | 'terkunci'; terkunciSampai?: Date };

export async function masuk(db: Db, p: PermintaanMasuk): Promise<HasilMasuk> {
  const sekarang = p.sekarang ?? new Date();
  const [akun] = await db.select().from(pengguna).where(eq(pengguna.username, p.username));
  const konteks = {
    ...(p.reqId ? { reqId: p.reqId } : {}),
    ...(p.ip ? { ip: p.ip } : {}),
  };

  if (akun?.terkunciSampai && akun.terkunciSampai > sekarang) {
    await periksaSandi(p.sandi, await ambilHashPalsu());
    await catatAudit(db, {
      aktor: p.username,
      aksi: 'masuk.ditolak_terkunci',
      entitas: 'pengguna',
      entitasId: p.username,
      ...konteks,
    });
    return { ok: false, kode: 'terkunci', terkunciSampai: akun.terkunciSampai };
  }

  const cocok = await periksaSandi(p.sandi, akun?.hashSandi ?? (await ambilHashPalsu()));
  if (!akun || !akun.aktif || !akun.hashSandi || !cocok) {
    if (akun) {
      const gagal = akun.gagalMasuk + 1;
      const kunci = gagal >= MAKS_GAGAL;
      await db
        .update(pengguna)
        .set({
          gagalMasuk: kunci ? 0 : gagal,
          terkunciSampai: kunci ? new Date(sekarang.getTime() + KUNCI_MENIT * 60_000) : null,
        })
        .where(eq(pengguna.id, akun.id));
      await catatAudit(db, {
        aktor: p.username,
        aksi: kunci ? 'masuk.terkunci' : 'masuk.gagal',
        entitas: 'pengguna',
        entitasId: akun.id,
        sesudah: { gagalBeruntun: gagal },
        ...konteks,
      });
    } else {
      await catatAudit(db, {
        aktor: p.username,
        aksi: 'masuk.gagal_tak_dikenal',
        entitas: 'pengguna',
        ...konteks,
      });
    }
    return { ok: false, kode: 'kredensial_salah' };
  }

  await db
    .update(pengguna)
    .set({ gagalMasuk: 0, terkunciSampai: null })
    .where(eq(pengguna.id, akun.id));
  const { token, kedaluwarsa } = await buatSesi(db, akun.id, {
    ip: p.ip,
    agen: p.agen,
    sekarang,
  });
  await catatAudit(db, {
    aktor: akun.username,
    aktorPeran: akun.peran,
    aksi: 'masuk.berhasil',
    entitas: 'pengguna',
    entitasId: akun.id,
    ...konteks,
  });
  const izin = [...(await izinPeran(db, akun.peran))].sort();
  return {
    ok: true,
    token,
    kedaluwarsa,
    akun: {
      id: akun.id,
      username: akun.username,
      nama: akun.nama,
      peran: akun.peran,
      pejabatId: akun.pejabatId,
    },
    izin,
  };
}
