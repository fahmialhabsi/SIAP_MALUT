# Daftar Induk Dokumen Wajib Audit SIAP MALUT

**Status:** v1.0 (Tahap 0.5). Dokumen hidup: diperbarui setiap tahap.
**Tujuan:** memastikan sejak awal setiap dokumen yang akan diminta pemeriksa **sudah ada, benar, dan sesuai dengan aplikasi yang berjalan**, sehingga siap diperiksa Diskominfosan, Inspektorat, dan BPK.

> **Peringatan rujukan.** Rujukan regulasi dan standar pada bagian 2 disusun dari pengetahuan penulis dan **harus diverifikasi** (nomor, tahun, pasal, perubahan terbaru) di JDIH resmi sebelum dikutip sebagai dasar. Daftar ini bukan nasihat hukum.

## 1. Prinsip: Dokumen = Bukti yang Berjalan

1. **Satu aplikasi, satu kebenaran.** Dokumen tidak boleh menjelaskan sistem yang tidak ada. Bila kode berubah, dokumen terdampak berubah pada **tahap yang sama**.
2. **Hasilkan dari kode bila mungkin.** Dokumen yang dapat dihasilkan otomatis (spesifikasi API, skema basis data, daftar dependensi, laporan uji, riwayat perubahan) **tidak ditulis tangan**, agar tidak bisa melenceng.
3. **Keterlusuran.** Kebutuhan, lalu desain, lalu kode, lalu uji, lalu bukti, dihubungkan lewat ID di `docs/audit/MATRIKS_KETERLUSURAN.md`. Setiap kebutuhan wajib punya uji; setiap uji menyebut ID kebutuhan.
4. **Bukti tidak dapat diubah diam-diam.** Riwayat Git (commit per tahap), handoff, tag rilis, dan log audit aplikasi menjadi jejak. Dilarang menulis ulang riwayat tanpa izin owner.
5. **Tidak ada rahasia di repo.** Kata sandi, kunci, token, dan data pribadi nyata tidak disimpan di repo atau dokumen. Dokumen hanya menyebut *letak* dan *prosedur* pengelolaannya.
6. **Jujur tentang status.** Tiap dokumen berstatus **Ada**, **Draf**, atau **Belum**. Skrip `scripts/audit-check.ps1` memeriksa bahwa setiap berkas berstatus **Ada** benar-benar ada.
7. **Definisi Selesai (tiap tahap):** gate lolos, handoff dibuat, **dokumen audit terdampak diperbarui**, RTM dan register risiko mutakhir.

## 2. Apa yang Biasanya Dicari Tiap Pemeriksa (ringkasan)

| Pemeriksa | Fokus umum | Pertanyaan khas |
|---|---|---|
| **Diskominfosan** (pembina SPBE daerah) | Kesesuaian dengan Arsitektur SPBE, keamanan informasi, interoperabilitas, kesiapan operasi dan pemeliharaan, kelayakan serah terima | Apakah terdaftar/terpetakan dalam Arsitektur SPBE? Apakah bisa dipasang, dipelihara, dan dipulihkan oleh tim kami? Bagaimana keamanan dan integrasinya? |
| **Inspektorat** (APIP) | Kepatuhan terhadap prosedur, efektivitas dan manfaat, pengendalian intern (SPIP), pengelolaan akses, pengelolaan aset, pencapaian kinerja | Apakah proses dijalankan sesuai SOP? Siapa yang boleh melakukan apa dan apa buktinya? Apakah manfaat tercapai sesuai target? |
| **BPK** | Kewajaran dan kepatuhan keuangan, keberadaan dan kepemilikan aset, pengendalian TI dalam pemeriksaan (termasuk tujuan tertentu), kepatuhan pengadaan, efektivitas | Apa biayanya dan buktinya? Siapa pemilik kode dan aset? Apakah kontrol TI (akses, perubahan, cadangan) berjalan? |

Kode peminta pada tabel: **D** = Diskominfosan, **I** = Inspektorat, **B** = BPK.

