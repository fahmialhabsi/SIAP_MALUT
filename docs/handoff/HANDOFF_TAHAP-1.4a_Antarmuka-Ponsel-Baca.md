# Handoff Tahap 1.4a: Antarmuka Ponsel (Bagian Baca), Dasbor per Peran, Persona Demo

| | |
|---|---|
| Tanggal | 24 Oktober 2026 |
| Tahap | 1.4a (bagian pertama Tahap 1.4) |
| Lembar Tahap | `docs/handoff/LEMBAR_TAHAP-1.4_Antarmuka-Ponsel.md` (disetujui, KP-016) |
| Commit | dibuat saat owner menjalankan `scripts/patch/tahap-1.4a.ps1` |
| Penyusun | Claude (Sonnet 5.5) |
| Status | Selesai dan diverifikasi lokal; commit/push menunggu owner. **Belum ada fitur tindakan** (itu 1.4b). |

## 1. Tujuan
Aplikasi dapat dipakai dari ponsel untuk **membaca**: masuk, agenda harian dan mingguan, rincian kegiatan, halaman bentrok, dasbor per peran, pemilih persona demo, tema terang/gelap; mengikuti `STANDAR_DESAIN.md`.

## 2. Yang dikerjakan
- **Fondasi:** `react-router`; klien `fetch` (`api/klien.ts`: 401 kembali ke Masuk, galat jaringan berstatus 0, galat 422 membawa rincian); **tipe API dihasilkan dari `openapi.json`** (`npm run api:tipe`, KB-049) dengan uji kesesuaian; ikon SVG sendiri; tema terang/gelap/ikuti perangkat (penyimpanan aman bila diblokir); token ikon baru (`--icon-sm/md/lg`) di `design-tokens.css`.
- **Layar:** Masuk (tombol tampil sandi, pesan salah/terkunci/jaringan); kerangka dengan **navigasi bawah menurut izin** dan spanduk DATA CONTOH; **pita persona** (hanya mode demo, admin) dengan "Lihat sebagai..." dan "Kembali ke akun asli"; **Beranda per peran** (susunan = data di `konfigurasi.ts`, PH-11); **Agenda** (mulai hari ini WIT, panah, pemilih tanggal, jalur 7 hari dengan penanda kegiatan/bentrok, tombol "Ke tanggal data contoh" 26 Okt); **Rincian kegiatan** (waktu WIT, lokasi, PIC, pihak dan kedudukan, tautan rapat bila berhak, bentrok, lampiran, riwayat audit untuk yang berizin); **Bentrok** (per tanggal, kepastian, irisan waktu, tautan kedua kegiatan); **Akun** (tema, keluar).
- **Format WIT baku** (KB-048): `Sabtu, 24 Oktober 2026`, `20.00 WIT`, tidak bergantung zona perangkat.
- **Proksi dan PWA:** Vite meneruskan juga `/health` dan `/ready`; layanan pekerja tidak mengembalikan halaman aplikasi untuk `/api`, `/health`, `/ready` (`navigateFallbackDenylist`).
- **Uji ponsel otomatis** (KB-050): Playwright + axe pada 360 px terang dan 412 px gelap terhadap aplikasi nyata; `npm run test:e2e` (di luar gate).

