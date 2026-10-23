# Cara Kerja SIAP MALUT (Pedoman Wajib Tiap Tahap)

**Berlaku sejak:** Tahap 0.6 (23 Oktober 2026). Mengikat rancangan, implementasi, evaluasi, dan audit.
**Pelaksana:** owner (admin) dan asisten (Claude). Kabag Protokol melihat hasil setelah aplikasi terlihat jadi (KP-005).

## 1. Urutan Pedoman (bila bertabrakan, yang di atas menang)

1. **Keputusan owner**: `docs/keputusan/KEPUTUSAN.md`
2. **`CLAUDE.md`**: aturan kerja
3. **Standar**: `docs/standar/` (desain, cara kerja, struktur folder, data contoh, teknologi)
4. **Rancangan, SOP, aturan kewenangan** (banyak berstatus draf)
5. **Handoff dan STATUS**: kondisi terkini (bukan aturan)

Perubahan pedoman hanya lewat `KEPUTUSAN:` owner yang dicatat; tidak ada perubahan diam-diam.

## 2. Siklus Tiap Tahap

```
Lembar Tahap -> SETUJU -> Bangun -> Evaluasi -> Patch -> Handoff + STATUS
```

| Langkah | Isi | Keluaran |
|---|---|---|
| **Lembar Tahap** | Dasar kerja tahap: tujuan, rujukan wajib, ID kebutuhan (KB), batas cakupan, kriteria selesai, gate, dokumen audit terdampak, placeholder yang dipakai | `docs/handoff/LEMBAR_TAHAP-<nomor>_<judul>.md` |
| **SETUJU** | Owner menyetujui Lembar Tahap | Mulai membangun |
| **Bangun** | Mengerjakan hanya yang ada di Lembar Tahap | Berkas tahap |
| **Evaluasi** | Daftar periksa standar desain, uji, pencocokan RTM, tinjau register risiko, `audit-check` | Laporan evaluasi di handoff |
| **Patch** | Skrip PowerShell: gate, add, commit, push (dijalankan owner) | `scripts/patch/tahap-<nomor>.ps1` |
| **Handoff + STATUS** | Serah terima tahap dan pembaruan `STATUS.md` | Berkas handoff |

**Ringan untuk sub-langkah kecil:** tahap besar (1.1, 1.2, ...) wajib Lembar Tahap penuh. Perbaikan kecil/koreksi cukup 3 baris di Register Koreksi (bagian 5).

## 3. Isi Lembar Tahap (templat: `docs/handoff/_TEMPLATE_LEMBAR_TAHAP.md`)

Tujuan, rujukan wajib (berkas dan bagian), ID `KB` yang dikerjakan, **di luar cakupan** (yang sengaja tidak dikerjakan), kriteria selesai yang dapat diperiksa, gate yang berlaku, dokumen audit yang diperbarui, data contoh yang dipakai, risiko khusus.

## 4. Perintah Owner (bahasa singkat)

| Perintah | Arti | Yang dilakukan asisten |
|---|---|---|
| `STATUS` | Minta ringkasan | Membaca `STATUS.md`, melaporkan kondisi dan langkah berikutnya |
| `LANJUT` | Lanjutkan | Membaca `STATUS.md`, mengerjakan langkah berikutnya sesuai siklus (mulai dari Lembar Tahap bila tahap baru) |
| `TAHAP <n>` | Mulai tahap | Menerbitkan Lembar Tahap untuk disetujui |
| `SETUJU` | Setujui Lembar Tahap | Mulai membangun |
| `EVALUASI` | Minta evaluasi | Menjalankan daftar periksa dan melaporkan hasilnya jujur |
| `KEPUTUSAN: ...` | Catat keputusan owner | Menulis ke `KEPUTUSAN.md`, menyesuaikan pedoman terdampak |
| `KOREKSI: ...` | Koreksi (dari owner atau Kabag) | Memproses lewat Register Koreksi (bagian 5) |
| `UBAH: ...` | Ubah arah/aturan | Memeriksa terhadap pedoman; bila melanggar, memberi peringatan dan dua pilihan (ubah pedoman secara resmi, atau catat pengecualian) |

