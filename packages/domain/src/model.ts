import type { StatusAgenda } from './status.js';

/** Golongan pihak. Pimpinan = Gubernur, Wakil Gubernur, Sekda (Rancangan 5.2). */
export type GolonganPihak = 'pimpinan' | 'pejabat' | 'petugas';

/**
 * Kedudukan pihak pada sebuah kegiatan:
 * - `diundang`: undangan ditujukan kepadanya, kehadiran belum diputuskan;
 * - `ditugaskan`: sudah ditetapkan hadir (belum dikonfirmasi bila pejabat/petugas);
 * - `diterima`: kehadiran terkonfirmasi (pimpinan yang memutuskan hadir sendiri langsung `diterima`);
 * - `ditolak`: tidak hadir/dilepas (tidak dihitung dalam bentrok).
 */
export type KedudukanPihak = 'diundang' | 'ditugaskan' | 'diterima' | 'ditolak';

export type PeranPihak = 'utama' | 'mewakili' | 'pendamping';

export interface Pihak {
  id: string;
  nama: string;
  golongan: GolonganPihak;
  kedudukan: KedudukanPihak;
  peran?: PeranPihak;
}

export interface Lokasi {
  nama: string;
  pulau?: string;
}

export interface Kegiatan {
  id: string;
  judul: string;
  jenis?: string;
  /** Waktu mulai: ISO 8601 beserta zona, mis. `2026-10-24T20:00:00+09:00` (WIT). */
  mulai: string;
  /** Waktu selesai; kosong berarti "sampai selesai" (dipakai durasi bawaan dari konfigurasi). */
  selesai?: string;
  lokasi?: Lokasi;
  status: StatusAgenda;
  pihak: readonly Pihak[];
}
