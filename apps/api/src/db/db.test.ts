import { sql } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';
import { catatAudit, hitungAudit } from './audit.js';
import { ambilPengaturan, simpanPengaturan } from './pengaturan.js';
import { hitungDataContoh, jagaProduksi } from './penjaga-db.js';
import { aturSandiAdmin, isiDataContoh } from './seed.js';
import { kegiatan, kegiatanPihak, logAudit, pejabat, pengguna } from './schema.js';
import { periksaSandi } from './sandi.js';
import { JENIS_UJI, pesanGalat, siapkanBersama, tutupSemua } from './uji-db.helper.js';
import { DataContohDiProduksiError } from '../penjaga.js';

afterAll(tutupSemua);
async function siapkan(jenis: (typeof JENIS_UJI)[number], seed = false) {
  const koneksi = await siapkanBersama(jenis, seed);
  return { koneksi };
}

describe.each(JENIS_UJI)('basis data (%s)', (jenis) => {
  it('KB-030: migrasi dari kosong membuat sembilan tabel dan dapat diulang', async () => {
    const { koneksi } = await siapkan(jenis);
    await koneksi.migrasi();
    const hasil = await koneksi.db.execute<{ table_name: string }>(
      sql`select table_name from information_schema.tables where table_schema = 'public' order by 1`,
    );
    const baris = (Array.isArray(hasil) ? hasil : hasil.rows) as { table_name: string }[];
    expect(baris.map((b) => b.table_name)).toEqual([
      'kegiatan',
      'kegiatan_pihak',
      'lampiran',
      'log_audit',
      'pejabat',
      'pengaturan',
      'pengguna',
      'peran_izin',
      'sesi',
    ]);
    expect(await koneksi.sehat()).toBe(true);
  });

  it('KB-031: seed membuat data contoh lengkap dan semuanya berpenanda is_contoh', async () => {
    const { koneksi } = await siapkan(jenis);
    const hasilSeed = await isiDataContoh(koneksi.db);
    expect(hasilSeed.dibuat).toBe(true);
    expect(hasilSeed.jumlah).toEqual({
      pejabat: 11,
      pengguna: 13,
      kegiatan: 14,
      kegiatanPihak: 28,
    });
    const db = koneksi.db;
    for (const tabel of [pejabat, pengguna, kegiatan]) {
      const [semua] = await db.select({ n: sql<number>`count(*)::int` }).from(tabel);
      const [contoh] = await db
        .select({ n: sql<number>`count(*) filter (where ${tabel.isContoh})::int` })
        .from(tabel);
      expect(contoh?.n).toBe(semua?.n);
    }
    const [pihak] = await db.select({ n: sql<number>`count(*)::int` }).from(kegiatanPihak);
    expect(pihak?.n).toBe(28);
  });

  it('KB-031: semua nama pada data contoh berlabel (CONTOH)', async () => {
    const { koneksi } = await siapkan(jenis, true);
    const orang = await koneksi.db.select({ nama: pejabat.nama }).from(pejabat);
    const akun = await koneksi.db.select({ nama: pengguna.nama }).from(pengguna);
    for (const { nama } of [...orang, ...akun]) expect(nama.endsWith('(CONTOH)')).toBe(true);
  });

  it('KB-031: seed idempoten (kedua kali tidak mengubah apa pun)', async () => {
    const { koneksi } = await siapkan(jenis, true);
    const lagi = await isiDataContoh(koneksi.db);
    expect(lagi.dibuat).toBe(false);
    expect(await hitungDataContoh(koneksi.db)).toBe(11 + 13 + 14);
  });

  it('KB-041: kata sandi admin.owner acak muncul sekali dan cocok dengan hash; persona tanpa sandi', async () => {
    const { koneksi } = await siapkan(jenis);
    const hasilSeed = await isiDataContoh(koneksi.db);
    const sandi = hasilSeed.sandiAdminSementara;
    expect(sandi).toBeTruthy();
    const akun = await koneksi.db.select().from(pengguna);
    const admin = akun.find((a) => a.username === 'admin.owner');
    expect(await periksaSandi(sandi ?? '', admin?.hashSandi)).toBe(true);
    expect(
      akun.filter((a) => a.username !== 'admin.owner').every((a) => a.hashSandi === null),
    ).toBe(true);
    expect(JSON.stringify(await koneksi.db.select().from(logAudit))).not.toContain(sandi ?? 'x');
  });

  it('KB-041: kata sandi admin dari lingkungan dipakai dan tidak dikembalikan', async () => {
    const { koneksi } = await siapkan(jenis);
    const hasil = await isiDataContoh(koneksi.db, { sandiAdmin: 'sandi-dari-lingkungan-1' });
    expect(hasil.sandiAdminSementara).toBeUndefined();
    const [admin] = await koneksi.db.select().from(pengguna);
    const akun = (await koneksi.db.select().from(pengguna)).find(
      (a) => a.username === 'admin.owner',
    );
    expect(admin).toBeDefined();
    expect(await periksaSandi('sandi-dari-lingkungan-1', akun?.hashSandi)).toBe(true);
  });

  it('KB-041: atur ulang sandi admin berhasil dan tercatat di log audit', async () => {
    const { koneksi } = await siapkan(jenis, true);
    const hasil = await aturSandiAdmin(koneksi.db, 'sandi-baru-panjang-123');
    expect(hasil.sandiSementara).toBeUndefined();
    const akun = (await koneksi.db.select().from(pengguna)).find(
      (a) => a.username === 'admin.owner',
    );
    expect(await periksaSandi('sandi-baru-panjang-123', akun?.hashSandi)).toBe(true);
    const audit = await koneksi.db.select().from(logAudit);
    expect(audit.some((a) => a.aksi === 'admin.atur_sandi')).toBe(true);
  });
});

