# Rancangan Awal Sistem Aplikasi Biro Administrasi Pimpinan Sekretariat Daerah Provinsi Maluku Utara

*Studi Tugas dan Fungsi, Benchmarking Antarprovinsi, dan Rekomendasi Desain Konseptual*

| | |
|---|---|
| Disusun oleh | Manus AI |
| Tanggal | 7 Agustus 2026 |
| Versi | 1.0 (Dokumen Rancangan Awal / Initial Design Document) |
| Konversi ke Markdown dan penambahan Bab XI | Oktober 2026 (versi 1.1, berdasarkan permintaan tambahan Kabag Protokol) |

> **Catatan konversi.** Dokumen ini adalah konversi dari PDF asli ke Markdown. Isi Bab I–X dipertahankan. Beberapa tabel pada PDF asli terekstrak rusak (teks bertumpuk); tabel tersebut disusun ulang berdasarkan narasi di sekitarnya. Tabel hasil penyusunan ulang diberi tanda **[disusun ulang]** dan perlu dicek terhadap PDF asli. Hal baru dari permintaan Kabag Protokol dikumpulkan di **Bab XI** dan dirujuk silang di Bab V dan VII.

---

## Ringkasan Eksekutif

Dokumen ini menyajikan hasil penelusuran tugas pokok, fungsi, dan struktur organisasi Biro Administrasi Pimpinan Sekretariat Daerah Provinsi Maluku Utara (selanjutnya disebut Biro Adpim Malut), memetakan praktik sistem aplikasi yang telah berjalan pada Biro Administrasi Pimpinan di dua belas provinsi lain, serta merumuskan rekomendasi rancangan awal sistem aplikasi yang sesuai dengan karakteristik organisasi dan kondisi kewilayahan Maluku Utara.

Temuan pokok kajian ini bersifat cukup tegas. Secara normatif, Biro Adpim Malut memiliki mandat yang luas dan padat beban kerja harian, mencakup tiga rumpun urusan sekaligus, yaitu keprotokolan, materi dan komunikasi pimpinan, serta perencanaan dan kepegawaian Sekretariat Daerah, sebagaimana diatur dalam Pasal 94 hingga Pasal 107 Peraturan Gubernur Maluku Utara Nomor 36 Tahun 2021 [1]. Namun secara faktual, dukungan digital untuk mandat tersebut baru berhenti pada tingkat situs web publikasi. Penelusuran langsung terhadap laman resmi Biro Adpim Malut pada Agustus 2026 menunjukkan bahwa halaman Struktur Organisasi, Daftar Layanan, Daftar Pegawai, serta Jadwal dan Agenda dalam keadaan kosong, sementara berkas gambar struktur organisasi Tahun Anggaran 2026 pada Bank Data tidak dapat diakses [2]. Kanal yang benar-benar hidup hanyalah rilis pers, infografis, dan galeri video. Dengan kata lain, belum tersedia satu pun sistem aplikasi kerja yang menopang proses bisnis inti biro, padahal proses inti itulah yang paling padat, paling sensitif waktu, dan paling langsung menyentuh Gubernur, Wakil Gubernur, dan Sekretaris Daerah.

Sebaliknya, benchmarking menunjukkan bahwa sejumlah provinsi telah bergerak jauh. Kalimantan Tengah mengoperasikan tiga aplikasi yang saling melengkapi, yakni SIPeT untuk pengelolaan agenda pimpinan dan penugasan protokol, BERAKSI untuk permohonan dan koordinasi naskah sambutan, serta SAMFO sebagai bank data sambutan dan foto kegiatan pimpinan [2][3][4]. Kalimantan Selatan memiliki DALAPAN dan SIPMATPIM untuk digitalisasi permintaan pidato dan materi pimpinan, termasuk permohonan video ucapan. Jawa Timur mengembangkan PASTI MAPAN sebagai pusat data terpadu penyiapan materi, komunikasi, publikasi, dan dokumentasi pimpinan, ditopang SINOMEN untuk penomoran dokumen, dan yang tidak kurang penting, menerbitkan standar prosedur layanannya secara terbuka di situs resmi [5]. Jambi menampilkan struktur organisasi lengkap sampai tingkat subbagian beserta nomor kontak setiap pejabat sebagai bagian dari layanan, serta mengoperasikan SIKOKPLAN dan LOKDON [6].

Atas dasar itu, dokumen ini merekomendasikan pembangunan satu platform terpadu, bukan sekumpulan aplikasi yang berdiri sendiri. Platform tersebut diusulkan bernama **SIAP MALUT** (Sistem Informasi Administrasi Pimpinan Maluku Utara), tersusun atas tujuh modul yang dipetakan langsung dari tiga bagian dalam struktur organisasi biro, dan dibangun secara bertahap selama sekitar delapan belas bulan (satu tahap persiapan nonkode, Tahap 0, diikuti empat tahap pengembangan, Tahap 1–4). Tahap pertama sengaja dibatasi pada dua modul dengan nilai manfaat tertinggi dan risiko terendah, yaitu modul Agenda dan Acara Pimpinan serta modul Layanan Permohonan Pimpinan, agar organisasi memperoleh kemenangan awal yang nyata sebelum melangkah ke modul yang lebih kompleks.

Satu pertimbangan strategis perlu ditekankan sejak awal. Indeks Sistem Pemerintahan Berbasis Elektronik (SPBE) Provinsi Maluku Utara tercatat 2,49 dengan predikat "Cukup" pada evaluasi Kementerian PANRB, dan kelemahan utamanya justru berada pada domain manajemen, khususnya penyusunan Arsitektur SPBE [7][8]. Karena itu, SIAP MALUT tidak boleh dibangun sebagai inisiatif yang terisolasi. Ia harus didaftarkan sebagai aplikasi khusus dalam Arsitektur SPBE Pemerintah Provinsi Maluku Utara dan dikembangkan bersama Dinas Komunikasi, Informatika, dan Persandian. Dengan cara ini, satu investasi menghasilkan dua manfaat sekaligus, yaitu perbaikan kinerja operasional biro dan kenaikan skor SPBE provinsi.

> **Tambahan versi 1.1 (Bab XI).** Kabag Protokol meminta agar aplikasi secara khusus memudahkan penyusunan agenda pimpinan dan pembagian jadwal ketika agenda Gubernur/Wakil Gubernur bertabrakan, sehingga kegiatan dapat diwakilkan kepada Sekda, Asisten I/II/III, atau Kepala Dinas/Badan/Biro yang tugasnya benar-benar sesuai. Permintaan ini memperkuat Modul M1 dan diuraikan sebagai Modul M1+ pada Bab XI. Aplikasi harus dapat diakses dari ponsel.

---

## Bab I. Pendahuluan

### 1.1 Latar Belakang

Biro Administrasi Pimpinan menempati posisi yang unik dalam anatomi Sekretariat Daerah. Berbeda dengan perangkat daerah teknis yang melayani masyarakat secara langsung, biro ini melayani pimpinan daerah, dan melalui pimpinan itulah ia menyentuh publik. Kualitas kerjanya terbaca dari hal-hal yang tampak sederhana namun sesungguhnya rumit, seperti ketepatan agenda Gubernur, kesesuaian naskah sambutan dengan konteks acara, kelancaran tata tempat dan tata upacara, kerapian penerimaan tamu kehormatan, hingga ketersediaan dokumentasi kegiatan yang layak dipublikasikan. Kesalahan kecil pada wilayah ini berbiaya politik dan reputasional yang tidak kecil.

Beban tersebut menjadi berlipat di Maluku Utara karena karakter kewilayahannya. Provinsi ini adalah provinsi kepulauan dengan pusat pemerintahan di Sofifi, sementara denyut ekonomi, media, dan sebagian besar layanan pendukung masih terkonsentrasi di Ternate. Mobilitas pimpinan karena itu bersifat antarpulau dan bergantung pada moda laut serta udara yang rentan terhadap cuaca. Koordinasi keprotokolan yang di provinsi daratan dapat diselesaikan dengan perjalanan darat satu jam, di Maluku Utara dapat menuntut perencanaan logistik sehari penuh. Ketergantungan pada koordinasi lisan melalui percakapan telepon dan grup pesan instan, yang masih menjadi praktik dominan, menyimpan risiko kehilangan jejak informasi, duplikasi penugasan, dan bentrok agenda yang baru diketahui pada saat terakhir.

Pada waktu yang sama, kerangka kebijakan nasional dan daerah sudah lebih dari cukup untuk menopang digitalisasi. Peraturan Presiden Nomor 95 Tahun 2018 tentang SPBE menetapkan kerangka arsitektur dan pembedaan antara aplikasi umum dan aplikasi khusus [9]. Peraturan Presiden Nomor 132 Tahun 2022 mengatur Arsitektur SPBE Nasional, dan Peraturan Presiden Nomor 82 Tahun 2023 mendorong percepatan transformasi digital serta keterpaduan layanan digital nasional [10][11]. Pada tingkat provinsi, Pasal 18 Peraturan Gubernur Maluku Utara Nomor 20 Tahun 2023 menegaskan bahwa penyelenggaraan layanan administrasi pemerintahan diutamakan berbasis elektronik melalui aplikasi SPBE yang terintegrasi dan berbagi pakai, dikoordinasikan oleh Tim Koordinasi SPBE [12]. Visi pembangunan daerah "Maluku Utara Bangkit" dengan misi ketiga mengenai tata kelola pemerintahan yang transparan, melayani, dan bebas korupsi memberikan pijakan kebijakan yang selaras.

Kesenjangan antara mandat yang berat, kondisi geografis yang menantang, dan dukungan digital yang nyaris tidak ada inilah yang menjadi alasan penyusunan rancangan ini.

### 1.2 Tujuan dan Ruang Lingkup

Dokumen ini disusun untuk tiga tujuan yang saling berurutan:

1. Mendokumentasikan secara akurat tugas pokok, fungsi, dan struktur organisasi Biro Adpim Malut berdasarkan sumber regulasi resmi, sekaligus memotret kondisi kematangan digitalnya saat ini.
2. Menyarikan pelajaran dari sistem aplikasi yang telah berjalan pada Biro Administrasi Pimpinan atau unit sepadan di provinsi lain, dengan penekanan pada apa yang benar-benar dipakai dan mengapa ia bekerja.
3. Merumuskan rancangan awal sistem aplikasi yang mencakup usulan nama dan konsep, arsitektur modul, alur proses layanan, model data pokok, pilihan teknologi, tata kelola, kebutuhan sumber daya, peta jalan implementasi, indikator keberhasilan, serta analisis risiko.

