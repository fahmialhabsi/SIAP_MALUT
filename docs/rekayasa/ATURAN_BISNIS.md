# Aturan Bisnis Agenda (RK-07)

**Versi:** Tahap 1.2. Ditegakkan oleh `packages/domain` dan diuji otomatis (nama uji memuat ID KB). Nilai yang dapat berubah (durasi bawaan, jenis, tenggat) berasal dari konfigurasi/data, bukan kode (CLAUDE.md Aturan 12). Aturan ini berstatus **usulan** sampai dikonfirmasi Kabag Protokol (KT-03).

## 1. Istilah

| Istilah | Arti |
|---|---|
| Pimpinan | Gubernur, Wakil Gubernur, Sekda |
| Pejabat | Asisten, Kepala OPD/Biro, dan sejenisnya |
| Petugas | Staf pelaksana (protokol, dokumentasi, dan sejenisnya) |
| Kedudukan pihak | `diundang` (undangan ditujukan, belum diputuskan), `ditugaskan` (sudah ditetapkan hadir), `diterima` (kehadiran terkonfirmasi; pimpinan yang memutuskan hadir sendiri langsung `diterima`), `ditolak` (tidak hadir/dilepas) |
| Waktu | ISO 8601 beserta zona; WIT = +09:00. Interval setengah terbuka [mulai, selesai) |

## 2. Aturan Bentrok (KB-008, KB-010, KB-038, KB-039)

| No | Aturan | Uji |
|---|---|---|
| B1 | Dua kegiatan **aktif** bentrok bila intervalnya beririsan dan ada pihak yang sama (kedudukan bukan `ditolak`) di keduanya | `KB-008` |
| B2 | Bersinggungan (selesai 20.00, mulai 20.00) **bukan** bentrok | `KB-008` |
| B3 | Kegiatan berstatus `dibatalkan`, `ditunda`, atau `selesai` tidak dihitung | `KB-008` |
| B4 | **Jenis**: `langsung` bila pihak berupa pimpinan; `sumber_daya` bila pejabat atau petugas | `KB-008`, `KB-010` |
| B5 | **Kepastian**: `pasti` bila kedudukan pihak di kedua kegiatan `ditugaskan`/`diterima`; `potensi` bila salah satunya baru `diundang` | `KB-008`, `KB-010` |
| B6 | Bila jam selesai kosong dipakai **durasi bawaan** dari konfigurasi (nilai awal **120 menit**); nilai wajib positif | `KB-039` |
| B7 | Bentrok adalah **peringatan, bukan pemblokiran** | `KB-038` |
| B8 | Dua pimpinan berbeda pada acara berbeda tidak bentrok; kegiatan tidak bentrok dengan dirinya | `KB-008` |
| B9 | Hasil terurut dan deterministik | `KB-008` |
| B10 | Waktu tanpa zona atau format salah ditolak; selesai harus setelah mulai | `KB-008` |

Di luar cakupan 1.2: bentrok perjalanan antarlokasi/pulau (KB-009, Tahap 2).

## 3. Aturan Perpindahan Status (KB-004, KB-016, KB-038)

Diagram dan tabel perpindahan: `ALUR_PROSES.md` (dihasilkan dari kode). Syarat tiap tujuan:

| Ke status | Syarat | Uji |
|---|---|---|
| Menunggu Arahan | Judul tidak kosong; waktu mulai valid | `KB-004` |
| Ditetapkan | Minimal satu pihak `ditugaskan` atau `diterima`. Bila ada **bentrok pasti** dengan kegiatan lain: wajib `alasanBentrok`; bentrok **potensi** hanya peringatan | `KB-004`, `KB-038` |
| Terkonfirmasi | Minimal satu pihak `diterima`; tidak ada pejabat/petugas yang masih `ditugaskan` (belum konfirmasi) | `KB-004` |
| Ditunda, Dibatalkan | `alasan` wajib diisi | `KB-004` |
| Lainnya | Cukup perpindahan sah menurut tabel | `KB-004` |

Setiap perpindahan sukses menghasilkan **catatan peristiwa** (kegiatan, dari, ke, oleh, waktu, alasan, alasan bentrok, bentrok yang diketahui) dan mengembalikan kegiatan baru tanpa mengubah masukan (`KB-016`). Penyimpanan catatan ke log audit aplikasi dikerjakan di Tahap 1.3.

## 4. Contoh dari Agenda Protokol (difiktifkan; `data/contoh/agenda-uji.json`)

| Contoh | Hasil yang diharapkan (uji) |
|---|---|
| 22 Okt, durasi bawaan 2 jam | Tidak ada bentrok |
| 22 Okt, durasi 3 jam | 1 bentrok pasti: Wagub (upacara dan pangan murah) |
| 24 Okt 20.00 | 1 bentrok potensi: Wagub (diundang di acara adat, ditugaskan di hari puncak); makan malam selesai 20.00 tidak bentrok |
| 26 Okt | 12 bentrok pimpinan (potensi: 3 pimpinan × 4 pasangan kegiatan) dan 1 bentrok petugas (pasti) |
| Seluruh agenda uji | 14 bentrok, tidak ada lintas hari |

## 5. Pertanyaan untuk Kabag Protokol (KT-03)

1. Apakah durasi bawaan 2 jam sesuai? Apakah berbeda per jenis kegiatan?
2. Apakah "bentrok pasti" cukup diberi alasan, atau harus disetujui oleh pihak tertentu?
3. Apakah syarat terkonfirmasi (menunggu konfirmasi pejabat/petugas) sesuai praktik?
4. Apakah ada status lain yang dibutuhkan (mis. "Perlu Dijadwalkan Ulang")?