### Rujukan yang perlu diverifikasi (JDIH)
- Perpres 95/2018 (SPBE); Perpres 132/2022 (Arsitektur SPBE Nasional); Perpres 82/2023; PermenPANRB tentang pemantauan dan evaluasi SPBE (indeks SPBE) dan manajemen risiko SPBE.
- UU 27/2022 (Pelindungan Data Pribadi); UU ITE dan perubahannya; PP 71/2019 (Penyelenggaraan Sistem dan Transaksi Elektronik).
- Peraturan BSSN tentang manajemen keamanan informasi SPBE; ISO/IEC 27001 dan 27002; OWASP ASVS dan Top 10.
- UU 43/2009 (Kearsipan) dan SRIKANDI; UU 14/2008 (Keterbukaan Informasi Publik).
- PP 60/2008 (SPIP); peraturan pengelolaan Barang Milik Daerah (aset tak berwujud); standar pemeriksaan BPK.
- Pergub Malut 36/2021 dan 20/2023 (sudah dalam rancangan).

## 3. Daftar Dokumen

Kolom **Sinkron lewat** menunjukkan cara dokumen dijaga selalu sesuai aplikasi. Status: **Ada** / **Draf** / **Belum** / **Placeholder** (berisi data contoh; diganti pada Tahap P, lihat `DAFTAR_PLACEHOLDER.md`).

### A. Tata Kelola dan Perencanaan

| ID | Dokumen | Diminta | Dibuat | Sinkron lewat | Status | Berkas |
|---|---|---|---|---|---|---|
| TG-01 | Rancangan awal sistem (latar, benchmarking, rekomendasi) | D I B | 0 | Direvisi tiap perubahan cakupan | Ada | `docs/rancangan/Rancangan_Awal_Sistem_Aplikasi_Biro_Adpim_Malut.md` |
| TG-02 | Aturan kerja proyek dan pembagian peran | I | 0 | `CLAUDE.md` diperbarui bila aturan berubah | Ada | `CLAUDE.md` |
| TG-03 | Keputusan arsitektur/teknologi (ADR) | D | 0 | ADR baru tiap keputusan penting | Ada | `docs/standar/KEPUTUSAN_TEKNOLOGI_PURWARUPA.md` |
| TG-04 | Standar desain antarmuka | D I | 0 | Token CSS satu sumber | Ada | `docs/standar/STANDAR_DESAIN.md` |
| TG-05 | Surat keputusan kelompok kerja, tim, dan peran (pemilik sistem, pemilik proses, administrator); sementara berisi placeholder | I B | 0 | Salinan SK ditaruh di arsip; diganti SK asli pada Tahap P | Placeholder | `docs/audit/arsip/` |
| TG-06 | Matriks keterlusuran kebutuhan (RTM) | D I B | 0 | Diperbarui tiap tahap; skrip memeriksa | Ada | `docs/audit/MATRIKS_KETERLUSURAN.md` |
| TG-07 | Register risiko proyek dan sistem | D I B | 0 | Ditinjau tiap tahap | Ada | `docs/audit/REGISTER_RISIKO.md` |
| TG-08 | Rencana kerja, jadwal tahap, dan laporan kemajuan | I B | 0 | Handoff per tahap | Ada | `docs/handoff/` |
| TG-09 | Spesifikasi kebutuhan perangkat lunak (SRS) | D I B | 1.0 | Diturunkan dari RTM | Ada | `docs/rekayasa/SRS.md` |
| TG-10 | Draf SOP layanan Biro | I | 0 | Aturan tenggat di aplikasi dibaca dari SOP | Draf | `docs/sop/SOP_LAYANAN_DRAF.md` |
| TG-11 | Aturan kewenangan mewakili pimpinan | I | 0 | Data aturan di aplikasi = isi dokumen | Draf | `docs/standar/ATURAN_KEWENANGAN_MEWAKILI_DRAF.md` |
| TG-12 | Bahan Arsitektur SPBE (proses bisnis, data, aplikasi, infrastruktur, keamanan) | D | 3 | Diturunkan dari TG-01, RK-01..04 | Belum | `docs/audit/spbe/` |
| TG-13 | Analisis manfaat dan indikator kinerja (baseline dan target) | I B | 1.0 | Indikator Rancangan 8.1; dihitung dari data sistem | Belum | `docs/audit/indikator/` |
| TG-14 | Standar cara kerja (siklus tahap, perintah, penanganan koreksi) | I | 0 | `CLAUDE.md` merujuknya | Ada | `docs/standar/CARA_KERJA.md` |
| TG-15 | Log keputusan owner | I B | 0 | Entri tiap keputusan | Ada | `docs/keputusan/KEPUTUSAN.md` |
| TG-16 | Struktur folder baku | I | 0 | Diperiksa `audit-check` | Ada | `docs/standar/FOLDER_STRUKTUR.md` |
| TG-17 | Register koreksi (owner dan Kabag) | I | 0 | Setiap koreksi tercatat | Ada | `docs/perubahan/REGISTER_KOREKSI.md` |
| TG-18 | Standar data contoh dan placeholder | I B | 0 | Penjaga produksi di aplikasi | Ada | `docs/standar/STANDAR_DATA_CONTOH.md` |
| TG-19 | Daftar placeholder dan rencana penggantian | I B | 0 | Diperbarui tiap tahap | Ada | `docs/audit/DAFTAR_PLACEHOLDER.md` |

