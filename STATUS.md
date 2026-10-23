# STATUS SIAP MALUT

**Diperbarui:** 23 Oktober 2026, Tahap 1.2
**Baca dahulu:** `CLAUDE.md`, lalu berkas ini. Perintah lanjut: `LANJUT`.

## Posisi sekarang
- **Fase:** Tahap 1 (pembangunan). Tahap 0.1 sampai 1.1 sudah di-push.
- **Tahap 1.2 (logika domain: bentrok jam/sumber daya, aturan status) selesai dibangun dan diverifikasi lokal oleh asisten; menunggu owner menjalankan `scripts/patch/tahap-1.2.ps1`.** Termasuk tambahan owner: `npm run dev`.
- **Berikutnya:** **Tahap 1.3** (API + basis data PostgreSQL + data contoh/seed + akun dan peran + log audit + OpenAPI/kamus data). Mulai dengan `TAHAP 1.3` setelah patch 1.2 dijalankan.

## Cara menjalankan (pengembangan)
```powershell
npm ci          # sekali
npm run dev     # API http://localhost:3180 + web http://localhost:5180 (mode demo)
npm run dev:lan # idem, dapat dibuka dari ponsel (satu Wi-Fi)
```
Port khusus (3180/5180) karena 3000 dan 5173 dipakai proyek lain di komputer owner (MDBKA). Gate: `powershell -ExecutionPolicy Bypass -File scripts\gate.ps1`.

## Yang berjalan sekarang
- Monorepo: `apps/web` (React 19, Vite 8, PWA), `apps/api` (Fastify 5), `packages/shared`, `packages/domain`.
- **Domain (1.2):** model kegiatan; waktu ISO 8601 + zona; `cariBentrok` (jenis langsung/sumber_daya, kepastian pasti/potensi, durasi bawaan dari konfigurasi 120 menit); aturan status (16 perpindahan sah, syarat per tujuan, alasan wajib, bentrok pasti butuh alasan, peristiwa murni).
- Data uji fiktif `data/contoh/` (agenda 22/24/26 Okt) dengan uji bahwa tidak memuat data nyata.
- Gate: `npm run lint`, `npm test` (**76 uji**), `npm run build`; lolos di Node 20.20.0 dan 22.22.0; `docker compose build` lolos.
- Dokumen dihasilkan dari kode: `ALUR_PROSES.md` (`npm run docs:status`), SBOM (`npm run sbom`).

## Fakta kunci
- Strategi: bangun mandiri; tidak konsultasi Diskominfosan sebelum peluncuran; serah terima saat peluncuran (KP-004).
- Kabag Protokol melihat aplikasi setelah terlihat jadi; semua orang/SK/hak akses = **placeholder** berlabel CONTOH (KP-005, KP-006). Owner = admin `admin.owner`; mode `demo` dengan pindah tampilan peran (KP-007).
- Keputusan 1.2 (KP-013): durasi bawaan 2 jam; bentrok = peringatan, bukan pemblokiran; aturan status ikut dikerjakan.
- Teknologi: TypeScript ~5.9, React + Vite (PWA), Fastify, PostgreSQL (1.3), Vitest, ESLint (ADR-001, revisi 1). Node 22 disarankan; Node 20.19+ berjalan.
- Gate, add, commit, push dijalankan owner lewat `scripts/patch/tahap-<nomor>.ps1` (KP-002). Pra-verifikasi gate oleh asisten bila disetujui di Lembar Tahap (KP-012, KP-013).

## Keputusan terbuka
KT-01 kepemilikan kode/HKI, KT-02 sumber dana dan biaya, KT-03 jawaban pertanyaan Kabag (Bab XI 11.10 dan `ATURAN_BISNIS.md` bagian 5), KT-04 pengesahan Kepala Biro. Rincian: `docs/keputusan/KEPUTUSAN.md`.

## Dokumen audit
Setelah 1.2: Ada 27 (RK-06, RK-07, TG-09 baru). Daftar: `docs/audit/DAFTAR_DOKUMEN_AUDIT.md`; hitungan terkini: `scripts/audit-check.ps1`.

## Placeholder aktif
PH-01..13 (`docs/audit/DAFTAR_PLACEHOLDER.md`); PH-07 (agenda contoh) mulai terisi. Penggantian di **Tahap P**.

## Koreksi terbuka
Tidak ada. KOR-002 (`npm run dev`) selesai (`docs/perubahan/REGISTER_KOREKSI.md`).

## Urutan tahap ke depan
1.2 (ini) → **1.3** API+data+contoh+akun/peran+log audit+OpenAPI → 1.4 antarmuka ponsel + dasbor peran + mode demo → 1.5 notifikasi/ekspor/luring → 1.6 evaluasi mandiri → 2 M2+pengganti+bentrok perjalanan+dokumen operasi → 3 perluasan+uji keamanan (naik Node 24) → **P** penggantian data contoh → 4 peluncuran dan serah terima.

## Riwayat patch
0.1 sampai 1.1 sudah di-push. **Patch 1.2 menunggu dijalankan owner** (ikut meng-commit koreksi Docker dan bukti dari akhir 1.1).
