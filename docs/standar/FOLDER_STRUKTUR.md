# Struktur Folder Baku SIAP MALUT

**Status:** DIBEKUKAN sejak Tahap 0.6. Struktur ini dirancang agar koreksi di masa depan tidak merusak tata letak proyek.

## 1. Aturan

1. **Tambah, jangan pindah.** Folder baru hanya di bawah folder induk yang sudah ada dan dicatat di berkas ini pada tahap yang sama.
2. **Dilarang membuat folder tingkat atas baru** tanpa `KEPUTUSAN:` owner.
3. **Memindah atau mengganti nama** folder/berkas yang sudah dirujuk: hanya lewat koreksi jenis D (`CARA_KERJA.md` bagian 5), dengan pembaruan semua rujukan (dokumen, skrip, daftar audit) dalam satu patch dan `audit-check` lolos.
4. Berkas harus berada di tempat yang ditentukan di bagian 2; bila ragu, tanyakan, jangan menebak.
5. Folder kosong yang disiapkan memakai `.gitkeep`.
6. Nama berkas: huruf besar untuk dokumen resmi (`STANDAR_DESAIN.md`), `kebab-case` untuk berkas data/kode, awalan tahap pada handoff (`HANDOFF_TAHAP-<nomor>_...`).

## 2. Pohon Folder

```
SIAP_MALUT/
|-- CLAUDE.md                 aturan kerja wajib (dibaca tiap sesi)
|-- STATUS.md                 kondisi terkini satu halaman (diperbarui tiap patch)
|-- README.md
|-- docs/
|   |-- rancangan/            rancangan awal (PDF asli dan .md)
|   |-- standar/              standar mengikat: desain, cara kerja, struktur folder, data contoh, teknologi, aturan kewenangan
|   |-- sop/                  SOP layanan biro
|   |-- keputusan/            KEPUTUSAN.md (log keputusan owner)
|   |-- perubahan/            REGISTER_KOREKSI.md (koreksi owner/Kabag)
|   |-- handoff/              LEMBAR_TAHAP-*, HANDOFF_TAHAP-*, templat
|   |-- audit/                dokumen audit (daftar induk, RTM, risiko, serah terima, placeholder)
|   |   |-- arsip/ bukti-gate/ sbom/ spbe/ indikator/ kepemilikan/ keuangan/
|   |   |-- pengadaan/ aset/ akun-layanan/ bast/ peninjauan-akses/
|   |-- rekayasa/             arsitektur, kamus data, API, desain keamanan, hak akses, aturan bisnis
|   |-- mutu/                 rencana uji, laporan uji, UAT, daftar cacat
|   |-- keamanan/             kebijakan, data pribadi, retensi, insiden, hasil uji keamanan
|   |-- operasi/              pemasangan, infrastruktur, cadangan, BCP/DRP, runbook, SLA
|   |-- pengguna/             panduan pengguna/admin, pelatihan
|-- apps/
|   |-- web/                  antarmuka PWA
|   |-- api/                  peladen API (src/db: skema Drizzle; drizzle/: migrasi hasil drizzle-kit, jangan diedit tangan)
|-- packages/
|   |-- domain/               logika murni (bentrok, pengganti, status)
|   |-- shared/               skema dan tipe bersama
|-- data/
|   |-- contoh/               DATA CONTOH (fiktif): pejabat, peran, agenda, aturan; satu-satunya tempat data seed
|   |-- dev/                  basis data pengembangan PGlite (diabaikan Git; hapus untuk mengulang dari nol)
|   |-- unggahan/             lampiran undangan pengembangan (diabaikan Git; Tahap 1.3b)
|-- src/
|   |-- styles/               design-tokens.css (sumber token bersama; tidak dipindah)
|   |-- assets/fonts/
|-- scripts/
|   |-- gate.ps1  audit-check.ps1  dev.mjs  buat-sbom.mjs  buat-diagram-status.mjs  cek-token.mjs
|   |-- patch/                tahap-<nomor>.ps1
```

## 3. Di Mana Koreksi Umum Diletakkan

| Koreksi | Tempat |
|---|---|
| Nama pejabat/staf, jabatan, akun contoh | `data/contoh/` |
| Aturan kewenangan, tenggat, waktu tempuh, jenis kegiatan | `data/contoh/` (nilai awal) dan dikelola admin di aplikasi |
| Istilah/label antarmuka | Berkas teks antarmuka di `apps/web/` (satu berkas) |
| Warna, font, jarak | `src/styles/design-tokens.css` |
| Isi SOP | `docs/sop/` |
| Keputusan baru | `docs/keputusan/KEPUTUSAN.md` |
| Koreksi masuk | `docs/perubahan/REGISTER_KOREKSI.md` |
| Dokumen audit baru | `docs/audit/` (atau subfolder yang sudah ada) |

## 4. Pemeriksaan

`scripts/audit-check.ps1` memeriksa keberadaan folder baku di bagian 2 dan menolak jika ada folder tingkat atas yang tidak dikenal.
