# Register Koreksi SIAP MALUT

Semua koreksi atau permintaan tambahan dari **owner** maupun **Kabag Protokol** dicatat di sini sebelum dikerjakan (lihat `docs/standar/CARA_KERJA.md` bagian 5).

**Jenis:** A = teks/label/isi dokumen; B = data dan aturan; C = fitur/perilaku baru; D = struktur/arsitektur (wajib `KEPUTUSAN:`).
**Status:** Baru, Dianalisis, Dijadwalkan, Dikerjakan, Selesai, Ditolak.

| ID | Tanggal | Sumber | Isi koreksi | Jenis | Dampak (dokumen, KB, kode, data) | Tahap | Status | Bukti penutupan |
|---|---|---|---|---|---|---|---|---|
| KOR-001 | 2026-10-23 | Owner | Antisipasi koreksi tambahan agar tidak merusak struktur folder | D | Struktur folder dibekukan; pedoman cara kerja | 0.6 | Selesai | KP-010, `FOLDER_STRUKTUR.md` |
| KOR-002 | 2026-10-23 | Owner | Cukup menjalankan `npm run dev` untuk server backend dan frontend Vite sekaligus | C | KB-040; `package.json`, `scripts/dev.mjs`, `apps/api` (tsx), paket (kondisi `development`), `PEMASANGAN.md` | 1.2 | Selesai | Patch 1.2; diverifikasi manual (API `/health` dan web hidup tanpa `dist`) |
| KOR-003 | 2026-10-23 | Owner (uji ponsel) | Di ponsel, `localhost:5180` ditolak (ERR_CONNECTION_REFUSED) karena `localhost` di ponsel = ponsel itu sendiri; `dev:lan` harus menampilkan alamat IP komputer yang benar | A | KB-040; `scripts/dev.mjs`, `scripts/alamat-lan.mjs` (+ uji), `PEMASANGAN.md` | 1.3 | Selesai | Patch 1.3; dev:lan kini mencetak alamat Wi-Fi/IP (mis. http://192.168.1.63:5180) dan petunjuk Firewall |
| KOR-004 | 2026-10-24 | Owner (laporan galat gate) | Saat patch 1.3a dijalankan ulang (24 Okt), `gate.ps1` berhenti di build dengan "NativeCommandError": Vite menulis peringatan `[PLUGIN_TIMINGS]` (build di komputer owner 47 detik di tahap callback) ke stderr, dan Windows PowerShell 5.1 (`powershell -ExecutionPolicy Bypass`) menganggap stderr sebagai galat bila `$ErrorActionPreference='Stop'` dan keluaran dialihkan (`*>&1`), walau build sukses | A | `scripts/native.ps1` (Invoke-Native), `scripts/gate.ps1`, `scripts/patch/tahap-1.3a1.ps1`, `CLAUDE.md` Aturan 3; RS-32 | 1.3a.1 | Selesai | Direproduksi di PowerShell 5.1; gate penuh lolos di 5.1 dan 7 (24 Okt); patch 1.3a.1 |
| KOR-005 | 2026-10-24 | Owner (laporan galat) | `npm run admin:sandi` gagal "Akun admin.owner belum ada": perintah membuka basis data PGlite di memori, bukan folder `data/dev/pgdata` yang dipakai `npm run dev` | A | `scripts/admin-sandi.mjs` (baru), `package.json`, `PEMASANGAN.md` | 1.4 | Selesai | Diuji lokal pada basis data sementara; masuk commit berikutnya (patch 1.4b atau 1.5) |
| KOR-006 | 2026-10-24 | Owner (permintaan Kabag Protokol) | Pak Kabag, berada di pulau lain, ingin melihat hasil sementara lewat ponselnya: perlu akun sendiri (bukan `admin.owner`) | C | KB-051; `apps/api/src/db/seed.ts` (`aturSandiAkun`), `cli/seed.ts`, `scripts/admin-sandi.mjs` (`npm run akun:sandi -- demo.kabag-protokol`), `akun-demo.test.ts` | 1.4 | Selesai | Akun persona yang sudah ada diberi kata sandi lewat CLI; hak tetap hak peran Kabag Protokol; 6 uji (PGlite dan PostgreSQL) |
| KOR-007 | 2026-10-24 | Owner (permintaan Kabag Protokol) | Akses dari luar jaringan Wi-Fi yang sama: alamat sementara lewat internet | C | KB-052; `scripts/dev.mjs --tunnel` (`npm run dev:tunnel`), `apps/web/vite.config.ts` (`allowedHosts`), `PEMASANGAN.md`, RS-40 | 1.4 | Selesai | Jalur diuji lokal dengan Host terowongan; cloudflared sendiri belum diuji berjalan (belum terpasang di komputer pembangun) |

*(Tambahkan baris baru di bawah. Jangan menghapus baris lama.)*
