# Lembar Tahap 1.1: Kerangka Repo dan Gate npm Pertama

| | |
|---|---|
| Tanggal | 23 Oktober 2026 |
| Tahap | 1.1 |
| Status | **Disetujui owner (23 Okt 2026, KP-012)**; dibangun; lihat handoff |
| Berkas ini di-commit bersama patch Tahap 1.1 (bukan patch terpisah, hemat kuota) |

## 1. Tujuan
Membangun kerangka proyek yang sudah dapat dipasang, diuji, dibangun, dan dikemas, dengan gate `lint`, `test`, `build` yang nyata, token desain terpasang, dan syarat teknis serah terima (kontainer, konfigurasi lingkungan, `/health`, log JSON) ada sejak hari pertama. **Belum ada fitur bisnis.**

## 2. Rujukan wajib
- `docs/standar/KEPUTUSAN_TEKNOLOGI_PURWARUPA.md` bagian 1, 4, 5 (sub-tahap 1.1), 9
- `docs/audit/PAKET_SERAH_TERIMA.md` bagian 2
- `docs/standar/STANDAR_DESAIN.md`, `src/styles/design-tokens.css`
- `docs/standar/STANDAR_DATA_CONTOH.md` bagian 4 (`APP_MODE`)
- `docs/standar/FOLDER_STRUKTUR.md`, `CLAUDE.md` Aturan 1, 3, 9, 11, 12

## 3. Kebutuhan yang dikerjakan (ID KB)
- **KB-030** (kontainer + konfigurasi lingkungan) penuh
- **KB-020** (standar desain): fondasi (token terpasang, pemeriksa token otomatis)
- **KB-034** (penjaga produksi): rangka awal (`APP_MODE`, default `production`, nilai tak valid menggagalkan start); pemeriksaan data contoh menyusul di 1.3
- **KB-033** (spanduk DATA CONTOH di mode demo): halaman awal
- **KB-036**: fondasi (teks antarmuka di satu berkas; konfigurasi dari lingkungan)

## 4. Isi pekerjaan
| Bagian | Isi |
|---|---|
| Monorepo | `package.json` akar dengan npm workspaces: `apps/web`, `apps/api`, `packages/domain`, `packages/shared`; TypeScript ketat; Node 20 |
| Perkakas mutu | ESLint, Prettier, Vitest; skrip akar `lint`, `test`, `build`; `lint` juga menjalankan **pemeriksa token** (menolak warna heksadesimal/`rgb()` langsung di kode antarmuka, Aturan 1) |
| `packages/shared` | Skema Zod konfigurasi lingkungan (`APP_MODE=demo\|production`, port, tingkat log); satu sumber untuk web dan api |
| `packages/domain` | Kerangka murni; satu definisi `StatusAgenda` (Baru, Menunggu Arahan, Ditetapkan, Terkonfirmasi, Berlangsung, Selesai, Dibatalkan, Ditunda) beserta uji (KB-004) |
| `apps/api` | Fastify; `GET /health`, `GET /ready`; log JSON dengan ID permintaan; validasi konfigurasi saat start; uji lewat `inject` |
| `apps/web` | React + Vite + PWA (manifest, service worker); halaman awal berstandar (token, mode terang/gelap, 16 px, 48 px, tanpa gulir horizontal di 360 px); **spanduk "DATA CONTOH"** saat mode demo; teks antarmuka di satu berkas (`teks-ui`); uji komponen |
| Kontainer | `Dockerfile` (api dan web), `docker-compose.yml`, `.dockerignore`, `.env.example` (tanpa rahasia) |
| Bukti mutu | `scripts/patch/tahap-1.1.ps1` menyimpan keluaran gate ke `docs/audit/bukti-gate/`; SBOM (`npm sbom`) disimpan ke `docs/audit/sbom/` |
| Gate | `scripts/gate.ps1` yang sudah ada kini menjalankan `npm ci` bila perlu, lalu lint, test, build (sebelumnya dilewati) |

