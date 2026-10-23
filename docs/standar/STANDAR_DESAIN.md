# Standar Desain SIAP MALUT

**Versi:** 1.0 (ditetapkan Oktober 2026, menunggu pengesahan Kepala Biro)
**Berlaku untuk:** seluruh antarmuka SIAP MALUT (aplikasi web progresif, dasbor, halaman publik, dokumen PDF/ekspor).
**Sumber kebenaran kode:** [`src/styles/design-tokens.css`](../../src/styles/design-tokens.css). Dokumen ini menjelaskan alasannya; bila berbeda, **berkas token yang berlaku** dan dokumen ini wajib diperbarui pada tahap yang sama.

## 1. Aturan Wajib

1. Setiap perancangan atau pembangunan tampilan **wajib** memakai token pada `design-tokens.css`. Dilarang menulis warna heksadesimal, ukuran font, atau jarak langsung di komponen.
2. Perubahan standar ini hanya lewat tahap kerja tersendiri yang ditulis di handoff, lalu di-commit dengan awalan `docs(standar):`.
3. Tinjauan setiap tahap wajib memeriksa daftar periksa di bagian 8 sebelum handoff dibuat.

## 2. Tipografi

| Peran | Nilai |
|---|---|
| Keluarga font | **Inter** (variabel), cadangan: system-ui, Segoe UI, Roboto, Arial |
| Pemuatan | **Self-hosted** di `src/assets/fonts/Inter-Variable.woff2`. Tanpa CDN, agar jalan luring pada PWA dan di jaringan lemah |
| Angka | `font-variant-numeric: tabular-nums` untuk jam, tanggal, nomor tiket (kelas `.tabular`) |
| Monospace | Hanya untuk ID rapat, kode, dan nomor teknis |

| Token | Ukuran | Pemakaian |
|---|---|---|
| `--fs-2xl` | 28 px | Judul halaman |
| `--fs-xl` | 22 px | Judul bagian |
| `--fs-lg` | 18 px | Sub-judul, nama kegiatan pada kartu agenda |
| `--fs-md` | 16 px | **Teks isi (minimum di ponsel)** |
| `--fs-sm` | 14 px | Label, tabel padat |
| `--fs-xs` | 13 px | Keterangan pendukung saja, bukan informasi penting |

Spasi baris: 1,5 untuk teks isi, 1,25 untuk judul. Ketebalan: 400 isi, 500 label, 600 tombol dan judul kecil, 700 judul utama. Teks pimpinan (agenda harian di ponsel) tidak boleh lebih kecil dari 16 px.

**Alasan:** satu keluarga font yang mudah dibaca di layar kecil, gratis berlisensi OFL, dan dapat dibundel sendiri sehingga tidak bergantung pada jaringan.

## 3. Warna

### 3.1 Palet merek (mode terang)

| Token | Nilai | Nama | Pemakaian |
|---|---|---|---|
| `--color-primary` | `#0B4A6F` | Biru Laut | Tombol utama, header, tautan, ikon aktif |
| `--color-primary-strong` | `#082F47` | Biru Laut Tua | Hover/pressed |
| `--color-primary-soft` | `#E3EFF6` | Biru Muda | Latar lembut, baris terpilih |
| `--color-accent` | `#C8962E` | Emas Cengkih | Aksen, penanda penting; teks di atasnya `#1B2733` |
| `--color-accent-text` | `#8A6212` | Emas Teks | Teks emas di latar putih |

Biru laut dipilih sebagai simbol provinsi kepulauan dan nuansa resmi yang tenang. Emas memberi aksen kehormatan tanpa dipakai untuk teks panjang.

> Catatan: palet ini usulan awal. Bila Pemprov Maluku Utara memiliki pedoman identitas visual resmi (logo dan warna), palet disesuaikan melalui tahap kerja tersendiri, dengan token sebagai satu-satunya titik perubahan.

### 3.2 Netral

| Token | Terang | Pemakaian |
|---|---|---|
| `--color-bg` | `#F5F7FA` | Latar halaman |
| `--color-surface` | `#FFFFFF` | Kartu, panel, formulir |
| `--color-surface-2` | `#EEF2F6` | Latar sekunder |
| `--color-border` | `#C9D3DD` | Garis pemisah |
| `--color-text` | `#1B2733` | Teks utama |
| `--color-text-muted` | `#52606D` | Teks pendukung |

### 3.3 Semantik dan status agenda

| Makna | Token | Terang | Ikon wajib |
|---|---|---|---|
| Berhasil / Terkonfirmasi | `--color-success` | `#1E7B4F` | centang |
| Peringatan / Menunggu Arahan | `--color-warning` | `#8A5300` | jam |
| Bahaya / Bentrok / Batal | `--color-danger` | `#B3261E` | segitiga seru |
| Informasi / Ditetapkan | `--color-info` | `#1565A8` | huruf i |

**Aturan:** status tidak boleh disampaikan hanya lewat warna. Selalu pasangkan **ikon + teks** (misalnya "⚠ Bentrok"). Ini untuk pengguna buta warna dan layar di bawah sinar matahari.

