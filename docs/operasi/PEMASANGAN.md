# Panduan Pemasangan dan Penerapan (OP-01)

**Versi:** Tahap 1.1 (kerangka tanpa basis data). Panduan ini harus dapat diikuti oleh orang yang tidak menulis kodenya; diuji ulang setiap rilis.

## 1. Prasyarat
- Node.js **22 LTS** disarankan (Node 20.19+ berjalan dengan peringatan karena salah satu dependensi Fastify meminta Node 22); npm 10+.
- Opsional untuk kontainer: Docker dan Docker Compose v2.
- Tidak ada rahasia yang dibutuhkan pada tahap ini.

## 2. Pengembangan/evaluasi tanpa kontainer: satu perintah
```powershell
npm ci          # sekali saja
npm run dev     # API + web sekaligus, mode demo, tanpa build lebih dulu
```
- **Basis data pengembangan:** PGlite (PostgreSQL di dalam proses) di `data/dev/pgdata` (diabaikan Git). Pada start pertama (mode demo) data contoh diisi otomatis dan **kata sandi sementara `admin.owner` dicetak SEKALI** di terminal; catat. Ganti lewat `npm run admin:sandi` (hentikan `npm run dev` dulu). Mengulang dari nol: hapus folder `data/dev`.
- **Hentikan dulu terminal `npm run dev` lama** (Ctrl+C) sebelum menjalankan yang baru; server lama yang masih hidup memegang port.
- API: `http://localhost:3180` (`/health`, `/ready`); web (Vite): `http://localhost:5180`. Port khusus agar tidak bentrok dengan proyek lain (3000 dan 5173 sering terpakai); ubah dengan `SIAP_API_PORT` / `SIAP_WEB_PORT`. Port yang sudah terpakai menggagalkan start dengan pesan jelas.
- Kode paket bersama dibaca langsung dari sumber, dan API dimulai ulang otomatis saat kode berubah; Vite memuat ulang halaman.
- Dari ponsel (satu jaringan Wi-Fi): `npm run dev:lan`. Perintah ini **mencetak alamat IP komputer**, mis. `http://192.168.1.63:5180 (Wi-Fi)`; buka alamat itu di ponsel. **Jangan memakai `localhost` di ponsel** (di ponsel, `localhost` berarti ponsel itu sendiri dan akan ditolak). Bila tidak terbuka, izinkan Node.js di Windows Firewall (jaringan Pribadi). Hanya untuk pengembangan; jangan dipakai di jaringan tidak tepercaya.
- Mode: `demo` secara bawaan; paksa `production` dengan `$env:APP_MODE="production"; npm run dev`.
- Hentikan dengan Ctrl+C (keduanya berhenti).

Menjalankan hasil build (seperti produksi):
```powershell
npm run build
# API:  $env:APP_MODE="demo"; npm start -w apps/api     (port 3000)
# Web:  npm run preview -w apps/web                     (port 4173)
```
Untuk mode demo pada web hasil build: `$env:VITE_APP_MODE="demo"; npm run build -w apps/web`.

## 3. Dengan kontainer
```powershell
Copy-Item .env.example .env      # lalu isi POSTGRES_PASSWORD (wajib); sesuaikan APP_MODE, port
docker compose build
docker compose up -d
```
Web: `http://localhost:8080` (atau `WEB_PORT`). API diakses lewat web yang sama: `/api/...`, `/health`, `/ready` (nginx meneruskan ke layanan `api`; API tidak dibuka ke luar). Hentikan: `docker compose down` (tambah `-v` untuk menghapus basis data dan lampiran).