## 5. Dokumen audit yang dibuat atau diperbarui (versi ringkas tapi nyata)
RK-01 `ARSITEKTUR.md`, MU-02 `STANDAR_KODE.md`, MU-03 bukti gate, MU-04 `RENCANA_UJI.md`, MU-09 SBOM, AK-02 daftar lisensi (dari SBOM), OP-01 `PEMASANGAN.md`, OP-02 `KEBUTUHAN_INFRASTRUKTUR.md`, OP-06 `MANAJEMEN_PERUBAHAN.md`. RTM: KB di atas berstatus **Dibangun/Teruji** dengan nama uji menyebut ID. Status di daftar induk menjadi **Ada** hanya bila berkasnya benar ada dan sesuai kode.

## 6. Di luar cakupan
Basis data dan migrasi (1.3), akun/peran/autentikasi (1.3), logika bentrok (1.2), API bisnis, OpenAPI dan kamus data (1.3), Playwright dan uji ponsel otomatis (1.4), notifikasi (1.5), data contoh pejabat (1.3), log audit aplikasi (1.3), halaman agenda dan dasbor (1.4).

## 7. Kriteria selesai (dapat diperiksa)
- [x] `npm install` berhasil; `npm run lint`, `npm test`, `npm run build` **lolos** dari akar (Node 20.20.0 dan 22.22.0). `npm ci` dari nol dijalankan oleh gate di mesin owner.
- [x] `GET /health` dan `/ready` 200 (diuji otomatis); proses nyata juga dicoba; log JSON dengan `reqId`.
- [x] `APP_MODE` kosong menjadi `production`; nilai tak valid menggagalkan start (diuji, dan dicoba pada proses nyata: kode keluar 1).
- [x] Pemeriksa token gagal pada pelanggaran (5 uji) dan lolos pada kode sebenarnya.
- [x] Spanduk DATA CONTOH tampil hanya saat `APP_MODE=demo` (diuji; dicek di peramban pada build demo).
- [x] Build web menghasilkan `manifest.webmanifest` dan `sw.js` (precache 6 berkas).
- [ ] `docker compose build` berhasil: **BELUM DIVERIFIKASI** (Docker Desktop tidak aktif; `docker compose config` valid). Owner diminta menjalankannya.
- [x] `audit-check` lolos; SBOM dan ringkasan lisensi terbuat; keluaran gate tersimpan.
- [x] Tidak ada folder tingkat atas baru (kecuali `node_modules`, `dist`).

## 8. Gate yang berlaku
lint (termasuk pemeriksa token), test, build, audit-check. Pertama kalinya ketiganya nyata.

## 9. Data contoh dan placeholder
Tidak ada data orang pada tahap ini. Hanya penanda mode demo (PH tidak bertambah).

## 10. Koreksi yang tercakup
Tidak ada.

## 11. Risiko khusus
- Instalasi dependensi pertama di Windows dapat gagal karena jaringan atau versi Node (Node 20.20.0 terdeteksi). Mitigasi: kunci versi di `package.json`, catat di handoff.
- Versi pustaka dikunci pada tahap ini; saya pakai rilis stabil terbaru yang kompatibel dengan Node 20 dan mencatatnya.
- Pemeriksa token dapat menghasilkan positif palsu (mis. `#` di tautan); dibatasi pada pola warna di berkas gaya dan TSX.

## 12. Hal yang perlu keputusan Anda sebelum SETUJU
1. **Pra-verifikasi gate (rekomendasi: ya).** Aturan 3 menyatakan asisten tidak menjalankan gate. Untuk kerangka pertama yang rawan kegagalan instalasi, izinkan asisten menjalankan `npm ci`, lint, test, build **sekali secara lokal** dan hanya melaporkan ringkasan hasilnya, agar patch tidak gagal di mesin Anda. Bila tidak, patch langsung diterbitkan dan Anda yang menjalankan; bila gagal, tempelkan galatnya.
2. **Docker (rekomendasi: coba bila tersedia).** Docker 28.3.3 terdeteksi di komputer ini. Izinkan `docker compose build` dicoba sekali (membutuhkan unduhan gambar dasar dan waktu)?
3. **Dokumen audit pendamping (bagian 5)** dibuat dalam versi ringkas sekarang (rekomendasi), atau ditunda ke tahap berikutnya?

Balas **`SETUJU`** (beserta jawaban 1–3, atau "ikuti rekomendasi") untuk mulai membangun.