### 3.4 Kontras (diuji, WCAG 2.1 AA: teks ≥ 4,5:1)

| Pasangan | Rasio |
|---|---|
| Teks `#1B2733` di latar `#F5F7FA` | 14,13 |
| Teks pendukung `#52606D` di `#FFFFFF` | 6,46 |
| Putih di biru laut `#0B4A6F` | 9,45 |
| Teks gelap di emas `#C8962E` | 5,68 |
| Putih di hijau `#1E7B4F` | 5,25 |
| Putih di merah `#B3261E` | 6,54 |
| Putih di jingga `#8A5300` | 6,33 |
| Putih di biru info `#1565A8` | 6,07 |
| Mode gelap: teks `#E6EDF3` di `#0F1A24` | 14,89 |
| Mode gelap: pendukung `#9AA9B8` di `#16232F` | 6,64 |
| Mode gelap: biru `#7FC3EA` di `#0F1A24` | 9,13 |

Setiap warna baru wajib diuji sebelum masuk token. Perhitungan ulang cukup dengan rumus kontras WCAG 2.1.

### 3.5 Mode gelap

Wajib tersedia, otomatis mengikuti sistem (`prefers-color-scheme`) dan dapat dipaksa lewat `data-theme="light|dark"`. Pimpinan sering membuka agenda malam hari atau di kendaraan.

## 4. Tata Letak, Bentuk, dan Jarak

- **Mobile-first.** Rancang dari lebar 360 px; tidak boleh ada gulir horizontal halaman. Gutter halaman 16 px (`--page-gutter`).
- Titik lebar: ponsel < 640 px, tablet 640–1024 px, desktop ≥ 1024 px.
- Jarak memakai skala 4 px (`--space-1` … `--space-8`).
- Sudut: 6 px (input kecil), 10 px (tombol, kartu), 16 px (panel besar).
- Bayangan hanya `--shadow-sm` dan `--shadow-md`; tidak ada efek dekoratif berlebihan.

## 5. Komponen Dasar

| Komponen | Aturan |
|---|---|
| Tombol utama | Latar `--color-primary`, teks `--color-on-primary`, tinggi ≥ 48 px, hanya satu per layar |
| Tombol sekunder | Garis tepi `--color-primary`, latar transparan |
| Tombol bahaya | Latar `--color-danger`, selalu minta konfirmasi |
| Input | Tinggi ≥ 48 px, label selalu terlihat (bukan hanya placeholder), pesan galat di bawah input dengan ikon + teks |
| Kartu agenda | Judul `--fs-lg`; baris jam (tabular), lokasi, PIC, lencana status (ikon + teks), lencana "Bentrok" bila ada |
| Lencana status | Latar lembut dari warna status, teks gelap/terang sesuai kontras, ikon di kiri |
| Navigasi ponsel | Bilah bawah maks 5 item (Agenda, Undangan, Penugasan, Notifikasi, Akun) |
| Pesan sistem | Toast untuk keberhasilan, banner untuk peringatan jaringan ("Mode luring: perubahan akan dikirim saat tersambung") |

## 6. Aksesibilitas dan Kondisi Lapangan

1. Target sentuh minimum **48 × 48 px** (`--touch-min`), jarak antar target ≥ 8 px.
2. Fokus keyboard selalu terlihat (`:focus-visible`, cincin 3 px).
3. Kontras sesuai bagian 3.4; informasi tidak hanya lewat warna.
4. Mendukung pembesaran teks sistem sampai 200% tanpa kehilangan fungsi.
5. Bahasa antarmuka: **Bahasa Indonesia baku**; waktu selalu ditulis dengan zona (**WIT**); format tanggal `Sabtu, 24 Oktober 2026`; jam `07.00 WIT`.
6. Pengguna lapangan: layar di luar ruangan, tangan satu, sinyal lemah. Aksi utama (Setuju/Wakilkan/Tunda) dapat dijangkau ibu jari dan selesai dalam ≤ 3 ketukan.

## 7. Kinerja dan Luring

- Berkas halaman awal (di luar gambar) ≤ 300 KB terkompresi.
- Font dan ikon di-cache oleh service worker; halaman agenda dan direktori kontak tersedia luring.
- Gambar undangan dikompresi di sisi klien sebelum unggah (maks. 1600 px sisi terpanjang) agar hemat kuota.

## 8. Daftar Periksa Tinjauan (wajib sebelum handoff)

- [ ] Tidak ada warna, ukuran font, atau jarak yang ditulis langsung; semua lewat token.
- [ ] Teks isi ≥ 16 px; target sentuh ≥ 48 px.
- [ ] Status memakai ikon + teks, bukan warna saja.
- [ ] Diuji pada lebar 360 px, tanpa gulir horizontal.
- [ ] Mode terang dan gelap sama-sama terbaca; kontras lolos.
- [ ] Teks Indonesia baku; waktu berzona WIT.
- [ ] Berfungsi (minimal membaca) tanpa jaringan untuk halaman yang dijanjikan luring.
- [ ] Berkas token tidak diubah, atau perubahannya dicatat sebagai tahap kerja tersendiri.
