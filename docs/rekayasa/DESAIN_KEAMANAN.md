# Desain Keamanan Aplikasi (RK-04)

**Versi:** Tahap 1.3b. Mencerminkan kode saat ini (`apps/api`). Bagian bertanda **belum** adalah celah yang diketahui. Rujukan regulasi/standar wajib diverifikasi sebelum dikutip (Aturan 9 butir 8).

## 1. Ancaman yang Dibahas
Pencurian atau tebakan kata sandi, pembajakan sesi, akses melebihi hak (termasuk kegiatan milik pihak lain), pemalsuan permintaan lintas situs (CSRF), unggahan berkas berbahaya, kebocoran rahasia (tautan rapat, kata sandi) lewat log, pengubahan jejak audit, serta data contoh yang terbawa ke produksi.

## 2. Lapisan Pertahanan

| Lapisan | Kontrol | Bukti (uji / berkas) |
|---|---|---|
| Kata sandi | Hash **scrypt** (N=2^15, r=8, p=1, garam acak 16 byte), perbandingan waktu-konstan; sandi tidak pernah disimpan, dicatat, atau dikembalikan | `db/sandi.ts`; `sandi.test.ts`; `auth.test.ts` (log audit tidak memuat sandi) |
| Penelusuran akun | Pesan galat sama untuk pengguna tak dikenal dan sandi salah; verifikasi tiruan menyamakan waktu | `masuk.ts`; `auth.test.ts` |
| Percobaan berulang | 5 kegagalan beruntun mengunci akun 15 menit; semua kejadian tercatat | `auth.test.ts` (kunci dan buka kunci) |
| Sesi | Token acak 256 bit; hanya hash SHA-256 di basis data; kedaluwarsa 12 jam; keluar menghapus sesi; akun dinonaktifkan langsung memutus sesi | `keamanan/sesi.ts`; `auth.test.ts` |
| Kuki | `httpOnly`, `SameSite=Strict`, `Path=/`, `Secure` pada mode production | `auth.test.ts` |
| CSRF | SameSite=Strict **dan** pemeriksaan `Origin` = `Host` pada setiap permintaan pengubah | `app.ts`; `auth.test.ts`; diuji lewat proksi dev dan nginx |
| Otorisasi | Urutan tetap **autentikasi → izin → validasi → penangan**; izin dari matriks sebagai data; deny-by-default (rute non-publik wajib mendeklarasikan izin) | `rute.ts`; `rbac.test.ts` (9 peran × semua rute) |
| Pembatasan data | `baca_terkait` hanya kegiatan yang memuat dirinya (404 bukan 403 agar keberadaan tidak bocor); lampiran mengikuti kegiatan | `layanan/kegiatan-detail.ts`; `rbac.test.ts`; `lampiran.test.ts` |
| Rahasia pada data | Tautan rapat hanya untuk peran berizin atau pihak yang ditugaskan; disamarkan di log audit | `rbac.test.ts` (KB-019) |
| Validasi masukan | Skema Zod pada jalur, query, dan isi; waktu wajib ISO 8601 + zona; batas panjang; galat 400 dengan rincian | `skema-dto.ts`; `kegiatan-api.test.ts` |
| Unggahan | Jenis dikenali dari **isi** (magic bytes PDF/JPG/PNG), bukan nama/tipe kiriman; batas 10 MB; nama simpan acak; nama tampil dibersihkan; unduhan `attachment` + `nosniff` | `penyimpanan.ts`; `lampiran.test.ts` |
| Header | `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `Cache-Control: no-store` untuk `/api` | `app.ts`; `auth.test.ts` |
| Jejak audit | Tabel append-only (pemicu menolak UPDATE/DELETE/TRUNCATE); pencatatan satu transaksi dengan perubahan; aktor, peran, ID permintaan, IP | `LOG_AUDIT.md`; `db.test.ts` |
| Mode demo | Pindah persona hanya `APP_MODE=demo` dan hanya admin; tercatat; produksi menjawab 404 | `demo.test.ts` |
| Data contoh | Penjaga produksi menolak start bila ada baris `is_contoh` | `penjaga-db.ts`; uji PG asli dan kontainer |
| Galat | Galat tak terduga dijawab generik (500) dan dicatat di log; tidak ada jejak tumpukan ke klien | `app.ts` |
| Kontainer | API berjalan sebagai pengguna non-root; API tidak dibuka ke luar (hanya lewat nginx); kata sandi basis data wajib dari `.env` | `Dockerfile`, `docker-compose.yml` |

## 3. Aliran Autentikasi
1. `POST /api/sesi` (publik) → pemeriksaan kunci akun → verifikasi sandi → sesi baru → kuki. 2. Setiap permintaan lain: kuki → hash → sesi berlaku? → akun aktif? → izin peran (efektif; akun asli untuk fitur demo) → penangan. 3. `DELETE /api/sesi` menghapus sesi.

## 4. Celah dan Batas yang Diketahui (jujur)
- **Belum ada pembatasan laju per IP** (hanya penguncian per akun); penguncian akun dapat dimanfaatkan untuk menutup akun orang lain (DoS akun). Dipertimbangkan Tahap 3.
- **Belum ada autentikasi dua faktor atau SSO** (SSO menyusul saat serah terima).
- **Tidak ada pemindaian virus** pada lampiran; hanya pembatasan jenis, ukuran, dan unduhan sebagai lampiran.
- **TLS** tidak ditangani aplikasi; wajib di depan nginx pada produksi (`Secure` bergantung `APP_MODE=production`).
- Kata sandi sementara `admin.owner` tercetak sekali di terminal/log kontainer pada mode demo (RS-30).
- Superuser basis data dapat menonaktifkan pemicu audit (RS-29; mitigasi saat serah terima).
- `SIAP_TRUST_PROXY=true` hanya aman bila API tidak dapat dijangkau langsung (Compose tidak membukanya).
- **Belum diuji penetrasi** (Tahap 3, KM-07).
