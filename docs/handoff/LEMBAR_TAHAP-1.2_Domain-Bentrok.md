# Lembar Tahap 1.2: Logika Domain Agenda, Deteksi Bentrok, dan Status

| | |
|---|---|
| Tanggal | 23 Oktober 2026 |
| Tahap | 1.2 |
| Status | **Disetujui owner (23 Okt 2026, KP-013)**; dibangun; lihat handoff |
| Prasyarat | Patch 1.1 sudah di-push (commit `7deb345`, `main` sinkron dengan `origin`) |

## 1. Tujuan
Membangun inti logika agenda di `packages/domain` (murni, tanpa basis data/jaringan/UI): model kegiatan dan penugasan, **deteksi bentrok jam dan sumber daya**, serta **aturan perpindahan status** agenda. Diuji dengan bentuk agenda nyata Kabag Protokol yang sudah difiktifkan. Hasilnya menjadi dasar API (1.3) dan antarmuka (1.4).

## 2. Rujukan wajib
- Rancangan Bab XI: 11.2 (alur 4 langkah), 11.3 (contoh nyata), 11.4 (data kegiatan), 11.5 huruf B (deteksi bentrok)
- `docs/standar/KEPUTUSAN_TEKNOLOGI_PURWARUPA.md` bagian 4 (domain murni)
- `docs/standar/STANDAR_DATA_CONTOH.md` (data berlabel CONTOH, tanpa nama asli/ID rapat)
- `docs/standar/ATURAN_KEWENANGAN_MEWAKILI_DRAF.md` bagian 8 (contoh uji)
- `CLAUDE.md` Aturan 9, 11, 12

## 3. Kebutuhan yang dikerjakan (ID KB)
- **KB-008** bentrok jam pada pimpinan yang sama
- **KB-010** bentrok sumber daya (pejabat/petugas ganda)
- **KB-004** alur status: aturan perpindahan dan syarat (melanjutkan definisi dari 1.1)
- **KB-016** (fondasi): setiap perpindahan status menghasilkan catatan peristiwa (siapa, dari, ke, alasan) sebagai nilai kembalian murni
- **Baru (diusulkan, ditambahkan ke RTM saat SETUJU):** KB-038 bentrok bersifat peringatan, bukan pemblokiran, dan penetapan meski bentrok wajib beralasan (override tercatat); KB-039 durasi bawaan bila jam selesai kosong berupa konfigurasi, bukan angka di kode

## 4. Isi pekerjaan
| Bagian | Isi |
|---|---|
| Model | `Kegiatan` (id, judul, jenis, mulai, selesai opsional, lokasi {nama, pulau}, status, daftar pihak) dan `Pihak` (id, nama, golongan: pimpinan/pejabat/petugas, kedudukan: **diundang** atau **ditugaskan**) |
| Waktu | Waktu berupa ISO 8601 beserta zona (WIT = +09:00); irisan memakai interval setengah terbuka (acara yang selesai pukul 10.00 tidak bentrok dengan yang mulai pukul 10.00) |
| `cariBentrok(kegiatan, opsi)` | Mengembalikan daftar bentrok: pihak, dua kegiatan, rentang irisan, **jenis** (`langsung` bila pimpinan, `sumber_daya` bila pejabat/petugas), **kepastian** (`pasti` bila keduanya ditugaskan, `potensi` bila salah satunya baru diundang) |
| Pengecualian | Kegiatan `dibatalkan`, `ditunda`, dan `selesai` tidak dihitung; kegiatan yang sama tidak bentrok dengan dirinya; dua pimpinan berbeda di acara yang sama bukan bentrok |
| Durasi bawaan | Bila `selesai` kosong ("08.00 sampai selesai"), dipakai durasi bawaan dari konfigurasi (usulan 2 jam) |
| Status | `TRANSISI_STATUS` dan `bolehBerpindah(dari, ke)`; `periksaSyarat(kegiatan, ke)` mengembalikan alasan penolakan (mis. `ditetapkan` butuh ≥ 1 pihak ditugaskan; `terkonfirmasi` butuh ≥ 1 penugasan diterima); `pindahStatus(...)` mengembalikan kegiatan baru dan catatan peristiwa (tanpa mengubah data asli) |
| Data uji | `data/contoh/agenda-uji.json`: bentuk agenda 22 Okt dan 24 sampai 31 Okt 2026, **difiktifkan** ("Gubernur (CONTOH)", "Penyelenggara Contoh", tanpa ID rapat/sandi/nomor telepon) |
| Dokumen | `docs/rekayasa/ALUR_PROSES.md` (diagram status **dihasilkan dari kode** lewat `npm run docs:status`), `docs/rekayasa/ATURAN_BISNIS.md` (aturan bentrok dan status beserta contoh), `docs/rekayasa/SRS.md` v0.1 (kerangka, merujuk RTM) |

