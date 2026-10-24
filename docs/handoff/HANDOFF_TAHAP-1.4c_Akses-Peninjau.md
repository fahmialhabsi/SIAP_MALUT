# Handoff Tahap 1.4c: Akses Peninjau Jarak Jauh (Akun Demo Bersandi dan Terowongan)

| | |
|---|---|
| Tanggal | 24 Oktober 2026 |
| Dasar | KOR-005, KOR-006, KOR-007; KP-017 (permintaan Kabag Protokol yang berada di pulau lain; pilihan owner (b) dan (c)) |
| Commit | dibuat saat owner menjalankan `scripts/patch/tahap-1.4c.ps1` (memuat juga 1.4b bila belum dijalankan) |
| Penyusun | Claude (Sonnet 5.5) |
| Status | Selesai dan diverifikasi sebagian lokal; **cloudflared belum diuji berjalan** |

## 1. Yang dikerjakan
- **KOR-005:** `npm run admin:sandi` kini memakai `data/dev/pgdata` (sebelumnya basis data memori sehingga "Akun admin.owner belum ada"). Skrip `scripts/admin-sandi.mjs`.
- **KOR-006 (KB-051):** `npm run akun:sandi -- <username>` memberi kata sandi pada akun persona yang sudah ada (mis. `demo.kabag-protokol`); kata sandi dari `SIAP_AKUN_PASSWORD` (minimal 12 karakter) atau acak dicetak sekali. Akun itu masuk dengan **hak perannya sendiri**, tanpa hak admin (tanpa Lihat sebagai dan Pengaturan). Fungsi `aturSandiAkun` (admin.owner memakainya juga); tercatat di log audit tanpa memuat kata sandi. 6 uji (PGlite dan PostgreSQL).
- **KOR-007 (KB-052):** `npm run dev:tunnel` membangun web, menjalankan API dan `vite preview` (hasil build, cepat di jaringan seluler), dan membuka terowongan Cloudflare yang memberi alamat `https://....trycloudflare.com`. Vite mengizinkan hanya host `.trycloudflare.com` (host lain 403). Prasyarat sekali: `winget install --id Cloudflare.cloudflared`.

## 2. Hasil verifikasi (oleh asisten)
| Pemeriksaan | Hasil |
|---|---|
| Uji API akun demo | 3 uji lulus pada PGlite (gate); varian PostgreSQL asli tidak dijalankan ulang pada tahap ini |
| `admin:sandi` pada basis data sementara | berhasil (sebelum dan sesudah perbaikan, lihat laporan owner di percakapan) dan pada `data/dev/pgdata` milik owner (owner melaporkan berhasil) |
| Jalur terowongan tanpa cloudflared (build + API + `vite preview`) | Host `*.trycloudflare.com`: halaman 200; host asing 403; masuk dengan Origin sama Host: 200 dan kuki sesi; `/health` OK |
| `cloudflared` sendiri | **belum diuji berjalan** (belum terpasang di komputer pembangun) |
| Gate (PowerShell 5.1) | **LOLOS**: shared 12, domain 51, api 123, web 43, skrip 7 = 236 uji; `gate-tahap-1.4c-asisten.txt` |

## 3. Risiko dan batasan (RS-40, RS-33)
Terowongan membuka laptop ke internet: server mode pengembangan, tanpa pembatasan laju per IP (RS-33), hanya data CONTOH. Mitigasi: alamat acak berubah tiap dijalankan, dibagikan hanya ke Kabag, akun peninjau tanpa hak admin, `admin.owner` tidak dibagikan, matikan terminal setelah selesai. Laptop harus menyala dan terhubung internet; jika terminal ditutup, akses putus. Solusi tetap ada di Tahap 4 (server serah terima).

## 4. Gate
Lolos (audit-check, lint, test, build). Belum diulang di Node 22.

## 5. Langkah berikutnya
Owner: `npm run akun:sandi -- demo.kabag-protokol` (server dihentikan), pasang cloudflared, `npm run dev:tunnel`, kirim alamat dan kredensial Kabag lewat jalur terpisah. Lalu `TAHAP 1.5`.
