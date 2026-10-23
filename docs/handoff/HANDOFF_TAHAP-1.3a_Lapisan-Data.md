# Handoff Tahap 1.3a: Lapisan Data, Data Contoh, Penjaga Produksi, Log Audit

| | |
|---|---|
| Tanggal | 23 Oktober 2026 |
| Tahap | 1.3a (bagian pertama Tahap 1.3) |
| Lembar Tahap | `docs/handoff/LEMBAR_TAHAP-1.3_API-Data-Akun.md` (disetujui, KP-015) |
| Commit | dibuat saat owner menjalankan `scripts/patch/tahap-1.3a.ps1` |
| Penyusun | Claude (Sonnet 5.5) |
| Status | Selesai dan diverifikasi lokal (termasuk PostgreSQL asli dan kontainer); commit/push menunggu owner |

## 1. Tujuan
Menyimpan data agenda secara permanen dengan skema dan migrasi yang dapat dipasang ulang, mengisi data contoh berlabel, menjadikan penjaga produksi sungguhan, dan memastikan log audit tidak dapat diubah. API/akun/hak akses/lampiran/OpenAPI ada di 1.3b.

## 2. Yang dikerjakan
- **Skema Drizzle** (9 tabel) dengan batasan data; **migrasi SQL** `0000_awal` + `0001_log_audit_append_only` (pemicu).
- **Klien basis data** ganda: PGlite (dev/uji) dan PostgreSQL via `pg` (kontainer/produksi), migrasi dijalankan saat start.
- **Seed data contoh** dari `data/contoh/` (tambahan `pengguna.json`): 11 pejabat, 13 pengguna, 14 kegiatan, 28 pihak; semua `is_contoh`; idempoten; admin.owner dengan kata sandi dari lingkungan atau acak (tercetak sekali).
- **Penjaga produksi sungguhan** (`jagaProduksi`): menghitung baris `is_contoh`; production menolak start.
- **Log audit append-only**; `catatAudit`; peristiwa status tersimpan dalam satu transaksi dengan perubahan (`pindahStatusKegiatan`, dengan kunci optimistis).
- **Pengaturan sebagai data** (durasi bawaan 120 menit); **hash kata sandi** scrypt; **CLI** `npm run seed -w apps/api` dan `npm run admin:sandi`.
- **`/ready`** memeriksa basis data (503 bila gagal).
- **Docker Compose** kini `db` (PostgreSQL 16) + `api` + `web`; `POSTGRES_PASSWORD` wajib; `.env.example` diperbarui.
- **Pembangkit dokumen:** `npm run docs:data` membuat `KAMUS_DATA.md` dan `INVENTARIS_DATA_PRIBADI.md` dari skema (dengan sensitivitas per kolom).
- **`npm run dev`:** basis data PGlite di `data/dev/pgdata` otomatis; **KOR-003:** `dev:lan` mencetak alamat IP komputer.
- Dokumen: `LOG_AUDIT.md`; pembaruan RTM (KB-041..044 baru, 9 lainnya), daftar induk, risiko RS-28..31, PH, PEMASANGAN, ARSITEKTUR, RENCANA_UJI, STANDAR_DATA_CONTOH (Tahap P = basis data produksi baru), FOLDER_STRUKTUR, ADR revisi 2, CLAUDE.md.