### B. Rekayasa dan Desain

| ID | Dokumen | Diminta | Dibuat | Sinkron lewat | Status | Berkas |
|---|---|---|---|---|---|---|
| RK-01 | Dokumen arsitektur perangkat lunak (konteks, komponen, deployment) | D | 1.1 | Diagram dari kode/konfigurasi; ditinjau tiap tahap | Ada | `docs/rekayasa/ARSITEKTUR.md` |
| RK-02 | Model dan kamus data (ERD, tipe, makna, sensitivitas) | D I B | 1.3 | **Dihasilkan dari skema Drizzle** | Belum | `docs/rekayasa/KAMUS_DATA.md` |
| RK-03 | Spesifikasi API | D | 1.3 | **Dihasilkan dari skema Fastify/Zod (OpenAPI)** | Belum | `docs/rekayasa/openapi.json` |
| RK-04 | Desain keamanan (autentikasi, otorisasi, enkripsi, log) | D I B | 1.3 | Diuji oleh kasus uji keamanan | Belum | `docs/rekayasa/DESAIN_KEAMANAN.md` |
| RK-05 | Matriks hak akses (peran × fitur × data) | I B | 1.3 | **Uji otomatis membaca matriks yang sama dengan aplikasi** | Belum | `docs/rekayasa/MATRIKS_HAK_AKSES.md` |
| RK-06 | Desain alur proses dan status (diagram status tiket/agenda) | I | 1.2 | Status di kode = diagram | Ada | `docs/rekayasa/ALUR_PROSES.md` |
| RK-07 | Aturan bisnis (bentrok, pengganti, tenggat) | I | 1.2 | Uji unit memakai contoh di dokumen | Ada | `docs/rekayasa/ATURAN_BISNIS.md` |
| RK-08 | Desain integrasi (SRIKANDI, e-Office, notifikasi, BSrE) | D | 2 | Kontrak integrasi diuji | Belum | `docs/rekayasa/INTEGRASI.md` |

### C. Pembangunan dan Mutu

