# STATUS SIAP MALUT

**Diperbarui:** 24 Oktober 2026, Tahap 1.4a selesai (patch menunggu owner)
**Baca dahulu:** `CLAUDE.md`, lalu berkas ini. Perintah lanjut: `LANJUT`.

## Posisi sekarang
- **Fase:** Tahap 1 (pembangunan). Tahap 0.1 sampai **1.3b sudah di-push** (terakhir `2d4c683`).
- **Sekarang:** **Tahap 1.4a (antarmuka ponsel bagian baca) selesai dan terverifikasi lokal; patch menunggu dijalankan owner:** `scripts/patch/tahap-1.4a.ps1`. Handoff: `docs/handoff/HANDOFF_TAHAP-1.4a_Antarmuka-Ponsel-Baca.md`. Lembar 1.4 disetujui (KP-016).
- **Berikutnya:** owner mencoba di ponsel (`npm run dev:lan`) dan mencatat koreksi; lalu **1.4b** (form undangan, keputusan kehadiran atomik KB-047, lampiran, pengaturan, audit).

## Cara menjalankan (pengembangan)
```powershell
npm ci                # sekali
npm run dev           # web http://localhost:5180 (API di /api, port 3180); mode demo; basis data PGlite di data/dev/
npm run dev:lan       # idem + mencetak alamat IP komputer untuk ponsel (jangan pakai localhost di ponsel)
npm run admin:sandi   # atur ulang kata sandi admin.owner (hentikan npm run dev dulu)
```
- **Hentikan terminal `npm run dev` lama (Ctrl+C) sebelum menjalankan yang baru** (server lama memegang port).
- Start pertama (demo): data contoh diisi otomatis; **kata sandi sementara `admin.owner` dicetak SEKALI** di terminal (atau isi `SIAP_ADMIN_PASSWORD`, min. 12 karakter). Mengulang dari nol: hapus folder `data/dev` (lampiran: `data/unggahan`).
- Port khusus 3180/5180 karena 3000 dan 5173 dipakai proyek lain di komputer owner (MDBKA).
- Kontainer: salin `.env.example` menjadi `.env`, isi `POSTGRES_PASSWORD`, lalu `docker compose up -d` (db + api + web/nginx). **Hanya web yang dibuka**; API lewat `/api`, `/health`, `/ready`.
- Gate: `powershell -ExecutionPolicy Bypass -File scripts\gate.ps1`. Dokumentasi API: `docs/rekayasa/openapi.json`; hak akses: `docs/rekayasa/MATRIKS_HAK_AKSES.md`.

## Yang berjalan sekarang
- Monorepo: `apps/web` (React 19, Vite 8, PWA, react-router; **antarmuka baca 1.4a**: Masuk, Beranda per peran, Agenda, Rincian, Bentrok, Akun, persona demo, tema; tipe API dari OpenAPI), `apps/api` (Fastify 5 + Drizzle), `packages/shared`, `packages/domain`.
- **Domain (1.2):** bentrok jam/sumber daya, aturan status.
- **Data (1.3a):** 9 tabel + migrasi; PGlite/PostgreSQL 16; seed data contoh; penjaga produksi; log audit append-only.
- **API (1.3b):** 22 rute melalui registri rute; masuk/keluar dengan kuki sesi httpOnly, penguncian akun; **hak akses berbasis peran dari data** (9 peran, 17 izin, 65 baris, **placeholder**); kegiatan (buat, ubah, daftar, rincian), pihak (tetapkan, hapus, pejabat menerima/menolak dirinya), pindah status (aturan domain, bentrok pasti butuh alasan), bentrok, lampiran (PDF/JPG/PNG, 10 MB), pengaturan, log audit, direktori pejabat, matriks hak akses, **mode demo pindah persona**; kendali: Origin = Host (CSRF), header keamanan, tautan rapat dibatasi dan disamarkan di log.
- **Dokumen dihasilkan dari kode:** `ALUR_PROSES.md`, `KAMUS_DATA.md`, `INVENTARIS_DATA_PRIBADI.md`, `openapi.json`, `MATRIKS_HAK_AKSES.md`, SBOM; uji menjaga kesesuaiannya.
- Uji ponsel: `npm run test:e2e` (Playwright + axe, 360/412 px; Chromium: `npx playwright install chromium`; di luar gate).
- Gate: lint, **205 uji** (shared 12, domain 51, api 112, web 23, skrip 7), build; lolos di Node 20.20 dan 22.22 dan di Windows PowerShell 5.1; API juga **188 uji di PostgreSQL 16 asli**; alur lengkap diverifikasi lewat proksi dev dan kontainer + nginx (`docs/audit/bukti-gate/verifikasi-api-tahap-1.3b.txt`).

