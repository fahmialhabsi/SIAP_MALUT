# Handoff Tahap 0.4: Verifikasi Tabel Rancangan dan Keputusan Teknologi Purwarupa

| | |
|---|---|
| Tanggal | 23 Oktober 2026 |
| Tahap | 0.4 |
| Commit | dibuat saat owner menjalankan `scripts/patch/tahap-0.4.ps1` (pesan berakhiran "Tahap 0.4") |
| Penyusun | Claude (Sonnet 5.5) |
| Status | Berkas selesai; commit dan push menunggu owner menjalankan patch |

## 1. Tujuan tahap
Mencocokkan tabel rancangan yang direkonstruksi (Tahap 0.1) dengan PDF asli, dan memutuskan kerangka teknologi purwarupa.

## 2. Yang dikerjakan
- Mengekstrak ulang isi PDF dengan mode `pdftotext -raw` (urutan konten asli, sel tabel utuh), lalu membandingkan **semua tabel** dengan versi `.md`.
- Mengoreksi tabel yang berbeda dari PDF; menghapus tanda `[disusun ulang]` karena kini terverifikasi.
- Menulis ADR-001 tentang teknologi purwarupa dan rencana sub-tahap 1.1–1.6.

## 3. Hasil pencocokan tabel
| Tabel | Hasil |
|---|---|
| 2.3 Susunan organisasi | Sesuai |
| 2.4 Kondisi digital | 1 koreksi kecil (teks galat Bank Data) |
| **3.2 Benchmarking** | **Banyak salah, ditulis ulang.** Contoh: SIMPATI (Sulsel) sebelumnya salah ditulis persuratan/TTE, yang benar fasilitas acara; Lampung memakai e-Sughat; Sulut tentang kepegawaian ASN |
| 4.1 Kesenjangan | 1 baris dikoreksi (Ketatausahaan: SRIKANDI dan e-Office; pembanding e-Sughat Lampung) |
| 5.3 Tujuh modul | Isi fungsi banyak dikoreksi (M1 sudah memuat "deteksi bentrok jadwal otomatis", M2 memuat piagam dan pembawa acara, M6 bukan "surat tugas", M7 memuat sentimen pemberitaan) |
| 5.5 Entitas data | Isi dan relasi dikoreksi |
| 5.6 Pendekatan teknologi | Disesuaikan |
| **5.7 Titik integrasi** | **Koreksi atas kesalahan Tahap 0.1:** e-Office ternyata berpasangan dengan sistem kepegawaian, bukan digabung dengan SRIKANDI. Tujuh baris asli dipulihkan, prioritas dikoreksi |
| 6.1 Tata kelola | 2 kolom dikoreksi |
| 7 Peta jalan | Beberapa sel dikoreksi (Tahap 0 memuat dokumen spesifikasi kebutuhan, dll.) |
| 8.1 Indikator | 3 indikator dikoreksi |
| 8.2 Risiko | Dampak 1 baris dikoreksi, nama risiko disesuaikan |

Catatan jujur: penggabungan SRIKANDI dan e-Office pada handoff Tahap 0.1 dan penyeragaman "tujuh titik" **salah** dan sudah dibatalkan. Handoff 0.1 bagian 4 dan 5 usang pada butir itu.

## 4. Berkas yang dibuat atau diubah
| Berkas | Perubahan |
|---|---|
| `docs/rancangan/…Biro_Adpim_Malut.md` | Koreksi tabel, tanda `[disusun ulang]` dihapus, rujukan ke ADR |
| `docs/standar/KEPUTUSAN_TEKNOLOGI_PURWARUPA.md` | Baru (ADR-001) |
| `CLAUDE.md` | Satu baris rujukan tumpukan teknologi |
| `scripts/patch/tahap-0.4.ps1` | Baru |
| `docs/handoff/HANDOFF_TAHAP-0.4_…md` | Baru (berkas ini) |

## 5. Keputusan
- **Teknologi purwarupa:** PWA kustom (TypeScript, React + Vite, Fastify, PostgreSQL, Vitest, ESLint), bukan low-code. Alasan utama: standar desain wajib, aturan bentrok/pengganti yang perlu diuji, data di infrastruktur Pemprov, gate npm, kode milik pemda.
- **Tahap 1 dipecah** menjadi 1.1 sampai 1.6; notifikasi WhatsApp resmi ditunda, Tahap 1 memakai Web Push dan teks siap tempel.

## 6. Verifikasi
| Pemeriksaan | Hasil |
|---|---|
| Tabel dicocokkan dengan teks PDF (mode raw) | Selesai untuk 13 tabel |
| Pembandingan visual halaman PDF | **Belum** (tidak ada perender PDF; hanya teks) |
| Gambar 1–4 PDF | Tidak dikaji (hanya keterangan) |
| Gate npm | Dilewati (belum ada `package.json`) |
| Patch dijalankan | Belum (dijalankan owner) |

## 7. Belum selesai / asumsi
- Versi pustaka belum dikunci (Tahap 1.1).
- Tempat pemasangan server belum disepakati dengan Diskominfosan.
- Pengesahan Kepala Biro atas standar dan teknologi belum ada.
- Contoh agenda nyata memuat ID rapat; **jangan dimasukkan ke repo**.

## 8. Risiko
- Bila Diskominfosan mewajibkan tumpukan lain, ADR perlu ditinjau (kriteria di ADR bagian 7).
- Tabel mungkin masih berbeda tipis dari PDF karena kata pada mode raw tanpa spasi; sudah dibaca manual.

## 9. Langkah berikutnya
1. Owner menjalankan patch 0.4.
2. Tahap 0.5 (usulan): konsultasi dengan Diskominfosan (server, domain, tumpukan) dan jawaban 11.10 dari Kabag Protokol.
3. Tahap 1.1: kerangka repo dan gate npm pertama.

## 10. Cara melanjutkan
Baca `docs/standar/KEPUTUSAN_TEKNOLOGI_PURWARUPA.md` bagian 5, lalu mulai Tahap 1.1.