| ID | Dokumen | Diminta | Dibuat | Sinkron lewat | Status | Berkas |
|---|---|---|---|---|---|---|
| MU-01 | Riwayat perubahan (commit per tahap, tag rilis, CHANGELOG) | I B | 0 | Git; patch per tahap | Ada | `docs/handoff/` |
| MU-02 | Standar pengodean dan tinjauan kode | D | 1.1 | ESLint/Prettier di gate | Ada | `docs/rekayasa/STANDAR_KODE.md` |
| MU-03 | Bukti gate (lint, test, build) per rilis | D I | 1.1 | Keluaran skrip patch disimpan | Ada | `docs/audit/bukti-gate/` |
| MU-04 | Rencana uji dan strategi pengujian | D I | 1.1 | RTM | Ada | `docs/mutu/RENCANA_UJI.md` |
| MU-05 | Kasus uji dan laporan uji (unit, integrasi, E2E, ponsel 360 px) | D I B | 1.x | **Laporan dari Vitest/Playwright** | Belum | `docs/mutu/laporan-uji/` |
| MU-06 | Uji penerimaan pengguna (UAT) dan berita acara | D I B | 1.6 | Skenario dari SOP dan RTM | Belum | `docs/mutu/UAT/` |
| MU-07 | Uji kinerja dan ketahanan jaringan lemah/luring | D | 3 | Hasil uji beban | Belum | `docs/mutu/UJI_KINERJA.md` |
| MU-08 | Uji aksesibilitas dan kepatuhan standar desain | I | 1.4 | Daftar periksa standar bagian 8 | Belum | `docs/mutu/UJI_AKSESIBILITAS.md` |
| MU-09 | Daftar komponen perangkat lunak (SBOM) dan lisensi | D B | 1.1 | **Dihasilkan `npm sbom` tiap rilis** | Ada | `docs/audit/sbom/` |
| MU-10 | Daftar cacat, status perbaikan, dan pengecualian yang diterima | D I | 1.x | Isu di repo | Belum | `docs/mutu/DAFTAR_CACAT.md` |

### D. Keamanan dan Pelindungan Data Pribadi

| ID | Dokumen | Diminta | Dibuat | Sinkron lewat | Status | Berkas |
|---|---|---|---|---|---|---|
| KM-01 | Kebijakan keamanan informasi aplikasi | D I | 1.3 | Selaras RK-04 | Belum | `docs/keamanan/KEBIJAKAN_KEAMANAN.md` |
| KM-02 | Klasifikasi data dan inventaris data pribadi (siapa, apa, dasar, lokasi, retensi) | D I B | 1.3 | **Kolom sensitivitas pada kamus data** | Belum | `docs/keamanan/INVENTARIS_DATA_PRIBADI.md` |
| KM-03 | Penilaian dampak pelindungan data pribadi | D I | 1.6 | Ditinjau tiap fitur data baru | Belum | `docs/keamanan/PENILAIAN_DAMPAK_PDP.md` |
| KM-04 | Kebijakan retensi dan penghapusan data | I B | 2 | Pekerjaan retensi di aplikasi mengikuti kebijakan | Belum | `docs/keamanan/KEBIJAKAN_RETENSI.md` |
| KM-05 | Manajemen akun, kata sandi, dan peninjauan akses berkala | I B | 1.3 | Fitur peninjauan akses di aplikasi | Belum | `docs/keamanan/MANAJEMEN_AKSES.md` |
| KM-06 | Rencana tanggapan insiden keamanan dan formulir pelaporan | D I | 2 | Latihan dan catatan | Belum | `docs/keamanan/TANGGAPAN_INSIDEN.md` |
| KM-07 | Hasil pindai kerentanan dan uji penetrasi, serta tindak lanjut | D I B | 3 | Diulang tiap rilis besar | Belum | `docs/keamanan/hasil-uji-keamanan/` |
| KM-08 | Pengelolaan kunci, sertifikat, dan rahasia (prosedur, tanpa nilai) | D I | 2 | Skrip konfigurasi | Belum | `docs/keamanan/PENGELOLAAN_RAHASIA.md` |
| KM-09 | Desain log audit (apa yang dicatat, retensi, perlindungan perubahan) | I B | 1.3 | **Tabel log append-only di aplikasi** | Belum | `docs/keamanan/LOG_AUDIT.md` |

### E. Operasional

