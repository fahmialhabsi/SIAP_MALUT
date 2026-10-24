# STATUS SIAP MALUT

**Diperbarui:** 24 Oktober 2026, Tahap 1.3a
**Baca dahulu:** `CLAUDE.md`, lalu berkas ini. Perintah lanjut: `LANJUT`.

## Posisi sekarang
- **Fase:** Tahap 1 (pembangunan). Tahap 0.1 sampai 1.2 sudah di-push (commit `47321cc`).
- **Tahap 1.3a (lapisan data) sudah di-push** (commit `f2e9a80`). Ikut KOR-003.
- **Tahap 1.3a.1 (perbaikan skrip patch, KOR-004) selesai dibuat; menunggu owner menjalankan `scripts/patch/tahap-1.3a1.ps1`.** Pemicu: menjalankan ulang patch 1.3a memunculkan galat palsu `NativeCommandError` di Windows PowerShell 5.1 (peringatan stderr Vite); build sebenarnya sukses.
- **Berikutnya:** **Tahap 1.3b** (API + autentikasi + hak akses + lampiran + OpenAPI). Mulai dengan `LANJUT` atau `TAHAP 1.3b` (boleh langsung; patch 1.3a.1 tidak menghalangi).

## Cara menjalankan (pengembangan)
```powershell
npm ci            # sekali
npm run dev       # API http://localhost:3180 + web http://localhost:5180 (mode demo, basis data PGlite di data/dev/)
npm run dev:lan   # idem + mencetak alamat IP komputer untuk ponsel (jangan pakai localhost di ponsel)
npm run admin:sandi   # atur ulang kata sandi admin.owner (hentikan npm run dev dulu)
```
- **Hentikan terminal `npm run dev` lama (Ctrl+C) sebelum menjalankan yang baru** (server lama memegang port 3180/5180).
- Start pertama (demo): data contoh diisi otomatis dan **kata sandi sementara `admin.owner` dicetak SEKALI** di terminal; catat. Mengulang dari nol: hapus folder `data/dev`.
- Port khusus (3180/5180) karena 3000 dan 5173 dipakai proyek lain di komputer owner (MDBKA).
- Kontainer: salin `.env.example` menjadi `.env`, isi `POSTGRES_PASSWORD`, lalu `docker compose up -d` (db + api + web). Gate: `powershell -ExecutionPolicy Bypass -File scripts\gate.ps1`.

## Yang berjalan sekarang
- Monorepo: `apps/web` (React 19, Vite 8, PWA), `apps/api` (Fastify 5 + Drizzle), `packages/shared`, `packages/domain`.
- **Domain (1.2):** bentrok jam/sumber daya, aturan status (lihat `docs/rekayasa/ATURAN_BISNIS.md`).
- **Lapisan data (1.3a):** 9 tabel + migrasi SQL (`apps/api/drizzle/`); PGlite (dev/uji) dan PostgreSQL 16 (kontainer/produksi); seed data contoh dari `data/contoh/` (11 pejabat, 13 pengguna, 14 kegiatan, 28 pihak; semua `is_contoh`); **penjaga produksi sungguhan** (menolak start bila ada data contoh); **log audit append-only** (pemicu basis data menolak UPDATE/DELETE/TRUNCATE); pengaturan sebagai data (durasi bawaan); hash kata sandi scrypt; `pindahStatusKegiatan` (status + peristiwa audit dalam satu transaksi); `/ready` memeriksa basis data.
- Dokumen dihasilkan dari kode: `ALUR_PROSES.md` (`npm run docs:status`), `KAMUS_DATA.md` dan `INVENTARIS_DATA_PRIBADI.md` (`npm run docs:data`), SBOM (`npm run sbom`); uji menjaga kesesuaiannya.
- Gate: lint, **124 uji**, build; lolos di Node 20.20.0 dan 22.22.0. API juga lolos **70 uji di PostgreSQL 16 asli** dan verifikasi kontainer penuh (`docs/audit/bukti-gate/verifikasi-postgres-tahap-1.3a.txt`).

## Fakta kunci
- Strategi: bangun mandiri; tidak konsultasi Diskominfosan sebelum peluncuran (KP-004).
- Kabag Protokol melihat aplikasi setelah terlihat jadi; semua orang/SK/hak akses = **placeholder** berlabel CONTOH (KP-005, KP-006). Owner = admin `admin.owner`; mode `demo` dengan pindah tampilan peran (KP-007).
- Keputusan 1.2: durasi bawaan 2 jam, bentrok = peringatan (KP-013). Keputusan 1.3: PGlite dev/uji + PostgreSQL produksi, dipecah 1.3a/1.3b, sandi admin dari env atau acak sekali, lampiran di 1.3b, **izin tetap pra-verifikasi lokal oleh asisten** (KP-015).
- Tahap P membuat **basis data produksi baru** (log audit demo tidak dibawa); mode production saat ini tanpa akun (pembuatan admin produksi: Tahap P).
- Teknologi: TypeScript ~5.9, React + Vite (PWA), Fastify, Drizzle, PostgreSQL/PGlite, Vitest, ESLint (ADR-001, revisi 1 dan 2). Node 22 disarankan; Node 20.19+ berjalan.
- Gate, add, commit, push dijalankan owner lewat `scripts/patch/tahap-<nomor>.ps1` (KP-002).

## Keputusan terbuka
KT-01 kepemilikan kode/HKI, KT-02 sumber dana dan biaya, KT-03 jawaban pertanyaan Kabag (Bab XI 11.10 dan `ATURAN_BISNIS.md` bagian 5), KT-04 pengesahan Kepala Biro. Rincian: `docs/keputusan/KEPUTUSAN.md`.

## Dokumen audit
Setelah 1.3a: Ada 30 (RK-02, KM-02, KM-09 baru). Daftar: `docs/audit/DAFTAR_DOKUMEN_AUDIT.md`; hitungan terkini: `scripts/audit-check.ps1`. Akan menyusul di 1.3b: RK-03, RK-04, RK-05, KM-01, KM-05.

## Placeholder aktif
PH-01..13 (`docs/audit/DAFTAR_PLACEHOLDER.md`); PH-01/03/07 kini terisi lewat seed demo. Penggantian di **Tahap P**.

## Koreksi terbuka
Tidak ada. KOR-002 (`npm run dev`) dan KOR-003 (alamat IP `dev:lan`) selesai.

## Urutan tahap ke depan
1.3a (ini) → **1.3b** API + autentikasi + hak akses + lampiran + OpenAPI → 1.4 antarmuka ponsel + dasbor peran + mode demo → 1.5 notifikasi/ekspor/luring → 1.6 evaluasi mandiri → 2 M2+pengganti+bentrok perjalanan+dokumen operasi → 3 perluasan+uji keamanan (naik Node 24) → **P** penggantian data contoh (basis data produksi baru) → 4 peluncuran dan serah terima.

## Riwayat patch
0.1 sampai 1.3a sudah di-push (terakhir `f2e9a80`). **Patch 1.3a.1 menunggu dijalankan owner.**
