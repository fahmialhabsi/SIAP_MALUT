# Panduan Pengguna SIAP MALUT (Draf, Tahap 1.4a)

| | |
|---|---|
| Status | **Draf**: baru memuat fitur baca (Tahap 1.4a). Fitur tindakan (undangan, keputusan kehadiran, lampiran) ditambahkan setelah Tahap 1.4b. |
| Data | Semua contoh di panduan ini fiktif dan berlabel CONTOH. |
| Tangkapan layar | `docs/audit/bukti-gate/tangkapan-1.4a/` (dihasilkan uji ponsel otomatis, lebar 360 px dan 412 px, mode terang dan gelap). |
| Daftar induk | PG-01 |

## 1. Membuka aplikasi
- Buka alamat aplikasi di peramban ponsel (Chrome atau Safari). Pada saat pengembangan, alamat yang dicetak `npm run dev:lan`.
- Masuk dengan **nama pengguna** dan **kata sandi**. Gunakan tombol mata untuk melihat kata sandi yang diketik.
- Pita kuning **DATA CONTOH: bukan data resmi** menandakan mode demo. Seluruh data bukan data resmi.
- Setelah 5 kali salah, akun dikunci sementara 15 menit.

## 2. Menu bawah
Menu bawah hanya menampilkan butir yang boleh Anda pakai:

| Butir | Isi | Siapa |
|---|---|---|
| Beranda | Ringkasan sesuai peran | Semua |
| Agenda | Kegiatan per hari | Peran yang boleh membaca kegiatan |
| Bentrok | Daftar bentrok jadwal | Peran yang boleh membaca bentrok |
| Akun | Data akun, tampilan terang/gelap, keluar | Semua |

## 3. Beranda menurut peran
| Peran | Yang tampil |
|---|---|
| Kabag Protokol | Ringkasan status, yang perlu ditetapkan dalam 3 hari, bentrok, agenda hari ini |
| Petugas Protokol | Yang perlu ditetapkan dalam 3 hari, bentrok, agenda hari ini |
| Ajudan | Yang menunggu arahan, agenda hari ini, bentrok |
| Pimpinan | Yang menunggu arahan, agenda saya, bentrok |
| Pejabat | Penugasan yang menunggu konfirmasi saya, agenda saya |
| Kepala Biro dan Administrator | Ringkasan status, bentrok, agenda hari ini |

Susunan ini **usulan sementara** (placeholder PH-11) dan dapat diubah setelah ditinjau Kabag Protokol.

## 4. Agenda
1. Buka **Agenda**. Layar dimulai pada **hari ini** (waktu WIT).
2. Gunakan panah, pemilih tanggal, atau jalur tujuh hari untuk berpindah hari. Titik pada jalur menandai hari yang berisi kegiatan; titik merah menandai bentrok.
3. Tombol **Ke tanggal data contoh** membuka 26 Oktober 2026 (hari dengan bentrok pada data contoh).
4. Ketuk kartu untuk melihat rincian. Status dan bentrok selalu ditulis dengan ikon dan teks.

## 5. Rincian kegiatan
Memuat waktu (WIT), lokasi, penyelenggara, PIC, pihak yang diundang beserta kedudukannya, peringatan bentrok, lampiran (bila berhak), dan riwayat perubahan (Kepala Biro dan Administrator). Tautan rapat hanya tampil bagi pihak yang ditugaskan atau peran yang berhak.

## 6. Bentrok
Daftar dikelompokkan menurut tanggal. **Bentrok pasti** berarti dua kegiatan beririsan pada pihak yang sama; **potensi bentrok** berarti satu sumber daya (mis. kendaraan, ajudan) dipakai dua kegiatan. Bentrok adalah peringatan, bukan larangan: kegiatan tetap dapat ditetapkan dengan alasan tertulis (Tahap 1.4b).

## 7. Akun, tema, dan keluar
Pilih tampilan **Ikuti perangkat**, **Terang**, atau **Gelap**. Tombol **Keluar** mengakhiri sesi di server.

## 8. Khusus Administrator pada mode demo
Pita **Lihat sebagai...** memilih salah satu persona untuk melihat tampilan peran itu. Pita menunjukkan siapa yang sedang dilihat; tombol **Kembali ke akun asli** mengembalikan tampilan. Setiap perpindahan tercatat di log audit.
