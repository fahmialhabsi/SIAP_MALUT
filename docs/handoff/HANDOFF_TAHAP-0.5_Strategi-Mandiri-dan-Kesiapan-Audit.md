# Handoff Tahap 0.5: Strategi Bangun Mandiri dan Kesiapan Audit

| | |
|---|---|
| Tanggal | 23 Oktober 2026 |
| Tahap | 0.5 |
| Commit | dibuat saat owner menjalankan `scripts/patch/tahap-0.5.ps1` (pesan berakhiran "Tahap 0.5") |
| Penyusun | Claude (Sonnet 5.5) |
| Status | Berkas selesai; commit dan push menunggu owner menjalankan patch |

## 1. Tujuan tahap
Mencatat keputusan owner bahwa **belum ada konsultasi ke Diskominfosan**; kita merancang, membangun, dan menguji sampai siap, lalu serah terima saat peluncuran. Menyiapkan penuh dokumen yang wajib ada saat audit Diskominfosan, Inspektorat, dan BPK, dan menjaganya selaras dengan aplikasi.

## 2. Yang dikerjakan
- Aturan kerja baru: **Aturan 8** (bangun mandiri, serah terima saat peluncuran) dan **Aturan 9** (dokumen audit hidup, Definisi Selesai).
- **Daftar induk 65 dokumen audit** dalam 9 kategori, dengan peminta (D/I/B), tahap pembuatan, cara menjaga sinkron, status, dan berkas.
- **Paket serah terima**: 11 syarat teknis yang dibangun sejak Tahap 1.1, 35 butir daftar periksa, 6 uji serah terima, alur, dan risiko.
- **RTM awal** (30 kebutuhan KB-001..030) dan **register risiko awal** (20 risiko).
- **Skrip `scripts/audit-check.ps1`**: memastikan setiap dokumen berstatus Ada benar-benar ada; dipanggil `gate.ps1`.
- Penyesuaian ADR, templat handoff (centang dokumen audit), rancangan (catatan di 6.1 dan Bab IX, Bab XII baru), handoff 0.4 (usulan konsultasi dibatalkan).

## 3. Berkas yang dibuat atau diubah
| Berkas | Perubahan |
|---|---|
| `docs/audit/DAFTAR_DOKUMEN_AUDIT.md` | Baru |
| `docs/audit/PAKET_SERAH_TERIMA.md` | Baru |
| `docs/audit/MATRIKS_KETERLUSURAN.md` | Baru |
| `docs/audit/REGISTER_RISIKO.md` | Baru |
| `scripts/audit-check.ps1` | Baru |
| `scripts/gate.ps1` | Memanggil audit-check |
| `CLAUDE.md` | Aturan 8, 9; peta folder |
| `docs/handoff/_TEMPLATE_HANDOFF.md` | Centang dokumen audit |
| `docs/standar/KEPUTUSAN_TEKNOLOGI_PURWARUPA.md` | Tanpa konsultasi Diskominfosan; bagian 9 syarat serah terima |
| `docs/rancangan/…Biro_Adpim_Malut.md` | Catatan di 6.1 dan Bab IX; Bab XII |
| `docs/handoff/HANDOFF_TAHAP-0.4_…md` | Langkah berikutnya diperbarui |
| `scripts/patch/tahap-0.5.ps1`, handoff ini | Baru |

## 4. Keputusan
- Tidak ada konsultasi atau konfirmasi Diskominfosan sebelum peluncuran (keputusan owner).
- Sistem dibangun portabel dan siap serah terima sejak Tahap 1.1.
- Dokumen yang bisa dihasilkan dari kode tidak ditulis tangan.

## 5. Asumsi dan catatan jujur
- Rujukan regulasi pada daftar audit ditulis dari pengetahuan penulis dan **belum diverifikasi di JDIH**.
- Pembagian "apa yang dicari pemeriksa" adalah gambaran umum, bukan pedoman resmi masing-masing lembaga.
- Peta tahap pembuatan dokumen adalah usulan.

## 6. Verifikasi
| Pemeriksaan | Hasil |
|---|---|
| Sintaks `audit-check.ps1` dan `gate.ps1` | 0 galat |
| `audit-check.ps1` dijalankan | Terbaca 65 baris: Ada=9, Draf=2, Belum=54; lolos (bug awal "terbaca 0 baris" ditemukan dan diperbaiki, kini gagal bila tidak ada baris terbaca) |
| `gate.ps1` | Audit lolos; gate npm dilewati (belum ada `package.json`) |
| Patch dijalankan | Belum (dijalankan owner) |

### Dokumen audit terdampak (Aturan 9)
- [x] `DAFTAR_DOKUMEN_AUDIT.md` dibuat; status 9 Ada, 2 Draf, 54 Belum
- [x] `MATRIKS_KETERLUSURAN.md` dibuat (KB-001..030, belum ada uji)
- [x] `REGISTER_RISIKO.md` dibuat (RS-01..20)
- [ ] Dokumen dari kode: belum berlaku (belum ada kode)
- [x] `scripts/audit-check.ps1` lolos
- Dokumen Belum yang tahapnya sudah terlewati: **AK-01 (kepemilikan kode), AK-03 (catatan biaya), TG-05 (SK tim)** tahap 0 belum ada

## 7. Belum selesai
- **Keputusan owner yang masih terbuka:** kepemilikan kode dan HKI (AK-01), sumber dana dan pencatatan biaya (AK-03), SK tim (TG-05), kebijakan data uji.
- Rujukan regulasi belum diverifikasi.
- Skrip pemeriksa RTM (uji menyebut ID kebutuhan) menyusul Tahap 1.1.
- 7 pertanyaan terbuka di Bab XI 11.10 belum dijawab.

## 8. Risiko
- Strategi tanpa konsultasi membawa risiko penolakan saat serah terima (RS-14), aplikasi tak terdaftar (RS-15), kepemilikan kode (RS-16): dicatat dan dimitigasi.
- Dokumen melenceng dari aplikasi (RS-18) adalah risiko terbesar setelah kode ada; mitigasi: pembangkitan otomatis dan Definisi Selesai.

## 9. Langkah berikutnya
1. Owner menjalankan patch 0.5.
2. **Tahap 1.1**: kerangka repo (TypeScript, Vite, Fastify, Vitest, ESLint, kontainer, `.env.example`, `/health`, log audit) dengan gate npm pertama.
3. Owner memutuskan AK-01 dan AK-03 sebelum peluncuran (bisa paralel).

## 10. Cara melanjutkan
Baca `CLAUDE.md` Aturan 8 dan 9, lalu `docs/audit/PAKET_SERAH_TERIMA.md` bagian 2 (syarat teknis untuk Tahap 1.1).
