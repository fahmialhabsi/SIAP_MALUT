# Paket Serah Terima SIAP MALUT ke Diskominfosan

**Status:** DRAF kerangka (Tahap 0.5). Diisi dan diverifikasi bertahap; dipakai penuh pada peluncuran (Tahap 4).
**Strategi:** kita merancang, membangun, dan menguji sampai **siap**; baru saat peluncuran sistem diserahterimakan ke Diskominfosan. Karena itu seluruh bahan serah terima disiapkan **sejak awal** dan dibangun berjalan bersama aplikasi.

## 1. Prinsip Serah Terima

1. Penerima harus dapat **memasang, menjalankan, memelihara, memulihkan, dan mengaudit** sistem **tanpa bergantung pada pembangun**.
2. Semua yang dijanjikan di sini **diuji**: pemasangan dari nol oleh pihak yang tidak menulis kodenya sebelum serah terima.
3. Tidak ada rahasia di repo. Rahasia (sandi, kunci, token) diserahkan lewat saluran aman terpisah dan dicatat di BAST (hanya fakta penyerahannya).
4. Daftar ini mengikat: butir yang belum terpenuhi dicatat sebagai **pengecualian tertulis** dengan tenggat, bukan dihilangkan.

## 2. Syarat Teknis yang Dibangun Sejak Awal (agar serah terima mulus)

Seluruh syarat ini menjadi aturan pembangunan sejak Tahap 1.1 (dicatat juga di `docs/standar/KEPUTUSAN_TEKNOLOGI_PURWARUPA.md`):

| Syarat | Wujud di kode |
|---|---|
| Dapat dipasang di server mana pun | Semua komponen dikemas dalam kontainer (`Dockerfile`, `docker-compose`), tanpa ketergantungan pada komputer pembangun |
| Konfigurasi terpisah dari kode | Semua konfigurasi lewat variabel lingkungan; berkas contoh `.env.example` tanpa nilai rahasia |
| Skema dan data awal dapat diulang | Migrasi basis data berurutan dan berkas data awal (*seed*) berisi data fiktif |
| Dapat diperiksa kesehatannya | Titik `/health` dan `/ready`, log terstruktur (JSON) dengan ID permintaan |
| Dapat dicadangkan dan dipulihkan | Skrip cadangan dan pemulihan, beserta uji pemulihan terdokumentasi |
| Jejak audit | Tabel log audit yang hanya bisa ditambah (siapa, apa, kapan, dari mana, nilai sebelum dan sesudah) |
| Akses berbasis peran | Matriks hak akses yang sama dibaca aplikasi dan uji otomatis |
| Tidak terkunci vendor | Penyimpanan berkas di balik antarmuka `FileStore`; notifikasi di balik antarmuka `Notifier` |
| Dapat dipindahkan | Ekspor data dalam format terbuka (CSV/JSON/PDF) |
| Bukti mutu otomatis | Gate lint, test, build; SBOM dan laporan uji dihasilkan tiap rilis |
| Waktu dan zona | Semua waktu disimpan UTC dan ditampilkan dalam WIT |

## 3. Isi Paket (daftar periksa)

Setiap butir menunjuk ID di `DAFTAR_DOKUMEN_AUDIT.md`. Kolom Status diisi saat serah terima.

### 3.1 Kode dan Rilis
| No | Butir | Dokumen terkait | Status |
|---|---|---|---|
| 1 | Repositori kode sumber lengkap (seluruh riwayat), tag rilis yang diserahkan | MU-01 | Belum |
| 2 | Kode sumber yang dibangun dari nol dan lolos gate (lint, test, build) di mesin penerima | MU-03 | Belum |
| 3 | Daftar komponen (SBOM) dan lisensi | MU-09, AK-02 | Belum |
| 4 | Pernyataan kepemilikan dan penyerahan hak atas kode | AK-01 | Belum |

### 3.2 Pemasangan dan Operasi
| No | Butir | Dokumen terkait | Status |
|---|---|---|---|
| 5 | Panduan pemasangan dan penerapan, diuji pihak lain | OP-01 | Belum |
| 6 | Kebutuhan infrastruktur (CPU, memori, penyimpanan, jaringan, port, TLS, domain go.id) | OP-02 | Belum |
| 7 | Daftar variabel lingkungan dan fungsinya (tanpa nilai rahasia) | OP-01 | Belum |
| 8 | Skema basis data, migrasi, data awal | RK-02 | Belum |
| 9 | SOP cadangan dan pemulihan, beserta bukti uji pemulihan | OP-03 | Belum |
| 10 | Runbook pemantauan dan insiden | OP-05, OP-08 | Belum |
| 11 | BCP/DRP | OP-04 | Belum |
| 12 | Prosedur perubahan dan rilis | OP-06 | Belum |
| 13 | Usulan SLA dan rencana pemeliharaan | OP-07 | Belum |

