import type { PeranPengguna } from './api/tipe';

/** Tanggal pada data contoh yang memuat bentrok (agenda Protokol 26 Oktober 2026). */
export const TANGGAL_CONTOH = '2026-10-26';

export type BagianDasbor =
  | 'ringkasanStatus'
  | 'perluDitetapkan'
  | 'menungguArahan'
  | 'bentrok'
  | 'penugasanSaya'
  | 'agendaHariIni'
  | 'agendaSaya';

/**
 * Susunan beranda per peran = DATA, bukan kode (CLAUDE.md Aturan 12; PH-11).
 * Koreksi susunan dasbor dari Kabag Protokol cukup mengubah daftar ini.
 */
export const DASBOR_PER_PERAN: Record<PeranPengguna, readonly BagianDasbor[]> = {
  admin: ['ringkasanStatus', 'bentrok', 'agendaHariIni'],
  kepala_biro: ['ringkasanStatus', 'bentrok', 'agendaHariIni'],
  kabag_protokol: ['ringkasanStatus', 'perluDitetapkan', 'bentrok', 'agendaHariIni'],
  protokol: ['perluDitetapkan', 'bentrok', 'agendaHariIni'],
  ajudan: ['menungguArahan', 'agendaHariIni', 'bentrok'],
  pimpinan: ['menungguArahan', 'agendaSaya', 'bentrok'],
  pejabat: ['penugasanSaya', 'agendaSaya'],
  pemohon: [],
  publik: [],
};

/** Batas "perlu ditetapkan": kegiatan menunggu arahan yang dimulai dalam sekian hari. */
export const BATAS_HARI_PERLU_DITETAPKAN = 3;
