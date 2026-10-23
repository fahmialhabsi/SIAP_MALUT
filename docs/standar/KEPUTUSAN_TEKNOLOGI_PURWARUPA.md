# Keputusan Teknologi Purwarupa SIAP MALUT (ADR-001)

**Status:** DIPUTUSKAN untuk Tahap 1 (Tahap 0.4, Oktober 2026). Dapat ditinjau ulang sesuai bagian 7.
**Konteks rancangan:** Rancangan 5.6 merekomendasikan pendekatan bertingkat: purwarupa M1 dan M2 dengan *low-code atau kerangka sumber terbuka sederhana*, lalu versi definitif. Dokumen ini memilih antara dua opsi itu.

## 1. Keputusan

Purwarupa dibangun sebagai **aplikasi web progresif (PWA) berbasis kerangka sumber terbuka**, bukan di platform low-code.

| Lapisan | Pilihan | Alasan singkat |
|---|---|---|
| Bahasa | **TypeScript** di seluruh tumpukan | Satu bahasa, tipe data aman, mudah diuji |
| Runtime | **Node.js 20 LTS** (sudah terpasang di komputer owner: v20.20.0) | Selaras dengan gate `npm` yang diwajibkan |
| Antarmuka | **React + Vite**, PWA lewat `vite-plugin-pwa` (service worker) | Arus utama, komunitas luas, mendukung luring |
| Peladen API | **Fastify** (REST/JSON) | Ringan, cepat, skema tervalidasi |
| Basis data | **PostgreSQL** (dev lewat Docker, sudah terpasang) | Waktu/zona, JSON, pencarian; mudah dipindah ke pusat data |
| Akses data | **Drizzle ORM** + migrasi berkas | Skema tertulis di kode, mudah diaudit |
| Validasi | **Zod** (skema bersama klien dan peladen) | Satu sumber aturan input |
| Pengujian | **Vitest** (unit), **Playwright** (alur utama ponsel) | Gate `npm test` |
| Lint dan format | **ESLint** + **Prettier** | Gate `npm run lint` |
| Build | `tsc` + `vite build` | Gate `npm run build` |
| Penyimpanan berkas undangan | Disk lokal di balik antarmuka `FileStore` (siap dipindah ke penyimpanan objek) | Tidak terkunci ke satu vendor |
| Notifikasi | Tahap 1: **Web Push** + tombol "Bagikan ke WhatsApp" (teks siap tempel). Tahap 2: gerbang WhatsApp resmi | WhatsApp resmi butuh akun bisnis dan biaya; jangan menghambat Tahap 1 |
| Otentikasi | Akun lokal + peran (RBAC); SSO menyusul bersama Diskominfosan | Cukup untuk uji coba terbatas |
| Tampilan | Wajib memakai `src/styles/design-tokens.css` | Standar desain (Tahap 0.2) |

Versi pustaka dikunci pada Tahap 1.1 (pakai rilis stabil terbaru saat itu, dicatat di `package.json` dan handoff).

## 2. Mengapa bukan low-code (AppSheet, Budibase, NocoDB)

| Kriteria | Low-code | PWA kustom (dipilih) |
|---|---|---|
| Standar desain wajib (token, mode gelap, target sentuh 48 px) | Sulit/terbatas; token sendiri tidak bisa dijadikan sumber tunggal | Penuh |
| Aturan bentrok dan rekomendasi pengganti (algoritma bertahap, perjalanan antarpulau) | Rumit dan sulit diuji | Modul murni TypeScript yang dapat diuji otomatis |
| Luring dan jaringan lemah (kebutuhan nonfungsional khas Malut) | AppSheet punya mode luring, tetapi terkunci pada vendor | Service worker, dikendalikan sendiri |
| Letak data (Pemprov: pusat data/awan daerah, go.id) | AppSheet menyimpan data di layanan Google | Dapat dipasang di infrastruktur Pemprov |
| Gate lint/test/build dan riwayat Git per tahap (aturan kerja) | Tidak berlaku | Berlaku penuh |
| Penguasaan kode oleh pemda (Rancangan 5.6, risiko penyedia tunggal) | Terkunci pada platform | Kode milik pemda |
| Kecepatan mencapai purwarupa pertama | **Lebih cepat** | Lebih lambat (dimitigasi lewat cakupan sempit) |

Kelemahan nyata keputusan ini: purwarupa pertama lebih lambat daripada low-code. Mitigasinya adalah memangkas cakupan Tahap 1 menjadi **M1+ inti saja** (lihat bagian 5).

