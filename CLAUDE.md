# SIAP MALUT: Aturan Kerja Proyek (wajib dibaca setiap sesi)

Proyek: Sistem Informasi Administrasi Pimpinan Maluku Utara (Biro Adpim Setda Prov. Maluku Utara).
Repo: `fahmialhabsi/SIAP_MALUT`. Bahasa dokumen dan antarmuka: Bahasa Indonesia baku.

## Mulai di sini (setiap sesi baru atau konteks panjang)

1. Baca `CLAUDE.md` ini, lalu **`STATUS.md`** (kondisi terkini, langkah berikutnya, keputusan terbuka).
2. Pedoman lengkap: `docs/standar/CARA_KERJA.md`. Log keputusan owner: `docs/keputusan/KEPUTUSAN.md`.
3. Urutan pedoman bila bertabrakan: **keputusan owner > CLAUDE.md > standar > rancangan/SOP > handoff/STATUS**.
4. Perintah owner yang dikenali: `STATUS`, `LANJUT`, `TAHAP <n>`, `SETUJU`, `EVALUASI`, `KEPUTUSAN: ...`, `KOREKSI: ...`, `UBAH: ...` (arti: `CARA_KERJA.md` bagian 4).
5. Bila perintah owner bertabrakan dengan pedoman: jangan diikuti diam-diam; sebut aturan yang terlanggar dan tawarkan (a) ubah pedoman resmi lewat `KEPUTUSAN:` atau (b) catat pengecualian.

## Peta folder

Struktur folder **dibekukan** dan dirinci di `docs/standar/FOLDER_STRUKTUR.md`. Tambah, jangan pindah. Dilarang membuat folder tingkat atas baru tanpa keputusan owner. Ringkasan: `docs/` (rancangan, standar, sop, keputusan, perubahan, handoff, audit, rekayasa, mutu, keamanan, operasi, pengguna), `apps/` (web, api), `packages/` (domain, shared), `data/contoh/`, `src/styles/`, `scripts/` (gate, audit-check, patch).

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
- **Pra-verifikasi gate lokal** (tanpa commit/push) oleh Claude diperbolehkan bila disetujui owner di Lembar Tahap (KP-012); Claude hanya melaporkan ringkasan hasil, dan owner tetap menjalankan patch.
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
- Tidak ada data nyata sampai Tahap P (penggantian data contoh); lihat Aturan 11.
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

## Aturan 10: Siklus tahap dan dasar kerja

Setiap tahap besar mengikuti: **Lembar Tahap → SETUJU → Bangun → Evaluasi → Patch → Handoff + STATUS** (`CARA_KERJA.md`). Jangan membangun sebelum Lembar Tahap disetujui owner. Kerjakan hanya yang ada di Lembar Tahap; hal lain masuk Register Koreksi. `STATUS.md` diperbarui di setiap patch.

## Aturan 11: Data contoh dan placeholder (keputusan KP-005 s.d. KP-007)

Kabag Protokol meminta pembangunan mandiri dengan placeholder. Karena itu: **tidak ada data orang nyata** (nama, telepon, NIP, ID rapat, sandi) di repo; semua data berlabel "CONTOH" di `data/contoh/`; peran berdasarkan jabatan; owner = admin (`admin.owner`); mode `demo` dengan pindah tampilan peran hanya di demo; produksi menolak data contoh. Rincian: `docs/standar/STANDAR_DATA_CONTOH.md`. Daftar placeholder: `docs/audit/DAFTAR_PLACEHOLDER.md` (diperbarui tiap tahap). Dokumen berbasis placeholder berstatus **Placeholder**, bukan Ada.

## Aturan 12: Antisipasi koreksi, struktur tidak boleh rusak (KP-010)

Koreksi dari owner atau Kabag Protokol **dicatat dahulu** di `docs/perubahan/REGISTER_KOREKSI.md`, diklasifikasi A (teks), B (data/aturan), C (fitur baru), D (struktur/arsitektur), lalu dikerjakan di tempat yang sesuai tanpa mengubah struktur (`CARA_KERJA.md` bagian 5). Jenis D wajib `KEPUTUSAN:` dan ADR baru. Sejak rancangan, hal yang rawan berubah (nama, jabatan, hak akses, aturan kewenangan, tenggat, jenis kegiatan, label status, istilah antarmuka) disimpan sebagai **data/konfigurasi**, bukan tertanam di kode. Memindah atau mengganti nama berkas yang dirujuk hanya lewat jenis D, dengan semua rujukan diperbarui dalam satu patch dan `audit-check` lolos.

## Aturan 13: Kontinuitas

Handoff di akhir tahap dan otomatis tiap lebih dari 5 chat (Aturan 5); `STATUS.md` di setiap patch; keputusan owner dicatat di `KEPUTUSAN.md` begitu diucapkan. Informasi penting tidak boleh hanya hidup di percakapan.
