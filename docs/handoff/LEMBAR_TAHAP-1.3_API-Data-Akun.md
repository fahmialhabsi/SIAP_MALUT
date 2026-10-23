# Lembar Tahap 1.3: Basis Data, Data Contoh, Akun dan Peran, API, Log Audit

| | |
|---|---|
| Tanggal | 23 Oktober 2026 |
| Tahap | 1.3 (dipecah 1.3a dan 1.3b, masing-masing satu patch) |
| Status | **Disetujui owner (23 Okt 2026, KP-015)**; dibangun per patch: 1.3a lalu 1.3b |
| Prasyarat | Patch 1.2 sudah di-push (commit `47321cc`, `main` sinkron dengan `origin`) |
| Koreksi ikut | KOR-003 (alamat IP di `dev:lan`) sudah ada di berkas kerja; di-commit bersama patch 1.3a |

## 1. Tujuan
Menyimpan data agenda secara permanen dan menyediakan API aman di atas logika domain 1.2: basis data dan migrasi, **seed data contoh** (berlabel CONTOH), **penjaga produksi yang sungguhan**, **akun dan peran** dengan hak akses sesuai matriks, **log audit yang tidak dapat diubah**, API kegiatan/penugasan/bentrok/perpindahan status, lampiran undangan, serta **OpenAPI dan kamus data yang dihasilkan dari kode**.

## 2. Rujukan wajib
- `docs/standar/KEPUTUSAN_TEKNOLOGI_PURWARUPA.md` (PostgreSQL, Drizzle, Zod) dan bagian 9 (syarat serah terima)
- `docs/standar/STANDAR_DATA_CONTOH.md` (label, `is_contoh`, `APP_MODE`, mode demo, akun `admin.owner`)
- `docs/rekayasa/ATURAN_BISNIS.md` dan `ALUR_PROSES.md` (aturan domain)
- `docs/audit/PAKET_SERAH_TERIMA.md` bagian 2 (log audit, akses berbasis peran, ekspor terbuka)
- Rancangan Bab XI (11.4 data kegiatan, 11.6 entitas tambahan), `CLAUDE.md` Aturan 1, 9, 11, 12

## 3. Pembagian
| Patch | Isi |
|---|---|
| **1.3a: lapisan data** | Skema, migrasi, seed data contoh, penjaga produksi nyata, tabel log audit append-only, pengaturan (durasi bawaan, dll.) sebagai data, kamus data (dihasilkan), inventaris data pribadi, rangka konfigurasi basis data di Docker Compose |
| **1.3b: API dan keamanan** | Akun, kata sandi ber-hash, sesi, hak akses berbasis peran (dari data), endpoint kegiatan/pihak/bentrok/pindah-status, mode demo (pindah persona), lampiran undangan, OpenAPI (dihasilkan), desain keamanan dan kebijakan akses |

## 4. Kebutuhan yang dikerjakan (ID KB)
KB-001, KB-002, KB-003, KB-004 (penyimpanan), KB-016 (log audit nyata), KB-019 (ID/tautan rapat hanya untuk yang ditugaskan dan Protokol), KB-029 (hak akses sesuai matriks, diuji otomatis), KB-031 (seed data contoh), KB-034 (penjaga produksi menghitung `is_contoh` di basis data), KB-036 (aturan/pengaturan sebagai data).
**Baru (diusulkan, masuk RTM saat SETUJU):** KB-041 autentikasi (kata sandi ber-hash, sesi, pembatasan percobaan masuk); KB-042 lampiran undangan (tipe dan ukuran dibatasi, disimpan lewat `FileStore`); KB-043 OpenAPI dan kamus data dihasilkan dari kode; KB-044 log audit tidak dapat diubah atau dihapus (dijaga di basis data).

