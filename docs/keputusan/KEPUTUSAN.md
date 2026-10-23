# Log Keputusan Owner SIAP MALUT

Setiap keputusan owner dicatat di sini (urutan pedoman nomor 1). Perubahan keputusan = entri baru yang menyatakan "menggantikan KP-xxx"; entri lama tidak dihapus.
Format: ID, tanggal, keputusan, dasar/alasan, dampak pada pedoman. Sebagian entri awal dicatat belakangan (retrospektif) dari percakapan.

| ID | Tanggal | Keputusan | Alasan | Dampak |
|---|---|---|---|---|
| KP-001 | 2026-10-23 | Palet Biru Laut dan Emas Cengkih serta font Inter disetujui | Tahap 0.2 | `STANDAR_DESAIN.md`, `design-tokens.css` |
| KP-002 | 2026-10-23 | Gate (`npm test/build/lint`), add, commit, push dijalankan **owner** lewat patch PowerShell; asisten menerbitkan patch lengkap | Hemat kuota harian owner | `CLAUDE.md` Aturan 3 |
| KP-003 | 2026-10-23 | Handoff diperbarui otomatis bila sesi lebih dari 5 chat | Kontinuitas | `CLAUDE.md` Aturan 5 |
| KP-004 | 2026-10-23 | **Tidak berkonsultasi ke Diskominfosan sekarang**; bangun mandiri, serah terima saat peluncuran; siapkan dokumen audit untuk Diskominfosan, Inspektorat, BPK | Fokus rancang-bangun-uji sampai siap | `CLAUDE.md` Aturan 8, 9; `docs/audit/` |
| KP-005 | 2026-10-23 | Atas permintaan Kabag Protokol: perancangan, pembangunan, dan evaluasi dilakukan mandiri oleh owner dan asisten; Kabag melihat setelah aplikasi terlihat jadi | Permintaan Kabag Protokol | `CARA_KERJA.md` |
| KP-006 | 2026-10-23 | SK, nama pejabat/staf, admin, hak akses, dasbor pejabat dan staf memakai **placeholder/data contoh**; diganti nanti. Owner bertindak sebagai **admin** sementara | Permintaan Kabag Protokol | `STANDAR_DATA_CONTOH.md` |
| KP-007 | 2026-10-23 | Label data contoh jelas ("CONTOH"); **mode demo** dengan pindah tampilan peran untuk owner; penjaga produksi menolak data contoh | Evaluasi dasbor tiap peran tanpa data nyata | `STANDAR_DATA_CONTOH.md` |
| KP-008 | 2026-10-23 | Siklus kerja: Lembar Tahap → SETUJU → Bangun → Evaluasi → Patch → Handoff; Lembar Tahap penuh hanya untuk tahap besar; sub-langkah kecil 3 baris | Dasar kerja mengikat dan hemat kuota | `CARA_KERJA.md` |
| KP-009 | 2026-10-23 | Perintah singkat owner (`STATUS`, `LANJUT`, `TAHAP`, `SETUJU`, `EVALUASI`, `KEPUTUSAN:`, `KOREKSI:`, `UBAH:`); `STATUS.md` memori antar sesi | Kontinuitas tanpa kehilangan konteks | `CARA_KERJA.md`, `STATUS.md` |
| KP-010 | 2026-10-23 | **Antisipasi koreksi tambahan** dari owner/Kabag agar struktur folder tidak rusak: struktur dibekukan, koreksi lewat Register Koreksi dan klasifikasi A–D, data/aturan sebagai data bukan kode | Menjaga struktur proyek | `FOLDER_STRUKTUR.md`, `CARA_KERJA.md` bagian 5 |
| KP-011 | 2026-10-23 | Risiko diterima: Kabag baru melihat di akhir, sehingga mungkin revisi besar | Permintaan Kabag | `REGISTER_RISIKO.md` RS-22 |
| KP-012 | 2026-10-23 | Tahap 1.1 SETUJU. Asisten **boleh menjalankan gate lokal sekali sebagai pra-verifikasi** (hanya melaporkan ringkasan); `docker compose build` dicoba; dokumen audit ringkas dibuat sekarang | Kerangka pertama rawan gagal instalasi | `CLAUDE.md` Aturan 3 (pengecualian terbatas bila disetujui di Lembar Tahap) |

## Keputusan Terbuka (belum diputuskan)

| ID | Pertanyaan | Dibutuhkan sebelum |
|---|---|---|
| KT-01 | Bentuk penyerahan hak atas kode/HKI ke Pemprov (AK-01) | Peluncuran |
| KT-02 | Sumber dana dan pencatatan biaya (AK-03) | Peluncuran |
| KT-03 | Jawaban 7 pertanyaan Bab XI 11.10 dari Kabag Protokol | Tahap 2 (rekomendasi pengganti) |
| KT-04 | Pengesahan Kepala Biro atas standar | Peluncuran |
