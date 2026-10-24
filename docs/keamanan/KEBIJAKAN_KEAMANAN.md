# Kebijakan Keamanan Informasi Aplikasi SIAP MALUT (KM-01)

**Versi:** Tahap 1.3b (draf kebijakan yang dijalankan aplikasi dan tim pembangun). **Belum disahkan** pimpinan (KT-04). Rujukan regulasi (SPBE, UU 27/2022, standar BSSN, ISO/IEC 27001) wajib diverifikasi sebelum dikutip sebagai dasar. Rancangan teknis: `docs/rekayasa/DESAIN_KEAMANAN.md`.

## 1. Tujuan dan Ruang Lingkup
Melindungi kerahasiaan, keutuhan, dan ketersediaan agenda pimpinan, data pribadi pihak, dan jejak audit pada aplikasi SIAP MALUT beserta pembangunannya.

## 2. Prinsip
1. **Hak akses minimum** menurut peran dan keterkaitan dengan kegiatan.
2. **Deny-by-default**: tindakan tanpa izin ditolak.
3. **Jejak yang tidak dapat diubah** atas tindakan yang berdampak.
4. **Tidak ada rahasia di repo atau log**: kata sandi, token, tautan rapat, kunci.
5. **Data contoh tidak menyamar sebagai nyata**; produksi menolak data contoh.
6. **Jujur tentang celah**: dicatat di register risiko, bukan disembunyikan.

## 3. Klasifikasi Data
Biasa, pribadi, rahasia, audit (per kolom di `KAMUS_DATA.md`; inventaris pribadi di `INVENTARIS_DATA_PRIBADI.md`).

## 4. Kendali Wajib
| Area | Kendali |
|---|---|
| Identitas dan akses | Akun per orang (tanpa akun bersama); kata sandi minimal 12 karakter untuk yang ditetapkan lewat lingkungan; hash scrypt; penguncian setelah 5 kegagalan; sesi 12 jam |
| Hak akses | Matriks peran × izin sebagai data, disahkan Biro bersama Sekda; perubahan tercatat; peninjauan berkala (lihat `MANAJEMEN_AKSES.md`) |
| Kriptografi | TLS wajib di produksi; kuki `Secure`; hash token sesi; rahasia hanya lewat variabel lingkungan atau pengelola rahasia |
| Pembangunan | Gate lint, test, build, `audit-check` per tahap; tinjauan lewat handoff; SBOM dan daftar lisensi per rilis; tidak ada `--no-verify`; ketergantungan dikunci |
| Operasi | Cadangan dan pemulihan terjadwal dan diuji (Tahap 2); pemantauan `/health` `/ready`; log JSON ber-`reqId` tanpa data pribadi |
| Insiden | Rencana tanggapan insiden (KM-06, Tahap 2) |
| Data pribadi | Pengumpulan seperlunya; retensi ditetapkan (KM-04); penilaian dampak (KM-03) |
| Serah terima | Paket serah terima, uji pemasangan oleh pihak ketiga, penyerahan kredensial lewat saluran aman |

## 5. Peran dan Tanggung Jawab (selama pembangunan mandiri)
| Peran | Pemegang saat ini | Tanggung jawab |
|---|---|---|
| Pemilik sistem | Owner (admin `admin.owner`, placeholder) | Menyetujui tahap, menjalankan patch, memegang kredensial |
| Pembangun | Asisten | Menulis, menguji, mendokumentasikan; tidak memegang kredensial produksi |
| Pemilik proses | Kabag Protokol (placeholder SK) | Menetapkan aturan bisnis dan kewenangan |
| Pengawas | Kepala Biro / Sekda (placeholder) | Pengesahan kebijakan dan matriks hak akses |

## 6. Pelanggaran dan Pengecualian
Pengecualian kendali dicatat di `docs/keputusan/KEPUTUSAN.md` dengan alasan, batas waktu, dan pemilik risiko.

## 7. Tinjauan
Setiap tahap (register risiko), dan sebelum peluncuran bersama hasil uji keamanan (Tahap 3).