### Sesi baru atau konteks panjang
Ketik: **"Baca CLAUDE.md dan STATUS.md, lalu LANJUT."** Seluruh konteks tersimpan di berkas, bukan di ingatan percakapan.

### Bila perintah bertabrakan dengan pedoman
Asisten **tidak** mengikutinya diam-diam. Asisten menyebut aturan yang terlanggar, lalu owner memilih: (a) mengubah pedoman (`KEPUTUSAN:`), atau (b) mencatat pengecualian bertanggal di `KEPUTUSAN.md`.

## 5. Penanganan Koreksi (agar struktur proyek tidak rusak)

Koreksi dari owner atau Kabag Protokol **tidak langsung mengubah berkas sembarang**. Prosedur:

1. **Catat** di `docs/perubahan/REGISTER_KOREKSI.md` (ID `KOR-xxx`, sumber, isi, tanggal).
2. **Klasifikasi** ke salah satu jenis, yang menentukan *tempat* perubahan:

| Jenis | Contoh | Diubah di mana (tidak mengubah struktur) |
|---|---|---|
| **A. Teks/label/isi dokumen** | Istilah, urutan, kalimat | Berkas dokumen terkait |
| **B. Data dan aturan** | Nama pejabat, aturan kewenangan, tenggat, jenis kegiatan, tabel waktu tempuh | **Berkas data** di `data/` atau tabel konfigurasi (bukan kode) |
| **C. Fitur/perilaku baru** | Kolom baru, layar baru, status baru | Kebutuhan baru di RTM (`KB-xxx`), lalu Lembar Tahap |
| **D. Struktur/arsitektur** | Pindah folder, ganti tumpukan, ubah model data besar | Wajib `KEPUTUSAN:` dan ADR baru; tidak dikerjakan diam-diam |

3. **Analisis dampak**: dokumen, RTM, kode, uji, dan data contoh yang tersentuh dicatat di register.
4. **Kerjakan** pada tahap berjalan (jenis A, B) atau jadwalkan (C, D), lalu tutup koreksi dengan menunjuk commit/handoff.

**Antisipasi sejak rancangan (agar koreksi umum cukup jenis A atau B):**
- Nama, jabatan, hak akses, aturan kewenangan, tenggat, jenis kegiatan, dan label status disimpan sebagai **data/konfigurasi**, bukan tertanam di kode.
- Peran dibuat berdasarkan jabatan, bukan nama orang.
- Teks antarmuka berada di satu berkas teks (siap diganti istilahnya).
- Struktur folder dibekukan (lihat `FOLDER_STRUKTUR.md`); tambahan hanya di tempat yang sudah disediakan.
- Penamaan berkas konsisten sehingga skrip dan dokumen tidak putus rujukan.

## 6. Evaluasi (apa yang diperiksa tiap tahap)

1. Gate: lint, test, build, `audit-check`.
2. Daftar periksa standar desain (`STANDAR_DESAIN.md` bagian 8) bila ada tampilan.
3. Pencocokan **RTM**: setiap `KB` yang dijanjikan di Lembar Tahap memiliki uji; status diperbarui.
4. Tinjauan **register risiko**.
5. Pemeriksaan **placeholder**: tidak ada data contoh yang menyamar sebagai nyata; `DAFTAR_PLACEHOLDER.md` mutakhir.
6. Pemeriksaan **struktur folder**: tidak ada berkas di luar tempat yang ditetapkan.
7. Evaluasi owner: peragaan singkat memakai mode demo (bagian 4 standar data contoh).

## 7. Audit

Audit mengikuti `docs/audit/DAFTAR_DOKUMEN_AUDIT.md`. Dokumen berbasis placeholder berstatus **Placeholder**, bukan Ada, sampai diganti data asli.

## 8. Kontinuitas dan Hemat Kuota

- `STATUS.md` diperbarui di **setiap patch** (satu halaman).
- Handoff dibuat di akhir tahap, dan diperbarui otomatis tiap lebih dari 5 chat dalam satu sesi.
- Jawaban ringkas; satu perintah PowerShell siap salin per patch.
- Jangan mengulang pekerjaan yang sudah diverifikasi.
