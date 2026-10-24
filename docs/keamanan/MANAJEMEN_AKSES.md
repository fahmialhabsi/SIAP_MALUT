# Manajemen Akses (KM-05)

**Versi:** Tahap 1.3b. Mencerminkan kode saat ini. Bagian **belum** diisi menyusul pada tahap berikutnya.

## 1. Siklus Akun
| Langkah | Saat ini | Catatan |
|---|---|---|
| Pembuatan akun | Hanya lewat seed data contoh (mode demo) dan `admin.owner` | **Belum ada** fitur admin untuk membuat/menonaktifkan akun lewat aplikasi; impor akun asli dirancang di Tahap P (KB-035) |
| Kata sandi awal | `admin.owner`: dari `SIAP_ADMIN_PASSWORD` atau acak (tercetak sekali). Persona demo: tanpa kata sandi (tidak dapat masuk; hanya dipakai admin lewat pindah tampilan) | Tidak pernah disimpan di repo |
| Penggantian sandi | `npm run admin:sandi` (hentikan server dulu); tercatat di log audit | Penggantian oleh pengguna sendiri **belum ada** |
| Penonaktifan | Kolom `pengguna.aktif`; sesi aktif langsung ditolak (diuji) | Antarmuka admin belum ada |
| Penguncian | Otomatis 15 menit setelah 5 gagal beruntun; dapat dibuka dengan `admin:sandi` untuk admin | Pembukaan kunci akun lain lewat admin: belum ada |

## 2. Peran dan Izin
Matriks peran × izin disimpan sebagai data (tabel `peran_izin`), sumber nilai awal `data/contoh/hak-akses.json`, ditampilkan di `docs/rekayasa/MATRIKS_HAK_AKSES.md` (**PLACEHOLDER**, PH-05). Kewenangan menetapkan matriks: Kepala Biro bersama Sekda (KT-04, Tahap P). Perubahan matriks saat ini hanya lewat berkas data lalu seed ulang pada basis data baru; **belum ada** antarmuka ubah matriks (perubahan akan memakai log audit).

## 3. Peninjauan Akses Berkala (PM-02)
Prosedur yang direncanakan: tiap triwulan admin mengekspor daftar akun aktif beserta perannya dan tindakan terakhir (dari `log_audit`), pemilik proses mengonfirmasi, kelebihan hak dicabut dan dicatat. **Fitur ekspor belum ada**; log audit dapat dibaca lewat `GET /api/audit` (admin, kepala biro).

## 4. Pemisahan Tugas
Pembuatan kegiatan, penetapan kehadiran, dan perubahan pengaturan dipisahkan peran (lihat matriks): mis. pengaturan hanya admin; log audit hanya admin dan kepala biro; pejabat hanya mengonfirmasi penugasan dirinya.

## 5. Akses Istimewa
- Admin dapat berpindah persona hanya pada mode demo; setiap perpindahan dan tindakan sebagai persona tercatat dengan aktor ganda (`admin.owner (sebagai demo.x)`).
- Akses basis data langsung (superuser) berada di luar aplikasi; mitigasinya di `LOG_AUDIT.md` bagian 5 dan paket serah terima.

## 6. Bukti
`apps/api/src/auth.test.ts`, `rbac.test.ts`, `demo.test.ts`; `GET /api/audit`; `docs/rekayasa/MATRIKS_HAK_AKSES.md`.
