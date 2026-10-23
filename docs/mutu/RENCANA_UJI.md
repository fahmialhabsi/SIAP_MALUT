# Rencana Uji (MU-04)

**Versi:** Tahap 1.1. Diperbarui setiap tahap.

## 1. Prinsip
1. Setiap kebutuhan di `docs/audit/MATRIKS_KETERLUSURAN.md` memiliki uji; nama uji memuat ID `KB-xxx`.
2. Uji berjalan otomatis lewat `npm test` (bagian dari gate); hasilnya menjadi bukti (`docs/audit/bukti-gate/`).
3. Data uji memakai data contoh/fiktif (`docs/standar/STANDAR_DATA_CONTOH.md`).

## 2. Tingkat Uji

| Tingkat | Alat | Cakupan | Mulai |
|---|---|---|---|
| Unit | Vitest | Logika murni (`packages/*`), konfigurasi, penjaga | 1.1 |
| Integrasi API | Vitest + Fastify `inject` | Rute, ID permintaan, penjaga | 1.1 |
| Komponen web | Vitest + Testing Library (jsdom) | Spanduk, alur status, teks UI | 1.1 |
| Skrip | `node --test` | Pemeriksa token | 1.1 |
| Alur utama ponsel (360 px) | Playwright | Input undangan, penetapan kehadiran | 1.4 |
| Aksesibilitas dan standar desain | Daftar periksa `STANDAR_DESAIN.md` bagian 8 + otomatis | Kontras, target sentuh, status ikon+teks | 1.4 |
| Keamanan | Pindai kerentanan, uji penetrasi | Seluruh | 3 |
| Kinerja/luring | Uji beban, simulasi jaringan lemah | Seluruh | 3 |
| Penerimaan (UAT) | Skenario dari SOP dan RTM | Seluruh fitur | 1.6 |

## 3. Kondisi Tahap 1.1 (dilanjutkan di bawah untuk 1.2)

26 uji otomatis lulus pada Node 20.20.0 dan 22.22.0: konfigurasi/`APP_MODE` (shared), status agenda (domain), `/health` `/ready` ID permintaan penjaga produksi (api), spanduk dan alur status (web), pemeriksa token (skrip). Pengukuran manual di peramban pada lebar 360 px (tanpa gulir horizontal, font 16 px, target sentuh 48 px, font Inter termuat). Uji otomatis ponsel menyusul di Tahap 1.4.

## 4. Kriteria Lulus
Seluruh gate lolos (lint, test, build, audit-check); tidak ada kebutuhan tahap berjalan tanpa uji; cacat terbuka dicatat di `docs/mutu/DAFTAR_CACAT.md` (menyusul).

## 5. Pelaporan
Keluaran gate tiap tahap disimpan di `docs/audit/bukti-gate/`. Laporan uji rinci per rilis menyusul pada Tahap 1.x (`docs/mutu/laporan-uji/`).

### Kondisi Tahap 1.2
**76 uji otomatis** lulus (Node 20.20.0): shared 8, **domain 51** (waktu, bentrok dengan agenda fiktif 22/24/26 Okt, tabel status lengkap, syarat, peristiwa, kesesuaian `ALUR_PROSES.md` dengan kode, data contoh tanpa data nyata), api 8, web 4, skrip 5. Uji domain memakai `data/contoh/` sebagai data uji tunggal.

### Kondisi Tahap 1.3a
**124 uji otomatis** lulus di Node 20.20.0 dan 22.22.0: shared 12, domain 51, **api 50** (basis data, seed, log audit, penjaga, layanan kegiatan, sandi, kamus, kesehatan), web 4, skrip 7. Uji basis data berjalan di **PGlite** dan, bila `SIAP_TEST_DATABASE_URL` diisi, di **PostgreSQL asli** (diverifikasi: 70 uji api lulus di PostgreSQL 16). Verifikasi kontainer penuh (db+api+web), append-only via `psql`, dan penjaga produksi: `docs/audit/bukti-gate/verifikasi-postgres-tahap-1.3a.txt`.