## Fakta kunci
- Strategi: bangun mandiri; tidak konsultasi Diskominfosan sebelum peluncuran (KP-004).
- Kabag Protokol melihat aplikasi setelah terlihat jadi; semua orang/SK/hak akses = **placeholder** berlabel CONTOH (KP-005, KP-006). Owner = admin `admin.owner`; mode `demo` dengan pindah tampilan peran (KP-007).
- Keputusan 1.2: durasi bawaan 2 jam, bentrok = peringatan (KP-013). Keputusan 1.3: PGlite dev/uji + PostgreSQL produksi, sandi admin dari env atau acak sekali, **izin tetap pra-verifikasi lokal oleh asisten** (KP-015).
- Tahap P membuat **basis data produksi baru**; mode production belum punya akun (admin produksi: Tahap P).
- Teknologi: TypeScript ~5.9, React + Vite (PWA), Fastify, Drizzle, PostgreSQL/PGlite, Vitest, ESLint (ADR-001 revisi 1–3). Node 22 disarankan; Node 20.19+ berjalan.
- **Patch memakai `Invoke-Native` (`scripts/native.ps1`)**; gate dan patch diuji di PowerShell 5.1 dan 7 (KOR-004).
- Gate, add, commit, push dijalankan owner lewat `scripts/patch/tahap-<nomor>.ps1` (KP-002).

## Keputusan terbuka
KT-01 kepemilikan kode/HKI, KT-02 sumber dana dan biaya, KT-03 jawaban pertanyaan Kabag (Bab XI 11.10 dan `ATURAN_BISNIS.md` bagian 5; juga matriks hak akses usulan), KT-04 pengesahan Kepala Biro. Rincian: `docs/keputusan/KEPUTUSAN.md`.

## Dokumen audit
Setelah 1.4a: lihat `scripts/audit-check.ps1` (MU-08, PG-01, PG-02 menjadi Draf); sebelumnya Ada 34, Draf 2, Placeholder 2, Belum 33. Daftar: `docs/audit/DAFTAR_DOKUMEN_AUDIT.md`; hitungan terkini: `scripts/audit-check.ps1`.

## Placeholder aktif
PH-01..13 (`docs/audit/DAFTAR_PLACEHOLDER.md`); PH-01/03/05/07 terisi lewat seed demo; PH-11 (susunan dasbor) terisi usulan, perlu tinjauan Kabag. Penggantian di **Tahap P**.

## Celah yang diketahui (lihat `DESAIN_KEAMANAN.md` bagian 4)
Tanpa pembatasan laju per IP (RS-33), tanpa pemindaian virus lampiran (RS-34), belum ada fitur admin kelola akun/matriks lewat aplikasi (RS-35), belum diuji penetrasi (Tahap 3), TLS di depan nginx wajib pada produksi.

## Koreksi terbuka
Tidak ada. KOR-002 (`npm run dev`), KOR-003 (IP `dev:lan`), KOR-004 (stderr PowerShell 5.1) selesai.

## Urutan tahap ke depan
1.4a (ini, baca) → **1.4b** tindakan (form, keputusan kehadiran, lampiran, pengaturan, audit) → 1.5 notifikasi/ekspor/luring → 1.6 evaluasi mandiri → 2 M2 + pengganti + bentrok perjalanan + dokumen operasi + admin akun → 3 perluasan + uji keamanan (naik Node 24) → **P** penggantian data contoh (basis data produksi baru) → 4 peluncuran dan serah terima.

## Riwayat patch
0.1 sampai 1.3b sudah di-push (terakhir `2d4c683`). Patch 1.4a siap, menunggu dijalankan owner.