## 3. Mengapa bukan opsi lain

- **Next.js/SSR penuh:** tidak dibutuhkan; aplikasi di belakang login, bukan situs publik. SPA/PWA lebih sederhana untuk luring.
- **PHP/Laravel (XAMPP tersedia di komputer owner):** layak, tetapi gate `npm` dan satu bahasa TypeScript lebih konsisten dengan aturan kerja, dan aplikasi web progresif penuh lebih mudah dengan JavaScript.
- **Aplikasi native (Android/iOS):** biaya distribusi dan pemeliharaan tinggi; PWA cukup untuk kebutuhan ponsel.

## 4. Struktur Repo Rencana (Tahap 1.1)

```
SIAP_MALUT/
  apps/
    web/              antarmuka PWA (React + Vite)
    api/              peladen Fastify
  packages/
    domain/           logika murni: deteksi bentrok, rekomendasi pengganti, status tiket
    shared/           skema Zod dan tipe bersama
  docs/ scripts/ src/styles/   (sudah ada)
```

`packages/domain` tidak boleh bergantung pada basis data atau jaringan, agar aturan kewenangan dan bentrok dapat diuji tuntas dengan contoh agenda nyata (22–31 Oktober 2026 dari Kabag Protokol; gunakan data fiktif bila memuat ID rapat).

## 5. Cakupan Tahap 1 yang Diusulkan

Dipecah agar tiap sub-tahap kecil, dapat dipatch, dan menghemat kuota:

| Sub-tahap | Isi | Gate |
|---|---|---|
| 1.1 | Kerangka repo (`package.json`, ESLint, Prettier, Vitest, TypeScript, Vite), token desain terpasang, halaman kosong berstandar, patch pertama dengan gate lengkap | lint, test, build lolos |
| 1.2 | `packages/domain`: model agenda, deteksi **bentrok langsung dan bentrok sumber daya**, uji unit dengan contoh agenda nyata | test |
| 1.3 | API + basis data: akun dan peran, kegiatan, lampiran undangan, PIC, status 4 langkah | test, build |
| 1.4 | Antarmuka ponsel: papan Protokol, kalender, formulir input undangan (kamera/galeri), penetapan kehadiran | lint, test, build; Playwright 360 px |
| 1.5 | Notifikasi Web Push, ekspor teks WhatsApp/PDF, mode luring baca-saja | test |
| 1.6 | Uji coba terbatas bersama Bagian Protokol, evaluasi | laporan |

M2 (permohonan) dan rekomendasi pengganti penuh mengikuti sesuai peta jalan (Rancangan 11.8); aturan kewenangan hanya disiapkan sebagai data.

## 6. Prasyarat (Keputusan Owner / Pihak Lain)

1. **Tempat pemasangan.** Purwarupa awal boleh jalan di laptop/komputer Biro (untuk uji coba), tetapi **sebelum data nyata dimasukkan**, dikoordinasikan dengan Diskominfosan untuk server dan domain go.id. *(Belum ada konfirmasi.)*
2. **Data nyata.** Uji coba awal memakai data fiktif atau agenda yang sudah dipublikasikan. Meeting ID dan kata sandi rapat tidak dimasukkan ke repo atau data uji.
3. **Pengesahan Kepala Biro** atas standar desain dan tumpukan ini.
4. **Pendaftaran aplikasi** dalam Arsitektur SPBE (Rancangan 2.5).

## 7. Kriteria Meninjau Ulang

Keputusan ditinjau bila: (a) Diskominfosan mewajibkan tumpukan tertentu (mis. PHP/Laravel atau Java); (b) setelah Tahap 1.3 laju kerja ternyata jauh di bawah yang diharapkan; (c) pusat data Pemprov tidak mendukung Node.js/PostgreSQL. Perubahan dicatat sebagai ADR baru, bukan menimpa dokumen ini.

## 8. Risiko Keputusan

| Risiko | Mitigasi |
|---|---|
| Tumpukan berbeda dari yang dikelola Diskominfosan | Libatkan Diskominfosan pada Tahap 0.5; logika domain murni mudah dialihkan |
| Satu pengembang (owner) dan asisten AI menjadi titik tunggal | Handoff tiap tahap, gate otomatis, dokumentasi di repo |
| Cakupan membengkak | Sub-tahap kecil; fitur baru masuk daftar tunggu |
| Notifikasi WhatsApp resmi tertunda | Web Push dan teks siap tempel sebagai jalur cadangan |
