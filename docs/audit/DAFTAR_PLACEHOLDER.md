# Daftar Placeholder SIAP MALUT

Semua hal yang masih berupa **placeholder/data contoh** dicatat di sini (lihat `docs/standar/STANDAR_DATA_CONTOH.md`). Diperbarui setiap tahap. Diganti pada **Tahap P** (penggantian data contoh dengan data asli) sebelum peluncuran.

| ID | Placeholder | Lokasi | Pengganti (nyata) | Tahap pengganti | Status |
|---|---|---|---|---|---|
| PH-01 | Nama pimpinan dan pejabat (Gubernur, Wagub, Sekda, Asisten, Kepala OPD) | `data/contoh/`; tabel `pejabat` | Struktur pejabat asli | P | Terisi (seed demo) |
| PH-02 | Nama staf (Protokol, Materi, ajudan) | `data/contoh/` | Daftar staf asli | P | Direncanakan |
| PH-03 | Akun pengguna (`demo.*`) | `data/contoh/pengguna.json`; tabel `pengguna` | Akun asli lewat impor admin | P | Terisi (seed demo) |
| PH-04 | Akun admin (`admin.owner`, dipegang owner) | Tabel `pengguna` | Administrator resmi | P | Aktif (sementara; kata sandi acak/lingkungan, tidak di repo) |
| PH-05 | Matriks hak akses berbasis jabatan contoh | `data/contoh/hak-akses.json`; tabel `peran_izin`; `docs/rekayasa/MATRIKS_HAK_AKSES.md` (dihasilkan) | Disahkan Biro bersama Sekda dengan pemegang jabatan asli | P | Terisi (seed demo; dokumen berstatus Placeholder) |
| PH-06 | SK kelompok kerja/tim/peran (TG-05) | `docs/audit/arsip/` | SK asli | P | Placeholder |
| PH-07 | Agenda contoh (bentuk mengikuti agenda Protokol, difiktifkan) | `data/contoh/agenda-uji.json`; tabel `kegiatan` | Agenda nyata (input petugas) | P | Terisi (seed demo) |
| PH-08 | Aturan kewenangan mewakili (nilai awal) | `data/contoh/`, `docs/standar/ATURAN_KEWENANGAN_MEWAKILI_DRAF.md` | Disahkan Sekda | P | Draf |
| PH-09 | Tabel waktu tempuh antarlokasi/pulau (nilai awal) | `data/contoh/` | Diisi Protokol | P | Direncanakan |
| PH-10 | Nomor telepon, nomor surat contoh | `data/contoh/` | Data asli | P | Direncanakan |
| PH-11 | Dasbor pejabat dan dasbor staf (susunan per peran, data contoh) | `apps/web/src/konfigurasi.ts` (`DASBOR_PER_PERAN`), `apps/web/src/halaman/beranda.tsx` | Susunan disahkan Kabag Protokol; data asli | P | Terisi (usulan, perlu tinjauan Kabag) |
| PH-12 | Penandatangan dokumen audit | `docs/audit/` | Pejabat berwenang | P | Direncanakan |
| PH-13 | Ikon aplikasi sementara (tulisan SIAP di atas biru) | `apps/web/public/icon.svg` | Logo resmi Pemprov/Biro | P | Sementara |
