# STATUS SIAP MALUT

**Diperbarui:** 23 Oktober 2026, Tahap 1.1
**Baca dahulu:** `CLAUDE.md`, lalu berkas ini. Perintah lanjut: `LANJUT`.

## Posisi sekarang
- **Fase:** Tahap 1 (pembangunan). **Tahap 1.1 (kerangka repo + gate npm) selesai ditulis dan diverifikasi lokal oleh asisten; menunggu owner menjalankan `scripts/patch/tahap-1.1.ps1`.**
- **Terakhir selesai (sudah di-push):** Tahap 0.1 sampai 0.6.
- **Berikutnya:** **Tahap 1.2** (domain: deteksi bentrok jam dan sumber daya, uji dengan bentuk agenda nyata yang difiktifkan). Mulai dengan `TAHAP 1.2` setelah patch 1.1 dijalankan.

## Yang berjalan sekarang
- Monorepo npm workspaces: `apps/web` (React 19, Vite 8, PWA), `apps/api` (Fastify 5), `packages/shared`, `packages/domain`.
- Gate nyata: `npm run lint` (ESLint 10, Prettier, pemeriksa token), `npm test` (26 uji), `npm run build`. Lolos di Node 20.20.0 dan 22.22.0.
- `/health`, `/ready`, log JSON ber-`reqId`, `APP_MODE` (default production), penjaga produksi (rangka), spanduk DATA CONTOH di mode demo.
- Kontainer: Dockerfile api/web, `docker-compose.yml`, `.env.example`. **Build Docker belum diverifikasi** (Docker Desktop tidak aktif); `docker compose config` valid.
- SBOM dan ringkasan lisensi dibuat otomatis (`npm run sbom`).

## Fakta kunci
- Strategi: bangun mandiri; tidak konsultasi Diskominfosan sebelum peluncuran; serah terima saat peluncuran (KP-004).
- Kabag Protokol melihat aplikasi setelah terlihat jadi; semua orang/SK/hak akses = **placeholder** berlabel CONTOH (KP-005, KP-006). Owner = admin `admin.owner`; mode `demo` dengan pindah tampilan peran (KP-007).
- Teknologi: TypeScript ~5.9, React + Vite (PWA), Fastify, PostgreSQL (1.3), Vitest, ESLint (ADR-001, revisi 1).
- Node: disarankan **22** (nvm 22.22.0 terpasang di komputer owner); Node 20.19+ berjalan dengan peringatan. Kontainer memakai Node 22.
- Gate, add, commit, push dijalankan owner lewat `scripts/patch/tahap-<nomor>.ps1` (KP-002). Pra-verifikasi gate oleh asisten hanya bila disetujui di Lembar Tahap (KP-012).

## Keputusan terbuka
KT-01 kepemilikan kode/HKI, KT-02 sumber dana dan biaya, KT-03 jawaban pertanyaan Kabag (Bab XI 11.10), KT-04 pengesahan Kepala Biro. Rincian: `docs/keputusan/KEPUTUSAN.md`.

## Dokumen audit
Lihat `scripts/audit-check.ps1` untuk hitungan terkini (setelah 1.1: Ada 24). Daftar: `docs/audit/DAFTAR_DOKUMEN_AUDIT.md`.

## Placeholder aktif
PH-01..13 (`docs/audit/DAFTAR_PLACEHOLDER.md`), termasuk ikon aplikasi sementara. Penggantian di **Tahap P**.

## Koreksi terbuka
Tidak ada (`docs/perubahan/REGISTER_KOREKSI.md`).

## Urutan tahap ke depan
1.1 (ini) → **1.2** domain bentrok → 1.3 API+data+contoh+akun/peran+log audit → 1.4 antarmuka ponsel + dasbor peran + mode demo → 1.5 notifikasi/ekspor/luring → 1.6 evaluasi mandiri → 2 M2+pengganti+dokumen operasi → 3 perluasan+uji keamanan (naik Node 24) → **P** penggantian data contoh → 4 peluncuran dan serah terima.

## Riwayat patch
0.1 sampai 0.6 sudah di-push. **Patch 1.1 menunggu dijalankan owner** (ikut meng-commit Lembar Tahap 1.1 dan menyimpan bukti gate milik owner).
