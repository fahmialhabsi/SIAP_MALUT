# Uji Aksesibilitas dan Kepatuhan Standar Desain

| | |
|---|---|
| Status | **Draf**: mencakup layar Tahap 1.4a (baca). Layar tindakan (1.4b) ditambahkan setelah dibangun. |
| Daftar induk | MU-08 |
| Dasar | `docs/standar/STANDAR_DESAIN.md` bagian 6 dan 8; KB-020, KB-050 |
| Alat | Playwright + axe-core (WCAG 2.0/2.1 A dan AA) + pemeriksa kustom: `apps/web/e2e/` (`npm run test:e2e`) |
| Perangkat | Chromium emulasi ponsel: 360 × 740 mode terang; 412 × 915 mode gelap; zona waktu Asia/Jayapura |
| Bukti | `docs/audit/bukti-gate/tangkapan-1.4a/` (tangkapan layar penuh) dan `docs/audit/bukti-gate/e2e-tahap-1.4a-asisten.txt` |

## 1. Pemeriksaan otomatis (tiap layar)
| Pemeriksaan | Ambang | Layar yang diperiksa |
|---|---|---|
| Gulir horizontal halaman | tidak ada pada 360 px | Masuk, Beranda (admin dan pejabat), Agenda, Rincian, Bentrok, Akun (terang dan gelap) |
| Teks isi | ≥ 16 px | idem (seluruh teks di `main`) |
| Target sentuh | ≥ 48 × 48 px (tautan, tombol, isian, pilihan; navigasi bawah) | idem |
| Status dan bentrok | selalu ikon + teks | idem |
| Aksesibilitas (axe) | tanpa pelanggaran WCAG A/AA, termasuk kontras warna | idem |

Jalur minggu pada Agenda dapat digulir di dalam wadahnya (tujuh butir × 48 px tidak muat di 328 px); halaman tidak bergulir ke samping.

## 2. Daftar periksa `STANDAR_DESAIN.md` bagian 8
| Butir | Hasil 1.4a | Bukti |
|---|---|---|
| Hanya token; tanpa warna/ukuran langsung | Lolos | `npm run lint` (pemeriksa token) |
| Teks isi ≥ 16 px | Lolos | e2e |
| Target sentuh ≥ 48 px | Lolos | e2e |
| Status ikon + teks | Lolos | e2e, App.test |
| 360 px tanpa gulir horizontal | Lolos | e2e |
| Kontras AA terang dan gelap | Lolos (axe) | e2e |
| Bahasa baku, WIT | Lolos | waktu.test, App.test |
| Luring | **Belum** (Tahap 1.5) | - |
| Pembaca layar (uji manual NVDA/TalkBack) | **Belum diuji**; hanya axe dan label/landmark otomatis | - |
| Peninjauan di ponsel fisik | **Belum**: dilakukan owner lewat `npm run dev:lan` | - |

## 3. Keterbatasan
axe menangkap sekitar sepertiga masalah aksesibilitas; uji manual pembaca layar dan ponsel fisik tetap diperlukan sebelum UAT (Tahap 1.6).
