# Matriks Hak Akses (RK-05)

> **Status: PLACEHOLDER** (PH-05). Dihasilkan otomatis dari `data/contoh/hak-akses.json` dan registri rute oleh `scripts/buat-dokumen-api.mjs` (`npm run docs:api`). **Jangan diedit tangan.** Data yang sama dibaca aplikasi (tabel `peran_izin`) dan uji otomatis. Disahkan Biro bersama Sekda pada Tahap P.

Salah satu izin pada daftar rute sudah cukup (any-of). Pembatasan data tambahan: peran dengan `kegiatan.baca_terkait` hanya melihat kegiatan yang memuat dirinya; tautan rapat hanya untuk peran berizin `tautan_rapat.lihat_semua` atau pihak yang ditugaskan/diterima (KB-019).

## 1. Peran dan Izin

| Izin | admin | kepala_biro | kabag_protokol | protokol | ajudan | pimpinan | pejabat | pemohon | publik |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `kegiatan.baca_semua` | ya | ya | ya | ya | ya | ya |  |  |  |
| `kegiatan.baca_terkait` | ya |  |  |  |  |  | ya |  |  |
| `kegiatan.buat` | ya |  | ya | ya | ya |  |  |  |  |
| `kegiatan.ubah` | ya |  | ya | ya | ya |  |  |  |  |
| `kegiatan.pindah_status` | ya |  | ya | ya | ya | ya |  |  |  |
| `pihak.kelola` | ya |  | ya | ya | ya | ya |  |  |  |
| `pihak.konfirmasi_sendiri` | ya |  |  |  |  |  | ya |  |  |
| `bentrok.baca` | ya | ya | ya | ya | ya | ya |  |  |  |
| `pejabat.baca` | ya | ya | ya | ya | ya | ya | ya |  |  |
| `lampiran.baca` | ya | ya | ya | ya | ya | ya | ya |  |  |
| `lampiran.unggah` | ya |  | ya | ya | ya |  |  |  |  |
| `tautan_rapat.lihat_semua` | ya | ya | ya | ya |  |  |  |  |  |
| `pengaturan.baca` | ya | ya | ya |  |  |  |  |  |  |
| `pengaturan.ubah` | ya |  |  |  |  |  |  |  |  |
| `audit.baca` | ya | ya |  |  |  |  |  |  |  |
| `hakakses.baca` | ya | ya |  |  |  |  |  |  |  |
| `demo.pindah_persona` | ya |  |  |  |  |  |  |  |  |

## 2. Rute dan Izin yang Diperlukan

| Metode | Jalur | Izin (salah satu) |
|---|---|---|
| GET | `/api/audit` | `audit.baca` |
| GET | `/api/bentrok` | `bentrok.baca` |
| DELETE | `/api/demo/persona` | `demo.pindah_persona` |
| GET | `/api/demo/persona` | `demo.pindah_persona` |
| POST | `/api/demo/persona` | `demo.pindah_persona` |
| GET | `/api/hak-akses` | `hakakses.baca` |
| GET | `/api/kegiatan` | `kegiatan.baca_semua`, `kegiatan.baca_terkait` |
| POST | `/api/kegiatan` | `kegiatan.buat` |
| GET | `/api/kegiatan/:id` | `kegiatan.baca_semua`, `kegiatan.baca_terkait` |
| PATCH | `/api/kegiatan/:id` | `kegiatan.ubah` |
| GET | `/api/kegiatan/:id/lampiran` | `lampiran.baca` |
| POST | `/api/kegiatan/:id/lampiran` | `lampiran.unggah` |
| DELETE | `/api/kegiatan/:id/pihak/:pihakId` | `pihak.kelola` |
| PUT | `/api/kegiatan/:id/pihak/:pihakId` | `pihak.kelola`, `pihak.konfirmasi_sendiri` |
| POST | `/api/kegiatan/:id/pindah-status` | `kegiatan.pindah_status` |
| GET | `/api/lampiran/:id` | `lampiran.baca` |
| GET | `/api/pejabat` | `pejabat.baca` |
| GET | `/api/pengaturan` | `pengaturan.baca` |
| PUT | `/api/pengaturan/:kunci` | `pengaturan.ubah` |
| GET | `/api/saya` | (cukup sudah masuk) |
| DELETE | `/api/sesi` | (cukup sudah masuk) |
| POST | `/api/sesi` | (publik) |
