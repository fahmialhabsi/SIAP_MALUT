# Panduan Administrator SIAP MALUT (Draf, Tahap 1.4b)

| | |
|---|---|
| Status | **Draf**: belum dicoba orang di luar penyusun. Pengaturan dan log audit sudah ada di aplikasi (Lainnya); pengelolaan akun dan matriks hak akses menyusul (Tahap 2). |
| Daftar induk | PG-02 |

## 1. Menjalankan pada komputer pengembangan
```powershell
npm ci
npm run dev        # web http://localhost:5180, API di /api (port 3180), mode demo
npm run dev:lan    # idem, dan mencetak alamat IP untuk ponsel di Wi-Fi yang sama
```
Start pertama (50–90 detik pada PGlite) membuat data contoh dan mencetak sekali kata sandi sementara `admin.owner` (atau isi `SIAP_ADMIN_PASSWORD`, minimal 12 karakter). Atur ulang: hentikan server lalu `npm run admin:sandi`. Mengulang dari nol: hapus folder `data/dev`.

## 2. Mode demo dan persona
Administrator memilih **Lihat sebagai...** di pita bawah kepala aplikasi. Hak akses persona berlaku penuh; izin pemilih tetap dari akun asli. Mode `production` tidak memiliki pemilih dan menolak data contoh.

## 3. Pemeriksaan sebelum menyerahkan tahap
- `powershell -ExecutionPolicy Bypass -File scripts\gate.ps1` (audit-check, lint, test, build).
- `npm run test:e2e -w apps/web` untuk uji ponsel (Playwright + axe); butuh `npx playwright install chromium` sekali.

## 3a. Peninjau jarak jauh
Akun demo bersandi dan terowongan sementara: `docs/operasi/PEMASANGAN.md` bagian 6e (`npm run akun:sandi -- demo.kabag-protokol`, `npm run dev:tunnel`).

## 4. Yang belum tersedia di aplikasi
Membuat/menonaktifkan akun dan mengubah matriks hak akses lewat layar belum ada; dilakukan lewat seed dan CLI (RS-35). Lihat `docs/keamanan/MANAJEMEN_AKSES.md`.
