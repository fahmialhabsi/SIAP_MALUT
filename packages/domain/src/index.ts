/**
 * Logika domain murni (tanpa basis data/jaringan). Lihat docs/standar/KEPUTUSAN_TEKNOLOGI_PURWARUPA.md bagian 4.
 * Tahap 1.1 hanya memuat definisi status agenda (KB-004). Aturan perpindahan status dan deteksi bentrok menyusul di Tahap 1.2.
 */

export const STATUS_AGENDA = [
  'baru',
  'menunggu_arahan',
  'ditetapkan',
  'terkonfirmasi',
  'berlangsung',
  'selesai',
  'dibatalkan',
  'ditunda',
] as const;

export type StatusAgenda = (typeof STATUS_AGENDA)[number];

/** Label antarmuka (Bahasa Indonesia baku). Istilah dapat dikoreksi di sini (KB-036). */
export const LABEL_STATUS_AGENDA: Readonly<Record<StatusAgenda, string>> = {
  baru: 'Baru',
  menunggu_arahan: 'Menunggu Arahan',
  ditetapkan: 'Ditetapkan',
  terkonfirmasi: 'Terkonfirmasi',
  berlangsung: 'Berlangsung',
  selesai: 'Selesai',
  dibatalkan: 'Dibatalkan',
  ditunda: 'Ditunda',
};

/** Alur utama empat langkah dari Kabag Protokol (Rancangan 11.2). */
export const ALUR_UTAMA: readonly StatusAgenda[] = [
  'baru',
  'menunggu_arahan',
  'ditetapkan',
  'terkonfirmasi',
];

export function adalahStatusAgenda(nilai: string): nilai is StatusAgenda {
  return (STATUS_AGENDA as readonly string[]).includes(nilai);
}
