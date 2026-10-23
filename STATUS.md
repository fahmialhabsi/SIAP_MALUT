# STATUS SIAP MALUT

**Diperbarui:** 23 Oktober 2026, Tahap 0.6
**Baca dahulu:** `CLAUDE.md`, lalu berkas ini. Perintah lanjut: `LANJUT`.

## Posisi sekarang
- **Fase:** Tahap 0 (persiapan), hampir selesai. Belum ada kode aplikasi.
- **Terakhir selesai:** Tahap 0.6: cara kerja, struktur folder dibekukan, data contoh, keputusan, register koreksi.
- **Berikutnya:** **Tahap 1.1** (kerangka repo + gate npm pertama). Mulai dengan `TAHAP 1.1` (asisten menerbitkan Lembar Tahap untuk Anda setujui).

## Fakta kunci
- Strategi: bangun mandiri; tidak konsultasi Diskominfosan sebelum peluncuran; serah terima saat peluncuran (KP-004).
- Kabag Protokol melihat aplikasi setelah terlihat jadi; semua orang/SK/hak akses = **placeholder** berlabel CONTOH (KP-005, KP-006).
- Owner = admin (`admin.owner`); mode `demo` dengan pindah tampilan peran (KP-007).
- Teknologi: TypeScript, React + Vite (PWA), Fastify, PostgreSQL, Vitest, ESLint (ADR-001).
- Gate, add, commit, push dijalankan owner lewat `scripts/patch/tahap-<nomor>.ps1` (KP-002).

## Keputusan terbuka
KT-01 kepemilikan kode/HKI, KT-02 sumber dana dan biaya, KT-03 jawaban pertanyaan Kabag (Bab XI 11.10), KT-04 pengesahan Kepala Biro. Rincian: `docs/keputusan/KEPUTUSAN.md`.

## Dokumen audit
Ada 15, Draf 2, Placeholder 1, Belum selebihnya (lihat `scripts/audit-check.ps1`). Daftar: `docs/audit/DAFTAR_DOKUMEN_AUDIT.md`.

## Placeholder aktif
PH-01..12 (lihat `docs/audit/DAFTAR_PLACEHOLDER.md`). Penggantian di **Tahap P**.

## Koreksi terbuka
Tidak ada (lihat `docs/perubahan/REGISTER_KOREKSI.md`).

## Urutan tahap ke depan
0.6 (ini) → **1.1** kerangka repo → 1.2 domain (bentrok) → 1.3 API+data+contoh → 1.4 antarmuka ponsel + dasbor peran + mode demo → 1.5 notifikasi/ekspor/luring → 1.6 evaluasi mandiri → 2 M2+pengganti+dokumen operasi → 3 perluasan+uji keamanan → **P** penggantian data contoh → 4 peluncuran dan serah terima.

## Riwayat patch
0.1 → 0.5 sudah di-push. **Patch 0.6 menunggu dijalankan owner.**
