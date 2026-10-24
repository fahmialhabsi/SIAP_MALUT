# Register Risiko SIAP MALUT

**Status:** v0.1 (Tahap 0.5). Ditinjau setiap tahap. Menggabungkan risiko Rancangan 8.2 dan 11.9 serta risiko strategi pelaksanaan.
**Skala:** Kemungkinan dan Dampak: R (rendah), S (sedang), T (tinggi). Tingkat = gabungan.

| ID | Risiko | K | D | Tingkat | Pemilik | Mitigasi | Status |
|---|---|---|---|---|---|---|---|
| RS-01 | Rendahnya adopsi (nyaman dengan grup pesan instan) | T | T | Tinggi | Owner / Kabag Protokol | Notifikasi dan teks siap tempel WhatsApp; masa transisi berdampingan; antarmuka tiga ketukan | Terbuka |
| RS-02 | Jaringan lemah di wilayah kepulauan | T | S | Tinggi | Pembangun | PWA dengan luring terbatas, sinkronisasi tertunda | Terbuka |
| RS-03 | Ketergantungan pada satu pembangun | S | T | Tinggi | Owner | Handoff per tahap, dokumen hidup, paket serah terima, gate otomatis | Terbuka |
| RS-04 | Anggaran pemeliharaan tidak tersedia | S | S | Sedang | Owner / Kepala Biro | Pos tetap di RKA biro; masuk SLA (OP-07) | Terbuka |
| RS-05 | Kebocoran data pribadi dan agenda pimpinan | S | T | Tinggi | Pembangun | RBAC, penyandian data sensitif, log audit, ID rapat terbatas, uji keamanan | Terbuka |
| RS-06 | Perubahan struktur organisasi | R | S | Rendah | Kepala Biro | Rancangan berbasis peran | Terbuka |
| RS-07 | Cakupan meluas tanpa kendali | S | S | Sedang | Owner | Sub-tahap kecil; daftar tunggu fitur | Terbuka |
| RS-08 | Duplikasi dengan aplikasi provinsi yang ada | S | S | Sedang | Owner | Integrasi alih-alih duplikasi; kajian saat Tahap 3 (TG-12) | Terbuka |
| RS-09 | Rekomendasi pengganti dianggap menggantikan kewenangan pimpinan | S | S | Sedang | Kepala Biro | Hanya saran; keputusan dan jejak audit pada pimpinan/Sekda | Terbuka |
| RS-10 | Aturan kewenangan tidak disepakati atau berubah | S | S | Sedang | Sekda | Aturan sebagai data; ditetapkan bersama Sekda | Terbuka |
| RS-11 | Tautan rapat daring bocor | S | T | Tinggi | Pembangun | Hanya untuk ditugaskan; tidak masuk repo/data uji; log akses | Terbuka |
| RS-12 | Pimpinan/ajudan enggan memakai aplikasi | T | T | Tinggi | Kabag Protokol | Ajudan boleh menginput atas nama; jawaban cepat dari notifikasi | Terbuka |
| RS-13 | Waktu tempuh antarpulau tidak akurat | S | S | Sedang | Kabag Protokol | Tabel dikelola Protokol; saran bukan kepastian | Terbuka |
| RS-14 | **Diskominfosan menolak atau meminta perubahan besar saat serah terima** (strategi bangun dulu) | S | T | Tinggi | Owner | Standar terbuka, kontainer, dokumentasi lengkap sejak awal; logika domain terpisah; Paket Serah Terima | Diterima owner |
| RS-15 | **Aplikasi tak terdaftar dalam Arsitektur SPBE** (Rancangan 2.5) | S | S | Sedang | Owner | Bahan pemetaan sejak awal (TG-12); tidak ada data nyata di produksi sebelum serah terima | Diterima owner |
| RS-16 | **Kepemilikan kode/HKI tidak jelas saat diaudit BPK** | S | T | Tinggi | Owner | Putuskan bentuk penyerahan hak (AK-01) sebelum peluncuran | Terbuka, butuh keputusan |
| RS-17 | **Biaya pembangunan tak terdokumentasi** | S | S | Sedang | Owner | Catat biaya per tahap (AK-03) | Terbuka |
| RS-18 | Dokumen melenceng dari aplikasi | S | T | Tinggi | Pembangun | Dokumen dihasilkan dari kode; RTM; `audit-check`; DoD per tahap | Terbuka |
| RS-19 | Data nyata dipakai di lingkungan tak terkendali selama uji | S | T | Tinggi | Owner | Data fiktif hingga UAT; data nyata hanya di lingkungan UAT terkendali dengan persetujuan | Terbuka |
| RS-20 | Notifikasi WhatsApp resmi tertunda/berbiaya | S | S | Sedang | Owner | Web Push dan teks siap tempel; antarmuka `Notifier` | Terbuka |
| RS-21 | **Data contoh/placeholder lolos ke produksi atau dianggap nyata** | S | T | Tinggi | Pembangun | Label CONTOH, `is_contoh`, spanduk, penjaga produksi, Daftar Placeholder, Tahap P | Terbuka |
| RS-22 | **Kabag baru melihat di akhir: revisi besar** (KP-011) | S | S | Sedang | Owner | Uji dengan bentuk agenda nyata (difiktifkan); koreksi sebagai data/konfigurasi; struktur dibekukan; KP-010 | Diterima owner |
| RS-23 | Koreksi mengacaukan struktur folder dan rujukan | S | S | Sedang | Pembangun | Folder dibekukan; Register Koreksi; `audit-check` memeriksa struktur | Terbuka |
| RS-24 | **Node 20 sudah melewati akhir dukungan; dependensi Fastify (cookie@2) meminta Node 22** | S | S | Sedang | Pembangun | Kontainer memakai Node 22; dev disarankan Node 22 (nvm 22.22.0 terpasang); gate diverifikasi di Node 20.20 dan 22.22; rencana naik ke Node 24 sebelum peluncuran | Terbuka |
| RS-25 | Build kontainer belum diverifikasi (Docker Desktop tidak aktif saat uji) | S | S | Sedang | Owner | Diverifikasi asisten 23 Okt 2026: build berhasil, kontainer jalan, health ok (`docs/audit/bukti-gate/docker-tahap-1.1.txt`) | Tertutup |
| RS-26 | Aturan bentrok dan status adalah tafsiran dari dokumen Protokol (pimpinan/pejabat, diundang/ditugaskan, syarat terkonfirmasi) | S | S | Sedang | Owner | Dibuat sebagai data/konfigurasi dan diuji; pertanyaan di `ATURAN_BISNIS.md` bagian 5 untuk Kabag (KT-03) | Terbuka |
| RS-27 | Port pengembangan bentrok dengan proyek lain di komputer owner (3000 dan 5173 dipakai proyek lain) | T | R | Rendah | Pembangun | `npm run dev` memakai port khusus 3180 (API) dan 5180 (web) dengan `strictPort`; dapat diubah lewat `SIAP_API_PORT`, `SIAP_WEB_PORT` | Tertutup |
| RS-28 | Perbedaan perilaku PGlite (dev/uji) dan PostgreSQL (produksi) | S | S | Sedang | Pembangun | Satu skema dan migrasi; seluruh uji basis data dijalankan di keduanya (70 uji lulus di PostgreSQL 16); satu uji ke PostgreSQL asli wajib sebelum tiap rilis | Dimitigasi |
| RS-29 | Pemilik/superuser basis data dapat menonaktifkan pemicu log audit | S | T | Tinggi | Owner | Akun aplikasi tanpa hak DDL, cadangan terpisah, pemantauan DDL saat serah terima (LOG_AUDIT.md bagian 5) | Terbuka |
| RS-30 | Kata sandi sementara admin tercetak di terminal/log kontainer | S | S | Sedang | Owner | Tampil sekali; wajib diganti (`npm run admin:sandi`); tidak pernah di repo; hanya mode demo | Terbuka |
| RS-31 | Server pengembangan lama tetap berjalan di terminal owner (tsx watch memuat kode baru dengan basis data memori) | R | R | Rendah | Owner | Hentikan terminal lama (Ctrl+C) sebelum `npm run dev` baru; port khusus dengan `strictPort` | Terbuka |
| RS-32 | Skrip patch/gate gagal palsu di Windows PowerShell 5.1 karena stderr perintah eksternal (peringatan npm/Vite/git) dianggap galat; juga `$?` setelah pipeline tidak dapat diandalkan sebagai penentu lolosnya gate | T | S | Sedang | Pembangun | `scripts/native.ps1` (Invoke-Native): kode keluar yang menentukan; patch memeriksa penanda `[gate] LOLOS`; diuji di 5.1 dan 7 (patch 1.3a.1) | Tertutup setelah patch 1.3a.1 dijalankan |
| RS-33 | Belum ada pembatasan laju per IP pada masuk; penguncian per akun dapat dimanfaatkan menutup akun orang lain | S | S | Sedang | Pembangun | Dicatat di DESAIN_KEAMANAN; dipertimbangkan Tahap 3 (uji penetrasi); admin dapat membuka kunci lewat `admin:sandi` | Terbuka |
| RS-34 | Lampiran tidak dipindai virus | S | S | Sedang | Pembangun | Jenis dari isi (PDF/JPG/PNG), batas 10 MB, unduhan sebagai lampiran + nosniff; pemindaian dipertimbangkan Tahap 2/3 | Terbuka |
Dirancang di Tahap P (impor akun) dan Tahap 2 (antarmuka admin akun; pengaturan sudah di 1.4b); dicatat di MANAJEMEN_AKSES | Terbuka |
| RS-36 | Proksi dev mengganti header Host sehingga pemeriksaan Origin menolak semua POST (ditemukan dan diperbaiki 24 Okt) | T | S | Sedang | Pembangun | `changeOrigin:false` pada proksi Vite; nginx meneruskan `$http_host`; diverifikasi lewat proksi dev dan nginx | Tertutup |
| RS-37 | Susunan dasbor per peran adalah tafsiran pembangun dari dokumen Protokol; dapat meleset dari kebutuhan Kabag | S | R | Rendah | Owner / Kabag Protokol | Susunan disimpan sebagai data (`apps/web/src/konfigurasi.ts`, PH-11) sehingga koreksi tidak mengubah struktur; ditinjau Kabag saat aplikasi diperlihatkan (KT-03) | Terbuka |
| RS-38 | Uji ponsel (Playwright) berada di luar gate dan butuh Chromium (±150 MB); dapat terlewat bila tidak dijalankan | S | S | Sedang | Pembangun | `npm run test:e2e` dijalankan pada pra-verifikasi tiap tahap antarmuka dan buktinya disimpan; pertimbangkan masuk gate pada Tahap 1.6 | Terbuka |
| RS-39 | Antarmuka memuat seluruh daftar kegiatan lalu menyaring di peramban (jalur minggu, beranda); lambat bila data ribuan baris | S | S | Sedang | Pembangun | Cukup untuk volume agenda satu biro; rencana: pencarian rentang tanggal di API pada Tahap 1.5/2 (luring dan sinkronisasi) | Terbuka |
| RS-40 | Terowongan sementara membuka laptop pengembang ke internet: server pengembangan, tanpa pembatasan laju (RS-33), kata sandi lewat https tetapi alamat dapat bocor bila dibagikan | S | S | Sedang | Owner | Hanya data CONTOH; alamat acak sementara yang berubah tiap dijalankan; dibagikan hanya ke Kabag; akun peninjau berhak terbatas (bukan admin); matikan terminal setelah selesai; kata sandi admin tidak dibagikan; dipakai hanya sampai ada server serah terima (Tahap 4) | Terbuka |
