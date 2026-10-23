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
| `docs/audit/` | Daftar dokumen audit, RTM, register risiko, paket serah terima (siap audit Diskominfosan, Inspektorat, BPK) |
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

Tumpukan teknologi purwarupa (TypeScript, React + Vite PWA, Fastify, PostgreSQL, Vitest, ESLint) diputuskan di `docs/standar/KEPUTUSAN_TEKNOLOGI_PURWARUPA.md`; jangan mengganti tanpa ADR baru.

Satu platform, tiga bagian, tujuh modul, satu basis data. Aplikasi pendukung, bukan pengganti surat resmi. Integrasi (SRIKANDI, e-Office, BSrE) alih-alih duplikasi. Rancangan utuh: `docs/rancangan/Rancangan_Awal_Sistem_Aplikasi_Biro_Adpim_Malut.md` (Bab XI memuat modul M1+ agenda dan penugasan pengganti).

## Aturan 5: Perbarui handoff otomatis setelah 5 chat

Dalam satu sesi, bila percakapan sudah **lebih dari 5 chat** (pesan dari owner), Claude **wajib langsung memperbarui handoff** tahap berjalan tanpa diminta: status terkini, berkas yang berubah, keputusan baru, yang belum selesai, dan langkah berikutnya. Setelah itu perbarui lagi setiap kelipatan 5 chat berikutnya. Pembaruan handoff ini ikut dimasukkan ke patch tahap yang berjalan.

## Aturan 6: Hemat kuota owner

Jawaban ringkas, tanpa mengulang isi berkas yang sudah disimpan. Satu perintah PowerShell siap salin per patch. Tidak menjalankan ulang pekerjaan yang sudah diverifikasi.

## Aturan 7: Keputusan yang bukan milik pengembang

Aturan kewenangan mewakili, siapa yang memegang akun, dan kegiatan yang tayang publik ditetapkan Biro bersama Sekda, bukan ditebak. Tulis sebagai asumsi di handoff bila belum dikonfirmasi.

## Aturan 8: Strategi pelaksanaan: bangun mandiri, serah terima saat peluncuran

**Keputusan owner (Tahap 0.5).** Untuk saat ini **jangan berkonsultasi dan jangan mengonfirmasi apa pun ke Diskominfosan** (server, domain, tumpukan, pendaftaran SPBE). Kita sendiri yang menetapkan model sistem, merancang, membangun, dan menguji sampai **siap**. Baru saat **peluncuran** sistem diserahterimakan ke Diskominfosan.

Konsekuensi yang wajib diikuti:
- Semua hal teknis (kontainer, konfigurasi, migrasi, cadangan/pemulihan, log, kesehatan sistem, keamanan) **kita siapkan dari awal**, mengikuti `docs/audit/PAKET_SERAH_TERIMA.md` bagian 2, agar pada serah terima tinggal dilampirkan.
- Jangan menulis rencana kerja yang bergantung pada persetujuan, data, atau server Diskominfosan sebelum peluncuran. Pertanyaan untuk Diskominfosan dicatat di handoff sebagai bahan serah terima, tidak diajukan sekarang.
- Jangan memakai data nyata di lingkungan produksi sebelum serah terima. Data fiktif sampai UAT; data nyata hanya di lingkungan UAT terkendali dengan persetujuan owner.
- Risiko strategi ini sudah dicatat di `docs/audit/REGISTER_RISIKO.md` (RS-14, RS-15, RS-16).

## Aturan 9: Dokumen audit adalah dokumen hidup

Sistem harus **siap diaudit Diskominfosan, Inspektorat, dan BPK**. Daftar induknya ada di `docs/audit/DAFTAR_DOKUMEN_AUDIT.md`. Aturan:
1. **Satu aplikasi, satu kebenaran.** Dokumen tidak boleh menjelaskan sesuatu yang tidak ada di aplikasi. Perubahan kode berarti dokumen terdampak diperbarui **pada tahap yang sama**.
2. **Hasilkan dari kode bila mungkin** (spesifikasi API, skema/kamus data, SBOM, laporan uji). Jangan menulis tangan yang bisa dihasilkan otomatis.
3. **Keterlusuran.** Setiap kebutuhan baru masuk `docs/audit/MATRIKS_KETERLUSURAN.md` (ID `KB-xxx`); setiap uji menyebut ID-nya.
4. **Register risiko** (`docs/audit/REGISTER_RISIKO.md`) ditinjau tiap tahap.
5. **Definisi Selesai tiap tahap:** gate lolos (termasuk `scripts/audit-check.ps1`), handoff dibuat, dokumen audit terdampak diperbarui (centang di handoff), RTM dan register risiko mutakhir, daftar induk diperbarui statusnya.
6. **Jujur tentang status** dokumen: Ada, Draf, atau Belum. Dilarang menandai Ada bila berkasnya belum ada atau belum sesuai aplikasi.
7. Jangan menyimpan rahasia atau data pribadi nyata di dokumen audit; cukup letak dan prosedurnya.
8. Rujukan regulasi dalam dokumen wajib diverifikasi di JDIH sebelum dikutip sebagai dasar resmi.
