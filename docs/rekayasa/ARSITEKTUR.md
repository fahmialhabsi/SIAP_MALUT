# Arsitektur Perangkat Lunak SIAP MALUT (RK-01)

**Versi:** Tahap 1.1 (kerangka). Diperbarui tiap tahap yang mengubah komponen. Mencerminkan kode saat ini; komponen yang belum ada ditandai **(rencana)**.

## 1. Konteks

```
Pengguna (ponsel/PC) --HTTPS--> [web: PWA statis] --HTTP/JSON--> [api: Fastify] --> [PostgreSQL (rencana, Tahap 1.3)]
                                                                 \--> [FileStore (rencana)]   \--> [Notifier (rencana)]
```

Integrasi eksternal (SRIKANDI, e-Office, BSrE, WhatsApp) berstatus **rencana** (Tahap 2).

## 2. Komponen (monorepo npm workspaces)

| Komponen | Folder | Peran | Status Tahap 1.1 |
|---|---|---|---|
| Antarmuka | `apps/web` | React 19 + Vite + PWA (manifest, service worker Workbox); memakai token desain; teks UI di `teks-ui.ts` | Ada: halaman awal, spanduk DATA CONTOH |
| Peladen API | `apps/api` | Fastify 5; `/health`, `/ready`; log JSON dengan ID permintaan; penjaga produksi | Ada |
| Konfigurasi bersama | `packages/shared` | Skema Zod: `APP_MODE`, port, host, tingkat log; satu sumber untuk web dan api | Ada |
| Logika domain | `packages/domain` | Logika murni tanpa basis data/jaringan; saat ini definisi status agenda | Ada (awal) |
| Token desain | `src/styles/design-tokens.css` | Sumber tunggal warna, font, jarak (terang/gelap) | Ada |
| Basis data | (rencana) | PostgreSQL + Drizzle, migrasi | Tahap 1.3 |

## 3. Aturan Ketergantungan

- `packages/domain` dan `packages/shared` **tidak** bergantung pada `apps/*`.
- `packages/domain` tidak boleh mengimpor basis data, jaringan, atau kerangka web.
- `apps/web` dan `apps/api` hanya saling berkomunikasi lewat HTTP (bukan impor langsung).
- Urutan build: shared, domain, api, web (urutan `workspaces` di `package.json`).

## 4. Mode Aplikasi

`APP_MODE` ∈ {`demo`, `production`}; kosong menjadi `production`; nilai lain menggagalkan start. `demo` menampilkan spanduk DATA CONTOH di web. Di `production`, penjaga (`apps/api/src/penjaga.ts`) menolak mulai bila ada data contoh (sambungan ke basis data di Tahap 1.3). Rujukan: `docs/standar/STANDAR_DATA_CONTOH.md`.

## 5. Pemasangan

Kontainer: `apps/api/Dockerfile`, `apps/web/Dockerfile` (nginx), `docker-compose.yml`, konfigurasi lewat variabel lingkungan (`.env.example`). Lihat `docs/operasi/PEMASANGAN.md`.

## 6. Keamanan (kondisi saat ini)

Belum ada autentikasi dan data pengguna (Tahap 1.3). Tidak ada rahasia di repo. Peta desain keamanan lengkap (RK-04) menyusul Tahap 1.3.

## 7. Pemeliharaan Dokumen Ini

Diperbarui setiap tahap yang menambah/mengubah komponen atau aturan ketergantungan. Diagram ditinjau terhadap struktur folder dan `package.json`.
