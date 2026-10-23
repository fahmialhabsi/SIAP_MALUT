# Handoff Tahap 0.1: Rancangan Awal ke Markdown dan Tambahan Kabag Protokol

| | |
|---|---|
| Tanggal | 23 Oktober 2026 |
| Tahap | 0.1 |
| Commit | lihat `git log` (pesan berakhiran "Tahap 0.1") |
| Penyusun | Claude (Sonnet 5.5) |
| Status | Selesai, dengan butir verifikasi tersisa (bagian 7) |

## 1. Tujuan tahap
Mengubah rancangan awal dari PDF ke Markdown yang dapat dipelihara, menambahkan permintaan Kabag Protokol (penyusunan agenda, pembagian jadwal saat bentrok, pengganti sesuai kewenangan, akses ponsel), dan menyeragamkan ketidakkonsistenan.

## 2. Yang dikerjakan
- Membaca penuh Bab I–X PDF dan mengonversinya ke `.md`.
- Menambah **Bab XI (modul M1+)**: alur status 4 langkah, data kegiatan, deteksi bentrok (langsung, perjalanan, sumber daya), penugasan kehadiran dan rekomendasi pengganti, aturan kewenangan mewakili, entitas tambahan, dampak ke tahap, indikator, risiko, 7 pertanyaan terbuka.
- Menyeragamkan: "tujuh titik integrasi" (SRIKANDI dan e-Office digabung jadi satu titik) dan "empat tahap" vs Tahap 0–4 (Tahap 0 persiapan; Tahap 1–4 pengembangan).

## 3. Berkas yang dibuat atau diubah
| Berkas | Perubahan |
|---|---|
| `docs/rancangan/Rancangan_Awal_Sistem_Aplikasi_Biro_Adpim_Malut.md` | Baru (versi 1.1) |
| `docs/rancangan/Rancangan_Awal_Sistem_Aplikasi_Biro_Adpim_Malut.pdf` | Dipindah dari akar proyek, tidak diubah |
| `README.md`, `.gitignore` | Baru |

## 4. Keputusan yang diambil
- Aplikasi tetap satu platform; permintaan Kabag Protokol menjadi M1+ (bukan aplikasi terpisah).
- Rekomendasi pengganti bersifat saran; keputusan tetap pada pimpinan/Sekda.
- SRIKANDI dan e-Office digabung sebagai satu titik integrasi agar konsisten dengan "tujuh titik".

## 5. Asumsi yang belum dikonfirmasi
- Isi awal tabel aturan kewenangan mewakili (11.7) hanya ilustrasi.
- Pembagian paket M1+ per tahap (11.8) adalah usulan.
- Penggabungan SRIKANDI dan e-Office didasarkan pada pembacaan teks PDF yang rusak.

## 6. Verifikasi
| Pemeriksaan | Hasil |
|---|---|
| Seluruh bab PDF terbaca | Ya (Bab I–X dan referensi) |
| Daftar periksa standar desain | Tidak berlaku (belum ada tampilan) |

## 7. Belum selesai / belum diverifikasi
- Tabel bertanda **[disusun ulang]** (2.3, 2.4, 3.2, 4.1, 5.3, 5.5, 5.6, 5.7, 6.1, 7, 8.1, 8.2) diekstrak dari PDF yang tabelnya rusak. **Belum dicocokkan manual dengan PDF.** Tabel benchmarking 3.2 paling rentan salah.
- Gambar 2, 3, 4 pada PDF (arsitektur, alur, peta jalan) tidak ikut; hanya keterangannya.
- 7 pertanyaan terbuka di 11.10 belum dijawab Kabag Protokol.

## 8. Risiko
- Kesalahan tabel hasil rekonstruksi bisa terbawa ke SRS bila tidak dicek.

## 9. Langkah berikutnya
1. Cocokkan tabel **[disusun ulang]** dengan PDF asli.
2. Dapatkan jawaban 11.10 dari Kabag Protokol.
3. Susun draf aturan kewenangan mewakili bersama Sekda dan Asisten.

## 10. Cara melanjutkan
Buka `docs/rancangan/Rancangan_Awal_Sistem_Aplikasi_Biro_Adpim_Malut.md`, mulai dari Bab XI.
