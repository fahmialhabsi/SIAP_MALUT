import { describe, expect, it } from 'vitest';
import { bentrokUntukKegiatan, cariBentrok } from './bentrok.js';
import { kegiatanPadaTanggal, muatAturanAwal, muatKegiatanUji } from './data-uji.helper.js';
import type { Kegiatan, Pihak } from './model.js';

const opsi = { durasiBawaanMenit: muatAturanAwal().durasiBawaanMenit };
const semua = muatKegiatanUji();

function kegiatan(
  id: string,
  mulai: string,
  selesai: string | undefined,
  pihak: Pihak[],
  status: Kegiatan['status'] = 'menunggu_arahan',
): Kegiatan {
  return { id, judul: `Kegiatan ${id}`, mulai, ...(selesai ? { selesai } : {}), status, pihak };
}
const gub = (kedudukan: Pihak['kedudukan'] = 'diundang'): Pihak => ({
  id: 'gubernur',
  nama: 'Gubernur (CONTOH)',
  golongan: 'pimpinan',
  kedudukan,
});
const staf = (kedudukan: Pihak['kedudukan'] = 'ditugaskan'): Pihak => ({
  id: 'petugas-protokol-01',
  nama: 'Petugas Protokol 01 (CONTOH)',
  golongan: 'petugas',
  kedudukan,
});

describe('KB-008: bentrok jam pada pimpinan', () => {
  it('KB-008: irisan sebagian terdeteksi dengan rentang irisan yang benar', () => {
    const hasil = cariBentrok(
      [
        kegiatan('A', '2026-10-24T19:00:00+09:00', '2026-10-24T21:00:00+09:00', [gub()]),
        kegiatan('B', '2026-10-24T20:00:00+09:00', '2026-10-24T22:00:00+09:00', [gub()]),
      ],
      opsi,
    );
    expect(hasil).toHaveLength(1);
    expect(hasil[0]).toMatchObject({
      pihakId: 'gubernur',
      jenis: 'langsung',
      kepastian: 'potensi',
      kegiatanA: 'A',
      kegiatanB: 'B',
      irisan: { mulai: '2026-10-24T11:00:00.000Z', selesai: '2026-10-24T12:00:00.000Z' },
    });
  });

  it('KB-008: irisan penuh (satu kegiatan di dalam yang lain) terdeteksi', () => {
    const hasil = cariBentrok(
      [
        kegiatan('A', '2026-10-24T08:00:00+09:00', '2026-10-24T12:00:00+09:00', [gub()]),
        kegiatan('B', '2026-10-24T09:00:00+09:00', '2026-10-24T10:00:00+09:00', [gub()]),
      ],
      opsi,
    );
    expect(hasil).toHaveLength(1);
  });

  it('KB-008: bersinggungan (selesai 20.00, mulai 20.00) bukan bentrok', () => {
    const hasil = cariBentrok(
      [
        kegiatan('A', '2026-10-24T19:00:00+09:00', '2026-10-24T20:00:00+09:00', [gub()]),
        kegiatan('B', '2026-10-24T20:00:00+09:00', '2026-10-24T21:00:00+09:00', [gub()]),
      ],
      opsi,
    );
    expect(hasil).toEqual([]);
  });

  it('KB-008: zona waktu berbeda dibandingkan pada saat yang sama', () => {
    const hasil = cariBentrok(
      [
        kegiatan('A', '2026-10-24T20:00:00+09:00', '2026-10-24T21:00:00+09:00', [gub()]),
        kegiatan('B', '2026-10-24T11:30:00Z', '2026-10-24T12:30:00Z', [gub()]),
      ],
      opsi,
    );
    expect(hasil).toHaveLength(1);
  });

  it('KB-008: dua pimpinan berbeda pada acara berbeda tidak bentrok', () => {
    const wagub: Pihak = {
      id: 'wagub',
      nama: 'Wakil Gubernur (CONTOH)',
      golongan: 'pimpinan',
      kedudukan: 'diundang',
    };
    const hasil = cariBentrok(
      [
        kegiatan('A', '2026-10-24T20:00:00+09:00', '2026-10-24T21:00:00+09:00', [gub()]),
        kegiatan('B', '2026-10-24T20:00:00+09:00', '2026-10-24T21:00:00+09:00', [wagub]),
      ],
      opsi,
    );
    expect(hasil).toEqual([]);
  });

  it('KB-008: status dibatalkan, ditunda, dan selesai tidak dihitung', () => {
    for (const status of ['dibatalkan', 'ditunda', 'selesai'] as const) {
      const hasil = cariBentrok(
        [
          kegiatan('A', '2026-10-24T20:00:00+09:00', '2026-10-24T21:00:00+09:00', [gub()]),
          kegiatan('B', '2026-10-24T20:00:00+09:00', '2026-10-24T21:00:00+09:00', [gub()], status),
        ],
        opsi,
      );
      expect(hasil, status).toEqual([]);
    }
  });

  it('KB-008: pihak yang menolak/dilepas tidak dihitung', () => {
    const hasil = cariBentrok(
      [
        kegiatan('A', '2026-10-24T20:00:00+09:00', '2026-10-24T21:00:00+09:00', [gub('ditolak')]),
        kegiatan('B', '2026-10-24T20:00:00+09:00', '2026-10-24T21:00:00+09:00', [gub()]),
      ],
      opsi,
    );
    expect(hasil).toEqual([]);
  });

  it('KB-008: kegiatan yang sama dengan id sama tidak bentrok dengan dirinya', () => {
    const k = kegiatan('A', '2026-10-24T20:00:00+09:00', '2026-10-24T21:00:00+09:00', [gub()]);
    expect(cariBentrok([k, k], opsi)).toEqual([]);
  });

  it('KB-008: hasil deterministik walau urutan masukan dibalik', () => {
    const urut = cariBentrok(semua, opsi);
    const balik = cariBentrok([...semua].reverse(), opsi);
    expect(balik.map((b) => `${b.pihakId}|${b.irisan.mulai}`).sort()).toEqual(
      urut.map((b) => `${b.pihakId}|${b.irisan.mulai}`).sort(),
    );
  });
});

