# Kamus Data (RK-02)

> **Dihasilkan otomatis** dari `apps/api/src/db/schema.ts` oleh `scripts/buat-kamus-data.mjs` (`npm run docs:data`). **Jangan diedit tangan.** Migrasi basis data: `apps/api/drizzle/`.

Sensitivitas: **biasa** = tidak memuat data pribadi; **pribadi** = data pribadi (UU 27/2022); **rahasia** = kredensial/akses; **audit** = jejak audit.

Jumlah tabel: 9.

## pejabat

Direktori pihak: pimpinan, pejabat, dan petugas yang dapat diundang atau ditugaskan.

| Kolom | Tipe | Wajib | Bawaan | Kunci | Sensitivitas |
|---|---|---|---|---|---|
| `id` | text | ya |  | PK | biasa |
| `nama` | text | ya |  |  | pribadi |
| `golongan` | text | ya |  |  | biasa |
| `jabatan` | text |  |  |  | biasa |
| `instansi` | text |  |  |  | biasa |
| `kontak` | text |  |  |  | pribadi |
| `urutan_tata_tempat` | integer |  |  |  | biasa |
| `aktif` | boolean | ya | ya |  | biasa |
| `is_contoh` | boolean | ya | ya |  | biasa |
| `dibuat` | timestamp with time zone | ya | ya |  | biasa |

Batasan (CHECK): `pejabat_golongan_sah`.

## pengguna

Akun pengguna aplikasi beserta peran; kata sandi hanya berupa hash (scrypt).

| Kolom | Tipe | Wajib | Bawaan | Kunci | Sensitivitas |
|---|---|---|---|---|---|
| `id` | text | ya |  | PK | biasa |
| `username` | text | ya |  | unik | pribadi |
| `nama` | text | ya |  |  | pribadi |
| `peran` | text | ya |  |  | biasa |
| `pejabat_id` | text |  |  | FK → pejabat.id | biasa |
| `hash_sandi` | text |  |  |  | rahasia |
| `aktif` | boolean | ya | ya |  | biasa |
| `gagal_masuk` | integer | ya | ya |  | biasa |
| `terkunci_sampai` | timestamp with time zone |  |  |  | biasa |
| `is_contoh` | boolean | ya | ya |  | biasa |
| `dibuat` | timestamp with time zone | ya | ya |  | biasa |

Batasan (CHECK): `pengguna_peran_sah`.

## peran_izin

Matriks hak akses sebagai data: izin yang dimiliki tiap peran (diisi di Tahap 1.3b).

| Kolom | Tipe | Wajib | Bawaan | Kunci | Sensitivitas |
|---|---|---|---|---|---|
| `peran` | text | ya |  |  | biasa |
| `izin` | text | ya |  |  | biasa |
| `is_contoh` | boolean | ya | ya |  | biasa |

## sesi

Sesi masuk; hanya hash token yang disimpan (diisi di Tahap 1.3b).

| Kolom | Tipe | Wajib | Bawaan | Kunci | Sensitivitas |
|---|---|---|---|---|---|
| `id_hash` | text | ya |  | PK | rahasia |
| `pengguna_id` | text | ya |  | FK → pengguna.id | biasa |
| `dibuat` | timestamp with time zone | ya | ya |  | biasa |
| `kedaluwarsa` | timestamp with time zone | ya |  |  | biasa |
| `ip` | text |  |  |  | pribadi |
| `agen` | text |  |  |  | pribadi |

## kegiatan

Kegiatan/undangan pada agenda pimpinan beserta status, waktu, lokasi, PIC, dan tautan rapat.

| Kolom | Tipe | Wajib | Bawaan | Kunci | Sensitivitas |
|---|---|---|---|---|---|
| `id` | text | ya |  | PK | biasa |
| `judul` | text | ya |  |  | biasa |
| `jenis` | text |  |  |  | biasa |
| `mulai` | timestamp with time zone | ya |  |  | biasa |
| `selesai` | timestamp with time zone |  |  |  | biasa |
| `lokasi_nama` | text |  |  |  | biasa |
| `lokasi_pulau` | text |  |  |  | biasa |
| `status` | text | ya | ya |  | biasa |
| `penyelenggara` | text |  |  |  | biasa |
| `pic_protokol_id` | text |  |  | FK → pejabat.id | biasa |
| `pic_pengundang_nama` | text |  |  |  | pribadi |
| `pic_pengundang_kontak` | text |  |  |  | pribadi |
| `tautan_rapat` | text |  |  |  | rahasia |
| `catatan` | text |  |  |  | biasa |
| `is_contoh` | boolean | ya | ya |  | biasa |
| `dibuat` | timestamp with time zone | ya | ya |  | biasa |
| `diubah` | timestamp with time zone | ya | ya |  | biasa |

Batasan (CHECK): `kegiatan_status_sah`, `kegiatan_selesai_setelah_mulai`.

## kegiatan_pihak

Kedudukan setiap pihak pada kegiatan: diundang, ditugaskan, diterima, atau ditolak.

| Kolom | Tipe | Wajib | Bawaan | Kunci | Sensitivitas |
|---|---|---|---|---|---|
| `kegiatan_id` | text | ya |  | FK → kegiatan.id | biasa |
| `pihak_id` | text | ya |  | FK → pejabat.id | biasa |
| `kedudukan` | text | ya |  |  | biasa |
| `peran` | text |  |  |  | biasa |

Batasan (CHECK): `kegiatan_pihak_kedudukan_sah`, `kegiatan_pihak_peran_sah`.

## lampiran

Berkas lampiran undangan (metadata; isi berkas di penyimpanan berkas) (diisi di Tahap 1.3b).

| Kolom | Tipe | Wajib | Bawaan | Kunci | Sensitivitas |
|---|---|---|---|---|---|
| `id` | text | ya |  | PK | biasa |
| `kegiatan_id` | text | ya |  | FK → kegiatan.id | biasa |
| `nama_berkas` | text | ya |  |  | biasa |
| `tipe` | text | ya |  |  | biasa |
| `ukuran` | integer | ya |  |  | biasa |
| `hash_isi` | text | ya |  |  | biasa |
| `jalur` | text | ya |  |  | biasa |
| `diunggah_oleh` | text |  |  |  | pribadi |
| `dibuat` | timestamp with time zone | ya | ya |  | biasa |

## pengaturan

Pengaturan yang dikelola admin, mis. durasi bawaan kegiatan tanpa jam selesai.

| Kolom | Tipe | Wajib | Bawaan | Kunci | Sensitivitas |
|---|---|---|---|---|---|
| `kunci` | text | ya |  | PK | biasa |
| `nilai` | jsonb | ya |  |  | biasa |
| `diubah` | timestamp with time zone | ya | ya |  | biasa |

## log_audit

Jejak audit append-only: siapa melakukan apa, kapan, nilai sebelum dan sesudah.

| Kolom | Tipe | Wajib | Bawaan | Kunci | Sensitivitas |
|---|---|---|---|---|---|
| `id` | bigint | ya | ya | PK | audit |
| `waktu` | timestamp with time zone | ya | ya |  | audit |
| `aktor` | text | ya |  |  | audit |
| `aktor_peran` | text |  |  |  | audit |
| `aksi` | text | ya |  |  | audit |
| `entitas` | text |  |  |  | audit |
| `entitas_id` | text |  |  |  | audit |
| `sebelum` | jsonb |  |  |  | audit |
| `sesudah` | jsonb |  |  |  | audit |
| `alasan` | text |  |  |  | audit |
| `req_id` | text |  |  |  | audit |
| `ip` | text |  |  |  | audit |
