# Handoff Tahap 1.3b: API, Autentikasi, Hak Akses, Lampiran, OpenAPI

| | |
|---|---|
| Tanggal | 24 Oktober 2026 |
| Tahap | 1.3b (bagian kedua Tahap 1.3) |
| Lembar Tahap | `docs/handoff/LEMBAR_TAHAP-1.3_API-Data-Akun.md` (disetujui, KP-015) |
| Commit | dibuat saat owner menjalankan `scripts/patch/tahap-1.3b.ps1` |
| Penyusun | Claude (Sonnet 5.5) |
| Status | Selesai dan diverifikasi lokal (PGlite, PostgreSQL 16 asli, proksi dev, kontainer + nginx); commit/push menunggu owner |

## 1. Tujuan
API aman di atas logika domain dan lapisan data 1.3a: autentikasi, hak akses berbasis peran dari data, endpoint kegiatan/pihak/bentrok/pindah-status, lampiran, pengaturan, audit, mode demo (pindah persona), serta OpenAPI dan matriks hak akses yang dihasilkan dari kode.

## 2. Yang dikerjakan
- **Registri rute** (`rute.ts`): satu deklarasi per rute (metode, jalur, izin, skema Zod); urutan tetap autentikasi → izin → validasi → penangan; dipakai untuk pemasangan, uji hak akses, dan OpenAPI. **22 rute** (`/api/sesi`, `/api/saya`, `/api/pejabat`, `/api/kegiatan` (+ rincian, ubah, pihak PUT/DELETE, pindah-status), `/api/bentrok`, lampiran (unggah, daftar, unduh), `/api/pengaturan`, `/api/audit`, `/api/hak-akses`, `/api/demo/persona` GET/POST/DELETE).
- **Autentikasi**: scrypt, sesi kuki httpOnly SameSite=Strict (Secure di production), hanya hash token tersimpan, kedaluwarsa 12 jam, penguncian 15 menit setelah 5 gagal, pesan galat tidak membocorkan akun, CSRF tambahan (Origin = Host).
- **Hak akses sebagai data**: `data/contoh/hak-akses.json` → tabel `peran_izin` (65 baris) → dibaca aplikasi, uji, dan dokumen. 17 izin, 9 peran. Pembatasan data: `baca_terkait` hanya kegiatan miliknya (404 bukan 403); tautan rapat (KB-019) hanya peran berizin atau pihak ditugaskan/diterima, disamarkan di log audit.
- **Kegiatan/pihak/status**: buat, ubah (kecuali status terkunci), tetapkan dan hapus pihak, pejabat menerima/menolak penugasan dirinya, pindah status lewat aturan domain (422 dengan rincian; bentrok pasti butuh alasan; peristiwa ke log audit).
- **Lampiran**: PDF/JPG/PNG dikenali dari isi, 10 MB, nama simpan acak, nama tampil dibersihkan, unduhan `attachment` + `nosniff`, akses mengikuti kegiatan; antarmuka `Penyimpanan` (disk/memori).
- **Mode demo**: admin berpindah persona (hak persona berlaku; izin demo dari akun asli; aktor ganda di audit); `production` menjawab 404.
- **Proksi satu asal**: Vite `/api` → API (`changeOrigin:false`); nginx meneruskan `/api`, `/health`, `/ready`; `SIAP_TRUST_PROXY`; API tidak dibuka ke luar pada Compose; volume `siap_unggahan`.
- **Dokumen dihasilkan**: `openapi.json`, `MATRIKS_HAK_AKSES.md` (`npm run docs:api`), kamus data dan inventaris (`npm run docs:data`, tambah kolom `sesi.persona_id`, migrasi `0002`).
- **Dokumen tulis tangan**: `DESAIN_KEAMANAN.md`, `KEBIJAKAN_KEAMANAN.md`, `MANAJEMEN_AKSES.md`; pembaruan LOG_AUDIT, PEMASANGAN, ARSITEKTUR, RENCANA_UJI, ADR (revisi 3), RTM, risiko RS-33..36, PH-05, daftar induk.

## 3. Hasil verifikasi (oleh asisten, lokal)
| Pemeriksaan | Hasil |
|---|---|
| `npm run lint`, `npm test`, `npm run build` | Lolos di **Node 20.20.0 dan 22.22.0** dan di **Windows PowerShell 5.1** (cara patch memanggil gate); **186 uji**: shared 12, domain 51, **api 112**, web 4, skrip 7 |
| Uji API di **PostgreSQL 16 asli** | **188 uji lulus** (PGlite + PostgreSQL) |
| Hak akses lintas peran | **180 kombinasi** (9 peran × 20 rute) sesuai matriks; 401 tanpa kuki pada semua rute non-publik |
| Alur nyata lewat proksi dev (`npm run dev`, data dev dibersihkan setelahnya) | 16 pemeriksaan OK (masuk, daftar, bentrok, buat, unggah+unduh, persona, audit, asal berbeda 403, keluar) |
| Kontainer penuh `db + api + web(nginx)` | Alur yang sama OK lewat nginx; lampiran di volume bertahan setelah restart; IP asal tercatat lewat proksi; semua dibersihkan |
| `gate-tahap-1.3b-asisten.txt`, `verifikasi-api-tahap-1.3b.txt` | Bukti di `docs/audit/bukti-gate/` |
| `patch/tahap-1.3b.ps1` dijalankan | Belum (dijalankan owner) |

