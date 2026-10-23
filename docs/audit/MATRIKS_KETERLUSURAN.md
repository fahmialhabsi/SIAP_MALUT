# Matriks Keterlusuran Kebutuhan (RTM) SIAP MALUT

**Status:** v0.1 (Tahap 0.5): kebutuhan awal diturunkan dari Rancangan, SOP draf, dan permintaan Kabag Protokol. Diperbarui tiap tahap.
**Aturan:**
1. Setiap kebutuhan punya ID `KB-xxx` yang tidak dipakai ulang.
2. Setiap uji otomatis menyebut ID kebutuhan di namanya (mis. `KB-012: deteksi bentrok jam beririsan`).
3. Kolom **Uji** diisi saat tahap yang memuat kebutuhan itu; skrip pemeriksa RTM menyusul pada Tahap 1.1.
4. Status: **Direncanakan**, **Dibangun**, **Teruji**, **Diterima (UAT)**.

| ID | Sumber | Kebutuhan | Modul | Tahap | Uji | Status |
|---|---|---|---|---|---|---|
| KB-001 | Kabag Protokol; Rancangan 11.2 | Mencatat undangan masuk sebagai kegiatan dengan jenis, waktu, lokasi, dan penyelenggara | M1+ | 1.3 | - | Direncanakan |
| KB-002 | Kabag Protokol | Melampirkan file undangan (PDF/foto) pada kegiatan | M1+ | 1.3 | - | Direncanakan |
| KB-003 | Kabag Protokol | Setiap kegiatan memiliki PIC (protokol dan pengundang/OPD) | M1+ | 1.3 | - | Direncanakan |
| KB-004 | Kabag Protokol | Alur status: Baru, Menunggu Arahan, Ditetapkan, Terkonfirmasi | M1+ | 1.3 | `KB-004` domain (3 uji: alur 4 langkah, label, penjaga tipe); web (urutan empat langkah) | Dibangun (definisi status); alur penuh di 1.3 |
| KB-005 | Kabag Protokol | Pimpinan menetapkan hadir sendiri, diwakilkan, tidak hadir, atau tunda | M1+ | 1.4 | - | Direncanakan |
| KB-006 | Kabag Protokol | Menyajikan agenda yang sudah memuat pejabat yang menghadiri | M1+ | 1.4 | - | Direncanakan |
| KB-007 | Kabag Protokol | Dapat diakses dan nyaman dipakai dari ponsel | Semua | 1.4 | - | Direncanakan |
| KB-008 | Kabag Protokol | Mendeteksi bentrok jam antar kegiatan pada pimpinan yang sama | M1+ | 1.2 | - | Direncanakan |
| KB-009 | Rancangan 4.2; contoh 26 Okt | Mendeteksi bentrok perjalanan antarlokasi/pulau (waktu tempuh tidak cukup) | M1+ | 2 | - | Direncanakan |
| KB-010 | Rancangan 11.5 B | Mendeteksi bentrok sumber daya (pejabat/petugas ganda) | M1+ | 1.2 | - | Direncanakan |
| KB-011 | Kabag Protokol; Aturan kewenangan | Menyarankan pengganti sesuai bidang dan tingkat acara, hanya sebagai saran | M1+ | 2 | - | Direncanakan |
| KB-012 | Aturan kewenangan 7 | Aturan kewenangan disimpan sebagai data yang dapat diubah admin dengan persetujuan | M1+ | 2 | - | Direncanakan |
| KB-013 | Rancangan 11.5 C | Pejabat pengganti menerima penugasan dan mengonfirmasi terima/tidak bisa | M1+ | 2 | - | Direncanakan |
| KB-014 | Rancangan 11.5 E; 5.7 | Notifikasi ke pimpinan, pengganti, dan PIC (pengingat H-1, perubahan, pembatalan) | M1+ | 1.5 | - | Direncanakan |
| KB-015 | Rancangan 11.5 F | Ekspor agenda ke teks siap tempel WhatsApp dan PDF | M1+ | 1.5 | - | Direncanakan |
| KB-016 | Rancangan 11.5 G | Setiap perubahan agenda dan penetapan tercatat (siapa, kapan, apa) | M1+ | 1.3 | - | Direncanakan |
| KB-017 | Rancangan 11.5 H | Agenda publik tayang otomatis ke situs; kegiatan tertutup tidak tayang | M1+ | 2 | - | Direncanakan |
| KB-018 | Rancangan 4.3 | Tahan jaringan lemah; baca agenda dan kontak secara luring | Semua | 1.5 | - | Direncanakan |
| KB-019 | Rancangan 4.3; UU 27/2022 | Pelindungan data pribadi; ID rapat daring hanya terlihat oleh yang ditugaskan | Semua | 1.3 | - | Direncanakan |
| KB-020 | Standar desain | Antarmuka mengikuti token desain; teks ≥ 16 px; target sentuh ≥ 48 px; status ikon + teks | Semua | 1.4 | `KB-020` skrip (5 uji pemeriksa token); ukur manual 360 px: tanpa gulir horizontal, font 16 px, target 48 px, Inter termuat | Dibangun (fondasi); uji otomatis ponsel di 1.4 |
| KB-021 | Rancangan 5.2 | Tampilan berbeda per peran (pimpinan, protokol, pengganti, pemohon, publik) | Semua | 1.4 | - | Direncanakan |
| KB-022 | SOP L-02 | Validasi tenggat minimal pengajuan layanan (H-7 usulan) | M2 | 2 | - | Direncanakan |
| KB-023 | SOP; Rancangan 5.4 | Nomor tiket dan pelacakan status permohonan | M2 | 2 | - | Direncanakan |
| KB-024 | SOP 5 | Undangan mendadak ditandai dan dicatat; jumlahnya dilaporkan | M1+ | 2 | - | Direncanakan |
| KB-025 | SOP 6 | Eskalasi otomatis tiket melewati tenggat | M2 | 2 | - | Direncanakan |
| KB-026 | Rancangan 8.1 | Indikator kinerja dihitung dari data sistem | M7 | 4 | - | Direncanakan |
| KB-027 | Rancangan 5.7 | Integrasi SRIKANDI, e-Office, BSrE | Integrasi | 2 | - | Direncanakan |
| KB-028 | Audit; Paket serah terima | Cadangan dan pemulihan dapat diuji | Operasi | 2 | - | Direncanakan |
| KB-029 | Audit; Daftar dokumen RK-05 | Hak akses sesuai matriks hak akses; diuji otomatis | Semua | 1.3 | - | Direncanakan |
| KB-030 | Paket serah terima 2 | Aplikasi berjalan dalam kontainer dengan konfigurasi lingkungan | Semua | 1.1 | `KB-030` shared (konfigurasi) dan api (health, ready, ID permintaan, 404) | Teruji; build kontainer belum diverifikasi |
| KB-031 | KP-006; Standar data contoh | Semua data awal berlabel CONTOH dan berpenanda `is_contoh`; berasal dari `data/contoh/` | Semua | 1.3 | - | Direncanakan |
| KB-032 | KP-007 | Mode `demo`: admin dapat pindah tampilan ke persona peran; tercatat di log audit | Semua | 1.4 | - | Direncanakan |
| KB-033 | KP-007 | Spanduk "DATA CONTOH" pada semua halaman dan ekspor selama mode demo | Semua | 1.4 | `KB-033` web (spanduk tampil di demo, tidak di production) | Teruji |
| KB-034 | KP-007 | Penjaga produksi: menolak mulai bila ada data contoh; menonaktifkan pindah peran | Semua | 1.3 | `KB-034` shared (APP_MODE) dan api (penjaga produksi) | Dibangun (rangka); sambungan basis data di 1.3 |
| KB-035 | KP-006; Tahap P | Impor data asli lewat admin (templat CSV) dan penghapusan data contoh | Admin | P | - | Direncanakan |
| KB-036 | KP-010 | Hal yang rawan berubah (nama, jabatan, hak akses, aturan, tenggat, jenis kegiatan, label status, istilah) disimpan sebagai data/konfigurasi | Semua | 1.3 | `KB-036` web (teks dari berkas teks UI); konfigurasi dari lingkungan | Dibangun (fondasi) |
| KB-037 | KP-006 | Dasbor per peran: pejabat (pimpinan, pengganti) dan staf (protokol), plus admin | Semua | 1.4 | - | Direncanakan |
