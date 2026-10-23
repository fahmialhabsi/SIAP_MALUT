/**
 * Pembantu uji basis data. Uji berjalan pada PGlite (memori) selalu, dan pada PostgreSQL asli bila
 * SIAP_TEST_DATABASE_URL diisi (mis. postgres://siap:xxx@localhost:54329/siap_uji). Basis data PostgreSQL uji
 * DIKOSONGKAN setiap uji; jangan diarahkan ke basis data berisi data penting.
 */
import { sql } from 'drizzle-orm';
import { bukaDatabase, type JenisDb, type Koneksi } from './klien.js';
import { isiDataContoh, type HasilSeed } from './seed.js';

export const URL_PG_UJI = process.env.SIAP_TEST_DATABASE_URL;
export const JENIS_UJI: JenisDb[] = URL_PG_UJI ? ['pglite', 'postgres'] : ['pglite'];

export async function bukaDbUji(
  jenis: JenisDb,
  opsi: { migrasi?: boolean; seed?: boolean } = {},
): Promise<{ koneksi: Koneksi; hasilSeed?: HasilSeed }> {
  const koneksi = await bukaDatabase(jenis === 'postgres' ? { databaseUrl: URL_PG_UJI } : {});
  if (jenis === 'postgres') {
    await koneksi.db.execute(sql`DROP SCHEMA IF EXISTS drizzle CASCADE`);
    await koneksi.db.execute(sql`DROP SCHEMA IF EXISTS public CASCADE`);
    await koneksi.db.execute(sql`CREATE SCHEMA public`);
  }
  const { migrasi = true, seed = false } = opsi;
  if (migrasi) await koneksi.migrasi();
  const hasilSeed = seed ? await isiDataContoh(koneksi.db) : undefined;
  return { koneksi, ...(hasilSeed ? { hasilSeed } : {}) };
}

/** Menggabungkan pesan galat beserta penyebabnya (galat Drizzle membungkus galat basis data). */
export function pesanGalat(e: unknown): string {
  const bagian: string[] = [];
  let sekarang: unknown = e;
  for (let i = 0; i < 5 && sekarang; i++) {
    if (sekarang instanceof Error) {
      bagian.push(sekarang.message);
      sekarang = (sekarang as Error & { cause?: unknown }).cause;
    } else {
      bagian.push(String(sekarang));
      break;
    }
  }
  return bagian.join(' | ');
}

const bersama = new Map<JenisDb, Koneksi>();

/**
 * Instance basis data yang dipakai bersama dalam satu berkas uji (pembuatan PGlite + migrasi mahal).
 * Tiap pemanggilan mengosongkan tabel bisnis (log_audit tidak dapat dikosongkan: append-only, uji memakai selisih)
 * lalu mengisi data contoh bila `seed` benar.
 */
export async function siapkanBersama(jenis: JenisDb, seed = true): Promise<Koneksi> {
  let koneksi = bersama.get(jenis);
  if (!koneksi) {
    koneksi = (await bukaDbUji(jenis)).koneksi;
    bersama.set(jenis, koneksi);
  }
  await koneksi.db.execute(
    sql`TRUNCATE kegiatan_pihak, lampiran, sesi, kegiatan, pengguna, pejabat, pengaturan, peran_izin RESTART IDENTITY CASCADE`,
  );
  if (seed) await isiDataContoh(koneksi.db);
  return koneksi;
}

export async function tutupSemua(): Promise<void> {
  for (const k of bersama.values()) await k.tutup();
  bersama.clear();
}
