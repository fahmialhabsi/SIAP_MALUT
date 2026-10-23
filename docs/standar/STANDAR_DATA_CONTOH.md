# Standar Data Contoh dan Placeholder SIAP MALUT

**Berlaku sejak:** Tahap 0.6. Dasar: KP-005 (Kabag Protokol meminta mandiri dan memakai placeholder), KP-006 (owner sebagai admin), KP-007 (mode demo).

## 1. Prinsip

1. **Tidak ada data orang nyata** (nama pejabat, staf, nomor telepon, NIP, ID rapat, kata sandi) di repo, data seed, atau dokumen selama masa pembangunan mandiri.
2. **Data contoh tidak boleh menyamar sebagai nyata.** Semuanya berlabel jelas "CONTOH".
3. **Satu tempat data:** semua data contoh ada di `data/contoh/`. Penggantian dengan data asli hanya mengganti isi tempat ini (dan impor lewat admin), bukan kode.
4. **Peran berdasarkan jabatan**, bukan nama. Nama hanya atribut pemegang jabatan.
5. **Data contoh mengikuti bentuk data nyata Kabag Protokol** (agenda 22 dan 24 Okt–17 Nov 2026) agar uji realistis, tetapi **difiktifkan**: nama kegiatan boleh meniru jenisnya, tanpa ID rapat, kata sandi, atau nama orang.

## 2. Penamaan

| Jenis | Format | Contoh |
|---|---|---|
| Pimpinan | `<Jabatan> (CONTOH)` | `Gubernur (CONTOH)`, `Wakil Gubernur (CONTOH)`, `Sekda (CONTOH)` |
| Asisten | `Asisten I (CONTOH)`, `Asisten II (CONTOH)`, `Asisten III (CONTOH)` | |
| Kepala OPD/Biro | `Kepala <OPD> (CONTOH)` | `Kepala Dinas Pendidikan (CONTOH)` |
| Staf Protokol | `Petugas Protokol 01 (CONTOH)` | |
| Ajudan | `Ajudan Gubernur (CONTOH)` | |
| Pemohon/pengundang | `Penyelenggara Contoh A` | |
| Akun | `demo.<peran>` | `demo.gubernur`, `demo.protokol01` |
| Admin | `admin.owner` (dipegang owner) | |
| Telepon | `0800-000-0001` (rentang jelas palsu) | |
| Surat | `CONTOH/001/2026` | |

Dilarang memakai nama orang asli atau nama yang mirip pemangku jabatan sebenarnya.

## 3. Persona Demo (satu per jabatan)

Gubernur, Wakil Gubernur, Sekda, Asisten I, II, III, Kepala Biro Adpim, Kabag Protokol, Petugas Protokol, Ajudan, beberapa Kepala OPD (pendidikan, kesra, pangan, BPKAD, inspektorat, perpustakaan, pariwisata, PTSP), Petugas Materi/Komunikasi, Pemohon eksternal, Publik. Mencakup seluruh jenis dasbor (pejabat, staf, admin).

## 4. Owner sebagai Admin dan Mode Demo

| Hal | Ketentuan |
|---|---|
| Akun owner | `admin.owner`, peran Administrator. Kata sandi **tidak** disimpan di repo atau dokumen. |
| `APP_MODE` | Variabel lingkungan: `demo` atau `production`. Default `production` (aman). |
| Pindah tampilan peran | **Hanya di `demo`**: admin memilih persona (Gubernur, Sekda, Protokol, ...) untuk menilai dasbor tiap peran. Setiap pemakaian tercatat di log audit sebagai "demo-impersonation". |
| Spanduk | Mode demo menampilkan spanduk tetap **"DATA CONTOH: bukan data resmi"** pada semua halaman dan hasil ekspor (PDF/teks). |
| Penjaga produksi | Pada `production`, aplikasi menolak mulai bila ada baris berpenanda `is_contoh = true`, dan fitur pindah peran dinonaktifkan. |
| Penanda data | Setiap tabel yang memuat orang/agenda memiliki kolom `is_contoh`. Seed contoh selalu `true`. |

## 5. Daftar Placeholder

Semua hal yang masih placeholder dicatat di `docs/audit/DAFTAR_PLACEHOLDER.md` (apa, di mana, pengganti, tahap penggantian, status). Setiap tahap memperbaruinya. Dokumen audit berbasis placeholder (mis. SK) berstatus **Placeholder**.

## 6. Tahap P: Penggantian Data Contoh dengan Data Asli

Tahap tersendiri sebelum peluncuran (setelah Kabag meninjau):
1. Kabag/owner memberikan data asli (struktur pejabat, staf, akun) lewat saluran aman.
2. Impor lewat fitur impor admin (CSV/templat), bukan mengedit kode.
3. **Membuat basis data produksi yang baru** (bukan membersihkan basis data demo): `log_audit` bersifat append-only sehingga catatan demo tidak dapat dihapus dan tidak dibawa ke produksi. Basis data demo diarsipkan atau dibuang. Penjaga produksi menolak start bila basis data masih memuat baris `is_contoh`.
4. Menjalankan penjaga produksi, menonaktifkan mode demo.
5. Menyusun ulang dokumen berstatus Placeholder (SK, matriks hak akses dengan nama, dll.) dengan data asli.
6. Uji ulang hak akses dan dasbor dengan data asli.

## 7. Hal yang Tidak Boleh

- Menaruh data nyata di `data/contoh/`.
- Membiarkan label "CONTOH" hilang pada hasil ekspor.
- Menyalin ID rapat, kata sandi, atau nama orang dari dokumen kerja Protokol ke repo.
- Menandai dokumen berbasis placeholder sebagai "Ada".