| ID | Dokumen | Diminta | Dibuat | Sinkron lewat | Status | Berkas |
|---|---|---|---|---|---|---|
| OP-01 | Panduan pemasangan, konfigurasi, dan penerapan (deployment) | D | 1.1 | Dicoba ulang dari nol tiap rilis | Ada | `docs/operasi/PEMASANGAN.md` |
| OP-02 | Spesifikasi kebutuhan infrastruktur (CPU, memori, penyimpanan, jaringan, domain) | D | 1.1 | Dari berkas kontainer | Ada | `docs/operasi/KEBUTUHAN_INFRASTRUKTUR.md` |
| OP-03 | SOP pencadangan dan pemulihan, beserta bukti uji pemulihan | D I B | 2 | Skrip cadangan dan uji pemulihan terjadwal | Belum | `docs/operasi/CADANGAN_PEMULIHAN.md` |
| OP-04 | Rencana keberlangsungan layanan dan pemulihan bencana (BCP/DRP) | D I | 3 | Latihan dan catatan | Belum | `docs/operasi/BCP_DRP.md` |
| OP-05 | Pemantauan, peringatan, dan runbook insiden | D | 2 | Titik kesehatan (*health check*) di aplikasi | Belum | `docs/operasi/RUNBOOK.md` |
| OP-06 | Manajemen perubahan (formulir, persetujuan, rilis, pembatalan) | I B | 1.1 | Selaras patch dan handoff | Ada | `docs/operasi/MANAJEMEN_PERUBAHAN.md` |
| OP-07 | Perjanjian tingkat layanan dan pemeliharaan (usulan) | D I B | 3 | Metrik dari pemantauan | Belum | `docs/operasi/SLA_PEMELIHARAAN.md` |
| OP-08 | Manajemen insiden dan masalah (daftar dan pelaporan) | I | 2 | Log | Belum | `docs/operasi/INSIDEN_MASALAH.md` |

### F. Pengguna dan Pelatihan

| ID | Dokumen | Diminta | Dibuat | Sinkron lewat | Status | Berkas |
|---|---|---|---|---|---|---|
| PG-01 | Panduan pengguna per peran (pimpinan, protokol, pengganti, pemohon) | I | 1.6 | Tangkapan layar dari versi rilis | Belum | `docs/pengguna/PANDUAN_PENGGUNA.md` |
| PG-02 | Panduan administrator | D I | 1.6 | Dicoba oleh orang di luar penyusun | Belum | `docs/pengguna/PANDUAN_ADMIN.md` |
| PG-03 | Materi bimtek, daftar hadir, dan evaluasi pelatihan | I B | 2 | Arsip bukti | Belum | `docs/pengguna/pelatihan/` |
| PG-04 | Pertanyaan umum dan panduan video singkat | I | 2 | Versi rilis | Belum | `docs/pengguna/FAQ.md` |

### G. Aset, Keuangan, dan Kepemilikan

| ID | Dokumen | Diminta | Dibuat | Sinkron lewat | Status | Berkas |
|---|---|---|---|---|---|---|
| AK-01 | Pernyataan kepemilikan kode sumber dan hak kekayaan intelektual (penyerahan ke Pemprov) | B D | 0 | **Keputusan owner (lihat 5)** | Belum | `docs/audit/kepemilikan/` |
| AK-02 | Daftar lisensi pihak ketiga dan kepatuhan lisensi | B D | 1.1 | Dari SBOM | Ada | `docs/audit/sbom/` |
| AK-03 | Rincian biaya pengembangan dan sumber pendanaan (bila ada anggaran) | B I | 0 | Dicatat per tahap | Belum | `docs/audit/keuangan/` |
| AK-04 | Dokumen pengadaan, kontrak, dan berita acara (bila ada pihak ketiga) | B I | 0 | Arsip | Belum | `docs/audit/pengadaan/` |
| AK-05 | Pencatatan aplikasi sebagai aset (aset tak berwujud) dan nilai perolehan | B I | 4 | Mengikuti BAST | Belum | `docs/audit/aset/` |
| AK-06 | Daftar akun layanan dan penanggung jawab (domain, server, penyimpanan, notifikasi) | B D | 2 | Peninjauan berkala | Belum | `docs/audit/akun-layanan/` |

### H. Peluncuran dan Serah Terima