## 5. Isi pekerjaan
**1.3a**
- Drizzle ORM + migrasi berkas SQL (`apps/api/drizzle/`). Tabel: `pejabat` (direktori pihak), `pengguna`, `peran_izin` (matriks hak akses sebagai data), `sesi`, `kegiatan`, `kegiatan_pihak`, `lampiran`, `pengaturan`, `log_audit`. Semua tabel orang/agenda memiliki `is_contoh`.
- `log_audit` append-only: pemicu (trigger) basis data menolak UPDATE dan DELETE; mencatat aktor, aksi, entitas, nilai sebelum dan sesudah, ID permintaan, waktu. Peristiwa status dari domain (KB-016) tersimpan di sini.
- Seed dari `data/contoh/` (pejabat, agenda fiktif, pengaturan awal, matriks hak akses contoh). Persona demo tidak memiliki kata sandi; `admin.owner` memperoleh kata sandi dari variabel lingkungan atau dibuat acak dan dicetak sekali ke terminal (**tidak pernah disimpan di repo**).
- Penjaga produksi: `APP_MODE=production` menolak start bila ada baris `is_contoh = true`; mode demo tidak.
- Skrip pembangkit: kamus data (`docs/rekayasa/KAMUS_DATA.md`) dari skema, dengan kolom **sensitivitas** per kolom; `docs/keamanan/INVENTARIS_DATA_PRIBADI.md` awal; `docs/keamanan/LOG_AUDIT.md`.
- Docker Compose: layanan PostgreSQL untuk pemasangan kontainer (volume, `healthcheck`, kredensial dari `.env`, bukan dari repo).

**1.3b**
- Autentikasi: kata sandi di-hash (scrypt bawaan Node), sesi acak disimpan sebagai hash di basis data, kuki `httpOnly`, `SameSite=Strict`, kedaluwarsa; pembatasan percobaan masuk dan penguncian sementara; semua tercatat di log audit.
- Hak akses: matriks peran × tindakan dibaca dari data (`peran_izin`) oleh aplikasi **dan** oleh uji otomatis yang sama; `docs/rekayasa/MATRIKS_HAK_AKSES.md` dihasilkan dari data itu (berstatus Placeholder sampai Tahap P).
- Endpoint (semua berawalan `/api`): masuk/keluar/profil; kegiatan (daftar menurut tanggal, ambil, buat, ubah); pihak dan penugasan; `bentrok` (menurut tanggal atau kegiatan); `pindah-status` (memakai `pindahStatus` domain, alasan dan alasan bentrok); direktori pejabat; pengaturan (admin); log audit (admin, baca saja); mode demo: pindah persona (hanya `demo`, hanya admin, tercatat).
- Lampiran undangan: unggah PDF/JPG/PNG (batas ukuran), `FileStore` di disk lokal (`data/unggahan/`, diabaikan Git), unduh hanya bagi yang berhak.
- OpenAPI 3.1 dihasilkan dari skema Zod yang sama dengan validasi (`docs/rekayasa/openapi.json`); uji memeriksa kesesuaiannya.
- Dokumen: `DESAIN_KEAMANAN.md`, `KEBIJAKAN_KEAMANAN.md`, `MANAJEMEN_AKSES.md`.

## 6. Di luar cakupan
Antarmuka agenda dan dasbor peran (1.4); notifikasi, ekspor teks/PDF, mode luring (1.5); rekomendasi pengganti dan bentrok perjalanan (Tahap 2); integrasi SRIKANDI/e-Office/BSrE; SSO; cadangan dan pemulihan terjadwal (Tahap 2); data nyata (Tahap P).

