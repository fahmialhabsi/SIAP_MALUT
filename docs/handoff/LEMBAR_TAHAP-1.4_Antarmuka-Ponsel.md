# Lembar Tahap 1.4: Antarmuka Ponsel, Dasbor per Peran, dan Persona Demo

| | |
|---|---|
| Tanggal | 24 Oktober 2026 |
| Tahap | 1.4 (dipecah 1.4a dan 1.4b, masing-masing satu patch) |
| Status | **Disetujui (KP-016, 24 Okt 2026, keempat rekomendasi)**. 1.4a selesai (`HANDOFF_TAHAP-1.4a_Antarmuka-Ponsel-Baca.md`); 1.4b belum dikerjakan |
| Prasyarat | Patch 1.3b sudah di-push (commit `2d4c683`; `main` sinkron dengan `origin`, pohon kerja bersih) |

## 1. Tujuan
Menjadikan aplikasi **dapat dipakai dari ponsel**: masuk, melihat agenda harian dan mingguan, memahami bentrok, memutuskan kehadiran dengan sedikit ketukan, mengelola undangan dan lampiran, serta tampilan dasbor yang berbeda untuk pimpinan, Protokol, pejabat pengganti, kepala biro, dan admin. Mengikuti `STANDAR_DESAIN.md` sepenuhnya, termasuk mode demo dengan pemilih persona agar Anda dapat menilai dasbor tiap peran dan menunjukkannya kepada Kabag Protokol (KP-005).

## 2. Rujukan wajib
- `docs/standar/STANDAR_DESAIN.md` (seluruhnya, terutama bagian 3 warna/status, 5 komponen, 6 aksesibilitas, 8 daftar periksa) dan `src/styles/design-tokens.css`
- Rancangan Bab XI: 11.2 (alur 4 langkah), 11.3 (contoh agenda), 11.5 (fitur inti M1+: A, B, C, D, E, F)
- `docs/rekayasa/openapi.json`, `MATRIKS_HAK_AKSES.md`, `ATURAN_BISNIS.md`, `DESAIN_KEAMANAN.md`
- `docs/standar/STANDAR_DATA_CONTOH.md` (spanduk DATA CONTOH, persona), `CLAUDE.md` Aturan 1, 9, 11, 12

## 3. Pembagian
| Patch | Isi |
|---|---|
| **1.4a: Kerangka, baca, dan dasbor** | Fondasi UI (router, klien API, tipe API dihasilkan dari OpenAPI, ikon, komponen dasar, tema terang/gelap); masuk dan keluar; navigasi bawah menurut izin; spanduk DATA CONTOH dan **pemilih persona**; **Agenda** (tampilan harian + jalur minggu); kartu kegiatan; **rincian kegiatan** (baca); **dasbor per peran**; halaman **Bentrok**; uji komponen dan uji ponsel 360 px otomatis (Playwright + axe) |
| **1.4b: Tindakan** | **Form undangan** (buat dan ubah); **keputusan kehadiran cepat** (hadir sendiri, wakilkan, tidak hadir, tunda) lewat **endpoint atomik baru**; pindah status dengan alasan; pejabat menerima atau menolak penugasan; **lampiran** (ambil foto/pilih berkas, unggah, unduh); **Pengaturan** dan **Log audit** (admin dan kepala biro); uji alur utama ujung ke ujung |

## 4. Kebutuhan yang dikerjakan (ID KB)
KB-001, KB-002, KB-003 (tampilan input), KB-005 (keputusan kehadiran), KB-006 (agenda tersaji lengkap dengan pejabat yang hadir), KB-007 (ponsel pertama), KB-008 (peringatan bentrok terlihat), KB-020 (standar desain: token, 16 px, 48 px, status ikon+teks), KB-021 (tampilan per peran), KB-032 dan KB-033 (persona demo dan spanduk), KB-037 (dasbor pejabat, staf, admin), KB-036 (teks UI di satu berkas), KB-013 (pejabat menerima/menolak dari ponsel).
**Baru (masuk RTM saat SETUJU):**
- **KB-047** keputusan kehadiran **atomik**: satu permintaan mengatur kedudukan pimpinan dan pengganti, dan memindahkan status bila diminta, dalam satu transaksi dengan satu catatan audit.
- **KB-048** tanggal dan waktu ditampilkan dalam **WIT** dengan format baku (`Sabtu, 24 Oktober 2026`, `20.00 WIT`).
- **KB-049** tipe API di antarmuka **dihasilkan dari `openapi.json`** (tidak ditulis tangan), dengan uji kesesuaian.
- **KB-050** aksesibilitas **otomatis**: tanpa gulir horizontal di 360 px, teks isi ≥ 16 px, target sentuh ≥ 48 px, kontras (axe) terang dan gelap, status selalu ikon + teks.