## 5. Di luar cakupan
Bentrok perjalanan antarlokasi/pulau dan tabel waktu tempuh (KB-009, Tahap 2); rekomendasi pengganti dan aturan kewenangan (KB-011, KB-012, Tahap 2); basis data, API, antarmuka, notifikasi; log audit di aplikasi (1.3).

## 6. Kriteria selesai (dapat diperiksa)
- [x] Gate lolos: lint, test, build, audit-check.
- [x] Uji bentrok: irisan sebagian, irisan penuh, bersinggungan (tidak bentrok), zona waktu berbeda, kegiatan tanpa jam selesai, status dikecualikan, dua pimpinan satu acara.
- [x] Uji dengan data contoh nyata-fiktif: bentrok **24 Okt 20.00** (Tara Noate dan HKG), **26 Okt** (penjemputan Wamen, Morotai, Tareba), dan **22 Okt tanpa bentrok** bila durasi bawaan 2 jam (kontras bila 3 jam, membuktikan durasi berasal dari konfigurasi).
- [x] Uji status: semua perpindahan sah/tidak sah (tabel penuh), syarat `ditetapkan` dan `terkonfirmasi`, catatan peristiwa, data asli tidak berubah.
- [x] Nama uji memuat ID KB; RTM diperbarui (KB-004, 008, 010, 016, 038, 039).
- [x] Diagram status di `ALUR_PROSES.md` identik dengan hasil generator (diperiksa lewat uji).
- [x] Tidak ada nama orang nyata, ID rapat, atau sandi di `data/contoh/` (diperiksa manual dan oleh uji sederhana yang menolak pola angka rapat).

## 7. Gate yang berlaku
lint, test, build, audit-check.

## 8. Dokumen audit yang dibuat atau diperbarui
RK-06 `ALUR_PROSES.md` (Ada, dihasilkan dari kode), RK-07 `ATURAN_BISNIS.md` (Ada), TG-09 `SRS.md` (Ada, v0.1 kerangka), RTM, daftar induk. Placeholder: PH-07 (agenda contoh) mulai terisi.

## 9. Koreksi yang tercakup
Tidak ada.

## 10. Risiko khusus
- Aturan "pimpinan" vs "pejabat" dan "diundang" vs "ditugaskan" adalah tafsiran saya dari dokumen Protokol; perlu dikonfirmasi Kabag di akhir (KT-03), tetapi dibuat sebagai data/konfigurasi agar mudah dikoreksi.
- Durasi bawaan memengaruhi hasil bentrok; karena itu dijadikan konfigurasi (KB-039).

## 11. Keputusan owner (terjawab, KP-013)
Durasi bawaan 2 jam; bentrok = peringatan dengan override beralasan; aturan status dikerjakan sekarang; pra-verifikasi lokal diperbolehkan. **Tambahan owner:** `npm run dev` menjalankan backend dan frontend sekaligus (KOR-002, KB-040).

### Pertanyaan semula
1. **Durasi bawaan** bila jam selesai kosong. Rekomendasi: **2 jam** (dapat diubah per jenis kegiatan nanti).
2. **Bentrok = peringatan, bukan blokir.** Rekomendasi: ya; pimpinan tetap boleh menetapkan meski bentrok dengan **alasan tercatat** (KB-038). Alternatif: bentrok pasti memblokir penetapan.
3. **Aturan status dan syarat perpindahan** dikerjakan sekarang (rekomendasi: ya), atau hanya bentrok dulu dan status menyusul.
4. **Pra-verifikasi lokal** oleh saya (gate dan, bila perlu, hasil uji ringkas) seperti 1.1 (rekomendasi: ya).


