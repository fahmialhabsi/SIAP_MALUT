/**
 * Seed data contoh (fiktif) dari data/contoh/ (STANDAR_DATA_CONTOH.md). Semua baris berpenanda is_contoh = true.
 * Idempoten: tidak melakukan apa pun bila direktori pejabat sudah terisi.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { eq, sql } from 'drizzle-orm';
import { catatAudit } from './audit.js';
import type { Db } from './klien.js';
import { hashSandi, buatSandiAcak } from './sandi.js';
import { kegiatan, kegiatanPihak, pejabat, pengaturan, pengguna } from './schema.js';

/** Folder data contoh bawaan (relatif terhadap apps/api/src|dist/db). */
export const FOLDER_CONTOH_BAWAAN = fileURLToPath(
  new URL('../../../../data/contoh/', import.meta.url),
);

interface BerkasAgenda {
  pihak: Record<string, { nama: string; golongan: string }>;
  kegiatan: {
    id: string;
    judul: string;
    mulai: string;
    selesai?: string;
    lokasi?: { nama: string; pulau?: string };
    status: string;
    pihak: { id: string; kedudukan: string; peran?: string }[];
  }[];
}
interface BerkasPengguna {
  pengguna: { username: string; nama: string; peran: string; pejabatId?: string }[];
}

export interface OpsiSeed {
  folderContoh?: string;
  /** Kata sandi admin.owner (dari lingkungan). Kosong = dibuat acak. */
  sandiAdmin?: string | undefined;
}

export interface HasilSeed {
  dibuat: boolean;
  /** Hanya terisi bila kata sandi dibuat acak; tampilkan sekali, jangan disimpan. */
  sandiAdminSementara?: string;
  jumlah?: { pejabat: number; pengguna: number; kegiatan: number; kegiatanPihak: number };
}

const baca = <T>(folder: string, nama: string): T =>
  JSON.parse(readFileSync(join(folder, nama), 'utf8')) as T;

export async function sudahTerisi(db: Pick<Db, 'select'>): Promise<boolean> {
  const [baris] = await db.select({ n: sql<number>`count(*)::int` }).from(pejabat);
  return (baris?.n ?? 0) > 0;
}

export async function isiDataContoh(db: Db, opsi: OpsiSeed = {}): Promise<HasilSeed> {
  if (await sudahTerisi(db)) return { dibuat: false };

  const folder = opsi.folderContoh ?? FOLDER_CONTOH_BAWAAN;
  const agenda = baca<BerkasAgenda>(folder, 'agenda-uji.json');
  const akun = baca<BerkasPengguna>(folder, 'pengguna.json');
  const aturan = baca<{ durasiBawaanMenit: number }>(folder, 'aturan-awal.json');

  const sandiAdmin =
    opsi.sandiAdmin && opsi.sandiAdmin.length > 0 ? opsi.sandiAdmin : buatSandiAcak();
  const acak = !opsi.sandiAdmin;
  const hashAdmin = await hashSandi(sandiAdmin);

  const hasil = await db.transaction(async (tx) => {
    const daftarPejabat = Object.entries(agenda.pihak).map(([id, p], i) => ({
      id,
      nama: p.nama,
      golongan: p.golongan,
      jabatan: p.nama.replace(/\s*\(CONTOH\)\s*$/, ''),
      instansi: 'Instansi Contoh',
      urutanTataTempat: i + 1,
      isContoh: true,
    }));
    await tx.insert(pejabat).values(daftarPejabat);

    const daftarPengguna = akun.pengguna.map((u) => ({
      id: u.username,
      username: u.username,
      nama: u.nama,
      peran: u.peran,
      pejabatId: u.pejabatId ?? null,
      hashSandi: u.username === 'admin.owner' ? hashAdmin : null,
      isContoh: true,
    }));
    await tx.insert(pengguna).values(daftarPengguna);

    await tx.insert(kegiatan).values(
      agenda.kegiatan.map((k) => ({
        id: k.id,
        judul: k.judul,
        mulai: new Date(k.mulai),
        selesai: k.selesai ? new Date(k.selesai) : null,
        lokasiNama: k.lokasi?.nama ?? null,
        lokasiPulau: k.lokasi?.pulau ?? null,
        status: k.status,
        isContoh: true,
      })),
    );
    const daftarPihak = agenda.kegiatan.flatMap((k) =>
      k.pihak.map((p) => ({
        kegiatanId: k.id,
        pihakId: p.id,
        kedudukan: p.kedudukan,
        peran: p.peran ?? null,
      })),
    );
    await tx.insert(kegiatanPihak).values(daftarPihak);

    await tx
      .insert(pengaturan)
      .values({ kunci: 'durasiBawaanMenit', nilai: aturan.durasiBawaanMenit as never })
      .onConflictDoNothing();

    await catatAudit(tx, {
      aktor: 'sistem',
      aksi: 'seed.data_contoh',
      entitas: 'basis_data',
      sesudah: {
        pejabat: daftarPejabat.length,
        pengguna: daftarPengguna.length,
        kegiatan: agenda.kegiatan.length,
        kegiatanPihak: daftarPihak.length,
      },
    });

    return {
      pejabat: daftarPejabat.length,
      pengguna: daftarPengguna.length,
      kegiatan: agenda.kegiatan.length,
      kegiatanPihak: daftarPihak.length,
    };
  });

  return {
    dibuat: true,
    ...(acak ? { sandiAdminSementara: sandiAdmin } : {}),
    jumlah: hasil,
  };
}

/** Mengatur ulang kata sandi admin.owner (CLI). Mengembalikan sandi sementara bila dibuat acak. */
export async function aturSandiAdmin(db: Db, sandi?: string): Promise<{ sandiSementara?: string }> {
  const baru = sandi && sandi.length > 0 ? sandi : buatSandiAcak();
  const hash = await hashSandi(baru);
  const diperbarui = await db
    .update(pengguna)
    .set({ hashSandi: hash, gagalMasuk: 0, terkunciSampai: null })
    .where(eq(pengguna.username, 'admin.owner'))
    .returning({ id: pengguna.id });
  if (diperbarui.length === 0)
    throw new Error('Akun admin.owner belum ada (jalankan seed lebih dulu).');
  await catatAudit(db, {
    aktor: 'cli',
    aksi: 'admin.atur_sandi',
    entitas: 'pengguna',
    entitasId: 'admin.owner',
  });
  return sandi && sandi.length > 0 ? {} : { sandiSementara: baru };
}