## 5. Isi pekerjaan
**Layar dan perilaku**
| Layar | Isi |
|---|---|
| Masuk | Nama pengguna dan kata sandi; pesan galat jelas (salah, akun terkunci dengan jam buka); tombol tampil sandi; tidak ada petunjuk sandi |
| Kerangka | Kepala dengan nama pengguna dan peran; spanduk DATA CONTOH (demo); bilah navigasi bawah maksimal 5 butir yang ditentukan oleh izin (Beranda, Agenda, Bentrok, Direktori/Lainnya, Akun); keluar; ganti tema |
| Pemilih persona | Hanya admin pada mode demo: "Lihat sebagai..." memilih persona; pita tetap "Anda melihat sebagai X" dengan tombol Kembali |
| Beranda (dasbor) | **Pimpinan/ajudan:** menunggu arahan (daftar dengan keputusan cepat), agenda hari ini, bentrok mendatang. **Protokol/Kabag:** hitungan per status (Baru, Menunggu Arahan, Ditetapkan, Terkonfirmasi), yang perlu ditetapkan ≤ 3 hari, bentrok. **Pejabat:** penugasan saya menunggu konfirmasi (Terima/Tolak), agenda saya. **Kepala biro:** ringkasan dan akses audit. **Admin:** ringkasan, pengaturan, audit, persona |
| Agenda | Jalur 7 hari (titik penanda ada kegiatan dan bentrok), navigasi hari sebelumnya/berikutnya dan pemilih tanggal, kartu kegiatan terurut jam |
| Kartu kegiatan | Jam (angka rata), judul, lokasi dan pulau, lencana status (ikon + teks), lencana **Bentrok** (ikon + teks), ringkasan siapa hadir, PIC; seluruh kartu dapat diketuk (≥ 48 px) |
| Rincian kegiatan | Semua data, daftar pihak berikut kedudukan, tautan rapat (hanya bila berhak), lampiran, peringatan bentrok dengan penjelasan, riwayat status dari log audit (ringkas) |
| Bentrok | Daftar menurut tanggal, dikelompokkan per pihak, dengan keterangan "pasti" atau "potensi" dan saran tindakan (tanpa rekomendasi pengganti; itu Tahap 2) |
| **1.4b** Form undangan | Judul, jenis, waktu mulai/selesai (pemilih WIT), lokasi, penyelenggara, PIC protokol, PIC pengundang, tautan rapat, catatan, pihak diundang; lampiran dari kamera atau galeri |
| **1.4b** Keputusan kehadiran | Lembar bawah (bottom sheet): **Hadir sendiri**, **Wakilkan** (pilih pejabat; menampilkan peringatan bila pejabat itu sibuk pada jam yang sama), **Tidak hadir**, **Tunda** (alasan wajib) dalam ≤ 3 ketukan |
| **1.4b** Status | Tombol sesuai aturan (hanya perpindahan yang sah), dialog alasan, dan **konfirmasi alasan bila bentrok pasti** |
| **1.4b** Pengaturan, Audit | Admin mengubah durasi bawaan; admin dan kepala biro membaca log audit |

**Teknis**
- Router sisi klien (`react-router`), klien `fetch` kecil dengan penanganan 401 (kembali ke Masuk), 403, 422 (rincian tampil), dan jaringan terputus; tanpa pustaka status global.
- Tipe API dihasilkan dari `openapi.json` (`openapi-typescript`, dev-only) ke `apps/web/src/api/` dan diuji sinkron.
- Ikon sebagai komponen SVG sendiri (tanpa pustaka ikon dan tanpa emoji); semua gaya lewat token; semua teks lewat `teks-ui.ts`.
- Tema: mengikuti sistem, dapat diganti manual (disimpan di perangkat, aman bila penyimpanan diblokir).
- Service worker: **tidak** mengembalikan `index.html` untuk `/api`, `/health`, `/ready` (agar unduhan lampiran dan navigasi API tidak rusak); mode luring baca-saja menyusul di 1.5.
- **API (1.4b):** satu rute baru `POST /api/kegiatan/:id/keputusan-kehadiran` (izin `pihak.kelola`), tercatat di log audit, dengan uji dan dokumen OpenAPI/matriks yang dibangkitkan ulang.
- Uji: komponen (Vitest + Testing Library, `fetch` ditiru) dan **ujung ke ujung di ponsel 360 px dan 412 px** (Playwright + Chromium) terhadap aplikasi nyata (PGlite, data contoh) termasuk pemeriksaan aksesibilitas otomatis (axe) mode terang dan gelap; **tangkapan layar** disimpan sebagai bukti peninjauan visual. Uji ujung ke ujung dijalankan lewat `npm run test:e2e` (di luar `gate` agar gate tetap cepat) dan dijalankan oleh saya pada pra-verifikasi; hasilnya disimpan di `docs/audit/bukti-gate/`.

## 6. Di luar cakupan
Notifikasi dan ekspor teks/PDF (1.5); mode luring dan sinkronisasi (1.5); rekomendasi pengganti berdasarkan aturan kewenangan dan bentrok perjalanan antarpulau (Tahap 2); permohonan layanan M2 dan portal pemohon (Tahap 2); naskah M3, dokumentasi M4, tamu M5; antarmuka admin akun dan matriks hak akses (Tahap 2); logo resmi (Tahap P).