### 3.3 Keamanan dan Data Pribadi
| No | Butir | Dokumen terkait | Status |
|---|---|---|---|
| 14 | Desain keamanan dan kebijakan keamanan informasi | RK-04, KM-01 | Belum |
| 15 | Matriks hak akses | RK-05 | Belum |
| 16 | Hasil pindai kerentanan, uji penetrasi, dan tindak lanjut | KM-07 | Belum |
| 17 | Inventaris data pribadi dan penilaian dampak PDP | KM-02, KM-03 | Belum |
| 18 | Kebijakan retensi, tanggapan insiden, pengelolaan rahasia | KM-04, KM-06, KM-08 | Belum |
| 19 | Desain dan contoh laporan log audit | KM-09 | Belum |

### 3.4 Arsitektur dan Integrasi (bahan Arsitektur SPBE)
| No | Butir | Dokumen terkait | Status |
|---|---|---|---|
| 20 | Dokumen arsitektur perangkat lunak | RK-01 | Belum |
| 21 | Spesifikasi API | RK-03 | Belum |
| 22 | Desain dan status integrasi (SRIKANDI, e-Office, notifikasi, BSrE) | RK-08 | Belum |
| 23 | Bahan pemetaan Arsitektur SPBE (proses bisnis, data, aplikasi, infrastruktur, keamanan) | TG-12 | Belum |

### 3.5 Mutu dan Penerimaan
| No | Butir | Dokumen terkait | Status |
|---|---|---|---|
| 24 | Matriks keterlusuran (kebutuhan sampai uji) lengkap | TG-06 | Belum |
| 25 | Laporan uji (unit, integrasi, E2E, ponsel, kinerja, aksesibilitas) | MU-05, MU-07, MU-08 | Belum |
| 26 | Berita acara UAT dan daftar cacat tersisa | MU-06, MU-10 | Belum |
| 27 | Kelayakan peluncuran | PL-02 | Belum |

### 3.6 Pengguna dan Pengetahuan
| No | Butir | Dokumen terkait | Status |
|---|---|---|---|
| 28 | Panduan pengguna dan administrator, FAQ | PG-01, PG-02, PG-04 | Belum |
| 29 | Bimbingan teknis kepada operator/administrator Diskominfosan, daftar hadir | PG-03 | Belum |
| 30 | Sesi alih pengetahuan teknis (arsitektur, pemeliharaan) dengan catatan | RK-01, OP-05 | Belum |

### 3.7 Administrasi dan Pascaluncur
| No | Butir | Dokumen terkait | Status |
|---|---|---|---|
| 31 | Daftar akun layanan dan penanggung jawab; serah terima kredensial lewat saluran aman | AK-06 | Belum |
| 32 | Rincian biaya dan sumber pendanaan | AK-03 | Belum |
| 33 | Pencatatan aset | AK-05 | Belum |
| 34 | Rencana pascaluncur (*hypercare*) dan jaminan perbaikan | PL-04 | Belum |
| 35 | Berita acara serah terima (BAST) | PL-03 | Belum |

## 4. Uji Serah Terima (wajib sebelum BAST)

| Uji | Cara | Lulus jika |
|---|---|---|
| Pemasangan dari nol | Pihak penerima atau pihak yang tidak menulis kode memasang memakai panduan saja | Sistem berjalan, tanpa bantuan lisan |
| Pemulihan | Cadangan dipulihkan ke mesin kosong | Data dan fungsi utuh; waktu pemulihan tercatat |
| Akses | Pemeriksaan matriks hak akses melawan aplikasi | Tidak ada hak di luar matriks |
| Jejak audit | Lakukan 10 aksi uji lalu telusuri di log audit | Semua tercatat dan tak dapat diubah |
| Gate | `lint`, `test`, `build` di mesin penerima | Lolos |
| Keterlusuran | Pilih 10 kebutuhan acak dan telusuri sampai uji dan bukti | Utuh |

## 5. Alur Serah Terima

1. Pembangun menyatakan **siap serah terima** setelah semua butir di bagian 3 bernilai Ada atau memiliki pengecualian tertulis.
2. Pemeriksaan bersama dengan Diskominfosan (bagian 4).
3. Perbaikan temuan.
4. Penandatanganan BAST, penyerahan kredensial lewat saluran aman, dan pencatatan aset.
5. Masa pascaluncur sesuai rencana.

## 6. Risiko Strategi Bangun-Dulu-Serah-Kemudian (diterima owner, dicatat)

| Risiko | Mitigasi |
|---|---|
| Diskominfosan menolak atau meminta perubahan besar saat serah terima | Ikuti standar terbuka (kontainer, API terdokumentasi, log standar); paket serah terima dibangun dari hari pertama; logika domain terpisah sehingga tumpukan bisa disesuaikan |
| Aplikasi tidak terdaftar dalam Arsitektur SPBE (Rancangan 2.5) | Siapkan bahan pemetaan (TG-12) sejak awal; jangan menggunakan data nyata di produksi sebelum serah terima |
| Pemeriksa mempertanyakan pembangunan di luar jalur resmi | Dokumentasi biaya, kepemilikan, persetujuan pimpinan, dan jejak keputusan sejak Tahap 0 (AK-01, AK-03, TG-05) |