## 7. Kriteria selesai (dapat diperiksa)
- [ ] Gate lolos (lint, test, build, audit-check) di Node 20 dan 22; `docker compose build` lolos.
- [ ] Migrasi berjalan dari kosong; seed menghasilkan agenda contoh yang sama dengan `data/contoh/`; uji memastikan semua baris `is_contoh = true` dan semua nama berlabel CONTOH.
- [ ] Penjaga produksi menolak start bila ada data contoh (diuji pada basis data sungguhan, bukan tiruan).
- [ ] Log audit: UPDATE dan DELETE ditolak basis data (diuji); perpindahan status, masuk/keluar, pindah persona tercatat.
- [ ] Autentikasi: kata sandi salah ditolak, percobaan berulang dikunci, sesi kedaluwarsa, kuki aman (diuji).
- [ ] Hak akses: uji otomatis menelusuri **seluruh** kombinasi peran × endpoint terhadap matriks; tidak ada akses di luar matriks.
- [ ] Bentrok dan pindah-status lewat API sama hasilnya dengan uji domain 1.2 (agenda 22/24/26 Okt fiktif).
- [ ] Tautan/ID rapat hanya terlihat oleh pihak yang ditugaskan dan Protokol (KB-019).
- [ ] Lampiran: tipe/ukuran tidak sesuai ditolak; berkas tersimpan dan terunduh hanya oleh yang berhak.
- [ ] `openapi.json` dan `KAMUS_DATA.md` dihasilkan dari kode dan diperiksa uji.
- [ ] Tidak ada kata sandi, token, atau data pribadi nyata di repo (diperiksa uji pola dan tinjauan).
- [ ] `npm run dev` tetap satu perintah dan langsung berjalan (basis data dev tanpa pengaturan tambahan).

## 8. Gate yang berlaku
lint, test, build, audit-check; ditambah uji terhadap basis data (lihat keputusan 1).

## 9. Dokumen audit yang dibuat atau diperbarui
RK-02 KAMUS_DATA, RK-03 openapi.json, RK-04 DESAIN_KEAMANAN, RK-05 MATRIKS_HAK_AKSES (Placeholder), KM-01 KEBIJAKAN_KEAMANAN, KM-02 INVENTARIS_DATA_PRIBADI, KM-05 MANAJEMEN_AKSES, KM-09 LOG_AUDIT; RTM (KB baru), register risiko, `DAFTAR_PLACEHOLDER` (PH-05 hak akses, PH-07 agenda, PH-03/04 akun), ARSITEKTUR, PEMASANGAN.

## 10. Data contoh dan placeholder
Seed dari `data/contoh/`; `FOLDER_STRUKTUR.md` diperbarui untuk `data/dev/` dan `data/unggahan/` (diabaikan Git, bukan folder tingkat atas baru).

## 11. Risiko khusus
- Dua sumber basis data (dev dan produksi) bila memilih PGlite: perbedaan kecil perilaku; dimitigasi dengan satu skema Drizzle, migrasi yang sama, dan uji ke PostgreSQL nyata sebelum serah terima.
- Keamanan autentikasi dibuat sendiri (tanpa SSO): batasi cakupan, uji ketat, dan tinjau ulang di Tahap 3 (uji penetrasi).
- Tahap besar: dipecah dua patch untuk menekan risiko dan kuota.

## 12. Keputusan Anda sebelum SETUJU
1. **Basis data pengembangan dan uji.** Rekomendasi: **PGlite** (PostgreSQL yang berjalan di dalam proses Node): `npm run dev` dan `npm test` tidak butuh Docker atau pengaturan apa pun; produksi/kontainer memakai **PostgreSQL asli** (layanan di Compose), dan satu uji ke PostgreSQL asli dijalankan sebelum serah terima. Alternatif: PostgreSQL via Docker untuk semuanya (lebih seragam, tetapi `npm run dev` butuh Docker menyala).
2. **Dipecah dua patch (1.3a lalu 1.3b).** Rekomendasi: ya.
3. **Kata sandi `admin.owner`:** dari variabel lingkungan `SIAP_ADMIN_PASSWORD` saat seed pertama; bila kosong dibuat acak dan dicetak **sekali** di terminal. Tidak pernah disimpan di repo. Persona demo tanpa kata sandi. Rekomendasi: ya.
4. **Lampiran undangan** dikerjakan di 1.3b (rekomendasi: ya), atau ditunda ke 1.4 bersama antarmuka.
5. **Izin tetap pra-verifikasi lokal** oleh saya untuk semua tahap pembangunan kode (gate, uji ke basis data, `docker compose build`; hanya melaporkan ringkasan; dapat Anda cabut kapan saja). Rekomendasi: ya, agar tidak ditanya tiap tahap.

**Dijawab owner:** ikuti rekomendasi untuk kelima keputusan (KP-015).