## 7. Kriteria selesai (dapat diperiksa)
- [ ] Gate lolos (lint, test, build, audit-check) di Node 20 dan 22 dan di PowerShell 5.1; `npm run test:e2e` lolos.
- [ ] Setiap layar di bagian 5 dapat dipakai pada lebar **360 px** tanpa gulir horizontal; teks isi ≥ 16 px; semua kontrol ≥ 48 × 48 px; fokus terlihat; mode terang dan gelap lolos axe (kontras).
- [ ] Status dan bentrok **selalu** ikon + teks (diperiksa otomatis dan pada tangkapan layar).
- [ ] Hak akses di antarmuka mengikuti izin: butir navigasi dan tombol yang tidak berizin **tidak tampil**; API tetap menolak bila dipaksa.
- [ ] Persona demo: admin dapat berpindah ke semua persona, melihat dasbor masing-masing, dan kembali; pita persona selalu tampil; pada mode production pemilih tidak ada.
- [ ] Alur nyata di ponsel (Playwright): masuk → agenda 26 Okt memperlihatkan bentrok → rincian → (1.4b) keputusan "wakilkan" → pejabat menerima → status Terkonfirmasi → keluar.
- [ ] Keputusan kehadiran atomik: gagal sebagian tidak meninggalkan perubahan separuh (diuji), satu catatan audit.
- [ ] Tipe API dihasilkan dari OpenAPI dan uji sinkron lolos; tidak ada teks UI atau warna langsung di komponen (pemeriksa token lolos).
- [ ] Ukuran halaman awal tetap < 300 KB terkompresi; `/api` tidak dilayani `index.html` oleh service worker (diuji).
- [ ] Daftar periksa `STANDAR_DESAIN.md` bagian 8 dicentang dengan bukti di handoff.
- [ ] RTM dan daftar induk diperbarui; dokumen pengguna ringkas (PG-01, PG-02) dibuat dari layar yang ada.

## 8. Gate yang berlaku
lint (termasuk pemeriksa token), test, build, audit-check; ditambah `npm run test:e2e` pada pra-verifikasi.

## 9. Dokumen audit yang dibuat atau diperbarui
PG-01 `PANDUAN_PENGGUNA.md` (per peran, dengan tangkapan layar), PG-02 `PANDUAN_ADMIN.md` (awal), MU-08 `UJI_AKSESIBILITAS.md` (hasil axe + pemeriksa kustom), `RENCANA_UJI.md`, RTM, register risiko, ARSITEKTUR, PEMASANGAN (cara menjalankan uji e2e), `openapi.json` dan `MATRIKS_HAK_AKSES.md` (rute baru), daftar induk. Placeholder: PH-11 (dasbor) terisi, PH-13 (ikon) tetap.

## 10. Data contoh dan placeholder
Seluruh tampilan memakai data contoh dari seed demo; spanduk DATA CONTOH tampil pada semua halaman demo.

## 11. Risiko khusus
- **Cakupan besar:** itu sebabnya dipecah dua patch; fitur yang tidak muat dimundurkan ke Register Koreksi, bukan dipotong diam-diam.
- **Verifikasi visual:** tangkapan layar peramban bawaan sering kehabisan waktu; Playwright menghasilkan gambar yang dapat saya tinjau, tetapi **penilaian rasa pakai di ponsel Anda tetap perlu Anda lakukan** (`npm run dev:lan`).
- **Playwright** mengunduh Chromium (±150–200 MB) sekali; tidak menyentuh gate.
- Keputusan UX (mis. susunan dasbor) adalah tafsiran saya dari dokumen Protokol; dikonfirmasi Kabag saat melihat aplikasi (KT-03), dibuat mudah diubah lewat konfigurasi teks dan komponen.

## 12. Keputusan Anda sebelum SETUJU
1. **Dipecah 1.4a (kerangka, baca, dasbor) lalu 1.4b (tindakan).** Rekomendasi: ya.
2. **Uji ujung ke ujung dengan Playwright + axe** (unduh Chromium sekali, di luar gate) dan tangkapan layar sebagai bukti. Rekomendasi: ya. Alternatif: hanya uji komponen dan pemeriksaan manual (lebih ringan, bukti visual dan aksesibilitas lebih lemah).
3. **Satu endpoint API baru** untuk keputusan kehadiran atomik (bagian 5). Rekomendasi: ya (lebih benar dan teraudit dibanding beberapa panggilan terpisah dari ponsel).
4. **Tampilan awal Agenda = hari ini menurut WIT** dengan tombol "Ke tanggal data contoh" (data contoh berada di 22–31 Okt 2026 dan 2–3 Nov). Rekomendasi: ya.

Balas **`SETUJU`** (beserta jawaban 1–4, atau "ikuti rekomendasi") untuk mulai membangun 1.4a.