describe('KB-010: bentrok sumber daya', () => {
  it('KB-010: petugas ganda pada dua kegiatan beririsan = sumber_daya dan pasti', () => {
    const hasil = cariBentrok(
      [
        kegiatan('A', '2026-10-26T09:00:00+09:00', '2026-10-26T11:00:00+09:00', [staf()]),
        kegiatan('B', '2026-10-26T10:00:00+09:00', '2026-10-26T12:00:00+09:00', [staf()]),
      ],
      opsi,
    );
    expect(hasil).toHaveLength(1);
    expect(hasil[0]).toMatchObject({
      jenis: 'sumber_daya',
      kepastian: 'pasti',
      golongan: 'petugas',
    });
  });

  it('KB-010: salah satu baru diundang membuat kepastian menjadi potensi', () => {
    const hasil = cariBentrok(
      [
        kegiatan('A', '2026-10-26T09:00:00+09:00', '2026-10-26T11:00:00+09:00', [
          staf('ditugaskan'),
        ]),
        kegiatan('B', '2026-10-26T10:00:00+09:00', '2026-10-26T12:00:00+09:00', [staf('diundang')]),
      ],
      opsi,
    );
    expect(hasil[0]?.kepastian).toBe('potensi');
  });
});

describe('KB-039: durasi bawaan dari konfigurasi', () => {
  it('KB-039: konfigurasi bernilai 120 menit (data contoh)', () => {
    expect(opsi.durasiBawaanMenit).toBe(120);
  });

  it('KB-039: durasi bawaan wajib positif', () => {
    expect(() => cariBentrok(semua, { durasiBawaanMenit: 0 })).toThrow(RangeError);
    expect(() => cariBentrok(semua, { durasiBawaanMenit: -5 })).toThrow(RangeError);
  });
});

describe('KB-008 dan KB-010: agenda nyata-fiktif Protokol', () => {
  it('KB-008: 22 Okt tanpa bentrok pada durasi bawaan 2 jam', () => {
    expect(cariBentrok(kegiatanPadaTanggal(semua, '2026-10-22'), opsi)).toEqual([]);
  });

  it('KB-039: 22 Okt bentrok pada durasi 3 jam (Wagub: upacara dan pangan murah)', () => {
    const hasil = cariBentrok(kegiatanPadaTanggal(semua, '2026-10-22'), { durasiBawaanMenit: 180 });
    expect(hasil).toHaveLength(1);
    expect(hasil[0]).toMatchObject({
      pihakId: 'wagub',
      kepastian: 'pasti',
      jenis: 'langsung',
      kegiatanA: 'K22-01',
      kegiatanB: 'K22-05',
    });
  });

  it('KB-008: 24 Okt 20.00: hanya Wagub bentrok (potensi); makan malam selesai 20.00 tidak bentrok', () => {
    const hasil = cariBentrok(kegiatanPadaTanggal(semua, '2026-10-24'), opsi);
    expect(hasil).toHaveLength(1);
    expect(hasil[0]).toMatchObject({
      pihakId: 'wagub',
      jenis: 'langsung',
      kepastian: 'potensi',
      kegiatanA: 'K24-02',
      kegiatanB: 'K24-03',
      irisan: { mulai: '2026-10-24T11:00:00.000Z', selesai: '2026-10-24T13:00:00.000Z' },
    });
  });

  it('KB-008 dan KB-010: 26 Okt: 12 bentrok pimpinan (potensi) dan 1 bentrok petugas (pasti)', () => {
    const hasil = cariBentrok(kegiatanPadaTanggal(semua, '2026-10-26'), opsi);
    expect(hasil).toHaveLength(13);
    const langsung = hasil.filter((b) => b.jenis === 'langsung');
    const sumberDaya = hasil.filter((b) => b.jenis === 'sumber_daya');
    expect(langsung).toHaveLength(12);
    expect(langsung.every((b) => b.kepastian === 'potensi')).toBe(true);
    // Tiga pimpinan masing-masing pada empat pasangan kegiatan yang beririsan.
    for (const id of ['gubernur', 'wagub', 'sekda']) {
      expect(langsung.filter((b) => b.pihakId === id)).toHaveLength(4);
    }
    expect(sumberDaya).toHaveLength(1);
    expect(sumberDaya[0]).toMatchObject({
      pihakId: 'petugas-protokol-01',
      kepastian: 'pasti',
      kegiatanA: 'K26-02',
      kegiatanB: 'K26-03',
    });
  });

  it('KB-008: penjemputan 07.00-09.00 dan rangkaian 09.00 tidak bentrok (bersinggungan)', () => {
    const hasil = cariBentrok(kegiatanPadaTanggal(semua, '2026-10-26'), opsi);
    expect(hasil.some((b) => b.kegiatanA === 'K26-01' && b.kegiatanB === 'K26-03')).toBe(false);
  });

  it('KB-008: seluruh agenda uji menghasilkan 14 bentrok dan tidak ada lintas hari', () => {
    expect(cariBentrok(semua, opsi)).toHaveLength(14);
  });

  it('KB-008: bentrokUntukKegiatan hanya mengembalikan yang melibatkan kegiatan itu', () => {
    const hasil = bentrokUntukKegiatan(semua, 'K24-03', opsi);
    expect(hasil).toHaveLength(1);
    expect(bentrokUntukKegiatan(semua, 'K22-04', opsi)).toEqual([]);
  });
});
