# Handoff Tahap 1.1: Kerangka Repo dan Gate npm Pertama

| | |
|---|---|
| Tanggal | 23 Oktober 2026 |
| Tahap | 1.1 |
| Lembar Tahap | `docs/handoff/LEMBAR_TAHAP-1.1_Kerangka-Repo.md` (disetujui, KP-012) |
| Commit | dibuat saat owner menjalankan `scripts/patch/tahap-1.1.ps1` |
| Penyusun | Claude (Sonnet 5.5) |
| Status | Selesai dan diverifikasi lokal; commit/push menunggu owner; **build Docker belum diverifikasi** |

## 1. Tujuan
Kerangka proyek yang dapat dipasang, diuji, dibangun, dikemas, dengan gate nyata dan syarat serah terima sejak hari pertama. Belum ada fitur bisnis.

## 2. Yang dikerjakan
- Monorepo npm workspaces: `packages/shared` (Zod, `APP_MODE`, konfigurasi), `packages/domain` (status agenda), `apps/api` (Fastify), `apps/web` (React 19 + Vite 8 + PWA).
- Gate: ESLint 10 + Prettier + **pemeriksa token** (`scripts/cek-token.mjs`), Vitest 4, `tsc`/`vite build`; `gate.ps1` kini menjalankan lint, test, build nyata.
- API: `/health`, `/ready`, log JSON dengan `reqId`, validasi konfigurasi, penjaga produksi (rangka).
- Web: halaman awal berstandar, spanduk DATA CONTOH di demo, teks UI di satu berkas, font **Inter** (OFL) terpasang lokal, ikon sementara.
- Kontainer: Dockerfile api dan web, nginx, `docker-compose.yml`, `.env.example`, `.dockerignore`.
- Bukti mutu: bukti gate, SBOM CycloneDX, ringkasan lisensi (`scripts/buat-sbom.mjs`).
- Dokumen audit ringkas: ARSITEKTUR, STANDAR_KODE, RENCANA_UJI, PEMASANGAN, KEBUTUHAN_INFRASTRUKTUR, MANAJEMEN_PERUBAHAN.
- Pembaruan: RTM (KB-004, 020, 030, 033, 034, 036), daftar induk (9 dokumen Ada), KEPUTUSAN (KP-012), register risiko (RS-24, RS-25), PH-13, ADR (revisi 1), CLAUDE.md Aturan 3.

## 3. Hasil verifikasi (oleh asisten, lokal)
| Pemeriksaan | Hasil |
|---|---|
| `npm install` | Berhasil (560 paket, ±4 menit) |
| `npm run lint` | Lolos (ESLint, Prettier, token) |
| `npm test` | **26 uji lulus**: shared 8, domain 3, api 8, web 4, skrip token 5 |
| `npm run build` | Lolos; web menghasilkan manifest dan `sw.js` (precache 6 berkas, ±94 KB JS terkompresi) |
| Node 20.20.0 dan 22.22.0 | Gate lolos di keduanya; Node 20 menampilkan peringatan `cookie@2.0.1` meminta Node 22 |
| API proses nyata | `/health` 200 dengan `x-request-id`; log JSON; `APP_MODE=staging` keluar kode 1 dengan pesan jelas |
| Peramban 360 px (build demo) | Tanpa gulir horizontal (scrollWidth 360), font 16 px, target 48 px, Inter termuat, spanduk dan manifest ada; tangkapan layar gagal (waktu habis), tidak ditinjau visual |
| `gate.ps1` (PowerShell) | Lolos; keluaran di `docs/audit/bukti-gate/gate-tahap-1.1-asisten.txt` |
| `docker compose config` | Valid |
| **`docker compose build`** | **BELUM DIVERIFIKASI**: Docker Desktop tidak aktif di mesin ini |
| Service worker terdaftar di peramban | Belum teramati (0 pendaftaran saat dicek); berkas `sw.js` dibangun |
| `patch/tahap-1.1.ps1` dijalankan | Belum (dijalankan owner) |

### Dokumen audit terdampak (Aturan 9)
- [x] `DAFTAR_DOKUMEN_AUDIT.md`: RK-01, MU-02, MU-03, MU-04, MU-09, AK-02, OP-01, OP-02, OP-06 menjadi Ada (Ada=24, Draf=2, Placeholder=1, Belum=44)
- [x] `MATRIKS_KETERLUSURAN.md` (6 kebutuhan diperbarui)
- [x] `REGISTER_RISIKO.md` (RS-24, RS-25)
- [x] Dokumen dari kode dibangkitkan: SBOM dan lisensi
- [x] `scripts/audit-check.ps1` lolos
- Dokumen Belum yang tahapnya sudah terlewati: AK-01, AK-03 (tahap 0), RK-... yang jatuh di 1.2/1.3 belum waktunya

## 4. Keputusan dan penyimpangan dari Lembar Tahap
- **TypeScript ~5.9, bukan 7.x**; **Vitest 4 dan jsdom 27**, bukan 5/30: yang terbaru meminta Node 22+ atau tidak didukung `typescript-eslint` (ADR revisi 1).
- Node 22 disarankan; Node 20.19+ tetap berjalan (diverifikasi) agar tidak memaksa Anda mengganti Node sekarang.
- `design-tokens.css` diformat ulang oleh Prettier (hanya format, isi token tidak berubah).
- Terdapat pengecualian Aturan 3 (KP-012) yang berlaku hanya bila disetujui di Lembar Tahap.

## 5. Hal yang belum selesai
- Verifikasi `docker compose build` (RS-25).
- Pengamatan service worker di peramban dan tinjauan visual halaman.
- Basis data, akun, log audit (1.3); uji ponsel otomatis (1.4).
- KT-01..04 dan AK-01, AK-03.

## 6. Risiko
RS-24 (Node 20 EOL), RS-25 (Docker belum diverifikasi), ketergantungan pada ekosistem versi sangat baru (Vite 8, Zod 4, ESLint 10, React 19.3): dikunci di `package-lock.json`; jangan memperbarui massal tanpa tahap tersendiri.

## 7. Langkah berikutnya
1. Owner menjalankan patch 1.1 (dan, bila Docker Desktop aktif, `docker compose build` lalu laporkan hasilnya).
2. Ketik `TAHAP 1.2` (domain: deteksi bentrok jam dan sumber daya, uji dengan bentuk agenda nyata yang difiktifkan).

## 8. Cara melanjutkan
Sesi baru: **"Baca CLAUDE.md dan STATUS.md, lalu LANJUT."**