Dokumen ini berada pada tataran rancangan awal atau desain konseptual. Ia belum menggantikan dokumen Spesifikasi Kebutuhan Perangkat Lunak (*Software Requirements Specification*), Kerangka Acuan Kerja pengadaan, maupun dokumen teknis basis data yang rinci. Dokumen ini dimaksudkan sebagai bahan pengambilan keputusan pimpinan dan sebagai dasar penyusunan ketiga dokumen lanjutan tersebut.

### 1.3 Metode Penyusunan

Penyusunan dilakukan melalui empat langkah:

1. **Penelusuran regulasi**, menggunakan salinan resmi Pergub Maluku Utara Nomor 36 Tahun 2021 tentang Organisasi dan Tata Kerja Sekretariat Daerah serta Pergub Nomor 20 Tahun 2023 tentang Sistem Kerja pada Instansi Pemerintah untuk Penyederhanaan Birokrasi, diakses melalui repositori analisis jabatan Pemprov Maluku Utara [1][12].
2. **Pemeriksaan langsung** terhadap situs resmi Biro Adpim Malut beserta laman turunannya untuk menilai kondisi digital aktual [2].
3. **Benchmarking** terhadap dua belas provinsi secara paralel: Jawa Timur, Jawa Barat, Jawa Tengah, Sumatera Utara, Lampung, Jambi, Kalimantan Tengah, Kalimantan Selatan, Sulawesi Selatan, Sulawesi Utara, Bali, dan Nusa Tenggara Barat, dengan verifikasi ulang atas aplikasi kunci melalui kunjungan langsung ke antarmukanya.
4. **Sintesis dan perumusan rekomendasi** dengan mempertimbangkan konteks SPBE dan kondisi kewilayahan Maluku Utara.

---

## Bab II. Tugas Pokok, Fungsi, dan Struktur Organisasi Biro

### 2.1 Dasar Hukum dan Kedudukan

Landasan organisasi Biro Adpim Malut adalah Peraturan Gubernur Maluku Utara Nomor 36 Tahun 2021 tentang Organisasi dan Tata Kerja Sekretariat Daerah Provinsi Maluku Utara. Peraturan ini menggantikan Pergub Nomor 7 Tahun 2021 dan diterbitkan setelah memperoleh persetujuan Menteri Dalam Negeri melalui surat Nomor 061/5949/OTDA tanggal 14 September 2021, dengan dasar PP Nomor 18 Tahun 2016 tentang Perangkat Daerah serta Perda Nomor 5 Tahun 2016 sebagaimana telah diubah dengan Perda Nomor 10 Tahun 2020 [1].

Sekretariat Daerah terdiri atas tiga Staf Ahli dan tiga Asisten, yaitu Asisten Pemerintahan dan Kesejahteraan Rakyat, Asisten Perekonomian dan Administrasi Pembangunan, serta Asisten Administrasi Umum. Pasal 65 menempatkan Biro Administrasi Pimpinan di bawah koordinasi Asisten Administrasi Umum bersama Biro Organisasi dan Biro Umum. Pasal 94 menyatakan bahwa Biro Administrasi Pimpinan dipimpin oleh Kepala Biro yang bertanggung jawab kepada Sekretaris Daerah. Garis pertanggungjawaban langsung kepada Sekda ini mencerminkan sifat strategis biro dan berimplikasi bahwa Sekda perlu memiliki akses dasbor terhadap sistem, tidak hanya melalui jalur Asisten.

> **Pasal 94 Pergub Malut 36/2021:** Biro Administrasi Pimpinan dipimpin oleh Kepala Biro yang bertanggung jawab kepada Sekretaris Daerah, mempunyai tugas melaksanakan perumusan dan pelaksanaan kebijakan operasional di bidang protokol, materi dan komunikasi pimpinan, serta perencanaan dan kepegawaian Sekretariat Daerah.

### 2.2 Tugas Pokok dan Fungsi

Tugas pokok biro mencakup perumusan dan pelaksanaan kebijakan operasional pada tiga bidang: protokol, materi dan komunikasi pimpinan, serta perencanaan dan kepegawaian Sekretariat Daerah. Pasal 95 menjabarkan tiga fungsi: (a) penyiapan pelaksanaan kebijakan pada ketiga bidang tersebut, (b) penyiapan pelaksanaan pemantauan dan evaluasi pada bidang yang sama, dan (c) pelaksanaan fungsi lain yang diberikan oleh pimpinan sesuai dengan tugasnya.

Dua kata kunci sering terlewat, yaitu *penyiapan pelaksanaan kebijakan* dan *pemantauan serta evaluasi*. Fungsi pertama menuntut kemampuan menghasilkan produk kerja secara cepat dan berkualitas, misalnya naskah sambutan, rundown acara, dan dokumentasi. Fungsi kedua menuntut kemampuan mengukur: berapa banyak permohonan yang masuk, berapa yang selesai tepat waktu, di mana penumpukan terjadi, dan bagaimana kualitas layanan dinilai pengguna. Fungsi kedua inilah yang paling sulit dijalankan tanpa sistem informasi, karena pengukuran manual atas ratusan kegiatan pimpinan dalam setahun praktis tidak mungkin dilakukan secara konsisten. Kebutuhan akan sistem aplikasi dengan demikian bukan sekadar soal efisiensi, melainkan prasyarat agar fungsi pemantauan dan evaluasi yang diamanatkan Pasal 95 huruf b dapat benar-benar dijalankan.

### 2.3 Susunan Organisasi

Pasal 96 menetapkan bahwa Biro Administrasi Pimpinan terdiri atas tiga bagian. Rincian tugas masing-masing diatur dalam Pasal 97 sampai dengan Pasal 107. **[disusun ulang]**

| Bagian | Bidang Urusan | Fungsi Pokok (Pergub 36/2021) | Susunan di Bawahnya |
|---|---|---|---|
| Bagian Protokol (Pasal 97–99) | Keprotokolan | Penyiapan perumusan dan pelaksanaan kebijakan; pemberian dukungan administrasi; pemantauan, evaluasi, dan pelaporan | Kelompok Jabatan Fungsional dan Pelaksana (tanpa subbagian) |
| Bagian Materi dan Komunikasi Pimpinan (Pasal 100–102) | Penyiapan materi dan komunikasi pimpinan | Idem | Kelompok Jabatan Fungsional dan Pelaksana (tanpa subbagian) |
| Bagian Perencanaan dan Kepegawaian Setda (Pasal 103–107) | Perencanaan dan kepegawaian | Idem | Subbagian Tata Usaha, serta Kelompok Jabatan Fungsional dan Pelaksana |

Struktur eselonisasi diatur dalam Pasal 108: Kepala Biro sebagai Jabatan Pimpinan Tinggi Pratama (eselon II.b), Kepala Bagian sebagai Jabatan Administrator (eselon III.a), dan Kepala Subbagian sebagai Jabatan Pengawas (eselon IV.a). Hanya Bagian Perencanaan dan Kepegawaian Setda yang masih memiliki subbagian (Subbagian Tata Usaha). Dua bagian lainnya langsung diisi oleh kelompok jabatan fungsional dan pelaksana sebagai konsekuensi kebijakan penyederhanaan birokrasi.

Pergub Nomor 20 Tahun 2023 menempatkan Biro Administrasi Pimpinan pada model organisasi dengan Pejabat Administrator (Kepala Bagian) berperan sebagai Pejabat Penilai Kinerja bagi pejabat fungsional dan pelaksana di bawahnya [12]. Model ini menghapus lapisan pengawas perantara dan menggantinya dengan mekanisme tim kerja lintas fungsi berbasis penugasan. **Implikasi desain:** sistem wajib memiliki kemampuan pembentukan tim kerja ad hoc, penugasan berbasis peran alih-alih kotak struktural, serta pencatatan kontribusi individu untuk penilaian kinerja.

### 2.4 Kondisi Kematangan Digital Saat Ini

Pemeriksaan langsung terhadap situs resmi Biro Adpim Malut pada awal Agustus 2026 menunjukkan bahwa situs tersedia dan aktif, dengan halaman Tugas Pokok dan Fungsi terisi lengkap dan identik dengan Pasal 94–95, serta aliran rilis pers yang rutin (tiga rilis dalam satu hari kerja). Namun di luar fungsi publikasi, hampir semuanya kosong. **[disusun ulang]**

| Elemen Situs | Kondisi (Agustus 2026) | Implikasi |
|---|---|---|
| Tugas Pokok dan Fungsi | Terisi, sesuai Pergub 36/2021 | Baik |
| Struktur Organisasi | Kosong; hanya penunjuk ke Bank Data | Publik tidak dapat mengetahui susunan organisasi |
| Berkas struktur organisasi TA 2026 pada Bank Data | Tidak dapat diakses (File Not Found / Exception) | Tata kelola aset digital lemah |
| Daftar Layanan | Kosong ("Belum ada data Layanan") | Standar layanan tidak terpublikasi, berbeda dengan Jawa Timur |
| Daftar Pegawai | Kosong | Tidak ada direktori kontak, berbeda dengan praktik Jambi |
| Jadwal dan Agenda | Kosong ("Belum ada data Jadwal & Agenda") | Padahal agenda pimpinan adalah proses bisnis inti biro |
| Rilis Pers, Infografis, Video, E-Book | Aktif dan mutakhir | Fungsi publikasi sudah berjalan |
| Tautan survei kepuasan (SIKMA) | Mengarah ke survei unit lain | Konfigurasi integrasi belum tertata |
| Kontribusi dataset pada Satu Data Malut | Hanya tiga dataset | Potensi data belum dimanfaatkan |

Kesimpulannya, Biro Adpim Malut telah memiliki kanal publikasi, tetapi belum memiliki sistem kerja. Tidak tersedia alur kerja digital untuk pengelolaan agenda pimpinan, penugasan petugas protokol, penerimaan dan penelusuran permohonan sambutan, penyusunan serta persetujuan naskah, pengarsipan dokumentasi, maupun pemantauan perencanaan dan kepegawaian Setda. Ironisnya, elemen yang paling kosong, yaitu Jadwal dan Agenda, adalah inti pekerjaan sehari-hari biro. Kekosongan ini sekaligus peluang, karena pembangunan sistem kerja akan otomatis mengisi kanal publikasi yang selama ini kosong tanpa pekerjaan tambahan.

