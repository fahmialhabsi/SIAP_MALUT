# Arsitektur Perangkat Lunak SIAP MALUT (RK-01)

**Versi:** Tahap 1.1 (kerangka). Diperbarui tiap tahap yang mengubah komponen. Mencerminkan kode saat ini; komponen yang belum ada ditandai **(rencana)**.

## 1. Konteks

```
Pengguna (ponsel/PC) --HTTPS--> [web: PWA statis] --HTTP/JSON--> [api: Fastify] --> [PostgreSQL | PGlite (dev/uji)]
                                                                 \--> [FileStore (rencana)]   \--> [Notifier (rencana)]
```

Integrasi eksternal (SRIKANDI, e-Office, BSrE, WhatsApp) berstatus **rencana** (Tahap 2).

## 2. Komponen (monorepo npm workspaces)

| Komponen | Folder | Peran | Status Tahap 1.1 |
|---|---|---|---|
| Antarmuka | `apps/web` | React 19 + Vite + PWA (manifest, service worker Workbox); memakai token desain; teks UI di `teks-ui.ts` | Ada: halaman awal, spanduk DATA CONTOH |
| Peladen API | `apps/api` | Fastify 5; 22 rute `/api` lewat registri rute (autentikasi → izin → validasi → penangan); sesi kuki; RBAC dari data; lampiran lewat `Penyimpanan`; OpenAPI dihasilkan; `/health`, `/ready`; log JSON ber-`reqId`; penjaga produksi | Ada (Tahap 1.3b) |
| Konfigurasi bersama | `packages/shared` | Skema Zod: `APP_MODE`, port, host, tingkat log; satu sumber untuk web dan api | Ada |
| Logika domain | `packages/domain` | Logika murni tanpa basis data/jaringan: model kegiatan, waktu (ISO 8601 + zona), deteksi bentrok, aturan status dan peristiwa | Ada (Tahap 1.2); aturan: `ATURAN_BISNIS.md`, diagram: `ALUR_PROSES.md` |
| Token desain | `src/styles/design-tokens.css` | Sumber tunggal warna, font, jarak (terang/gelap) | Ada |
| Basis data | `apps/api/src/db`, `apps/api/drizzle` | Drizzle ORM; PostgreSQL asli (kontainer/produksi) atau PGlite (dev/uji); 9 tabel; migrasi berkas SQL; log audit append-only dengan pemicu; seed data contoh | Ada (1.3a); kamus: `KAMUS_DATA.md` |

## 3. Aturan Ketergantungan

- `packages/domain` dan `packages/shared` **tidak** bergantung pada `apps/*`.
- `packages/domain` tidak boleh mengimpor basis data, jaringan, atau kerangka web.
- `apps/web` dan `apps/api` hanya saling berkomunikasi lewat HTTP (bukan impor langsung).
- Urutan build: shared, domain, api, web (urutan `workspaces` di `package.json`).

## 3a. Pengembangan Lokal
`npm run dev` menjalankan API (`tsx watch`) dan web (Vite) sekaligus. Paket `@siap/shared` dan `@siap/domain` memiliki kondisi ekspor `development` yang menunjuk ke sumber (`src/index.ts`); build produksi memakai `dist`. Detail: `docs/operasi/PEMASANGAN.md` bagian 2.

## 3b. Rute dan Keamanan (Tahap 1.3b)
Setiap rute dideklarasikan sekali di registri (`apps/api/src/rute/*.ts`: metode, jalur, izin, skema Zod params/query/body/respons). Registri yang sama dipakai untuk memasang rute di Fastify, menguji hak akses lintas peran, dan menghasilkan `openapi.json` serta `MATRIKS_HAK_AKSES.md`. Rincian pertahanan: `DESAIN_KEAMANAN.md`. Peramban selalu berbicara ke satu asal (proksi Vite saat dev, nginx pada kontainer).

## 4. Mode Aplikasi

`APP_MODE` ∈ {`demo`, `production`}; kosong menjadi `production`; nilai lain menggagalkan start. `demo` menampilkan spanduk DATA CONTOH di web. Di `production`, penjaga (`apps/api/src/penjaga.ts`) menolak mulai bila ada data contoh (sambungan ke basis data di Tahap 1.3). Rujukan: `docs/standar/STANDAR_DATA_CONTOH.md`.

## 5. Pemasangan

Kontainer: `apps/api/Dockerfile`, `apps/web/Dockerfile` (nginx), `docker-compose.yml`, konfigurasi lewat variabel lingkungan (`.env.example`). Lihat `docs/operasi/PEMASANGAN.md`.

## 6. Keamanan (kondisi saat ini)

Belum ada autentikasi dan data pengguna (Tahap 1.3). Tidak ada rahasia di repo. Peta desain keamanan lengkap (RK-04) menyusul Tahap 1.3.

## 7. Pemeliharaan Dokumen Ini

Diperbarui setiap tahap yang menambah/mengubah komponen atau aturan ketergantungan. Diagram ditinjau terhadap struktur folder dan `package.json`.