## 3. Hasil verifikasi (oleh asisten, lokal)
| Pemeriksaan | Hasil |
|---|---|
| `npm run lint`, `npm test`, `npm run build` | Lolos di **Node 20.20.0 dan 22.22.0**; **124 uji**: shared 12, domain 51, api 50, web 4, skrip 7 |
| Uji API di **PostgreSQL 16 asli** (kontainer sementara) | **70 uji lulus**. Temuan: 7 uji awalnya gagal karena dua berkas berbagi satu basis data; diperbaiki (`fileParallelism` dimatikan saat PG asli) |
| Kontainer penuh `db + api + web` (demo) | Temuan nyata: API gagal start karena compose meneruskan `SIAP_ADMIN_PASSWORD` kosong; **diperbaiki** + uji. Setelah itu: `/ready` ok, seed otomatis, restart tidak seed ulang (14 kegiatan tetap), web 200 |
| Log audit via `psql` | `DELETE` dan `UPDATE` ditolak: "log_audit bersifat append-only" |
| Penjaga produksi di kontainer | `APP_MODE=production` pada basis data berisi data contoh: API menolak ("38 data contoh") |
| `npm run dev` (PGlite berkas, port 3190/5190 agar tidak mengganggu server Anda) | Start pertama: seed + kata sandi sementara tercetak; `/ready` basisData ok; restart: tidak seed ulang; `npm run admin:sandi` berfungsi |
| `gate.ps1` (PowerShell) | Lolos; `docs/audit/bukti-gate/gate-tahap-1.3a-asisten.txt` |
| Bukti PG asli dan kontainer | `docs/audit/bukti-gate/verifikasi-postgres-tahap-1.3a.txt` |
| `patch/tahap-1.3a.ps1` dijalankan | Belum (dijalankan owner) |

### Dokumen audit terdampak (Aturan 9)
- [x] `DAFTAR_DOKUMEN_AUDIT.md`: RK-02, KM-02, KM-09 menjadi Ada
- [x] `MATRIKS_KETERLUSURAN.md`: 9 baris diperbarui; KB-041..044 ditambah
- [x] `REGISTER_RISIKO.md`: RS-28..31
- [x] Dokumen dari kode dibangkitkan: KAMUS_DATA, INVENTARIS_DATA_PRIBADI (uji menjaga), SBOM saat patch
- [x] `audit-check` lolos
- Belum waktunya (1.3b): RK-03 openapi, RK-04 desain keamanan, RK-05 matriks hak akses, KM-01 kebijakan, KM-05 manajemen akses

## 4. Keputusan dan penyimpangan
- **Log audit tidak punya `is_contoh`** dan **Tahap P membuat basis data produksi baru** (bukan membersihkan demo), karena log tidak dapat dihapus.
- `peran_izin`, `sesi`, `lampiran` sudah ada sebagai tabel kosong (diisi di 1.3b) agar migrasi tidak berubah di 1.3b.
- Status `berubah_bersamaan` (kunci optimistis) ada di kode tetapi **belum diuji** (butuh dua transaksi bersamaan).
- Kata sandi admin: hanya hash tersimpan; tidak pernah di log audit (diuji).
- **Port 54329 tidak dapat dibuka di Windows ini** (rentang yang dicadangkan sistem); uji PG asli memakai port 25433.

## 5. Hal yang belum selesai / belum diverifikasi
- 1.3b: akun masuk/sesi, hak akses, endpoint, lampiran, OpenAPI, dokumen keamanan.
- `berubah_bersamaan` belum diuji; tidak ada uji beban; pencadangan/pemulihan (Tahap 2).
- Mode production pada basis data bersih tidak memiliki akun (admin produksi dirancang di Tahap P).
- Waktu gate sekarang lebih lama (±2-4 menit; uji basis data PGlite).
- KT-01..04, AK-01, AK-03.

## 6. Risiko
RS-28 (perbedaan PGlite dan PostgreSQL: dimitigasi), RS-29 (superuser dapat menonaktifkan pemicu), RS-30 (kata sandi sementara tercetak), RS-31 (server dev lama di terminal Anda).

## 7. Yang perlu Anda lakukan sebelum patch
Hentikan terminal `npm run dev` / `npm run dev:lan` lama (Ctrl+C). Server lama (mulai 14.10 dan 14.21) memuat ulang otomatis dengan kode baru tetapi tanpa basis data berkas, dan memegang port 3180/5180.

## 8. Langkah berikutnya
1. Owner menjalankan patch 1.3a, lalu `npm run dev` (catat kata sandi sementara `admin.owner` yang tercetak sekali).
2. `LANJUT` untuk Tahap 1.3b (API, autentikasi, hak akses, lampiran, OpenAPI).

## 9. Cara melanjutkan
Sesi baru: **"Baca CLAUDE.md dan STATUS.md, lalu LANJUT."**