### 2.5 Konteks Penyelenggaraan SPBE Provinsi Maluku Utara

Pemprov Maluku Utara memperoleh indeks SPBE 2,47 pada 2022 (tertinggi di wilayah Indonesia Timur), dan 2,49 dengan predikat "Cukup" pada tahun berikutnya, dengan target melampaui 2,60 untuk predikat "Baik" [7][8]. Kelemahannya berada pada domain manajemen SPBE, khususnya penyusunan arsitektur.

> "Untuk kebijakan internal dan layanan SPBE, kita sudah berada pada level yang cukup baik. Tantangannya kini ada pada manajemen SPBE, di mana kita perlu membangun arsitektur sistem yang lebih matang." — Iksan R.A. Arsad, Kepala Diskominfosan Provinsi Maluku Utara [8]

Apabila SIAP MALUT didaftarkan secara tertib sebagai aplikasi khusus dalam Arsitektur SPBE Pemprov Maluku Utara, lengkap dengan pemetaan proses bisnis, data, aplikasi, infrastruktur, dan keamanan sebagaimana dimaksud Perpres 132/2022, maka sistem ini menjadi contoh konkret pemenuhan indikator arsitektur yang selama ini menjadi titik lemah provinsi. Sebaliknya, bila dibangun di luar koordinasi Diskominfosan, sistem ini berisiko menambah aplikasi tidak terdaftar yang justru menurunkan nilai domain manajemen.

Dua konsekuensi teknis:

1. Fungsi persuratan dan kearsipan dinamis tidak boleh diduplikasi karena telah tersedia **SRIKANDI** sebagai aplikasi umum berbagi pakai nasional. Yang diperlukan adalah integrasi, bukan pembangunan ulang.
2. Tanda tangan elektronik harus menggunakan sertifikat elektronik dari Balai Sertifikasi Elektronik agar keabsahan hukumnya terjamin.

---

## Bab III. Benchmarking Sistem Aplikasi Biro Administrasi Pimpinan

### 3.1 Cakupan dan Cara Baca

Benchmarking dilakukan terhadap dua belas provinsi yang dipilih dengan mempertimbangkan keragaman wilayah, tingkat kematangan digital, dan ketersediaan informasi yang dapat diverifikasi. Nomenklatur unit yang menangani keprotokolan dan komunikasi pimpinan tidak seragam: sebagian di Biro Administrasi Pimpinan seperti Maluku Utara, sebagian digabung dengan Biro Umum seperti NTB, dan sebagian menyerahkan sebagian fungsi kepada Biro Umum dan Protokol seperti Bali. Hasil dibaca berdasarkan **fungsi yang didigitalkan**, bukan nama unit.

### 3.2 Ikhtisar Hasil Benchmarking

> **Peringatan:** tabel ini paling rusak pada ekstraksi PDF. Isi di bawah disusun ulang dari teks tabel dan narasi bab; kolom "pelajaran" bersifat ringkasan dan perlu dicocokkan dengan PDF asli. **[disusun ulang]**

| Provinsi | Aplikasi Utama | Fungsi yang Didigitalkan | Pelajaran untuk Malut |
|---|---|---|---|
| Kalimantan Tengah | SIPeT, BERAKSI, SAMFO, e-CIS, Absensi Online | Agenda pimpinan, permohonan sambutan, bank data sambutan dan foto | Rujukan paling lengkap dan paling mudah ditiru; modul dapat dibangun bertahap dan berbiaya rendah |
| Jawa Timur | PASTI MAPAN, SINOMEN, SISTRADA | Materi, komunikasi, publikasi, dokumentasi, penomoran naskah | Konsep pusat data terpadu; standar layanan dipublikasikan terbuka |
| Kalimantan Selatan | DALAPAN, SIPMATPIM | Permintaan pidato dan materi pimpinan, termasuk video ucapan | Permohonan video ucapan layak menjadi jenis layanan resmi |
| Jambi | SIKOKPLAN, LOKDON | Perencanaan dan pelaporan Setda; layanan kepegawaian | Direktori pejabat dan kontak sebagai layanan; keterbukaan struktur |
| Sumatera Utara | SIMANTAP | Notifikasi dan penugasan kepada pimpinan | Notifikasi langsung kepada pimpinan adalah fitur yang paling dirasakan manfaatnya |
| Bali | SITU OK, Portal Layanan, e-Office | Tata administrasi persuratan, dokumentasi kegiatan | Platform tunggal multimodul dapat diterapkan pada unit Setda |
| Jawa Tengah | Portal Layanan Biro Umum (enam aplikasi) | Peminjaman gedung, kendaraan, ruang rapat, administrasi perkantoran | Layanan satu pintu internal Setda; enam aplikasi terpisah menimbulkan beban integrasi |
| Sulawesi Selatan | SIMPATI | Persuratan, tanda tangan elektronik, pelayanan publik | Penerapan tanda tangan elektronik internal |
| Sulawesi Utara | OK Setda, Manjo Ka Sulut | Administrasi Setda berbasis perangkat bergerak | Pentingnya perangkat bergerak |
| Lampung | (aplikasi Setda) | Fasilitas pendukung acara | Pelajaran negatif: aplikasi tidak lagi dapat diakses karena pemeliharaan |
| Nusa Tenggara Barat | NTB DIGIHub, E-Office | Portal layanan terpadu | Ekosistem provinsi dan aplikasi biro perlu dirancang agar dapat menyatu |
| Jawa Barat | E-Office Biro Adpim (pengembangan) | Pengelolaan dokumen dan arsip biro | Integrasi layanan |

### 3.3 Studi Kasus Utama: Ekosistem Kalimantan Tengah

Kalimantan Tengah memberikan rujukan yang paling langsung dapat dipakai karena ketiga aplikasinya menyasar tiga proses inti Biro Administrasi Pimpinan dan seluruhnya dapat diverifikasi secara terbuka.

- **SIPeT** (Sistem Informasi Protokol Elektronik Terintegrasi): platform pendukung layanan keprotokolan, memudahkan pengelolaan agenda pimpinan, penugasan protokol, administrasi kegiatan, dan pelaporan [2]. Tersedia repositori pendukung acara (lagu kebangsaan, mars, himne, foto resmi Gubernur dan Wakil Gubernur, daftar pejabat). Dibangun di atas platform low-code **AppSheet**, menunjukkan bahwa nilai terbesar terletak pada penataan proses kerja, bukan kecanggihan rekayasa perangkat lunak.
- **BERAKSI** (BERkoordinasi Atasi misKomunikaSI): lahir dari aksi perubahan Subbagian Komunikasi Pimpinan. Melayani pengajuan permohonan sambutan, pemantauan status, serta koordinasi penyusunan dan penyampaian naskah [3]. Pengguna dibuka luas (instansi pemerintah, swasta, organisasi, masyarakat). Prinsip penting yang perlu diadopsi:

  > "Aplikasi ini berfungsi sebagai sarana pendukung tambahan dalam pengelolaan permohonan sambutan pimpinan di samping surat resmi yang harus tetap disampaikan sebagai syarat administratif." — Laman resmi BERAKSI [3]

  Prinsip ini meredam kekhawatiran bahwa aplikasi menabrak ketentuan tata naskah dinas, tanpa mengorbankan manfaat digitalisasi.
- **SAMFO** (Sambutan dan Foto): bank data naskah sambutan resmi dan foto kegiatan pimpinan, dengan ringkasan substansi dan metadata (lokasi, tempat, tanggal) serta akun pengguna [4].

Ketiganya membentuk satu rantai nilai: permohonan masuk lewat BERAKSI, dikelola dan dijadwalkan lewat SIPeT, hasilnya diarsipkan lewat SAMFO. Kelemahannya, ketiganya berdiri terpisah dengan basis data yang tidak sepenuhnya menyatu. Maluku Utara sebagai pengadopsi belakangan dapat merancang ketiga fungsi itu sejak awal sebagai satu platform dengan basis data tunggal.

### 3.4 Pelajaran dari Jawa Timur: Standar Layanan sebagai Bagian dari Sistem

Biro Adpim Jawa Timur memiliki susunan tiga bagian yang identik dengan Maluku Utara dan menyajikan daftar layanan secara eksplisit: apel pagi, tata upacara, senam kesegaran jasmani, tata kehormatan, pendokumentasian kegiatan pimpinan, pelayanan keprotokolan kegiatan pimpinan, dan pencetakan kartu tanda pengenal pegawai [5]. Situs tersebut juga memuat prosedur baku setiap layanan dalam bentuk tanya jawab, termasuk ketentuan bahwa permohonan fasilitasi keprotokolan disampaikan **paling lambat tujuh hari sebelum pelaksanaan**, dilanjutkan rapat koordinasi (susunan acara, kerangka acuan, daftar undangan, tata letak, tata pakaian), dan diakhiri penerbitan Standar Pelaksanaan Acara.

Digitalisasi yang berhasil dimulai dari penataan dan pemublikasian prosedur, bukan dari penulisan kode. Tenggat tujuh hari, misalnya, adalah aturan bisnis yang dapat langsung menjadi validasi otomatis dan penghitungan tingkat layanan. Tanpa prosedur yang jelas lebih dahulu, aplikasi hanya memindahkan kekacauan dari kertas ke layar.

### 3.5 Sintesis Empat Klaster Fungsi

1. **Keprotokolan dan agenda pimpinan**: paling jarang tersedia, nilai manfaat tertinggi.
2. **Permintaan dan penyusunan naskah sambutan serta materi pimpinan**: paling banyak diinovasikan karena keluhannya paling terasa.
3. **Bank data dokumentasi dan publikasi pimpinan.**
4. **Perencanaan, kepegawaian, dan ketatausahaan Setda.**

Klaster 1 dan sebagian klaster 3 bersesuaian dengan Bagian Protokol; klaster 2 dan 3 dengan Bagian Materi dan Komunikasi Pimpinan; klaster 4 dengan Bagian Perencanaan dan Kepegawaian. Kesesuaian ini menjadi dasar arsitektur modul pada Bab V.

---

## Bab IV. Analisis Kesenjangan dan Kebutuhan

### 4.1 Kesenjangan antara Mandat dan Dukungan Sistem **[disusun ulang]**

