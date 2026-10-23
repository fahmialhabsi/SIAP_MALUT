import { afterAll, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { daftarAudit, hitungAudit } from '../db/audit.js';
import { simpanPengaturan } from '../db/pengaturan.js';
import { kegiatan } from '../db/schema.js';
import { JENIS_UJI, siapkanBersama, tutupSemua } from '../db/uji-db.helper.js';
import { bentrokAgenda, muatKegiatan, pindahStatusKegiatan } from './kegiatan.js';

afterAll(tutupSemua);
async function siapkan(jenis: (typeof JENIS_UJI)[number]) {
  return (await siapkanBersama(jenis, true)).db;
}
const WAKTU = new Date('2026-10-23T05:00:00Z'); // 14.00 WIT

async function statusDb(db: Awaited<ReturnType<typeof siapkan>>, id: string) {
  const [baris] = await db.select({ s: kegiatan.status }).from(kegiatan).where(eq(kegiatan.id, id));
  return baris?.s;
}

describe.each(JENIS_UJI)('layanan kegiatan (%s)', (jenis) => {
  it('KB-008: memuat model domain dari basis data dengan waktu WIT dan pihak lengkap', async () => {
    const db = await siapkan(jenis);
    const semua = await muatKegiatan(db);
    expect(semua).toHaveLength(14);
    const k = semua.find((x) => x.id === 'K24-03');
    expect(k).toMatchObject({
      mulai: '2026-10-24T20:00:00+09:00',
      status: 'ditetapkan',
      lokasi: { nama: 'Lokasi Contoh F', pulau: 'Halmahera' },
    });
    expect(k?.pihak).toEqual([
      {
        id: 'wagub',
        nama: 'Wakil Gubernur (CONTOH)',
        golongan: 'pimpinan',
        kedudukan: 'ditugaskan',
        peran: 'utama',
      },
    ]);
    expect(semua.find((x) => x.id === 'K24-01')?.selesai).toBe('2026-10-24T20:00:00+09:00');
  });

  it('KB-008: bentrok dari basis data sama dengan uji domain (22 Okt: 0, 24 Okt: 1, 26 Okt: 13, total 14)', async () => {
    const db = await siapkan(jenis);
    expect(await bentrokAgenda(db, '2026-10-22')).toHaveLength(0);
    expect(await bentrokAgenda(db, '2026-10-24')).toHaveLength(1);
    expect(await bentrokAgenda(db, '2026-10-26')).toHaveLength(13);
    expect(await bentrokAgenda(db)).toHaveLength(14);
  });

  it('KB-039: durasi dari pengaturan basis data mengubah hasil (3 jam: 22 Okt bentrok pasti Wagub)', async () => {
    const db = await siapkan(jenis);
    await simpanPengaturan(db, 'durasiBawaanMenit', 180);
    const hasil = await bentrokAgenda(db, '2026-10-22');
    expect(hasil).toHaveLength(1);
    expect(hasil[0]).toMatchObject({ pihakId: 'wagub', kepastian: 'pasti' });
  });
});

describe.each(JENIS_UJI)('pindah status tersimpan (%s)', (jenis) => {
  it('KB-016: perpindahan sah menyimpan status dan mencatat peristiwa di log audit', async () => {
    const db = await siapkan(jenis);
    const sebelum = await hitungAudit(db);
    const hasil = await pindahStatusKegiatan(db, {
      kegiatanId: 'K22-05',
      ke: 'ditetapkan',
      oleh: 'demo.kabag-protokol',
      aktorPeran: 'kabag_protokol',
      reqId: 'req-1',
      sekarang: WAKTU,
    });
    expect(hasil.ok).toBe(true);
    expect(await statusDb(db, 'K22-05')).toBe('ditetapkan');
    expect(await hitungAudit(db)).toBe(sebelum + 1);
    const [terbaru] = await daftarAudit(db, 1);
    expect(terbaru).toMatchObject({
      aktor: 'demo.kabag-protokol',
      aktorPeran: 'kabag_protokol',
      aksi: 'kegiatan.pindah_status',
      entitas: 'kegiatan',
      entitasId: 'K22-05',
      reqId: 'req-1',
      sebelum: { status: 'terkonfirmasi' },
    });
    expect(terbaru?.sesudah).toMatchObject({
      status: 'ditetapkan',
      peristiwa: { dari: 'terkonfirmasi', ke: 'ditetapkan', waktu: '2026-10-23T14:00:00+09:00' },
    });
  });

  it('KB-004: perpindahan tidak sah ditolak; status dan log tidak berubah', async () => {
    const db = await siapkan(jenis);
    const sebelum = await hitungAudit(db);
    const hasil = await pindahStatusKegiatan(db, {
      kegiatanId: 'K24-02',
      ke: 'terkonfirmasi',
      oleh: 'uji',
      sekarang: WAKTU,
    });
    expect(hasil).toMatchObject({ ok: false, kode: 'ditolak' });
    expect(await statusDb(db, 'K24-02')).toBe('menunggu_arahan');
    expect(await hitungAudit(db)).toBe(sebelum);
  });

  it('KB-004: ditetapkan tanpa pihak ditugaskan ditolak (semua masih diundang)', async () => {
    const db = await siapkan(jenis);
    const hasil = await pindahStatusKegiatan(db, {
      kegiatanId: 'K24-02',
      ke: 'ditetapkan',
      oleh: 'uji',
      sekarang: WAKTU,
    });
    expect(hasil.ok).toBe(false);
    expect(await statusDb(db, 'K24-02')).toBe('menunggu_arahan');
  });

  it('KB-038: bentrok pasti tanpa alasan ditolak; dengan alasan disimpan dan tercatat', async () => {
    const db = await siapkan(jenis);
    await simpanPengaturan(db, 'durasiBawaanMenit', 180); // K22-01 dan K22-05 (Wagub) menjadi bentrok pasti
    const tanpa = await pindahStatusKegiatan(db, {
      kegiatanId: 'K22-05',
      ke: 'ditetapkan',
      oleh: 'uji',
      sekarang: WAKTU,
    });
    expect(tanpa.ok).toBe(false);
    if (!tanpa.ok) expect(tanpa.alasan.join(' ')).toContain('bentrok pasti');
    expect(await statusDb(db, 'K22-05')).toBe('terkonfirmasi');

    const dengan = await pindahStatusKegiatan(db, {
      kegiatanId: 'K22-05',
      ke: 'ditetapkan',
      oleh: 'demo.sekda',
      alasanBentrok: 'Arahan Gubernur: acara pangan murah dimajukan',
      sekarang: WAKTU,
    });
    expect(dengan.ok).toBe(true);
    expect(await statusDb(db, 'K22-05')).toBe('ditetapkan');
    const [terbaru] = await daftarAudit(db, 1);
    expect(JSON.stringify(terbaru?.sesudah)).toContain(
      'Arahan Gubernur: acara pangan murah dimajukan',
    );
  });

  it('KB-004: ditunda wajib beralasan dan alasan tersimpan di log', async () => {
    const db = await siapkan(jenis);
    const tanpa = await pindahStatusKegiatan(db, {
      kegiatanId: 'K24-02',
      ke: 'ditunda',
      oleh: 'uji',
      sekarang: WAKTU,
    });
    expect(tanpa.ok).toBe(false);
    const dengan = await pindahStatusKegiatan(db, {
      kegiatanId: 'K24-02',
      ke: 'ditunda',
      oleh: 'uji',
      alasan: 'Pimpinan berhalangan',
      sekarang: WAKTU,
    });
    expect(dengan.ok).toBe(true);
    const [terbaru] = await daftarAudit(db, 1);
    expect(terbaru?.alasan).toBe('Pimpinan berhalangan');
    expect(await statusDb(db, 'K24-02')).toBe('ditunda');
  });

  it('KB-004: kegiatan tidak ditemukan dilaporkan', async () => {
    const db = await siapkan(jenis);
    const hasil = await pindahStatusKegiatan(db, {
      kegiatanId: 'TIDAK-ADA',
      ke: 'ditetapkan',
      oleh: 'uji',
    });
    expect(hasil).toMatchObject({ ok: false, kode: 'tidak_ditemukan' });
  });
});