## 3. Berkas yang berubah (ringkas)
`apps/web/src/` (App, main, sesi, pakai-data, ikon, tema, waktu, konfigurasi, teks-ui, api/{klien,tipe,skema.d.ts}, halaman/*, komponen/*, styles/app.css, uji), `apps/web/{vite.config.ts,playwright.config.ts,e2e/*,package.json}`, `src/styles/design-tokens.css` (token ikon), `package.json`, `package-lock.json`, `eslint.config.js`, `.prettierignore`, `.gitignore`, `docs/` (lembar, KEPUTUSAN KP-016, RTM, daftar induk, risiko RS-37..39, placeholder PH-11, ARSITEKTUR 3c, PEMASANGAN 6c, RENCANA_UJI, `mutu/UJI_AKSESIBILITAS.md`, `pengguna/PANDUAN_PENGGUNA.md`, `PANDUAN_ADMIN.md`, bukti dan tangkapan layar), `scripts/patch/tahap-1.4a.ps1`, `STATUS.md`.

## 4. Hasil verifikasi (oleh asisten, lokal)
| Pemeriksaan | Hasil |
|---|---|
| Uji komponen/web (Vitest + Testing Library) | 23 uji lulus (waktu 4, tipe 1, App 18) |
| `npm run test:e2e` (Playwright + axe) | **10 dari 10 lulus** pada 360 px terang dan 412 px gelap; bukti `docs/audit/bukti-gate/e2e-tahap-1.4a-asisten.txt` dan tangkapan layar di `tangkapan-1.4a/` |
| Gate lengkap (`scripts/gate.ps1` di Windows PowerShell 5.1) | **LOLOS** (audit-check, lint, test, build): shared 12, domain 51, api 112, web 23, skrip 7 = 205 uji. Percobaan pertama gagal karena 6 uji API (PGlite, tidak diubah di 1.4a) melewati batas 120 detik saat CPU 94% terpakai proses lain; diulang, lolos. Bukti: `gate-tahap-1.4a-asisten.txt` |
| Peninjauan tangkapan layar oleh asisten | Agenda 26 Okt (terang) dan beranda pejabat (gelap) dibaca: susunan wajar, status ikon+teks |
| `tahap-1.4a.ps1` | sintaks lolos di PowerShell 5.1 dan 7; **belum dijalankan** (dijalankan owner) |

**Temuan selama pengujian (semua diperbaiki):** (a) tombol mata di dalam `<label>` membuat nama label ganda → dipisah; (b) jalur minggu 7 hari tidak muat dengan target 48 px pada 360 px → dapat digulir di dalam wadahnya; (c) penanda "CONTOH" memakai gaya lencana tanpa ikon → dibuat penanda tersendiri; (d) pita persona hilang setelah berpindah karena izin persona tidak memuat izin pindah → pita juga tampil saat persona aktif; (e) `/health` tidak diteruskan proksi dev → ditambahkan; (f) PGlite butuh ±60 detik pada start pertama, jadi uji menunggu `/api/saya`, bukan halaman web.

### Dokumen audit terdampak (Aturan 9)
- [x] `DAFTAR_DOKUMEN_AUDIT.md`: MU-08, PG-01, PG-02 menjadi **Draf**
- [x] `MATRIKS_KETERLUSURAN.md`: 11 baris diperbarui; KB-047 (1.4b), KB-048, KB-049, KB-050 baru
- [x] `REGISTER_RISIKO.md`: RS-37, RS-38, RS-39
- [x] `DAFTAR_PLACEHOLDER.md`: PH-11 terisi (usulan)
- [x] `ARSITEKTUR.md`, `PEMASANGAN.md`, `RENCANA_UJI.md`, `UJI_AKSESIBILITAS.md`, panduan pengguna dan admin (Draf)
- [x] `openapi.json` dan `MATRIKS_HAK_AKSES.md`: tidak berubah (belum ada rute baru; rute baru di 1.4b)
- [x] SBOM dibangkitkan oleh patch

## 5. Keputusan dan asumsi
- Susunan dasbor per peran (PH-11) adalah **tafsiran saya**; perlu ditinjau Kabag Protokol. Disimpan sebagai data agar koreksi tidak mengubah struktur.
- Agenda memuat seluruh kegiatan yang boleh dibaca lalu menyaring di peramban (RS-39); cukup untuk data contoh.
- "Perlu ditetapkan" = status Menunggu Arahan yang dimulai dalam 0–3 hari dari hari ini (WIT) (`BATAS_HARI_PERLU_DITETAPKAN`).
- Hari ini menurut komputer saat ini; data contoh berada di 22–31 Okt dan 2–3 Nov 2026, sehingga di luar rentang itu beranda "Agenda hari ini" kosong (tombol "Ke tanggal data contoh" tersedia).

## 6. Belum selesai / belum diverifikasi
- **Tindakan** (1.4b): form undangan, keputusan kehadiran (endpoint atomik KB-047), pindah status dan konfirmasi pejabat dari antarmuka, unggah/kamera lampiran, Pengaturan, layar Audit penuh.
- Uji pembaca layar manual, **ponsel fisik** (owner: `npm run dev:lan`), mode luring (1.5), notifikasi/ekspor (1.5).
- `test:e2e` tidak termasuk gate (RS-38); Chromium harus terpasang (`npx playwright install chromium`).
- Hak akses di antarmuka hanya menyembunyikan pilihan; keputusan akhir tetap di API.

## 7. Risiko
RS-37 (tafsiran dasbor), RS-38 (e2e di luar gate), RS-39 (penyaringan di peramban).

## 8. Catatan untuk owner
- Hentikan `npm run dev` lama (Ctrl+C), jalankan patch, lalu `npm run dev` (web http://localhost:5180). Masuk sebagai `admin.owner`; kata sandi sementara tercetak sekali pada start pertama (PGlite butuh ±60 detik).
- Coba: pemilih "Lihat sebagai..." → Kepala Dinas Pendidikan, Gubernur, Kabag Protokol; Agenda → "Ke tanggal data contoh" (26 Okt memuat bentrok).
- Di ponsel: `npm run dev:lan`, buka alamat IP yang tercetak.

## 9. Gate
Lolos di Windows PowerShell 5.1 (Node 20.20). Belum diulang di Node 22 pada tahap ini. Bila komputer sedang berat (mis. proyek lain berjalan), uji API dapat melewati batas waktu; tutup proses berat lalu ulangi.

## 10. Langkah berikutnya
1. Owner menjalankan patch 1.4a dan mencoba di ponsel; catat koreksi dengan `KOREKSI:`.
2. **Tahap 1.4b** (form undangan, keputusan kehadiran atomik, lampiran, pengaturan, audit). Ketik `LANJUT` atau `TAHAP 1.4b`.

## 11. Cara melanjutkan
Sesi baru: **"Baca CLAUDE.md dan STATUS.md, lalu LANJUT."**