| Urusan Sesuai Pergub 36/2021 | Kondisi Dukungan Sistem di Malut | Praktik Pembanding | Tingkat Kebutuhan |
|---|---|---|---|
| Acara (Bagian Protokol) | Tidak ada; agenda di laman kosong | SIPeT (Kalteng) | Sangat tinggi |
| Tamu (Bagian Protokol) | Tidak ada | SIPeT (Kalteng), SIMPATI (Sulsel) | Tinggi |
| Hubungan keprotokolan | Tidak ada; tidak ada direktori pejabat maupun kontak | SIPeT (Kalteng), profil Jambi | Tinggi |
| Penyiapan materi pimpinan | Tidak ada; tidak ada bank naskah maupun template | BERAKSI dan SAMFO (Kalteng), DALAPAN dan SIPMATPIM (Kalsel), PASTI MAPAN (Jatim) | Sangat tinggi |
| Komunikasi pimpinan | Berupa rilis pers melalui situs | PASTI MAPAN (Jatim) | Sedang |
| Dokumentasi pimpinan | Sebagian berupa galeri video dan infografis, belum terstruktur | SAMFO (Kalteng), SITU OK (Bali) | Tinggi |
| Perencanaan Setda | Tidak ada | SIKOKPLAN (Jambi) | Sedang |
| Kepegawaian Setda | Tidak ada; daftar pegawai kosong | LOKDON (Jambi), OK Setda (Sulut), e-CIS (Kalteng) | Sedang |
| Ketatausahaan | Sebagian melalui e-Office provinsi | SINOMEN (Jatim), e-Office Lampung | Rendah (cukup integrasi) |
| Pemantauan dan evaluasi (Pasal 95 huruf b) | Tidak ada instrumen pengukuran sama sekali | Dasbor pada SIPeT dan PASTI MAPAN | Sangat tinggi |

Kebutuhan mendesak terkonsentrasi pada tiga hal: pengelolaan agenda dan acara, penyiapan materi serta naskah pimpinan, dan kemampuan pemantauan. Urusan ketatausahaan berprioritas paling rendah untuk dibangun sendiri karena aplikasi umum nasional dan aplikasi provinsi sudah memadai.

### 4.2 Titik Nyeri Operasional

1. Bentrok dan perubahan agenda pimpinan pada saat terakhir, yang di provinsi kepulauan berdampak berlipat karena melibatkan pemindahan jadwal kapal atau penerbangan.
2. Permohonan sambutan yang datang mendekati hari pelaksanaan, sering tanpa kerangka acuan memadai, sehingga mutu naskah sulit dijaga.
3. Hilangnya jejak koordinasi karena pembicaraan berlangsung di grup pesan instan yang tidak terarsip.
4. Dokumentasi foto dan video tersebar di perangkat pribadi petugas.
5. Ketidakmampuan menjawab pertanyaan sederhana seperti jumlah permohonan bulan lalu dan persentase yang tuntas tepat waktu.

Daftar ini disusun berdasarkan penalaran atas dokumen dan praktik pembanding, sehingga perlu divalidasi melalui diskusi kelompok terarah bersama pejabat dan pelaksana di ketiga bagian. *(Catatan v1.1: poin 1 telah dikonfirmasi langsung oleh Kabag Protokol melalui contoh agenda nyata; lihat Bab XI.)*

### 4.3 Kebutuhan Nonfungsional Khas Maluku Utara

1. **Ketahanan terhadap keterbatasan jaringan.** Kantor Gubernur di Sofifi sementara banyak kegiatan di Ternate dan kabupaten kepulauan lain. Aplikasi harus dapat dipakai pada koneksi lambat dan sebaiknya mendukung kerja luring terbatas (membuka rundown dan daftar kontak yang tersimpan, mengunggah laporan ketika sinyal kembali).
2. **Pengutamaan perangkat bergerak.** Antarmuka dimulai dari layar telepon pintar, bukan komputer meja.
3. **Kesederhanaan penggunaan**, mengingat keragaman keterampilan digital pengguna.
4. **Pelindungan data pribadi**, karena sistem menyimpan data tamu kehormatan, nomor kontak pejabat, dan data kepegawaian (UU Nomor 27 Tahun 2022).

---

## Bab V. Rekomendasi Rancangan Awal Sistem Aplikasi

### 5.1 Konsep dan Penamaan

Sistem diberi nama **SIAP MALUT** (Sistem Informasi Administrasi Pimpinan Maluku Utara). Nama dipilih karena mudah diingat, akronimnya selaras dengan nomenklatur biro, dan kata "siap" menggambarkan kesiapsiagaan pelayanan kepada pimpinan.

Konsep dasar: **satu platform, tiga bagian, tujuh modul, satu basis data.** Rumusan ini menolak pendekatan banyak aplikasi kecil dengan data terpisah yang sulit dipelihara. Pengalaman Kalimantan Tengah (tiga aplikasi terpisah) dan Jawa Tengah (enam aplikasi Biro Umum) menunjukkan pendekatan itu mempercepat langkah awal namun menciptakan beban integrasi di kemudian hari.

Empat prinsip perancangan:

1. **Pendukung, bukan pengganti prosedur formal** (mengikuti BERAKSI): surat resmi tetap menjadi syarat administratif; aplikasi mempercepat koordinasi dan menciptakan jejak audit.
2. **Integrasi alih-alih duplikasi**: fungsi di SRIKANDI, e-Office, dan sistem kepegawaian daerah tidak dibangun ulang.
3. **Satu kali masukan, banyak keluaran**: data kerja harian otomatis mengisi agenda publik di situs, arsip dokumentasi, laporan kinerja, dan dasbor pimpinan.
4. **Bertahap dan terukur**: setiap tahap menghasilkan manfaat yang dapat dirasakan dan dievaluasi sebelum tahap berikutnya.

### 5.2 Arsitektur Sistem

Arsitektur terdiri atas empat lapisan, yaitu **lapisan pengguna**, **lapisan portal dengan masuk tunggal (SSO)**, **lapisan modul fungsional**, dan **lapisan integrasi**, yang berpijak pada lapisan fondasi yang dikelola bersama Diskominfosan. *(Gambar 2 pada PDF asli: arsitektur konseptual dengan lima kelompok pengguna, tujuh modul, tujuh titik integrasi, dan lapisan fondasi.)*

Lima kelompok pengguna:

| Kelompok | Kebutuhan |
|---|---|
| Gubernur, Wakil Gubernur, Sekda | Tampilan sangat ringkas: agenda harian dan buku pengarahan digital di perangkat bergerak |
| Kepala Biro dan Kepala Bagian | Dasbor pemantauan dan kewenangan persetujuan |
| Petugas protokol, penulis naskah, juru foto/video, fungsional dan pelaksana | Pengguna operasional paling intensif |
| Perangkat daerah, instansi, dan masyarakat pengundang | Pengguna eksternal pada kanal permohonan |
| Publik dan media | Bagian terbuka: agenda kegiatan, rilis pers, naskah sambutan yang telah disampaikan, galeri dokumentasi |

Pembedaan ini menjawab kesalahan umum aplikasi pemerintahan, yaitu antarmuka yang sama untuk semua peran sehingga pimpinan dihadapkan pada menu operasional yang tidak relevan dan akhirnya berhenti memakai sistem.

### 5.3 Rincian Tujuh Modul Fungsional

Ketujuh modul dipetakan dari tiga bagian organisasi agar tiap modul punya pemilik proses yang jelas. Modul tanpa pemilik berakhir menjadi menu kosong seperti halaman agenda di situs saat ini. **[disusun ulang]**

| Kode | Nama Modul | Pemilik Proses | Fungsi Utama |
|---|---|---|---|
| M1 | Agenda dan Acara Pimpinan | Bagian Protokol | Kalender Gubernur, Wakil Gubernur, dan Sekda; jadwal otomatis; penyusunan rundown; penetapan tempat, tata upacara, dan penghormatan; catatan kebutuhan perjalanan antarpulau. **Diperluas menjadi M1+ (lihat Bab XI)** |
| M2 | Layanan Permohonan Pimpinan | Bagian Protokol dan Bagian Materi | Kanal pengajuan permohonan sambutan, narasumber, video ucapan, dan fasilitasi keprotokolan; nomor tiket dan pelacakan status; validasi tenggat minimal; unggah surat resmi dan kerangka acuan |
| M3 | Naskah dan Materi Pimpinan | Bagian Materi dan Komunikasi Pimpinan | Bank naskah sambutan berdasarkan tema, acara, dan tanggal; template naskah dinas; alur reviu dan persetujuan berjenjang; buku pengarahan digital berisi ringkasan, data pendukung, dan poin penting |
| M4 | Dokumentasi dan Publikasi | Bagian Materi dan Komunikasi Pimpinan | Manajemen aset foto dan video dengan penandaan metadata; pengelolaan rilis pers; penjadwalan unggahan kanal media sosial |
| M5 | Tamu dan Keprotokolan | Bagian Protokol | Basis data tamu penting beserta riwayat kunjungan; kebutuhan akomodasi dan transportasi; direktori pejabat dengan nomor kontak; repositori lagu kebangsaan, foto resmi, dan atribut pimpinan |
| M6 | Perencanaan, Kinerja, dan Kepegawaian Setda | Bagian Perencanaan dan Kepegawaian | Penyusunan dan pemantauan Rencana Kerja, Rencana Kerja dan Anggaran, serta laporan kinerja; penugasan dan penilaian kinerja pejabat fungsional; administrasi kepegawaian Setda; penerbitan surat tugas |
| M7 | Dasbor Pimpinan dan Analitik | Kepala Biro | Statistik beban acara per pimpinan dan per wilayah; capaian tingkat layanan tiap jenis permohonan; pemantauan ketepatan waktu; kinerja biro; laporan untuk Sekda |

Modul M1 dan M2 merupakan inti sistem sehingga ditempatkan pada tahap pertama. M3 dan M4 menguatkan nilai dengan mengubah keluaran kerja harian menjadi aset pengetahuan. M5 dan M6 memperluas cakupan ke seluruh mandat biro. M7 adalah buah dari keenam modul sebelumnya dan hanya bermakna jika data pada modul-modul itu terisi konsisten.

### 5.4 Alur Proses Layanan Terintegrasi

*(Gambar 3 pada PDF asli: alur layanan permohonan pimpinan dari pengajuan hingga pengarsipan.)* Poin-poin yang digarisbawahi:

