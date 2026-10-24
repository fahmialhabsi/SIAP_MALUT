/**
 * Daftar izin (tindakan) yang dikenal aplikasi. Matriks peran x izin berupa DATA (tabel peran_izin, seed dari
 * data/contoh/hak-akses.json), bukan kode (CLAUDE.md Aturan 12). Daftar ini hanya kosakata izin.
 */
export const IZIN = [
  'kegiatan.baca_semua',
  'kegiatan.baca_terkait',
  'kegiatan.buat',
  'kegiatan.ubah',
  'kegiatan.pindah_status',
  'pihak.kelola',
  'pihak.konfirmasi_sendiri',
  'bentrok.baca',
  'pejabat.baca',
  'lampiran.baca',
  'lampiran.unggah',
  'tautan_rapat.lihat_semua',
  'pengaturan.baca',
  'pengaturan.ubah',
  'audit.baca',
  'hakakses.baca',
  'demo.pindah_persona',
] as const;

export type Izin = (typeof IZIN)[number];

export function adalahIzin(nilai: string): nilai is Izin {
  return (IZIN as readonly string[]).includes(nilai);
}
