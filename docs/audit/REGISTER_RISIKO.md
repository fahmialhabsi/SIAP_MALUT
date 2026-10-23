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