- **Nomor tiket dan estimasi waktu** saat pengajuan, sehingga pengundang tidak perlu menelepon berulang kali.
- **Validasi tenggat** pada tahap verifikasi, menerjemahkan aturan seperti ketentuan tujuh hari Jawa Timur menjadi mekanisme otomatis.
- **Penugasan tim kerja langsung dari sistem**, sejalan dengan model penilaian kinerja Pergub 20/2023.
- **Persetujuan akhir dengan tanda tangan elektronik** untuk kepastian hukum.
- **Pengarsipan otomatis** ke bank naskah dan manajemen aset digital, serta pencatatan capaian tingkat layanan ke dasbor: wujud prinsip satu masukan banyak keluaran.

### 5.5 Entitas Data Pokok

Pada tahap ini basis data dinyatakan pada tingkat entitas dan relasi utama. Sepuluh entitas pokok: **[disusun ulang]**

| Entitas | Isi Pokok | Relasi Utama |
|---|---|---|
| Pimpinan | Data Gubernur, Wakil Gubernur, Sekda, dan pejabat yang mewakili | Agenda, Naskah |
| Agenda Kegiatan | Judul, jenis, tanggal, waktu, tempat, status, tema | Poros: Permohonan, Naskah, Dokumentasi, Tamu, Penugasan |
| Permohonan | Nomor tiket, jenis layanan, pemohon, tanggal masuk, tenggat, status | Agenda, Naskah, Pengguna |
| Naskah | Judul, jenis, isi, nomor versi, penyusun, penyetuju, status, tema | Agenda |
| Aset Dokumentasi | Berkas foto/video, metadata (lokasi, tanggal, kegiatan), hak publikasi | Agenda |
| Tamu | Nama, jabatan, instansi, klasifikasi kehormatan, riwayat kunjungan, kebutuhan khusus | Agenda |
| Pegawai dan Peran | Data pegawai, jabatan, bagian, peran dalam sistem | Penugasan, Pengguna |
| Penugasan | Petugas, peran dalam kegiatan, tenggat, status penyelesaian | Agenda, Permohonan, Pegawai |
| Direktori Pejabat | Nama, jabatan, instansi, nomor kontak | Agenda, Tamu |
| Indikator Kinerja | Jenis indikator, target, realisasi, periode | Permohonan, Penugasan, Agenda |

Keputusan desain: entitas **Agenda Kegiatan** berfungsi sebagai poros. Setiap naskah, dokumentasi, penugasan, dan kehadiran tamu melekat pada satu kegiatan, yang menyederhanakan pengembangan dan memudahkan penelusuran riwayat. *(Entitas tambahan untuk Bab XI: Undangan/Lampiran, Penugasan Kehadiran, Aturan Kewenangan Mewakili, dan Notifikasi; lihat 11.6.)*

### 5.6 Pilihan Teknologi dan Pola Pengadaan **[disusun ulang]**

| Pendekatan | Keunggulan | Kelemahan | Kesesuaian |
|---|---|---|---|
| Platform low-code (misalnya AppSheet, atau alternatif sumber terbuka seperti Budibase dan NocoDB) | Sangat cepat diwujudkan, biaya awal rendah, dapat dikelola internal setelah pelatihan singkat | Keterbatasan kustomisasi, ketergantungan pada penyedia, data bisa berada di luar pusat data pemerintah | Sesuai untuk purwarupa tahap pertama |
| Pengembangan kustom oleh penyedia | Fleksibel penuh, dapat diintegrasikan secara mendalam, kode jelas | Biaya tinggi, proses pengadaan panjang, berisiko bergantung pada penyedia tunggal | Sesuai untuk tahap kedua dan seterusnya |
| Pengembangan internal bersama Diskominfosan | Biaya paling rendah dalam jangka panjang, selaras dengan Arsitektur SPBE | Bergantung pada ketersediaan tenaga pengembang | Sesuai sebagai pola jangka panjang dan pemeliharaan |

Rekomendasi: **pendekatan bertingkat.** Tahap pertama, purwarupa M1 dan M2 dengan platform low-code atau kerangka sumber terbuka sederhana untuk memvalidasi proses bisnis dan membangun kebiasaan pengguna secepat mungkin. Setelah stabil, versi definitif dikembangkan lewat pengadaan penyedia atau pengembangan internal bersama Diskominfosan, dengan penguasaan kode sumber oleh pemda dan alih pengetahuan dalam kontrak.

Tumpukan teknologi: kerangka kerja arus utama dengan komunitas luas. Aplikasi berbentuk **aplikasi web progresif (PWA)** agar dapat dipasang di ponsel tanpa toko aplikasi sekaligus mendukung kerja luring terbatas. Data ditempatkan pada pusat data atau komputasi awan Pemprov Maluku Utara dengan domain resmi berakhiran **go.id**.

### 5.7 Titik Integrasi Wajib **[disusun ulang]**

Tujuh titik integrasi dengan prioritas berbeda:

| Sistem Tujuan | Bentuk Integrasi | Prioritas |
|---|---|---|
| SRIKANDI dan e-Office provinsi | Pengiriman dan penerimaan surat resmi, termasuk surat undangan dan disposisi; naskah dinas sebagai arsip dinamis | Tinggi |
| Sistem kepegawaian daerah | Sinkronisasi data pegawai | Sedang |
| Sistem Biro Umum | Pemesanan kendaraan, ruang rapat, dan fasilitas | Sedang |
| Sistem informasi perencanaan dan kinerja | Penarikan data perencanaan dan anggaran serta pengiriman capaian kinerja | Sedang |
| Portal Satu Data dan situs resmi Maluku Utara (go.id) | Publikasi otomatis agenda dan naskah sambutan | Sedang |
| Balai Sertifikasi Elektronik | Tanda tangan elektronik untuk naskah dan surat tugas | Tinggi |
| Kanal notifikasi (WhatsApp / aplikasi pesan) | Pemberitahuan otomatis dan pengingat kepada pimpinan | **Sangat tinggi** |

> **Penyeragaman (v1.1).** Hasil ekstraksi PDF sempat memuat delapan baris. SRIKANDI dan e-Office digabung menjadi satu titik integrasi (sama-sama jalur persuratan), sehingga tetap **tujuh titik** sesuai teks asli. Tabel ini tetap perlu dicocokkan dengan PDF asli.

Integrasi kanal notifikasi berprioritas tertinggi karena paling menentukan adopsi. Pengalaman SIMANTAP di Sumatera Utara memperlihatkan bahwa notifikasi langsung kepada pimpinan adalah fitur yang paling dirasakan manfaatnya; aplikasi yang menuntut pengguna membuka peramban untuk mengetahui tugas baru hampir selalu terabaikan.

---

## Bab VI. Tata Kelola, Sumber Daya, dan Manajemen Perubahan

### 6.1 Struktur Tata Kelola

Kegagalan sistem informasi pemerintahan lebih sering disebabkan tata kelola daripada teknis. Sebelum kode pertama ditulis, struktur tanggung jawab perlu ditetapkan melalui keputusan resmi. **[disusun ulang]**

| Peran | Pengisi | Tanggung Jawab |
|---|---|---|
| Pengarah | Sekretaris Daerah | Menetapkan arah kebijakan, menyelesaikan hambatan lintas biro, mengesahkan tahapan |
| Pemilik Sistem | Kepala Biro Administrasi Pimpinan | Bertanggung jawab atas sistem, menetapkan prioritas fitur, memimpin evaluasi |
| Pemilik Proses per Modul | Kepala Bagian terkait | Memastikan proses kerja yang benar, menjamin kelengkapan data, melatih pengguna |
| Mitra Teknis | Diskominfosan | Menyediakan infrastruktur, integrasi, keamanan, serta pendaftaran dalam Arsitektur SPBE |
| Administrator dan Operator | Pejabat fungsional atau pelaksana yang ditunjuk pada setiap bagian | Mengelola data induk, mendampingi pengguna, melaporkan gangguan |

Dua ketentuan khusus: (1) penunjukan administrator tiap bagian dituangkan dalam surat keputusan dan diperhitungkan dalam sasaran kinerja pegawai; (2) kemitraan dengan Diskominfosan dibangun sejak perencanaan, bukan saat sistem hendak dipasang.

### 6.2 Kebutuhan Sumber Daya

- **Tahap purwarupa:** satu penanggung jawab teknis, satu hingga dua penyusun konfigurasi aplikasi (pegawai internal setelah pelatihan), satu analis proses bisnis, dan tim narasumber dari ketiga bagian.
- **Tahap pengembangan definitif:** tambahan pengembang antarmuka, pengembang layanan belakang, perancang pengalaman pengguna, dan penguji (pengadaan penyedia atau kolaborasi dengan Diskominfosan).
- **Komponen anggaran:** pengembangan perangkat lunak; penyimpanan berkapasitas besar (arsip foto dan video tumbuh cepat); sertifikat elektronik dan layanan notifikasi; bimbingan teknis dan pendampingan; pemeliharaan tahunan.

Biaya pemeliharaan yang tidak dianggarkan adalah penyebab utama aplikasi berhenti berfungsi di provinsi lain. Alokasi pemeliharaan sebaiknya menjadi bagian tetap anggaran biro, bukan kegiatan yang dibahas ulang setiap tahun.

### 6.3 Manajemen Perubahan dan Adopsi

Aspek penentu bukan teknologi, melainkan kesediaan orang mengubah kebiasaan. Empat langkah:

1. Menata dan memublikasikan **standar prosedur layanan** terlebih dahulu (praktik Jawa Timur), sehingga aplikasi hanya menerjemahkan prosedur yang telah disepakati.
2. **Bimbingan teknis operator** berkala (seperti SAMFO di Kalteng), disertai panduan video pendek.
3. **Masa transisi berdampingan** (manual dan digital berjalan bersama satu hingga dua bulan).
4. **Pengakuan atas keberhasilan**, misalnya menampilkan capaian ketepatan waktu layanan pada rapat rutin biro.

Hindari peluncuran serentak untuk semua modul dan semua pengguna, karena menciptakan beban belajar berlebihan dan hampir selalu berujung penolakan.

---

## Bab VII. Peta Jalan Implementasi

Peta jalan disusun dalam **lima tahap (Tahap 0–4)** dengan rentang sekitar delapan belas bulan, dimulai dari tahap persiapan yang tidak melibatkan penulisan kode. Dua tonggak peluncuran: **Maret** dan **Juli 2027**. *(Gambar 4 pada PDF asli.)*

> **Penyeragaman istilah (v1.1).** PDF asli menyebut "empat tahap" di Ringkasan Eksekutif dan Bab X, sedangkan Bab VII memuat Tahap 0 sampai Tahap 4. Dokumen ini menyeragamkan: **Tahap 0 = persiapan tanpa kode; Tahap 1–4 = empat tahap pengembangan.** Total lima tahap, sekitar 18 bulan.

