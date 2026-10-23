# Handoff Tahap 0.2: Standar Desain dan Tata Kerja Proyek

| | |
|---|---|
| Tanggal | 23 Oktober 2026 |
| Tahap | 0.2 |
| Commit | lihat `git log` (pesan berakhiran "Tahap 0.2") |
| Penyusun | Claude (Sonnet 5.5) |
| Status | Selesai; palet dan font menunggu pengesahan |

## 1. Tujuan tahap
Menetapkan standar font, warna, dan tampilan yang wajib diikuti setiap perancangan atau pembangunan SIAP MALUT, serta aturan handoff, penyimpanan, commit, dan push per tahap.

## 2. Yang dikerjakan
- `STANDAR_DESAIN.md`: tipografi (Inter, self-hosted), palet (Biru Laut, Emas Cengkih, netral, semantik, status agenda), mode gelap, tata letak mobile-first, komponen, aksesibilitas, luring, daftar periksa.
- `design-tokens.css`: token sebagai sumber tunggal (terang dan gelap).
- `CLAUDE.md`: aturan wajib proyek (standar desain, handoff, commit dan push per tahap, larangan rahasia).
- Templat handoff.

## 3. Berkas yang dibuat atau diubah
| Berkas | Perubahan |
|---|---|
| `docs/standar/STANDAR_DESAIN.md` | Baru |
| `src/styles/design-tokens.css` | Baru |
| `src/assets/fonts/.gitkeep` | Penanda folder font |
| `CLAUDE.md` | Baru |
| `docs/handoff/_TEMPLATE_HANDOFF.md` | Baru |

## 4. Keputusan yang diambil
- Satu keluarga font (Inter) dibundel sendiri demi luring dan jaringan lemah.
- Status agenda wajib ikon + teks, bukan warna saja.
- Semua pasangan warna teks diuji WCAG AA (rasio terendah 5,25).

## 5. Asumsi yang belum dikonfirmasi
- Palet adalah usulan; belum ada pedoman identitas visual resmi Pemprov Maluku Utara yang diperiksa.
- Pengesahan standar oleh Kepala Biro belum ada.

## 6. Verifikasi
| Pemeriksaan | Hasil |
|---|---|
| Kontras palet (terang dan gelap) | Dihitung, lolos AA |
| Render visual komponen | **Belum** (belum ada tampilan) |

## 7. Belum selesai
- Berkas `src/assets/fonts/Inter-Variable.woff2` **belum diunduh**; sementara font jatuh ke cadangan sistem. Unduh dari rilis resmi Inter (lisensi OFL) pada Tahap 1.
- Belum ada logo; menunggu berkas resmi.

## 8. Risiko
- Bila identitas visual resmi ternyata berbeda, token harus disesuaikan (cukup di satu berkas).

## 9. Langkah berikutnya
1. Konfirmasi palet atau serahkan pedoman identitas visual resmi.
2. Tahap 0.3: draf SOP layanan dan aturan kewenangan mewakili.
3. Tahap 1: purwarupa M1+ mengikuti standar ini.

## 10. Cara melanjutkan
Baca `CLAUDE.md`, lalu `docs/standar/STANDAR_DESAIN.md`.