## 4. Konfigurasi (variabel lingkungan)
| Variabel | Arti | Bawaan |
|---|---|---|
| `APP_MODE` | `demo` atau `production`; nilai lain menggagalkan start | `production` |
| `PORT`, `HOST` | Alamat API (di kontainer `3000`, `0.0.0.0`) | `3000`, `0.0.0.0` |
| `LOG_LEVEL` | fatal/error/warn/info/debug/trace/silent | `info` |
| `DATABASE_URL` | URL PostgreSQL (kontainer/produksi). Kosong = PGlite | kosong |
| `SIAP_DB_DIR` | Folder data PGlite (dev). Kosong = di memori (hilang saat berhenti); `npm run dev` mengisinya | kosong |
| `SIAP_ADMIN_PASSWORD` | Kata sandi awal `admin.owner` (mode demo, minimal 12 karakter). Kosong = acak dan dicetak sekali | kosong |
| `POSTGRES_PASSWORD` | **Wajib** untuk `docker compose`: kata sandi basis data PostgreSQL (isi di `.env`, huruf/angka, ≥ 16 karakter) | tidak ada |
| `WEB_PORT` | Port web yang dibuka di host (Compose). API tidak dibuka; diakses lewat web (`/api`, `/health`, `/ready`) | `8080` |
| `SIAP_UNGGAHAN_DIR` | Folder lampiran (kontainer: volume `siap_unggahan`; dev: `data/unggahan`) | `data/unggahan` |
| `SIAP_TRUST_PROXY` | `true` bila API di belakang proksi tepercaya (Compose menyetelnya); IP asal diambil dari `X-Forwarded-For` | `false` |
| `VITE_APP_MODE` | Mode saat **build** web (diisi otomatis dari `APP_MODE` di Compose) | `production` |

## 5. Verifikasi Pemasangan
1. `GET /health` mengembalikan `{"status":"ok"}`.
2. `GET /ready` mengembalikan `status: ready` dan mode yang benar.
3. Halaman web terbuka; pada `demo` terlihat spanduk **DATA CONTOH**.
4. Log API berformat JSON dengan `reqId`.

## 5a. Gate mutu sebelum rilis
```powershell
powershell -ExecutionPolicy Bypass -File scripts\gate.ps1
```

## 6. Pemecahan Masalah
| Gejala | Tindakan |
|---|---|
| API gagal start dengan "APP_MODE tidak valid" | Isi `demo` atau `production` |
| `npm ci` gagal | Pastikan Node versi sesuai dan jaringan tersedia; hapus `node_modules` lalu ulangi |
| Port terpakai | Ubah `API_PORT`/`WEB_PORT` di `.env` |

## 6a. Basis Data dan Data Contoh (Tahap 1.3a)
- `docker compose` menjalankan **tiga layanan**: `db` (PostgreSQL 16, volume `siap_pgdata`, tidak dibuka ke luar), `api`, `web`. API menjalankan migrasi saat start.
- Mode `demo`: data contoh diisi otomatis bila basis data kosong; kata sandi sementara `admin.owner` ada di `docker compose logs api` (tampil sekali).
- Mode `production`: **tidak ada data contoh dan belum ada akun**; pembuatan admin produksi dan impor data asli dirancang di Tahap P. API menolak start bila basis data masih berisi data contoh.
- Migrasi: `apps/api/drizzle/` (dibuat `npm run db:generate -w apps/api`; jangan diedit tangan).
- Uji ke PostgreSQL asli: jalankan kontainer PostgreSQL sementara lalu `SIAP_TEST_DATABASE_URL=postgres://... npm test -w apps/api` (basis data uji **dikosongkan** tiap uji).

## 6b. API, Masuk, dan Lampiran (Tahap 1.3b)
- Dokumentasi API dihasilkan dari kode: `docs/rekayasa/openapi.json` (OpenAPI 3.1; `npm run docs:api` setelah build). Hak akses per rute: `docs/rekayasa/MATRIKS_HAK_AKSES.md`.
- Masuk: `POST /api/sesi` dengan `{username, sandi}`; sesi berupa kuki `siap_sesi` (httpOnly, SameSite=Strict). Peramban memakai satu asal: saat `npm run dev` Vite meneruskan `/api` ke API; di kontainer nginx yang meneruskan.
- Akun mode demo: `admin.owner` (sandi dari `SIAP_ADMIN_PASSWORD` atau acak tercetak sekali). Akun `demo.*` tidak dapat masuk; admin memakainya lewat `POST /api/demo/persona`.
- Lampiran: `data/unggahan/` (dev, diabaikan Git) atau volume `siap_unggahan` (kontainer). Hanya PDF, JPG, PNG hingga 10 MB.
- Pengujian cepat dengan `curl` memerlukan header `Origin` yang sama dengan `Host` pada permintaan pengubah (POST/PUT/PATCH/DELETE) bila Origin dikirim.

## 7. Batasan Tahap 1.1
Belum ada basis data, akun, dan data; cadangan/pemulihan (OP-03) menyusul. Pemasangan dengan kontainer **diverifikasi 23 Okt 2026** (build, jalan, health, web) pada Docker Desktop 28.3.3; bukti: `docs/audit/bukti-gate/docker-tahap-1.1.txt`. Pemasangan dari nol oleh pihak ketiga belum dicoba.
