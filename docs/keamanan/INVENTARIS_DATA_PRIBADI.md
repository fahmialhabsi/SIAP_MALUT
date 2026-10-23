# Inventaris Data Pribadi (KM-02)

> Bagian tabel **dihasilkan otomatis** dari `SENSITIVITAS` pada skema oleh `scripts/buat-kamus-data.mjs` (`npm run docs:data`). Bagian keterangan di bawahnya ditulis tangan dan ditinjau tiap fitur data baru. Rujukan regulasi (UU 27/2022 dan turunannya) wajib diverifikasi di JDIH.

## 1. Kolom yang memuat data pribadi atau rahasia

| Tabel | Kolom | Jenis |
|---|---|---|
| pejabat | `nama` | pribadi |
| pejabat | `kontak` | pribadi |
| pengguna | `username` | pribadi |
| pengguna | `nama` | pribadi |
| pengguna | `hash_sandi` | rahasia |
| sesi | `id_hash` | rahasia |
| sesi | `ip` | pribadi |
| sesi | `agen` | pribadi |
| kegiatan | `pic_pengundang_nama` | pribadi |
| kegiatan | `pic_pengundang_kontak` | pribadi |
| kegiatan | `tautan_rapat` | rahasia |
| lampiran | `diunggah_oleh` | pribadi |

Total: 12 kolom.

## 2. Keterangan (ditulis tangan)

| Hal | Ketentuan saat ini |
|---|---|
| Subjek data | Pimpinan, pejabat, petugas, pengguna aplikasi, kontak pengundang |
| Tujuan | Penyusunan agenda, penugasan kehadiran, koordinasi protokol, kontrol akses dan jejak audit |
| Dasar pemrosesan | Pelaksanaan tugas dan fungsi Biro Administrasi Pimpinan (Pergub Malut 36/2021); persetujuan bila ditentukan hukum (perlu ditinjau) |
| Data nyata | **Belum ada.** Seluruh data berupa data contoh berlabel CONTOH (Tahap P menggantinya) |
| Lokasi penyimpanan | PostgreSQL (kontainer) atau PGlite (pengembangan); lampiran di penyimpanan berkas (Tahap 1.3b) |
| Akses | Berbasis peran (Tahap 1.3b); tautan rapat hanya untuk yang ditugaskan dan Protokol |
| Perlindungan | Kata sandi di-hash scrypt; hanya hash token sesi disimpan; log audit append-only; tidak ada data pribadi di log aplikasi biasa (diverifikasi manual; uji otomatis menyusul) |
| Retensi dan penghapusan | **Belum ditetapkan** (KM-04, Tahap 2); log audit tidak dapat dihapus |
| Penilaian dampak (DPIA) | Belum (KM-03, Tahap 1.6) |