| Tahap | Rentang Waktu | Keluaran Utama | Tolok Ukur Keberhasilan |
|---|---|---|---|
| Tahap 0. Persiapan | Triwulan IV 2026 | Surat keputusan kelompok kerja; pemetaan proses bisnis dan standar prosedur layanan; kerangka acuan kerja dan perencanaan anggaran; pendaftaran dalam Arsitektur SPBE | Seluruh proses bisnis dan standar layanan terdokumentasi dan disahkan |
| Tahap 1. Purwarupa Berjalan | Desember 2026 sampai Maret 2027 | Modul M1 Agenda dan Acara serta M2 Layanan Permohonan; uji coba terbatas; bimbingan teknis operator | Seluruh agenda pimpinan di lingkungan Sekretariat Daerah tercatat dan seluruh permohonan masuk melalui sistem |
| Tahap 2. Penguatan Inti | Maret sampai Juli 2027 | Modul M3 Naskah dan Materi serta M4 Dokumentasi dan Publikasi; integrasi SRIKANDI dan tanda tangan elektronik; peluncuran resmi tingkat daerah | Bank naskah terisi; alur naskah berjalan sepenuhnya digital |
| Tahap 3. Perluasan | Juli sampai Desember 2027 | Modul M5 Tamu dan Keprotokolan serta M6 Perencanaan dan Kepegawaian; aplikasi bergerak untuk pimpinan | Pimpinan menggunakan ringkasan agenda dan pengarahan di perangkat bergerak |
| Tahap 4. Kematangan | Desember 2027 sampai April 2028 | Modul M7 Dasbor dan Analitik; integrasi Satu Data dan portal publik; audit dan evaluasi | Laporan kinerja biro dihasilkan dari sistem; agenda publik tampil otomatis di situs |

Alasan memilih M1 dan M2 pada Tahap 1: keduanya menyentuh titik nyeri yang paling dirasakan (bentrok agenda dan permohonan terlambat), relatif sederhana secara teknis dan belum menuntut integrasi rumit, serta menghasilkan data dasar bagi seluruh modul berikutnya.

> **Dampak Bab XI pada Tahap 1.** Fitur penugasan kehadiran dan deteksi bentrok (M1+) dimasukkan sebagai bagian inti Tahap 1 karena menjadi kebutuhan nyata Bagian Protokol. Rekomendasi pembagian paket kerja ada di 11.8.

---

## Bab VIII. Indikator Keberhasilan dan Analisis Risiko

### 8.1 Indikator Keberhasilan

Seluruh indikator dapat diukur langsung dari data sistem. **[disusun ulang]**

| Kategori | Indikator | Target Tahun Pertama |
|---|---|---|
| Cakupan | Persentase agenda pimpinan yang tercatat dalam sistem | Sekurang-kurangnya 90 persen |
| Cakupan | Persentase permohonan yang masuk melalui kanal digital | Sekurang-kurangnya 70 persen |
| Ketepatan waktu | Persentase permohonan yang diselesaikan sebelum tenggat | Sekurang-kurangnya 85 persen |
| Ketepatan waktu | Rata-rata waktu penyelesaian permohonan naskah sambutan | Berkurang sekurang-kurangnya 30 persen dibanding kondisi awal |
| Mutu koordinasi | Jumlah bentrok agenda yang terdeteksi lebih awal oleh sistem | Tercatat dan menurun dari triwulan ke triwulan |
| Kearsipan | Persentase kegiatan pimpinan yang memiliki dokumentasi dan naskah lengkap | Sekurang-kurangnya 80 persen |
| Kepuasan | Nilai kepuasan pengguna layanan permohonan | Sekurang-kurangnya 3,2 dari skala 4 |
| Keterbukaan | Jumlah naskah sambutan dan agenda yang dipublikasikan | Meningkat setiap triwulan |
| SPBE | Kenaikan nilai domain Layanan dan Manajemen SPBE provinsi | Berkontribusi pada pencapaian indeks di atas 2,60 |

### 8.2 Analisis Risiko dan Mitigasi **[disusun ulang]**

| Risiko | Tingkat | Dampak | Langkah Mitigasi |
|---|---|---|---|
| Kenyamanan petugas dengan grup pesan instan | Tinggi | Sistem sepi, seperti halaman agenda saat ini | Penetapan kewajiban melalui surat edaran; integrasi notifikasi ke WhatsApp agar sistem tidak terasa sebagai beban tambahan |
| Keterbatasan jaringan kepulauan | Tinggi | Petugas lapangan tidak dapat memperbarui data | Aplikasi web progresif dengan kemampuan luring dan sinkronisasi tertunda |
| Ketergantungan pada penyedia tunggal | Sedang | Pengembangan terhenti | Penguasaan kode sumber oleh pemda; alih pengetahuan wajib; teknologi arus utama |
| Tidak tersedianya pemeliharaan | Sedang | Aplikasi berhenti berfungsi setelah satu-dua tahun | Alokasi pemeliharaan sebagai pos tetap anggaran biro |
| Kebocoran data pribadi dan sensitif | Sedang | Pelanggaran UU 27/2022 dan risiko reputasi | Pembatasan akses berbasis peran; penyandian data sensitif; catatan audit; uji keamanan bersama Diskominfosan |
| Perubahan struktur organisasi akibat regulasi baru | Rendah | Modul tidak lagi sesuai dengan pemilik proses | Rancangan berbasis peran, bukan jabatan struktural, sehingga penyesuaian cukup pada konfigurasi |
| Cakupan membengkak (*scope creep*) | Sedang | Tahap awal tidak selesai | Penetapan batas cakupan tiap tahap; fitur tambahan dijadwalkan ke tahap berikutnya |
| Tumpang tindih dengan aplikasi yang telah ada | Sedang | Pemborosan anggaran, penolakan Diskominfosan | Kajian pendahuluan atas aplikasi eksisting; prinsip integrasi alih-alih duplikasi |

---

## Bab IX. Langkah Tindak Lanjut Segera

Enam langkah yang dapat dimulai dalam 30 hari tanpa anggaran khusus:

1. Membentuk **kelompok kerja** penyusunan sistem melalui keputusan Sekretaris Daerah, beranggotakan ketiga bagian dan Diskominfosan.
2. Menyelenggarakan **diskusi kelompok terarah** di setiap bagian untuk memvalidasi titik nyeri pada Bab IV.
3. Menyusun dan mengesahkan **standar prosedur layanan** biro, termasuk tenggat minimal pengajuan tiap jenis permohonan, lalu memublikasikannya di situs resmi.
4. **Membenahi situs saat ini**: mengisi halaman struktur organisasi, daftar layanan, daftar pegawai, dan agenda, serta memperbaiki tautan survei kepuasan yang mengarah ke unit lain.
5. **Kunjungan atau pertemuan pembelajaran** dengan Biro Administrasi Pimpinan Kalimantan Tengah.
6. **Berkoordinasi dengan Diskominfosan** agar SIAP MALUT masuk Arsitektur SPBE Pemprov Maluku Utara pada tahun anggaran berikutnya.

Langkah keempat perlu penekanan: pekerjaannya sederhana tetapi berdampak simbolis dan praktis besar, sekaligus memaksa organisasi mulai mengumpulkan data yang nantinya menjadi isi awal sistem.

*(Tambahan v1.1, langkah 7 dan 8, ada di 11.9.)*

---

## Bab X. Penutup

Biro Administrasi Pimpinan Setda Provinsi Maluku Utara memegang mandat berat dan bersinggungan langsung dengan citra pemerintahan daerah, namun sampai kini bekerja hampir tanpa dukungan sistem informasi. Kekosongan halaman agenda, layanan, pegawai, dan struktur organisasi di situs resminya adalah gejala belum adanya sistem kerja digital yang menghasilkan data tersebut secara otomatis.

Provinsi lain membuktikan persoalan ini dapat diselesaikan dengan sumber daya yang tidak besar: Kalimantan Tengah dengan tiga aplikasi low-code, Jawa Timur dengan standar prosedur terbuka, Kalimantan Selatan dengan permohonan video ucapan terstruktur, serta Bali dan Sulawesi Selatan dengan platform tunggal multimodul.

Rekomendasi utama: membangun **SIAP MALUT** sebagai satu platform terpadu dengan tujuh modul yang dipetakan dari tiga bagian organisasi, dimulai terbatas dari modul agenda dan permohonan, dikembangkan bertahap (Tahap 0 persiapan, lalu Tahap 1–4 pengembangan), dan dikoordinasikan sejak awal dengan Diskominfosan agar tercatat dalam Arsitektur SPBE provinsi. Satu inisiatif menghasilkan tiga manfaat: peningkatan mutu layanan kepada pimpinan, pemenuhan fungsi pemantauan dan evaluasi (Pasal 95 Pergub 36/2021), dan kontribusi pada perbaikan indeks SPBE.

Dokumen ini adalah rancangan awal berdasarkan sumber terbuka dan penalaran atas praktik pembanding. Validasi bersama pejabat dan pelaksana ketiga bagian tidak dapat dilewati sebelum rancangan diterjemahkan menjadi dokumen spesifikasi kebutuhan dan kerangka acuan kerja pengadaan.

---

## Bab XI (Tambahan v1.1). Modul M1+ Penyusunan Agenda, Penugasan Kehadiran, dan Pembagian Jadwal

*Bab ini dirumuskan dari permintaan Kabag Protokol Biro Adpim beserta tiga contoh dokumen kerja nyata yang dilampirkan: (a) agenda Gubernur/Wakil Gubernur/Sekda 24 Oktober–17 November 2026, (b) alur kerja agenda empat langkah, dan (c) agenda pimpinan Kamis 22 Oktober 2026. Isinya melengkapi Modul M1 pada Bab V dan tidak mengubah arsitektur platform.*

### 11.1 Permintaan Pengguna

1. Memudahkan **penyusunan agenda pimpinan** (Gubernur, Wakil Gubernur, Sekda) berdasarkan undangan dan koordinasi pimpinan.
2. Memudahkan **pembagian jadwal** ketika agenda Gubernur/Wakil Gubernur **saling bertabrakan** dengan agenda lain, sehingga kegiatan dapat **diwakili** oleh Sekda, Asisten I/II/III, atau Kepala Dinas/Badan/Biro yang **benar-benar sesuai** dengan tugas mewakili tersebut.
3. Setiap agenda dapat dilampiri **file undangan** dan memiliki **PIC (penanggung jawab)** agar bisa dikontrol.
4. Dapat **diakses lewat ponsel**.