**Temuan dan perbaikan selama pengujian:** (a) proksi Vite mengganti `Host` sehingga semua POST ditolak pemeriksaan Origin (RS-36) → `changeOrigin:false`; (b) `selesai`/`mulai` tanpa zona waktu menyebabkan 500 di validasi objek → diperbaiki dan diuji; (c) uji paralel 11 berkas membuat PGlite kehabisan waktu → `maxWorkers: 3` dan batas waktu 120 detik; (d) uji lintas peran sempat memanggil keluar (DELETE /api/sesi) sehingga memutus sesinya sendiri → dikecualikan (diuji di `auth.test.ts`).

### Dokumen audit terdampak (Aturan 9)
- [x] `DAFTAR_DOKUMEN_AUDIT.md`: RK-03, RK-04, KM-01, KM-05 menjadi Ada; RK-05 Placeholder (Ada 34, Draf 2, Placeholder 2, Belum 33)
- [x] `MATRIKS_KETERLUSURAN.md`: 18 baris diperbarui; KB-045, KB-046 baru
- [x] `REGISTER_RISIKO.md`: RS-33..36
- [x] Dokumen dari kode dibangkitkan: `openapi.json`, `MATRIKS_HAK_AKSES.md`, `KAMUS_DATA.md`, `INVENTARIS_DATA_PRIBADI.md` (uji menjaga), SBOM saat patch
- [x] `audit-check` lolos
- Belum waktunya: KM-03 (DPIA), KM-04 (retensi), KM-06 (insiden), KM-07 (uji penetrasi), KM-08 (rahasia), OP-03..08

## 4. Keputusan dan asumsi
- Matriks hak akses (65 baris) adalah **usulan placeholder** dari saya (PH-05); perlu disahkan Biro dan Sekda. Contoh: ajudan boleh membuat dan menetapkan kegiatan; pimpinan hanya membaca, menetapkan pihak, dan memindahkan status; pejabat hanya mengonfirmasi penugasan dirinya. Konfirmasi lewat KT-03/KT-04.
- Kegiatan yang dibuat pada mode demo berpenanda `is_contoh = true`; pada production `false`.
- Sesi memakai tabel basis data (bukan JWT) agar dapat dicabut dan diaudit; tidak ada CORS (satu asal lewat proksi).
- API tidak lagi dibuka ke luar pada Compose (`API_PORT` dihapus); akses lewat nginx.

## 5. Belum selesai / belum diverifikasi
- **Antarmuka** untuk semua fitur (masuk, agenda, dasbor, persona) = Tahap 1.4; saat ini hanya API.
- Belum ada fitur admin membuat/menonaktifkan akun, mengganti sandi sendiri, mengubah matriks lewat aplikasi (RS-35); pembatasan laju per IP (RS-33); pemindaian virus (RS-34).
- Batas unggahan di nginx (12 MB) tidak diuji; tidak ada uji beban/penetrasi.
- Pembuatan admin produksi dan impor data asli: Tahap P.
- Uji otomatis untuk proksi (KB-046) belum ada; diverifikasi manual.
- KT-01..04, AK-01, AK-03.

## 6. Risiko
RS-33 (laju), RS-34 (virus), RS-35 (admin akun), RS-29/30 (superuser DB, sandi sementara); RS-36 (proksi) tertutup.

## 7. Catatan untuk owner
- Hentikan terminal `npm run dev` lama (Ctrl+C) sebelum patch/menjalankan lagi.
- Setelah patch, `npm run dev` lalu uji dengan alamat `http://localhost:5180` (web); API lewat `http://localhost:5180/api/...`. Tanpa antarmuka, uji dapat memakai `docs/rekayasa/openapi.json` (mis. di Swagger Editor) atau curl; kuki dan header `Origin` perlu diperhatikan.
- Data lama di `data/dev` (jika ada) dibuat sebelum kolom `persona_id`; migrasi `0002` dijalankan otomatis saat start, jadi aman. Untuk mengulang dari nol, hapus folder `data/dev`.

## 8. Langkah berikutnya
1. Owner menjalankan patch 1.3b, lalu `npm run dev`.
2. Tahap **1.4**: antarmuka ponsel (masuk, agenda harian/mingguan, kartu kegiatan dengan lencana status ikon+teks, peringatan bentrok, penetapan kehadiran cepat, dasbor per peran, pemilih persona mode demo) mengikuti standar desain. Ketik `TAHAP 1.4`.

## 9. Cara melanjutkan
Sesi baru: **"Baca CLAUDE.md dan STATUS.md, lalu LANJUT."**