| ID | Dokumen | Diminta | Dibuat | Sinkron lewat | Status | Berkas |
|---|---|---|---|---|---|---|
| PL-01 | Paket serah terima ke Diskominfosan (lihat dokumen terpisah) | D I B | 4 | Daftar periksa | Ada | `docs/audit/PAKET_SERAH_TERIMA.md` |
| PL-02 | Kriteria kelayakan peluncuran (*go-live*) dan hasil periksa | D I | 4 | Dari RTM dan laporan uji | Belum | `docs/audit/KELAYAKAN_PELUNCURAN.md` |
| PL-03 | Berita acara serah terima (BAST) | D I B | 4 | Ditandatangani | Belum | `docs/audit/bast/` |
| PL-04 | Rencana dukungan pascaluncur (*hypercare*) dan jaminan perbaikan | D I | 4 | Jadwal | Belum | `docs/audit/PASCALUNCUR.md` |

### I. Pemantauan dan Evaluasi

| ID | Dokumen | Diminta | Dibuat | Sinkron lewat | Status | Berkas |
|---|---|---|---|---|---|---|
| PM-01 | Laporan indikator kinerja (Rancangan 8.1) | I B | 2 | **Dihitung dari data aplikasi** | Belum | `docs/audit/indikator/` |
| PM-02 | Laporan peninjauan akses dan log audit berkala | I B | 2 | Dari aplikasi | Belum | `docs/audit/peninjauan-akses/` |
| PM-03 | Laporan evaluasi dan pelajaran setelah peluncuran | D I | 4 | Handoff dan laporan | Belum | `docs/audit/EVALUASI.md` |

## 4. Peta Dokumen ke Tahap

| Tahap | Dokumen yang harus ada atau diperbarui saat tahap selesai |
|---|---|
| 0 | TG-01..08, TG-10, TG-11, TG-14..19, MU-01, AK-01 (keputusan), AK-03 (mulai catat) |
| P (penggantian data contoh) | TG-05 (SK asli), PH-01..12 diganti; matriks hak akses RK-05 dengan pemegang jabatan asli; uji ulang hak akses dan dasbor |
| 1.1 | RK-01, MU-02..04, MU-09, OP-01, OP-02, OP-06, AK-02 |
| 1.2 | RK-06, RK-07, TG-09 (SRS awal) |
| 1.3 | RK-02..05, KM-01, KM-02, KM-05, KM-09 |
| 1.4 | MU-08 |
| 1.5 | RK-08 (notifikasi), MU-05 |
| 1.6 | MU-06, PG-01, PG-02, KM-03, TG-13 |
| 2 | OP-03, OP-05, OP-08, KM-04, KM-06, KM-08, PG-03, PG-04, PM-01, PM-02, AK-06 |
| 3 | MU-07, KM-07, OP-04, OP-07, TG-12 |
| 4 / Peluncuran | PL-01..04, PM-03, AK-05, seluruh dokumen berstatus Ada |

## 5. Keputusan yang Dibutuhkan dari Owner (tercatat, belum diputuskan)

1. **Kepemilikan kode sumber dan hak kekayaan intelektual.** Bila sistem dibangun di luar pengadaan resmi, pemeriksa (terutama BPK) akan menanyakan siapa pemilik kode, dasar penyerahan ke Pemprov, dan apakah ada biaya. Perlu bentuk hukum penyerahan (mis. pernyataan penyerahan hak, lisensi). **Putusan wajib sebelum peluncuran.**
2. **Sumber pendanaan dan pencatatan biaya** (waktu, perangkat, layanan awan) agar dapat dijelaskan kepada BPK dan Inspektorat.
3. **Penanggung jawab resmi** tiap peran (SK) pada TG-05.
4. **Kebijakan data uji:** data fiktif sampai UAT; data nyata hanya di lingkungan terkendali yang disetujui owner; ID rapat dan kata sandi tidak masuk repo.

## 6. Cara Menjaga Daftar Ini Tetap Benar

- Setiap tahap: perbarui kolom Status dan Berkas, lalu jalankan `scripts/audit-check.ps1` (juga dipanggil `scripts/gate.ps1`).
- Skrip gagal bila ada dokumen berstatus **Ada** yang berkasnya tidak ditemukan.
- Dokumen berstatus **Belum** yang tahapnya sudah terlewati dilaporkan sebagai peringatan pada handoff tahap berikutnya.
