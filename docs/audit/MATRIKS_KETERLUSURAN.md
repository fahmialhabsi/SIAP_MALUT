# Matriks Keterlusuran Kebutuhan (RTM) SIAP MALUT

**Status:** v0.1 (Tahap 0.5): kebutuhan awal diturunkan dari Rancangan, SOP draf, dan permintaan Kabag Protokol. Diperbarui tiap tahap.
**Aturan:**
1. Setiap kebutuhan punya ID `KB-xxx` yang tidak dipakai ulang.
2. Setiap uji otomatis menyebut ID kebutuhan di namanya (mis. `KB-012: deteksi bentrok jam beririsan`).
3. Kolom **Uji** diisi saat tahap yang memuat kebutuhan itu; skrip pemeriksa RTM menyusul pada Tahap 1.1.
4. Status: **Direncanakan**, **Dibangun**, **Teruji**, **Diterima (UAT)**.

| ID | Sumber | Kebutuhan | Modul | Tahap | Uji | Status |
|---|---|---|---|---|---|---|
| KB-001 | Kabag Protokol; Rancangan 11.2 | Mencatat undangan masuk sebagai kegiatan dengan jenis, waktu, lokasi, dan penyelenggara | M1+ | 1.3 | `KB-001` api (kegiatan-api): buat/ubah/daftar/ambil; masukan tidak valid; status terkunci 409; db: batasan data | Teruji (API dan basis data); tampilan di 1.4 |
| KB-002 | Kabag Protokol | Melampirkan file undangan (PDF/foto) pada kegiatan | M1+ | 1.3 | `KB-042` lampiran.test (unggah PDF/PNG, unduh, daftar, pembatasan akses) | Teruji (API); tampilan kamera/galeri di 1.4 |
| KB-003 | Kabag Protokol | Setiap kegiatan memiliki PIC (protokol dan pengundang/OPD) | M1+ | 1.3 | `KB-003` kegiatan-api: PIC protokol dan PIC pengundang tersimpan dan dikembalikan | Teruji (API) |
| KB-004 | Kabag Protokol | Alur status: Baru, Menunggu Arahan, Ditetapkan, Terkonfirmasi | M1+ | 1.3 | `KB-004` domain (tabel 16 perpindahan) + kegiatan-api (200/422/404/403) + layanan (penyimpanan) | Teruji (domain, penyimpanan, API); antarmuka di 1.4 |
| KB-005 | Kabag Protokol | Pimpinan menetapkan hadir sendiri, diwakilkan, tidak hadir, atau tunda | M1+ | 1.4 | `KB-005` kegiatan-api: penetapan pihak (PUT/DELETE), pindah-status, pejabat menerima/menolak diri sendiri | Teruji (API); antarmuka keputusan cepat di 1.4 |
| KB-006 | Kabag Protokol | Menyajikan agenda yang sudah memuat pejabat yang menghadiri | M1+ | 1.4 | `KB-006` rbac/kegiatan-api: daftar dengan pihak dan kedudukan menurut tanggal | Dibangun (data via API); tampilan agenda di 1.4 |
| KB-007 | Kabag Protokol | Dapat diakses dan nyaman dipakai dari ponsel | Semua | 1.4 | - | Direncanakan |
| KB-008 | Kabag Protokol | Mendeteksi bentrok jam antar kegiatan pada pimpinan yang sama | M1+ | 1.2 | `KB-008` domain (22) + layanan + kegiatan-api (`/api/bentrok`: 14 total, 13 pada 26 Okt) | Teruji (domain, basis data, API); antarmuka di 1.4 |
| KB-009 | Rancangan 4.2; contoh 26 Okt | Mendeteksi bentrok perjalanan antarlokasi/pulau (waktu tempuh tidak cukup) | M1+ | 2 | - | Direncanakan |
| KB-010 | Rancangan 11.5 B | Mendeteksi bentrok sumber daya (pejabat/petugas ganda) | M1+ | 1.2 | `KB-010` domain + layanan + API (bentrok petugas pasti) | Teruji (domain, basis data, API) |
| KB-011 | Kabag Protokol; Aturan kewenangan | Menyarankan pengganti sesuai bidang dan tingkat acara, hanya sebagai saran | M1+ | 2 | - | Direncanakan |
| KB-012 | Aturan kewenangan 7 | Aturan kewenangan disimpan sebagai data yang dapat diubah admin dengan persetujuan | M1+ | 2 | - | Direncanakan |
| KB-013 | Rancangan 11.5 C | Pejabat pengganti menerima penugasan dan mengonfirmasi terima/tidak bisa | M1+ | 2 | `KB-013` kegiatan-api: pejabat menerima/menolak penugasan dirinya; tidak dapat mengubah pihak lain | Dibangun (konfirmasi dua arah, teruji); saran pengganti dan notifikasi di Tahap 2 |
| KB-014 | Rancangan 11.5 E; 5.7 | Notifikasi ke pimpinan, pengganti, dan PIC (pengingat H-1, perubahan, pembatalan) | M1+ | 1.5 | - | Direncanakan |
| KB-015 | Rancangan 11.5 F | Ekspor agenda ke teks siap tempel WhatsApp dan PDF | M1+ | 1.5 | - | Direncanakan |
| KB-016 | Rancangan 11.5 G | Setiap perubahan agenda dan penetapan tercatat (siapa, kapan, apa) | M1+ | 1.3 | `KB-016` layanan + kegiatan-api + auth + demo: aksi masuk/keluar/buat/ubah/pihak/pindah_status/lampiran/pengaturan/persona tercatat; sandi dan tautan rapat tidak bocor | Teruji (log audit pada seluruh tindakan berdampak) |
| KB-017 | Rancangan 11.5 H | Agenda publik tayang otomatis ke situs; kegiatan tertutup tidak tayang | M1+ | 2 | - | Direncanakan |
| KB-018 | Rancangan 4.3 | Tahan jaringan lemah; baca agenda dan kontak secara luring | Semua | 1.5 | - | Direncanakan |
| KB-019 | Rancangan 4.3; UU 27/2022 | Pelindungan data pribadi; ID rapat daring hanya terlihat oleh yang ditugaskan | Semua | 1.3 | `KB-019` rbac: tautan rapat hanya peran berizin dan pihak ditugaskan/diterima; disamarkan di daftar dan log | Teruji |
| KB-020 | Standar desain | Antarmuka mengikuti token desain; teks ≥ 16 px; target sentuh ≥ 48 px; status ikon + teks | Semua | 1.4 | `KB-020` skrip (5 uji pemeriksa token); ukur manual 360 px: tanpa gulir horizontal, font 16 px, target 48 px, Inter termuat | Dibangun (fondasi); uji otomatis ponsel di 1.4 |
| KB-021 | Rancangan 5.2 | Tampilan berbeda per peran (pimpinan, protokol, pengganti, pemohon, publik) | Semua | 1.4 | - | Direncanakan |
| KB-022 | SOP L-02 | Validasi tenggat minimal pengajuan layanan (H-7 usulan) | M2 | 2 | - | Direncanakan |
| KB-023 | SOP; Rancangan 5.4 | Nomor tiket dan pelacakan status permohonan | M2 | 2 | - | Direncanakan |
| KB-024 | SOP 5 | Undangan mendadak ditandai dan dicatat; jumlahnya dilaporkan | M1+ | 2 | - | Direncanakan |
| KB-025 | SOP 6 | Eskalasi otomatis tiket melewati tenggat | M2 | 2 | - | Direncanakan |
| KB-026 | Rancangan 8.1 | Indikator kinerja dihitung dari data sistem | M7 | 4 | - | Direncanakan |
| KB-027 | Rancangan 5.7 | Integrasi SRIKANDI, e-Office, BSrE | Integrasi | 2 | - | Direncanakan |
| KB-028 | Audit; Paket serah terima | Cadangan dan pemulihan dapat diuji | Operasi | 2 | - | Direncanakan |
| KB-029 | Audit; Daftar dokumen RK-05 | Hak akses sesuai matriks hak akses; diuji otomatis | Semua | 1.3 | `KB-029` rbac: 9 peran x 20 rute (180 pemeriksaan), 401 tanpa kuki, matriks DB = JSON, deny-by-default; MATRIKS_HAK_AKSES.md dihasilkan | Teruji |
| KB-030 | Paket serah terima 2 | Aplikasi berjalan dalam kontainer dengan konfigurasi lingkungan | Semua | 1.1 | `KB-030` shared dan api (health, ready + basis data); kontainer db+api+web diverifikasi | Teruji; kontainer dan PostgreSQL terverifikasi (23 Okt) |
| KB-031 | KP-006; Standar data contoh | Semua data awal berlabel CONTOH dan berpenanda `is_contoh`; berasal dari `data/contoh/` | Semua | 1.3 | `KB-031` api: seed 11 pejabat/13 pengguna/14 kegiatan/28 pihak semuanya is_contoh dan berlabel (CONTOH); idempoten | Teruji |
| KB-032 | KP-007 | Mode `demo`: admin dapat pindah tampilan ke persona peran; tercatat di log audit | Semua | 1.4 | `KB-032` demo.test: pindah persona, hak persona berlaku, kembali, aktor ganda di audit, hanya admin, production = 404 | Teruji (API); pemilih persona di antarmuka di 1.4 |
| KB-033 | KP-007 | Spanduk "DATA CONTOH" pada semua halaman dan ekspor selama mode demo | Semua | 1.4 | `KB-033` web (spanduk tampil di demo, tidak di production) | Teruji |
| KB-034 | KP-007 | Penjaga produksi: menolak mulai bila ada data contoh; menonaktifkan pindah peran | Semua | 1.3 | `KB-034` api: penjaga menghitung is_contoh di basis data (38); uji pada PostgreSQL asli dan kontainer | Teruji (penjaga produksi sungguhan) |
| KB-035 | KP-006; Tahap P | Impor data asli lewat admin (templat CSV) dan penghapusan data contoh | Admin | P | - | Direncanakan |
| KB-036 | KP-010 | Hal yang rawan berubah (nama, jabatan, hak akses, aturan, tenggat, jenis kegiatan, label status, istilah) disimpan sebagai data/konfigurasi | Semua | 1.3 | `KB-036` kegiatan-api: pengaturan dapat dibaca/diubah admin (validasi, audit) dan mengubah hasil bentrok; matriks dan nilai sebagai data | Teruji (API); antarmuka admin di 1.4 |
| KB-037 | KP-006 | Dasbor per peran: pejabat (pimpinan, pengganti) dan staf (protokol), plus admin | Semua | 1.4 | - | Direncanakan |
| KB-038 | Keputusan owner 23 Okt 2026 | Bentrok bersifat peringatan, bukan pemblokiran; penetapan meski ada bentrok pasti wajib beralasan dan tercatat | M1+ | 1.2 | `KB-038` domain (potensi tidak memblokir; pasti butuh alasan; alasan dan bentrok masuk peristiwa) | Teruji (domain) |
| KB-039 | Keputusan owner 23 Okt 2026 | Durasi bawaan bila jam selesai kosong berasal dari konfigurasi (nilai awal 120 menit), bukan angka di kode | M1+ | 1.2 | `KB-039` domain + layanan + kegiatan-api (120 dan 180 menit lewat pengaturan) | Teruji (domain, basis data, API) |
| KB-040 | KOR-002 (owner) | Pengembang menjalankan API dan web sekaligus dengan satu perintah `npm run dev` (tanpa build lebih dulu; `dev:lan` untuk ponsel) | Semua | 1.2 | Diverifikasi manual: kedua server hidup tanpa `dist`; dev:lan dicoba owner dari ponsel (KOR-003); `scripts/alamat-lan.test.mjs` (2 uji) | Dibangun |
| KB-041 | Lembar 1.3 | Autentikasi: kata sandi ber-hash, sesi, pembatasan percobaan masuk | Semua | 1.3 | `KB-041` sandi (6) + auth (17): masuk/keluar, kunci 5 gagal, kedaluwarsa, kuki aman, tanpa enumerasi akun, akun nonaktif | Teruji |
| KB-042 | Lembar 1.3 | Lampiran undangan: tipe dan ukuran dibatasi, disimpan lewat `FileStore` | M1+ | 1.3b | `KB-042` lampiran.test (7): jenis dari isi, batas ukuran 413, nama bersih, akses terbatas | Teruji |
| KB-043 | Lembar 1.3 | OpenAPI dan kamus data dihasilkan dari kode | Semua | 1.3 | `KB-043` kamus.test + openapi.test: OpenAPI dan matriks dihasilkan dari kode/data dan selaras; kamus dari skema | Teruji |
| KB-044 | Lembar 1.3 | Log audit tidak dapat diubah atau dihapus (dijaga basis data) | Semua | 1.3 | `KB-044` api (INSERT ok; UPDATE, DELETE, TRUNCATE ditolak) pada PGlite dan PostgreSQL 16; dicoba lewat psql di kontainer | Teruji |
| KB-045 | Desain keamanan 1.3b | Permintaan pengubah lintas asal ditolak; header keamanan; galat generik tanpa jejak tumpukan | Semua | 1.3 | `KB-041` auth.test (asal berbeda 403, header); diuji lewat proksi dev dan nginx | Teruji |
| KB-046 | Lembar 1.3 | Peramban mengakses API lewat satu asal (proksi Vite saat dev, nginx di kontainer); kuki sesi SameSite=Strict berfungsi tanpa CORS | Semua | 1.3 | Diverifikasi manual: alur lengkap (masuk, kegiatan, lampiran, persona, audit, keluar) lewat proksi dev dan nginx; belum ada uji otomatis | Dibangun (terverifikasi manual) |
