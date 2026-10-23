# SIAP MALUT: Aturan Kerja Proyek (wajib dibaca setiap sesi)

Proyek: Sistem Informasi Administrasi Pimpinan Maluku Utara (Biro Adpim Setda Prov. Maluku Utara).
Repo: `fahmialhabsi/SIAP_MALUT`. Bahasa dokumen dan antarmuka: Bahasa Indonesia baku.

## Peta folder

| Folder | Isi |
|---|---|
| `docs/rancangan/` | Rancangan awal (PDF asli dan `.md` yang dipelihara) |
| `docs/standar/` | Standar wajib (desain, dan standar lain yang menyusul) |
| `docs/handoff/` | Catatan serah terima per tahap (`HANDOFF_TAHAP-<nomor>_<judul>.md`) |
| `src/styles/` | `design-tokens.css`: sumber tunggal token desain |
| `src/` | Kode aplikasi (menyusul pada Tahap 1) |

Berkas ditaruh di folder yang sesuai dengan peta ini. Folder baru dicatat di tabel ini pada tahap yang sama.

## Aturan 1: Standar desain wajib

Setiap merancang atau membangun tampilan WAJIB mengikuti `docs/standar/STANDAR_DESAIN.md` dan memakai token di `src/styles/design-tokens.css`. Dilarang menulis warna, ukuran font, atau jarak langsung di komponen. Jalankan daftar periksa bagian 8 standar sebelum menyatakan tahap selesai.

## Aturan 2: Handoff setiap tahap selesai

Setiap tahap pekerjaan yang selesai WAJIB dibuatkan handoff, memakai `docs/handoff/_TEMPLATE_HANDOFF.md`, disimpan langsung di `docs/handoff/`. Isi minimal: tujuan, yang dikerjakan, berkas yang berubah, keputusan, hal yang belum selesai atau belum diverifikasi, risiko, dan langkah berikutnya. Handoff jujur: yang belum diuji ditulis belum diuji.

## Aturan 3: Commit dan push per tahap

Setiap tahap pekerjaan, setelah handoff dibuat: **commit lalu push** ke `origin` (`fahmialhabsi/SIAP_MALUT`), satu commit (atau satu rangkaian commit) per tahap, termasuk berkas handoff-nya.

- Pesan commit: `<jenis>(<cakupan>): <ringkasan>` (jenis: `docs`, `feat`, `fix`, `refactor`, `chore`), diakhiri `Tahap <nomor>`.
- Dilarang memasukkan rahasia (kata sandi, token, kunci API, `.env`), data pribadi nyata, atau meeting ID/sandi rapat ke repo. Contoh data memakai data fiktif.
- Dilarang `--force`, `--no-verify`, dan menimpa riwayat tanpa izin eksplisit pengguna.
- Bila push gagal, laporkan apa adanya; jangan mengaku selesai.

## Aturan 4: Prinsip dari rancangan

Satu platform, tiga bagian, tujuh modul, satu basis data. Aplikasi pendukung, bukan pengganti surat resmi. Integrasi (SRIKANDI, e-Office, BSrE) alih-alih duplikasi. Rancangan utuh: `docs/rancangan/Rancangan_Awal_Sistem_Aplikasi_Biro_Adpim_Malut.md` (Bab XI memuat modul M1+ agenda dan penugasan pengganti).

## Aturan 5: Keputusan yang bukan milik pengembang

Aturan kewenangan mewakili, siapa yang memegang akun, dan kegiatan yang tayang publik ditetapkan Biro bersama Sekda, bukan ditebak. Tulis sebagai asumsi di handoff bila belum dikonfirmasi.
