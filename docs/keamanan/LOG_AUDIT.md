# Desain Log Audit (KM-09)

**Versi:** Tahap 1.3a. Mencerminkan kode saat ini: tabel `log_audit` (lihat `docs/rekayasa/KAMUS_DATA.md`) dan migrasi `apps/api/drizzle/0001_log_audit_append_only.sql`.

## 1. Tujuan
Menjawab "siapa melakukan apa, kapan, dari mana, dan apa yang berubah" untuk tindakan yang berdampak pada agenda, akses, dan konfigurasi, dengan jejak yang **tidak dapat diubah atau dihapus** lewat aplikasi maupun SQL biasa.

## 2. Isi catatan
| Kolom | Isi |
|---|---|
| `id` | Nomor urut otomatis (identity), tidak dapat dimasukkan manual |
| `waktu` | Saat pencatatan (basis data, zona waktu tersimpan; ditampilkan WIT) |
| `aktor`, `aktor_peran` | Pelaku (username atau `sistem`/`cli`) dan perannya |
| `aksi` | Kode tindakan, mis. `kegiatan.pindah_status`, `seed.data_contoh`, `admin.atur_sandi` |
| `entitas`, `entitas_id` | Objek yang dikenai (mis. `kegiatan` / `K22-05`) |
| `sebelum`, `sesudah` | Nilai sebelum dan sesudah (JSON). Untuk perpindahan status memuat peristiwa lengkap dari domain, termasuk alasan dan bentrok yang diketahui |
| `alasan` | Alasan yang diisi pelaku (wajib untuk menunda/membatalkan; alasan bentrok ada di `sesudah.peristiwa`) |
| `req_id`, `ip` | ID permintaan (sama dengan `reqId` di log aplikasi) dan alamat asal |

## 3. Tindakan yang dicatat (saat ini)
| Aksi | Sumber |
|---|---|
| `kegiatan.pindah_status` | `pindahStatusKegiatan` (satu transaksi dengan perubahan status) |
| `seed.data_contoh` | Pengisian data contoh |
| `admin.atur_sandi` | CLI `npm run admin:sandi` |
| `masuk.berhasil`, `masuk.gagal`, `masuk.gagal_tak_dikenal`, `masuk.terkunci`, `masuk.ditolak_terkunci`, `keluar` | Autentikasi (`keamanan/masuk.ts`, `rute/auth.ts`); tanpa kata sandi |
| `kegiatan.buat`, `kegiatan.ubah`, `kegiatan.pihak.set`, `kegiatan.pihak.hapus` | Rute kegiatan (tautan rapat disamarkan) |
| `lampiran.unggah` | Rute lampiran (nama, jenis, ukuran, hash; bukan isi) |
| `pengaturan.ubah` | Rute pengaturan (sebelum dan sesudah) |
| `demo.pindah_persona`, `demo.kembali` | Mode demo; tindakan sebagai persona memakai aktor ganda `admin (sebagai persona)` |

Kata sandi, token sesi, dan isi berkas **tidak pernah** dicatat.

## 4. Perlindungan terhadap perubahan
- Pemicu basis data menolak `UPDATE` dan `DELETE` (per baris) dan `TRUNCATE` (per pernyataan) pada `log_audit`; hasil: galat `log_audit bersifat append-only`.
- Diuji pada PGlite dan PostgreSQL 16 asli, dan dicoba langsung lewat `psql` pada kontainer (23 Okt 2026).
- Pencatatan perubahan data (kegiatan, pihak, lampiran, pengaturan, persona demo, perpindahan status) terjadi **dalam transaksi yang sama** dengan perubahannya: bila pencatatan gagal, perubahan dibatalkan.
- Peristiwa masuk, gagal masuk, penguncian, dan keluar dicatat sebagai pernyataan terpisah (tidak ada data bisnis yang berubah selain hitungan gagal dan sesi).

## 5. Batas kendali (jujur)
- Pemilik/administrator basis data (superuser) tetap dapat menonaktifkan pemicu atau menghapus tabel. Mitigasi yang disiapkan untuk serah terima: akun basis data khusus aplikasi tanpa hak mengubah skema atau pemicu, cadangan berkala ke penyimpanan terpisah, dan pencantuman pemantauan atas perubahan DDL (OP-03, OP-05).
- Belum ada penandatanganan berantai (hash-chain) pada catatan; dapat dipertimbangkan bila auditor meminta.
- Retensi: log tidak dihapus; kebijakan arsip menyusul (KM-04).

## 6. Pemeriksaan
`apps/api/src/db/db.test.ts` (INSERT diperbolehkan; UPDATE, DELETE, TRUNCATE ditolak) dan `apps/api/src/layanan/kegiatan.test.ts` (peristiwa tercatat, tidak tercatat saat ditolak).
