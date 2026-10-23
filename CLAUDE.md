# SIAP MALUT: Aturan Kerja Proyek (wajib dibaca setiap sesi)

Proyek: Sistem Informasi Administrasi Pimpinan Maluku Utara (Biro Adpim Setda Prov. Maluku Utara).
Repo: `fahmialhabsi/SIAP_MALUT`. Bahasa dokumen dan antarmuka: Bahasa Indonesia baku.

## Peta folder

| Folder | Isi |
|---|---|
| `docs/rancangan/` | Rancangan awal (PDF asli dan `.md` yang dipelihara) |
| `docs/standar/` | Standar wajib (desain, dan standar lain yang menyusul) |
| `docs/sop/` | Draf dan SOP layanan biro |
| `scripts/` | `gate.ps1` (gate npm) dan `scripts/patch/tahap-<nomor>.ps1` (patch per tahap) |
| `docs/handoff/` | Catatan serah terima per tahap (`HANDOFF_TAHAP-<nomor>_<judul>.md`) |
| `src/styles/` | `design-tokens.css`: sumber tunggal token desain |
| `src/` | Kode aplikasi (menyusul pada Tahap 1) |

Berkas ditaruh di folder yang sesuai dengan peta ini. Folder baru dicatat di tabel ini pada tahap yang sama.

## Aturan 1: Standar desain wajib

Setiap merancang atau membangun tampilan WAJIB mengikuti `docs/standar/STANDAR_DESAIN.md` dan memakai token di `src/styles/design-tokens.css`. Dilarang menulis warna, ukuran font, atau jarak langsung di komponen. Jalankan daftar periksa bagian 8 standar sebelum menyatakan tahap selesai.

## Aturan 2: Handoff setiap tahap selesai

Setiap tahap pekerjaan yang selesai WAJIB dibuatkan handoff, memakai `docs/handoff/_TEMPLATE_HANDOFF.md`, disimpan langsung di `docs/handoff/`. Isi minimal: tujuan, yang dikerjakan, berkas yang berubah, keputusan, hal yang belum selesai atau belum diverifikasi, risiko, dan langkah berikutnya. Handoff jujur: yang belum diuji ditulis belum diuji.

## Aturan 3: Gate, commit, dan push per tahap lewat PATCH (dijalankan owner)

**Berlaku sejak Tahap 0.3.** Untuk menghemat kuota harian owner, Claude **tidak menjalankan** gate, `git add`, `git commit`, dan `git push` sendiri. Claude menulis semua berkas tahap, lalu **menerbitkan patch lengkap** yang dijalankan owner di Windows PowerShell.

Patch per tahap wajib berupa satu skrip: `scripts/patch/tahap-<nomor>.ps1`, yang berurutan:

1. Pindah ke akar repo (berdasarkan lokasi skrip).
2. Menjalankan **gate**: `scripts/gate.ps1` (`npm run lint`, `npm test`, `npm run build`). Selama belum ada `package.json`, gate npm dilewati dengan pesan jelas. Setelah ada kode, gate **wajib** dan skrip berhenti bila ada yang gagal.
3. `git add` hanya berkas tahap (bukan `git add -A` buta bila ada berkas lain tak terkait).
4. `git commit` dengan pesan `<jenis>(<cakupan>): <ringkasan>. Tahap <nomor>` dan baris `Co-Authored-By`.
5. `git push` ke `origin` (`fahmialhabsi/SIAP_MALUT`).

Setiap kali menyelesaikan tahap, Claude **langsung** memberi owner: (a) nama skrip patch, (b) satu perintah PowerShell untuk menjalankannya, (c) hasil yang diharapkan. Tidak perlu diminta.

- Pesan commit jenis: `docs`, `feat`, `fix`, `refactor`, `chore`.
- Dilarang memasukkan rahasia (kata sandi, token, kunci API, `.env`), data pribadi nyata, atau meeting ID/sandi rapat ke repo. Contoh data memakai data fiktif.
- Dilarang `--force`, `--no-verify`, dan menimpa riwayat tanpa izin eksplisit owner.
- Claude hanya menjalankan commit/push sendiri bila owner memintanya secara eksplisit pada tahap itu.
- Skrip patch sendiri harus lolos pemeriksaan sintaks sebelum diserahkan; Claude melaporkan bila belum diuji berjalan.

## Aturan 4: Prinsip dari rancangan

Satu platform, tiga bagian, tujuh modul, satu basis data. Aplikasi pendukung, bukan pengganti surat resmi. Integrasi (SRIKANDI, e-Office, BSrE) alih-alih duplikasi. Rancangan utuh: `docs/rancangan/Rancangan_Awal_Sistem_Aplikasi_Biro_Adpim_Malut.md` (Bab XI memuat modul M1+ agenda dan penugasan pengganti).

## Aturan 5: Perbarui handoff otomatis setelah 5 chat

Dalam satu sesi, bila percakapan sudah **lebih dari 5 chat** (pesan dari owner), Claude **wajib langsung memperbarui handoff** tahap berjalan tanpa diminta: status terkini, berkas yang berubah, keputusan baru, yang belum selesai, dan langkah berikutnya. Setelah itu perbarui lagi setiap kelipatan 5 chat berikutnya. Pembaruan handoff ini ikut dimasukkan ke patch tahap yang berjalan.

## Aturan 6: Hemat kuota owner

Jawaban ringkas, tanpa mengulang isi berkas yang sudah disimpan. Satu perintah PowerShell siap salin per patch. Tidak menjalankan ulang pekerjaan yang sudah diverifikasi.

## Aturan 7: Keputusan yang bukan milik pengembang

Aturan kewenangan mewakili, siapa yang memegang akun, dan kegiatan yang tayang publik ditetapkan Biro bersama Sekda, bukan ditebak. Tulis sebagai asumsi di handoff bila belum dikonfirmasi.