### 11.2 Alur Kerja Saat Ini (Dari Kabag Protokol) dan Alur dalam Sistem

| Langkah saat ini | Padanan di SIAP MALUT |
|---|---|
| 1. Undangan masuk | Undangan didaftarkan (input manual petugas, unggah dari surat/foto/PDF, atau masuk via kanal M2 / integrasi SRIKANDI-e-Office). Status: **Baru** |
| 2. Input dalam agenda | Petugas mengisi data kegiatan (lihat 11.4) dan melampirkan file undangan. Sistem langsung memeriksa bentrok. Status: **Menunggu Arahan** |
| 3. Menunggu arahan siapa yang menghadiri (Gubernur / Wagub / Sekda / pejabat lain) | Pimpinan atau Sekda menetapkan kehadiran dari ponsel (setuju, wakilkan, tolak, atau tunda). Sistem menampilkan saran pengganti. Status: **Ditetapkan** |
| 4. Tersaji dalam agenda yang sudah ada pejabat yang menghadiri | Agenda final per pimpinan dan per pejabat tampil di kalender dan dapat dibagikan; pejabat yang ditugaskan menerima notifikasi. Status: **Terkonfirmasi** |

Status lanjutan: **Berlangsung**, **Selesai**, **Dibatalkan/Ditunda**.

### 11.3 Pembelajaran dari Contoh Agenda Nyata

Contoh dokumen Kabag Protokol memperlihatkan pola yang harus didukung sistem:

| Temuan dari contoh | Kebutuhan sistem |
|---|---|
| **Bentrok waktu**: pada 24 Okt pukul 20.00 terdapat Penutupan Tara Noate di Kesultanan Ternate dan Hari Puncak HKG di Halmahera Timur; yang kedua sudah ditetapkan Wakil Gubernur | Deteksi bentrok otomatis dan pencatatan penetapan pengganti |
| **Bentrok lintas pulau**: 26 Okt pukul 08.00 Pembukaan Morotai Festival (Gubernur/Wagub/Sekda) hampir bersamaan dengan penjemputan Wamen di Bandara Babullah Ternate pukul 07.00 dan kegiatan di Pulau Tareba pukul 09.00 | Peringatan jarak dan waktu tempuh antarlokasi/pulau, bukan hanya jam yang beririsan |
| **Pelaksana beragam**: Wagub (Hari Santri, Halbar), Karo Kesra (Peletakan Batu Pertama gereja, Halut), Kepala Dinas Pendidikan (Hari Santri, Sofifi), Kepala Dinas Perpustakaan, Inspektorat/Kadis Keuangan, Kepala BPKAD | Penugasan pejabat berdasarkan kewenangan, bukan hanya lima pimpinan |
| **Satu kegiatan, lebih dari satu pihak**: Gerakan Pangan Murah dihadiri Wagub dan Dinas Pangan | Satu kegiatan dapat memiliki beberapa penugasan (pimpinan utama dan pendamping teknis) |
| **PIC kegiatan** (mis. "Pic. Dispora", "Pic. PTSP Maluku Utara"): pengundang atau OPD penyelenggara | Kolom PIC pengundang/OPD (di samping PIC petugas protokol) |
| **Kegiatan daring** memuat Meeting ID dan kata sandi | Kolom tautan/ID rapat daring; data ini sensitif sehingga hanya tampil untuk pejabat yang ditugaskan dan protokol |
| **Rentang waktu terbuka** ("08.00 WIT – Selesai") | Waktu selesai boleh kosong; sistem menganggap blok waktu perkiraan |
| **Agenda diterbitkan ke banyak pihak** (format teks seperti pesan WhatsApp) | Fitur ekspor agenda harian/mingguan ke teks siap tempel (WhatsApp) dan PDF |
| **Agenda jangka panjang** (kegiatan 17 November sudah masuk) | Kalender bulanan dan daftar "akan datang" |
| **Penjemputan dan pengantaran tamu** (para Wamen) sebagai kegiatan tersendiri | Jenis kegiatan: penjemputan/pengantaran, makan malam, city tour, dll., dan relasi ke modul Tamu (M5) |

### 11.4 Data Kegiatan yang Dicatat

| Kelompok | Isi |
|---|---|
| Identitas | Nama kegiatan, jenis (upacara, pembukaan, rapat, makan malam, kunjungan, daring, penjemputan, dan lain-lain), penyelenggara/pengundang |
| Waktu dan tempat | Tanggal, jam mulai, jam selesai (boleh "selesai"), zona WIT, lokasi (nama tempat, kota/kabupaten, pulau), tautan peta, tautan/ID rapat daring |
| Undangan | **File undangan** (PDF/foto, bisa lebih dari satu), nomor dan tanggal surat, kontak pengundang, batas konfirmasi kehadiran |
| Penanggung jawab | **PIC Protokol** (petugas Biro), **PIC Pengundang/OPD**, kontak keduanya |
| Kehadiran | Pimpinan/pejabat yang ditetapkan hadir, peran (utama, mewakili, pendamping), alasan penunjukan, penetapan oleh siapa dan kapan |
| Pendukung | Catatan perjalanan antarpulau (kapal/pesawat), tata pakaian, kebutuhan naskah sambutan (tautan ke M2/M3), kebutuhan dokumentasi (M4), tamu (M5) |
| Status | Baru, Menunggu Arahan, Ditetapkan, Terkonfirmasi, Berlangsung, Selesai, Dibatalkan, Ditunda |

### 11.5 Fitur Inti M1+

**A. Penyusunan agenda cepat dari ponsel**
- Formulir ringkas untuk input undangan; unggah foto undangan dari kamera atau galeri.
- Ekstraksi bantuan (opsional, tahap lanjutan): tanggal, jam, dan lokasi diusulkan dari file undangan lalu dikonfirmasi petugas, bukan disimpan otomatis tanpa tinjauan.

**B. Deteksi bentrok agenda**
- Sistem membandingkan agenda tiap pimpinan dan menandai: (1) **bentrok langsung** (jam beririsan), (2) **bentrok perjalanan** (jeda tidak cukup untuk berpindah lokasi, memakai tabel perkiraan waktu tempuh antarlokasi/pulau yang dikelola Protokol), dan (3) **bentrok sumber daya** (satu pejabat atau petugas ditugaskan di dua kegiatan bersamaan).
- Peringatan muncul saat input dan saat penetapan, bukan setelah agenda tersebar.

**C. Penugasan kehadiran dan rekomendasi pengganti**
- Pimpinan atau Sekda memilih dari opsi: *hadir sendiri*, *diwakilkan*, *tidak hadir (ucapan/surat)*, atau *ditunda/dijadwal ulang*.
- Bila diwakilkan, sistem mengusulkan pengganti berurutan dengan **aturan kewenangan mewakili** (lihat 11.7): kandidat difilter berdasarkan kesesuaian bidang kegiatan, tingkat acara, dan kewajaran tingkat jabatan, kemudian dicek ketersediaan (tidak bentrok) pada jam tersebut.
- Keputusan akhir tetap pada pimpinan. Sistem hanya menyajikan saran dan alasan ("Asisten Pemerintahan dan Kesra: bidang sesuai, jabatan setara eselon II.a, tersedia pukul 08.00–10.00").
- Pengganti yang ditunjuk menerima notifikasi untuk konfirmasi (**Terima / Tidak bisa**). Bila menolak, sistem menyarankan kandidat berikutnya.

**D. Kalender dan tampilan per peran**
- Pimpinan: agenda hari ini dan besok, kegiatan yang menunggu arahan, tombol keputusan cepat.
- Protokol: papan kerja dengan kolom status (Baru → Menunggu Arahan → Ditetapkan → Terkonfirmasi), filter per pimpinan, per tanggal, dan per PIC.
- Pejabat pengganti: hanya agenda penugasan miliknya beserta undangan dan bahan pendukung.
- Tampilan harian, mingguan, bulanan, dan daftar.

**E. Notifikasi dan pengingat**
- Ke pimpinan: ada undangan baru menunggu arahan; ada bentrok; pengingat H-1 dan beberapa jam sebelum acara.
- Ke pejabat pengganti dan PIC: penugasan baru, perubahan jam/lokasi, pembatalan.
- Kanal: notifikasi aplikasi dan WhatsApp (sesuai prioritas sangat tinggi pada 5.7).

**F. Ekspor dan berbagi**
- Agenda harian/mingguan sebagai teks siap tempel ke grup WhatsApp (mengikuti format yang kini dipakai: tanggal, nomor urut, lokasi, waktu, pejabat) dan sebagai PDF.
- Tautan baca-saja (opsional, kedaluwarsa) untuk pihak yang tidak memiliki akun.

**G. Kontrol dan jejak audit**
- Setiap perubahan (siapa mengubah apa dan kapan) tercatat. Riwayat penetapan dan pergantian pejabat dapat ditelusuri.
- Agenda yang belum ditetapkan melewati batas waktu (mis. H-3) otomatis ditandai merah di papan Protokol.

**H. Agenda publik**
- Setelah terkonfirmasi, kegiatan yang berstatus publik dapat ditayangkan otomatis ke laman Jadwal dan Agenda di situs biro (mengisi halaman yang kini kosong). Kegiatan sensitif/tertutup (mis. makan malam, penjemputan, tautan daring) tidak ditayangkan.

### 11.6 Tambahan Entitas Data

Melengkapi tabel 5.5:

| Entitas | Isi Pokok | Relasi |
|---|---|---|
| Lampiran Undangan | Berkas, jenis, nomor/tanggal surat, pengunggah, tanggal unggah | Agenda |
| Penugasan Kehadiran | Agenda, pejabat/pimpinan, peran (utama/mewakili/pendamping), status (diusulkan, ditugaskan, diterima, ditolak), alasan, penetapan oleh, waktu | Agenda, Pegawai/Pejabat |
| Aturan Kewenangan Mewakili | Bidang/tema kegiatan, jenis acara, tingkat acara, pejabat/jabatan yang boleh mewakili, prioritas, syarat | Direktori Pejabat |
| Lokasi dan Waktu Tempuh | Lokasi, kota/pulau, perkiraan waktu antarlokasi dan moda | Agenda |
| Notifikasi | Penerima, kanal, isi, status terkirim/dibaca | Agenda, Penugasan |
| PIC | Pihak (Protokol/Pengundang), nama, kontak | Agenda |