describe.each(JENIS_UJI)('log audit append-only (%s)', (jenis) => {
  it('KB-044: INSERT diperbolehkan', async () => {
    const { koneksi } = await siapkan(jenis);
    const awal = await hitungAudit(koneksi.db);
    await catatAudit(koneksi.db, { aktor: 'uji', aksi: 'uji.satu', entitas: 'x', entitasId: '1' });
    await catatAudit(koneksi.db, { aktor: 'uji', aksi: 'uji.dua' });
    expect(await hitungAudit(koneksi.db)).toBe(awal + 2);
  });

  it('KB-044: UPDATE ditolak basis data', async () => {
    const { koneksi } = await siapkan(jenis);
    await catatAudit(koneksi.db, { aktor: 'uji', aksi: 'uji.satu' });
    await expect(
      koneksi.db.execute(sql`update log_audit set aktor = 'penyusup'`),
    ).rejects.toSatisfy((e: unknown) => pesanGalat(e).includes('append-only'));
  });

  it('KB-044: DELETE ditolak basis data', async () => {
    const { koneksi } = await siapkan(jenis);
    await catatAudit(koneksi.db, { aktor: 'uji', aksi: 'uji.satu' });
    const awal = await hitungAudit(koneksi.db);
    await expect(koneksi.db.execute(sql`delete from log_audit`)).rejects.toSatisfy((e: unknown) =>
      pesanGalat(e).includes('append-only'),
    );
    expect(await hitungAudit(koneksi.db)).toBe(awal);
  });

  it('KB-044: TRUNCATE ditolak basis data', async () => {
    const { koneksi } = await siapkan(jenis);
    await catatAudit(koneksi.db, { aktor: 'uji', aksi: 'uji.satu' });
    const awal = await hitungAudit(koneksi.db);
    await expect(koneksi.db.execute(sql`truncate log_audit`)).rejects.toSatisfy((e: unknown) =>
      pesanGalat(e).includes('append-only'),
    );
    expect(await hitungAudit(koneksi.db)).toBe(awal);
  });
});

describe.each(JENIS_UJI)('penjaga produksi pada basis data (%s)', (jenis) => {
  it('KB-034: production menolak start bila ada data contoh', async () => {
    const { koneksi } = await siapkan(jenis, true);
    await expect(jagaProduksi(koneksi.db, 'production')).rejects.toThrow(DataContohDiProduksiError);
    await expect(jagaProduksi(koneksi.db, 'production')).rejects.toThrow(/38 data contoh/);
  });

  it('KB-034: demo boleh memuat data contoh', async () => {
    const { koneksi } = await siapkan(jenis, true);
    expect(await jagaProduksi(koneksi.db, 'demo')).toBe(38);
  });

  it('KB-034: production pada basis data tanpa data contoh diizinkan', async () => {
    const { koneksi } = await siapkan(jenis);
    expect(await jagaProduksi(koneksi.db, 'production')).toBe(0);
  });
});

describe.each(JENIS_UJI)('pengaturan dan batasan data (%s)', (jenis) => {
  it('KB-039: durasi bawaan 120 menit (bawaan kode saat belum diatur, dan dari seed)', async () => {
    const kosong = await siapkan(jenis);
    expect(await ambilPengaturan(kosong.koneksi.db, 'durasiBawaanMenit')).toBe(120);
    const terisi = await siapkan(jenis, true);
    expect(await ambilPengaturan(terisi.koneksi.db, 'durasiBawaanMenit')).toBe(120);
  });

  it('KB-036: pengaturan dapat diubah admin (disimpan sebagai data)', async () => {
    const { koneksi } = await siapkan(jenis, true);
    await simpanPengaturan(koneksi.db, 'durasiBawaanMenit', 180);
    expect(await ambilPengaturan(koneksi.db, 'durasiBawaanMenit')).toBe(180);
  });

  it('KB-001: status kegiatan tidak sah ditolak oleh basis data', async () => {
    const { koneksi } = await siapkan(jenis);
    await expect(
      koneksi.db
        .insert(kegiatan)
        .values({ id: 'X', judul: 'x', mulai: new Date(), status: 'rahasia' }),
    ).rejects.toSatisfy((e: unknown) => pesanGalat(e).includes('kegiatan_status_sah'));
  });

  it('KB-001: waktu selesai tidak boleh sebelum mulai', async () => {
    const { koneksi } = await siapkan(jenis);
    const mulai = new Date('2026-10-24T11:00:00Z');
    await expect(
      koneksi.db.insert(kegiatan).values({
        id: 'X',
        judul: 'x',
        mulai,
        selesai: new Date(mulai.getTime() - 60_000),
      }),
    ).rejects.toSatisfy((e: unknown) => pesanGalat(e).includes('kegiatan_selesai_setelah_mulai'));
  });

  it('KB-001: kedudukan pihak tidak sah ditolak', async () => {
    const { koneksi } = await siapkan(jenis, true);
    await expect(
      koneksi.db
        .insert(kegiatanPihak)
        .values({ kegiatanId: 'K22-01', pihakId: 'sekda', kedudukan: 'entah' }),
    ).rejects.toSatisfy((e: unknown) => pesanGalat(e).includes('kegiatan_pihak_kedudukan_sah'));
  });
});
