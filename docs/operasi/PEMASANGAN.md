# Panduan Pemasangan dan Penerapan (OP-01)

**Versi:** Tahap 1.1 (kerangka tanpa basis data). Panduan ini harus dapat diikuti oleh orang yang tidak menulis kodenya; diuji ulang setiap rilis.

## 1. Prasyarat
- Node.js **22 LTS** disarankan (Node 20.19+ berjalan dengan peringatan karena salah satu dependensi Fastify meminta Node 22); npm 10+.
- Opsional untuk kontainer: Docker dan Docker Compose v2.
- Tidak ada rahasia yang dibutuhkan pada tahap ini.

## 2. Pengembangan/evaluasi tanpa kontainer
```powershell
npm ci
npm run build
# API (terminal 1):  $env:APP_MODE="demo"; npm start -w apps/api
# Web (terminal 2):  npm run preview -w apps/web
```
API di `http://localhost:3000` (`/health`, `/ready`). Web di `http://localhost:4173` (preview). Untuk mode demo pada web, bangun dengan `$env:VITE_APP_MODE="demo"; npm run build -w apps/web`.

## 3. Dengan kontainer
```powershell
Copy-Item .env.example .env      # lalu sesuaikan APP_MODE, port
docker compose build
docker compose up -d
```
Web: `http://localhost:8080` (atau `WEB_PORT`). API: `http://localhost:3000` (atau `API_PORT`). Hentikan: `docker compose down`.

## 4. Konfigurasi (variabel lingkungan)
| Variabel | Arti | Bawaan |
|---|---|---|
| `APP_MODE` | `demo` atau `production`; nilai lain menggagalkan start | `production` |
| `PORT`, `HOST` | Alamat API (di kontainer `3000`, `0.0.0.0`) | `3000`, `0.0.0.0` |
| `LOG_LEVEL` | fatal/error/warn/info/debug/trace/silent | `info` |
| `API_PORT`, `WEB_PORT` | Port yang dibuka di host (Compose) | `3000`, `8080` |
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

## 7. Batasan Tahap 1.1
Belum ada basis data, akun, dan data; cadangan/pemulihan (OP-03) menyusul. Pemasangan dengan kontainer **belum diverifikasi di mesin pembangun** (Docker Desktop tidak aktif saat pengujian); verifikasi dicatat pada handoff.
