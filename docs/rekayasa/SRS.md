# Spesifikasi Kebutuhan Perangkat Lunak (SRS) v0.1 (TG-09)

**Status:** kerangka awal (Tahap 1.2). Sumber kebenaran kebutuhan adalah `docs/audit/MATRIKS_KETERLUSURAN.md` (RTM, ID `KB-xxx`); SRS ini mengelompokkan dan menjelaskannya, dan dilengkapi seiring tahap. Bila berbeda, RTM yang berlaku.

## 1. Tujuan dan Ruang Lingkup
SIAP MALUT mendukung Biro Administrasi Pimpinan Setda Provinsi Maluku Utara menyusun agenda pimpinan, menugaskan kehadiran, mendeteksi bentrok, dan melayani permohonan (Rancangan Bab V dan XI). Cakupan tahap saat ini: modul M1+ (agenda dan penugasan). Modul lain mengikuti peta jalan.

## 2. Pengguna dan Peran
Pimpinan (Gubernur, Wakil Gubernur, Sekda), Asisten dan Kepala OPD/Biro (pengganti), Petugas Protokol, Ajudan, Pemohon eksternal, Publik, Administrator. Hak akses per peran: `docs/rekayasa/MATRIKS_HAK_AKSES.md` (menyusul 1.3). Selama pembangunan seluruh identitas berupa data contoh (`docs/standar/STANDAR_DATA_CONTOH.md`).

## 3. Kebutuhan Fungsional (ringkas, rujuk RTM)
| Kelompok | KB | Status |
|---|---|---|
| Pencatatan undangan, lampiran, PIC, status | KB-001 sampai KB-004 | 1.2 (status), 1.3 (selebihnya) |
| Penetapan kehadiran dan penayangan agenda | KB-005, KB-006 | 1.4 |
| Deteksi bentrok | KB-008, KB-010 (1.2), KB-009 (2), KB-038, KB-039 | 1.2 |
| Pengganti sesuai kewenangan | KB-011 sampai KB-013 | 2 |
| Notifikasi dan ekspor | KB-014, KB-015 | 1.5 |
| Jejak audit | KB-016 | 1.2 (peristiwa), 1.3 (penyimpanan) |
| Permohonan layanan | KB-022 sampai KB-025 | 2 |
| Integrasi | KB-027 | 2 |

## 4. Kebutuhan Nonfungsional
Ponsel pertama dan standar desain (KB-007, KB-020, KB-021); tahan jaringan lemah dan luring terbatas (KB-018); pelindungan data pribadi (KB-019); kontainer dan konfigurasi lingkungan (KB-030); data contoh berlabel dan penjaga produksi (KB-031 sampai KB-035); kemudahan pengembangan lokal (KB-040).

## 5. Batasan dan Asumsi
Tanpa konsultasi Diskominfosan sebelum peluncuran (KP-004); data contoh sampai Tahap P (KP-006); aturan kewenangan dan SOP masih draf; tumpukan teknologi ADR-001.

## 6. Penerimaan
Setiap KB berstatus Teruji lalu Diterima (UAT, Tahap 1.6). Kriteria dan skenario UAT menyusul di `docs/mutu/UAT/`.

## 7. Riwayat
v0.1 (Tahap 1.2): kerangka. Diperbarui tiap tahap.