### 11.7 Aturan Kewenangan Mewakili

Inilah bagian yang paling menentukan kualitas rekomendasi "yang benar-benar sesuai tugas". Aturan **tidak ditulis sendiri oleh pengembang**, melainkan ditetapkan Biro bersama Sekda dan dapat diubah oleh admin Protokol tanpa mengubah kode.

Contoh tabel aturan (isi awal ilustratif; **harus divalidasi**):

| Bidang / jenis kegiatan | Pengganti utama | Pengganti berikutnya |
|---|---|---|
| Pemerintahan umum, keagamaan, kesejahteraan rakyat (mis. Hari Santri, peletakan batu pertama rumah ibadah) | Asisten I (Pemerintahan dan Kesra) | Karo Kesra; Kepala OPD teknis terkait (Kemenag/Dinas Pendidikan) |
| Ekonomi, investasi, pembangunan (mis. Apindo, PERHAPI, festival ekonomi kreatif) | Asisten II (Perekonomian dan Administrasi Pembangunan) | Kepala Dinas/Badan teknis (Perindag, DPMPTSP, ESDM, Pariwisata) |
| Administrasi umum, kepegawaian, aparatur | Asisten III (Administrasi Umum) | Kepala Biro terkait |
| Kegiatan seremonial tingkat tinggi dengan kehadiran pejabat pusat (mis. Wamen) | Sekda | Wakil Gubernur |
| Kegiatan OPD teknis (mis. gerakan pangan murah, workshop kontingensi banjir) | Kepala OPD teknis terkait | Sekretaris OPD / pejabat eselon II setara |
| Kegiatan daring/sosialisasi teknis | Kepala OPD/Inspektorat/Kepala BPKAD sesuai bidang | Pejabat eselon III yang ditunjuk |

Prinsip kendali:
1. **Tingkat acara menentukan tingkat pengganti** (acara berskala provinsi atau dihadiri pejabat pusat tidak diwakili staf rendah).
2. **Kesesuaian bidang** diprioritaskan di atas kedekatan struktural.
3. **Kerentanan protokol**: acara tertentu (mis. upacara dengan inspektur upacara, adat kesultanan) dapat ditandai "hanya pimpinan" atau "pengganti minimal setingkat tertentu".
4. **Ketersediaan** diperiksa sebelum disarankan, termasuk waktu perjalanan.
5. Keputusan terakhir tetap manusia (pimpinan/Sekda); sistem hanya memberi saran dan alasan yang dapat ditelusuri.

### 11.8 Dampak pada Rencana Tahap

| Paket | Isi | Waktu |
|---|---|---|
| M1+ inti (**Tahap 1**) | Input undangan beserta file dan PIC; alur status 4 langkah; kalender; penetapan kehadiran manual oleh pimpinan; deteksi bentrok langsung; notifikasi WhatsApp; akses ponsel (PWA); ekspor teks/PDF | Desember 2026 – Maret 2027 |
| M1+ lanjutan (**awal Tahap 2**) | Rekomendasi pengganti berbasis aturan kewenangan; deteksi bentrok perjalanan antarpulau (tabel waktu tempuh); konfirmasi pengganti dua arah; agenda publik otomatis ke situs | Maret – Mei 2027 |
| M1+ pendukung (**Tahap 3**) | Tautan ke M5 (tamu, penjemputan), M3 (naskah), M4 (dokumentasi); ekstraksi bantuan dari foto/PDF undangan | Juli – Desember 2027 |

Permintaan Kabag Protokol bersifat mendesak dan tidak perlu menunggu seluruh platform; dapat dimulai dengan purwarupa berbasis low-code (lihat 5.6).

### 11.9 Tambahan Kriteria Keberhasilan, Risiko, dan Tindak Lanjut

**Indikator tambahan:**

| Indikator | Target tahun pertama |
|---|---|
| Waktu rata-rata dari undangan masuk sampai kehadiran ditetapkan | Berkurang dibanding kondisi awal; target awal ≤ 24 jam |
| Persentase undangan yang memiliki file undangan dan PIC | ≥ 95 persen |
| Persentase bentrok yang terdeteksi sebelum agenda difinalkan | ≥ 90 persen |
| Persentase kegiatan dengan pejabat pengganti yang menerima penugasan tepat waktu | ≥ 85 persen |
| Penggunaan ponsel untuk penetapan kehadiran oleh pimpinan/ajudan | Mayoritas penetapan dilakukan via aplikasi |

**Risiko tambahan:**

| Risiko | Tingkat | Mitigasi |
|---|---|---|
| Rekomendasi pengganti dianggap menggantikan kewenangan pimpinan | Sedang | Sistem hanya menyarankan; keputusan dan jejak audit tetap pada pimpinan/Sekda |
| Aturan kewenangan tidak disepakati atau berubah | Sedang | Aturan diatur admin Protokol tanpa ubah kode; ditetapkan bersama Sekda |
| Kebocoran agenda pimpinan atau tautan rapat daring | Tinggi | Pembatasan akses per peran; tautan rapat hanya untuk pejabat ditugaskan; log akses; agenda sensitif tidak tampil publik |
| Pimpinan atau ajudan tidak mau memakai aplikasi | Tinggi | Antarmuka tiga ketukan; jawaban cepat langsung dari notifikasi WhatsApp; ajudan boleh menginput atas nama pimpinan |
| Data waktu tempuh antarpulau tidak akurat | Sedang | Tabel awal dari pengalaman Protokol, diperbarui berkala; peringatan bersifat saran |

**Langkah tindak lanjut tambahan (melengkapi Bab IX):**
- **Langkah 7.** Mengumpulkan contoh agenda nyata 3–6 bulan terakhir (termasuk kasus bentrok dan pergantian pejabat) untuk menguji aturan.
- **Langkah 8.** Menyusun draf **Aturan Kewenangan Mewakili** bersama Kabag Protokol, Sekda, dan Asisten, kemudian disahkan sebagai pedoman internal.

### 11.10 Pertanyaan Terbuka untuk Kabag Protokol

1. Siapa saja yang akan memiliki akun: Gubernur, Wagub, Sekda, ajudan, Asisten I/II/III, Kepala OPD, atau hanya Protokol dan pimpinan?
2. Siapa yang berwenang menetapkan pengganti: pimpinan sendiri, Sekda, atau Kepala Biro atas arahan?
3. Apakah pejabat pengganti harus **konfirmasi menerima** di aplikasi, atau cukup diberitahu?
4. Apakah agenda perlu tayang publik di situs, dan kegiatan mana yang dikecualikan?
5. Apakah ada format agenda baku (seperti pesan WhatsApp saat ini) yang ingin dipertahankan persis?
6. Apakah undangan juga akan diteruskan dari SRIKANDI/e-Office, atau sebagian besar masuk lewat WhatsApp dan fisik?
7. Berapa lama batas minimal undangan agar bisa diproses (aturan H-berapa), dan apa perlakuan undangan mendadak?

---

## Referensi

1. Peraturan Gubernur Maluku Utara Nomor 36 Tahun 2021 tentang Organisasi dan Tata Kerja Sekretariat Daerah Provinsi Maluku Utara. Repositori Analisis Jabatan Pemprov Maluku Utara.
2. Situs resmi Biro Administrasi Pimpinan Setda Provinsi Maluku Utara (biroadpim.malutprov.go.id), halaman Tugas Pokok dan Fungsi, Struktur Organisasi, Layanan, Pegawai, Agenda, dan Bank Data (diakses Agustus 2026); serta SIPeT — Sistem Informasi Protokol Elektronik Terintegrasi, Bagian Protokol Biro Adpim Setda Provinsi Kalimantan Tengah. *(Pada PDF asli, nomor [2] dipakai ganda untuk situs Biro Adpim Malut dan SIPeT.)*
3. BERAKSI — BERkoordinasi Atasi misKomunikaSI, Biro Adpim Setda Provinsi Kalimantan Tengah.
4. SAMFO — Sambutan dan Foto Pimpinan, Biro Adpim Setda Provinsi Kalimantan Tengah.
5. Situs resmi Biro Administrasi Pimpinan Setda Provinsi Jawa Timur — daftar layanan dan prosedur baku layanan.
6. Profil Biro Administrasi Pimpinan Setda Provinsi Jambi — struktur organisasi dan direktori kontak pejabat.
7. Pemprov Malut Target Predikat SPBE 2024 Meningkat. InfoPublik, 22 Januari 2024.
8. Maluku Utara Fokus Tingkatkan Indeks SPBE, Siap Capai Predikat Baik di Tahun 2024. Akses News, 28 September 2024.
9. Peraturan Presiden Nomor 95 Tahun 2018 tentang Sistem Pemerintahan Berbasis Elektronik. JDIH BPK.
10. Peraturan Presiden Nomor 132 Tahun 2022 tentang Arsitektur SPBE Nasional. JDIH Kemenko Infrastruktur.
11. Peraturan Presiden Nomor 82 Tahun 2023 tentang Percepatan Transformasi Digital dan Keterpaduan Layanan Digital Nasional. JDIH BPK.
12. Peraturan Gubernur Maluku Utara Nomor 20 Tahun 2023 tentang Sistem Kerja pada Instansi Pemerintah Provinsi Maluku Utara untuk Penyederhanaan Birokrasi. Repositori Analisis Jabatan Pemprov Maluku Utara.
13. Portal Dinas Komunikasi, Informatika, dan Persandian Provinsi Maluku Utara — informasi kegiatan tata kelola SPBE provinsi.
14. SRIKANDI — Sistem Informasi Kearsipan Dinamis Terintegrasi, aplikasi umum berbagi pakai berdasarkan Keputusan Menteri PANRB Nomor 679 Tahun 2020.
15. Peraturan Pemerintah Nomor 62 Tahun 1990 tentang Ketentuan Keprotokolan mengenai Tata Tempat, Tata Upacara, dan Tata Penghormatan. JDIH BPK.
16. Portal Layanan Biro Umum Setda Provinsi Jawa Tengah — model layanan satu pintu internal Setda.
17. SITU OK — Sistem Informasi Tata Usaha Optimalisasi Kinerja, Biro Umum dan Protokol Setda Provinsi Bali.
18. Dokumen kerja Protokol Provinsi Maluku Utara (Kabag Protokol): Agenda Pimpinan 24 Oktober–17 November 2026; alur kerja agenda; Agenda Pimpinan 22 Oktober 2026.
