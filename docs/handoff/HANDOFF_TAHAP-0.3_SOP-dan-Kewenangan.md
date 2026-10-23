# Handoff Tahap 0.3: Draf SOP Layanan, Aturan Kewenangan Mewakili, dan Aturan Kerja Patch

| | |
|---|---|
| Tanggal | 23 Oktober 2026 |
| Tahap | 0.3 |
| Commit | dibuat saat owner menjalankan `scripts/patch/tahap-0.3.ps1` (lihat `git log`, pesan berakhiran "Tahap 0.3") |
| Penyusun | Claude (Sonnet 5.5) |
| Status | Berkas selesai ditulis; **commit dan push menunggu owner menjalankan patch** |

## 1. Tujuan tahap
Menyusun draf SOP layanan Biro dan draf aturan kewenangan mewakili (dasar fitur rekomendasi pengganti M1+), serta menambah aturan kerja: handoff otomatis setelah 5 chat, dan patch PowerShell yang dijalankan owner untuk gate, add, commit, push.

## 2. Yang dikerjakan
- **SOP layanan (draf):** 8 layanan (L-01 sampai L-08), status tiket, langkah dan waktu per layanan, penanganan undangan mendadak, perubahan, eskalasi, akses data, daftar angka yang harus diputuskan.
- **Aturan kewenangan mewakili (draf):** prinsip, hierarki kandidat, klasifikasi tingkat acara A–D (dengan contoh dari agenda nyata), matriks pengganti minimum, matriks bidang, pengecualian, algoritma penyaringan, tiga contoh uji, tata kelola aturan, daftar validasi.
- **Aturan kerja (CLAUDE.md):** Aturan 3 diganti menjadi mekanisme patch oleh owner; Aturan 5 (handoff otomatis setelah lebih dari 5 chat); Aturan 6 (hemat kuota).
- **Skrip:** `scripts/gate.ps1` dan `scripts/patch/tahap-0.3.ps1`.
- Rujukan silang ke draf baru di Bab XI 11.7 rancangan.

## 3. Berkas yang dibuat atau diubah
| Berkas | Perubahan |
|---|---|
| `docs/sop/SOP_LAYANAN_DRAF.md` | Baru |
| `docs/standar/ATURAN_KEWENANGAN_MEWAKILI_DRAF.md` | Baru |
| `CLAUDE.md` | Aturan 3 diganti; Aturan 5, 6 baru; peta folder |
| `docs/rancangan/…Biro_Adpim_Malut.md` | Tambah rujukan silang di 11.7 |
| `scripts/gate.ps1`, `scripts/patch/tahap-0.3.ps1` | Baru |
| `docs/handoff/HANDOFF_TAHAP-0.3_…md` | Baru (berkas ini) |

## 4. Keputusan yang diambil
- Seluruh angka tenggat selain H-7 (Jawa Timur) ditandai **[USULAN]**; tidak dianggap fakta.
- Rekomendasi pengganti memakai penyaringan berurutan (bukan pembobotan), agar mudah dijelaskan dan diaudit.
- Palet dan font disetujui owner (Tahap 0.2 dianggap disahkan oleh owner; pengesahan Kepala Biro belum).

## 5. Asumsi yang belum dikonfirmasi
- Pembagian OPD per Asisten (bagian 5 aturan kewenangan) dan daftar Staf Ahli belum diketahui.
- Klasifikasi A–D disusun dari contoh agenda; belum divalidasi Kabag Protokol.
- Semua waktu layanan SOP adalah usulan.

## 6. Verifikasi
| Pemeriksaan | Hasil |
|---|---|
| Sintaks skrip PowerShell | Diperiksa dengan parser PowerShell (lihat laporan chat) |
| `gate.ps1` dijalankan | Dijalankan; Tahap 0 melewati gate npm karena belum ada `package.json` |
| `tahap-0.3.ps1` dijalankan | **Belum** (sengaja; dijalankan owner) |
| Daftar periksa standar desain | Tidak berlaku (tidak ada tampilan) |

## 7. Belum selesai / belum diverifikasi
- L-08 (kepegawaian dan perencanaan) belum dirinci.
- Tabel rancangan bertanda **[disusun ulang]** masih belum dicocokkan dengan PDF (dari Tahap 0.1).
- `Inter-Variable.woff2` belum diunduh (dari Tahap 0.2).
- 7 pertanyaan terbuka di Bab XI 11.10 belum dijawab.

## 8. Risiko
- Bila angka usulan tenggat dipublikasikan sebelum diputuskan, pengundang bisa memegangnya sebagai aturan resmi.
- Patch gagal di tengah (mis. push ditolak) meninggalkan commit lokal; jalankan ulang `git push origin main`.

## 9. Langkah berikutnya
1. Owner menjalankan patch 0.3.
2. Bahas draf SOP dan aturan kewenangan dengan Kabag Protokol dan Sekda (butir validasi di akhir masing-masing).
3. Tahap 0.4: pemeriksaan tabel rancangan terhadap PDF, dan keputusan kerangka teknologi purwarupa (low-code vs web progresif).

## 10. Cara melanjutkan
Baca `CLAUDE.md`, lalu `docs/sop/SOP_LAYANAN_DRAF.md` bagian 8 dan 9, serta `docs/standar/ATURAN_KEWENANGAN_MEWAKILI_DRAF.md` bagian 10.
