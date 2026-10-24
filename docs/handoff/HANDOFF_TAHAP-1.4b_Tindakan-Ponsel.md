# Handoff Tahap 1.4b: Tindakan di Ponsel (Undangan, Keputusan Kehadiran, Status, Lampiran, Pengaturan, Audit)

| | |
|---|---|
| Tanggal | 24 Oktober 2026 |
| Tahap | 1.4b (bagian kedua Tahap 1.4; penutup Tahap 1.4) |
| Lembar Tahap | `docs/handoff/LEMBAR_TAHAP-1.4_Antarmuka-Ponsel.md` (disetujui, KP-016) |
| Commit | dibuat saat owner menjalankan `scripts/patch/tahap-1.4b.ps1` |
| Penyusun | Claude (Sonnet 5.5) |
| Status | Selesai dan diverifikasi lokal; commit/push menunggu owner |

## 1. Tujuan
Semua tindakan utama Protokol dapat dikerjakan dari ponsel: mencatat undangan (dengan lampiran dari kamera atau galeri), memutuskan kehadiran pimpinan dalam satu lembar, memindahkan status, pejabat menerima atau menolak penugasan, serta admin dan Kepala Biro membaca/mengubah pengaturan dan membaca log audit.

## 2. Yang dikerjakan
- **API (satu rute baru, KB-047):** `POST /api/kegiatan/:id/keputusan-kehadiran` (izin `pihak.kelola`; 23 rute). Satu permintaan = satu transaksi: kedudukan pimpinan, pengganti, dan (opsional) status, dengan **satu** catatan audit `kegiatan.keputusan_kehadiran`. Pilihan: `hadir_sendiri` (pimpinan Diterima), `wakilkan` (pimpinan Ditolak, pengganti Ditugaskan peran mewakili; pengganti yang sudah Diterima tidak diturunkan), `tidak_hadir`, `tunda` (alasan wajib; status Ditunda); `tetapkan` memindahkan ke Ditetapkan lewat aturan domain (bentrok pasti butuh `alasanBentrok`). Bila aturan menolak, **seluruh perubahan dibatalkan** (422 dengan rincian); 409 untuk status terkunci. Kode: `apps/api/src/layanan/keputusan-kehadiran.ts`.
- **Form undangan** (`/kegiatan/baru`, `/kegiatan/:id/ubah`): judul, jenis, tanggal dan jam WIT, lokasi, penyelenggara, PIC protokol, PIC pengundang, tautan rapat, catatan, pihak diundang (saat membuat), lampiran awal.
- **Lembar keputusan kehadiran** (dialog modal dari bawah, Esc menutup, fokus dikembalikan): empat pilihan, pemilih pengganti dengan **peringatan bila pengganti sudah punya kegiatan pada jam yang sama**, "Sekaligus tetapkan" dengan alasan bentrok wajib bila ada bentrok pasti.
- **Pindah status:** hanya perpindahan sah (dari aturan domain); alasan wajib untuk Ditunda/Dibatalkan; alasan bentrok untuk menetapkan saat ada bentrok pasti.
- **Konfirmasi penugasan:** pejabat Terima / Tidak dapat hadir untuk dirinya sendiri.
- **Lampiran:** "Ambil foto" (kamera) dan "Pilih berkas" (galeri/berkas); jenis dan ukuran diperiksa di perangkat sebelum unggah.
- **Lainnya → Pengaturan** (durasi bawaan) dan **Log audit** (disaring menurut ID kegiatan; aksi berlabel Indonesia). Navigasi bawah menambah "Lainnya" bagi yang berizin (maksimal 5 butir).
- **Perilaku:** berpindah persona demo selalu kembali ke Beranda (halaman sebelumnya mungkin terlarang bagi peran baru).
- Tipe API diperbarui dari `openapi.json` (23 rute); `MATRIKS_HAK_AKSES.md` dibangkitkan ulang.

## 3. Berkas yang berubah (ringkas)
API: `layanan/keputusan-kehadiran.ts`, `rute/kegiatan.ts`, `skema-dto.ts`, `keputusan-kehadiran.test.ts`. Web: `komponen/{lembar,tindakan}.tsx`, `halaman/{form-kegiatan,admin,rincian,agenda,kerangka}.tsx`, `App.tsx`, `api/{klien,tipe}.ts`, `api/skema.d.ts` (dihasilkan), `ikon.tsx`, `waktu.ts`, `teks-ui.ts`, `styles/app.css`, `tindakan.test.tsx`, `e2e/{tindakan.spec,bantu}.ts`. Dokumen: `openapi.json`, `MATRIKS_HAK_AKSES.md`, RTM, risiko, ARSITEKTUR, panduan pengguna/admin, `UJI_AKSESIBILITAS.md`, bukti dan tangkapan layar `tangkapan-1.4b/`, STATUS, `scripts/patch/tahap-1.4b.ps1`.

## 4. Hasil verifikasi (oleh asisten, lokal)
| Pemeriksaan | Hasil |
|---|---|
| Uji API keputusan kehadiran | 8 uji × (PGlite dan **PostgreSQL 16 asli**): hadir sendiri, tetapkan, wakilkan, tunda, **rollback saat gagal sebagian**, hak akses (403/404/422/401), status terkunci (409) |
| Seluruh uji API di PostgreSQL 16 asli | **204 lulus** (12 berkas); kontainer sementara dihapus |
| Uji komponen web | 43 lulus (termasuk 20 uji tindakan: keputusan, status, konfirmasi, form, lampiran, pengaturan, audit) |
| `npm run test:e2e` (Playwright + axe) | **14 dari 14 lulus** (7 skenario × 360 px terang dan 412 px gelap), memeriksa juga lembar dialog, form, audit, pengaturan; bukti `e2e-tahap-1.4b-asisten.txt` |
| Gate lengkap di Windows PowerShell 5.1 | **LOLOS** (audit-check, lint, test, build): shared 12, domain 51, api 120, web 43, skrip 7 = **233 uji**. Bukti `gate-tahap-1.4b-asisten.txt` |
| `tahap-1.4b.ps1` | sintaks lolos di PowerShell 5.1 dan 7; **belum dijalankan** (dijalankan owner) |
| Tinjauan tangkapan layar oleh asisten | lembar keputusan (terang) dan rincian Terkonfirmasi (gelap) dibaca; wajar |

**Temuan selama pengujian:** (a) uji ujung ke ujung proyek kedua gagal karena kegiatan proyek pertama membuat **bentrok pasti** bagi pengganti yang sama, sehingga tombol menetapkan menuntut alasan: perilaku aplikasi benar, tanggal uji dibedakan; (b) kotak centang/radio 24 px: area sentuhnya adalah seluruh baris label (≥ 48 px), pemeriksa disesuaikan dan hal ini dicatat di `UJI_AKSESIBILITAS.md`; (c) pindah persona tidak mengalihkan halaman → sekarang kembali ke Beranda.

### Dokumen audit terdampak (Aturan 9)
- [x] `openapi.json` dan `MATRIKS_HAK_AKSES.md` dibangkitkan ulang (23 rute)
- [x] `MATRIKS_KETERLUSURAN.md`: KB-001, 002, 005, 013, 016, 036, 047 menjadi Teruji (antarmuka)
- [x] `REGISTER_RISIKO.md`: RS-35 diperbarui (pengaturan sudah ada di layar; kelola akun tetap Tahap 2)
- [x] `UJI_AKSESIBILITAS.md`, `PANDUAN_PENGGUNA.md`, `PANDUAN_ADMIN.md`, `ARSITEKTUR.md`
- [x] `DAFTAR_DOKUMEN_AUDIT.md`: tidak ada perubahan status (MU-08, PG-01, PG-02 tetap Draf)
- [x] SBOM dibangkitkan oleh patch

## 5. Keputusan dan asumsi
- Keputusan kehadiran tersedia bagi semua peran berizin `pihak.kelola` menurut matriks usulan (PH-05): pimpinan, ajudan, protokol, kabag, admin. Siapa yang berhak memutuskan atas nama pimpinan **belum dikonfirmasi** Biro/Sekda (Aturan 7; KT-03).
- "Tidak hadir" tanpa pengganti hanya mengubah kedudukan pimpinan; tidak ada saran pengganti otomatis (Tahap 2).
- Pengganti dipilih dari direktori pejabat (golongan pimpinan/pejabat) tanpa memeriksa kewenangan mewakili; aturan kewenangan menyusul (Tahap 2, `ATURAN_KEWENANGAN_MEWAKILI_DRAF.md`).
- Peringatan "pengganti sibuk" memakai durasi bawaan 120 menit di perangkat (nilai bawaan yang sama dengan pengaturan awal); keputusan akhir bentrok tetap dihitung server saat menetapkan.

## 6. Belum selesai / belum diverifikasi
- Kamera ponsel fisik (hanya atribut `capture` yang diuji), pembaca layar manual, dan peninjauan di ponsel nyata (`npm run dev:lan`) oleh owner.
- Mengubah pihak pada kegiatan yang sudah ada selain lewat keputusan kehadiran (mis. menambah undangan baru ke kegiatan lama) belum ada layarnya; API-nya ada.
- Pengelolaan akun dan matriks hak akses lewat layar (Tahap 2); notifikasi, ekspor, dan luring (1.5); rekomendasi pengganti otomatis dan bentrok perjalanan (Tahap 2).
- Uji ponsel di luar gate (RS-38).

## 7. Risiko
RS-37 (susunan dasbor), RS-38 (e2e di luar gate), RS-39 (penyaringan di peramban), RS-35 (kelola akun).

## 8. Catatan untuk owner
- Hentikan `npm run dev` lama (Ctrl+C), jalankan patch, lalu `npm run dev`. Data di `data/dev` lama aman (tidak ada migrasi baru).
- Coba alur: admin → Agenda → **Tambah undangan** → rincian → **Putuskan kehadiran** (Wakilkan) → **Lihat sebagai** Kepala Dinas (pengganti) → **Terima penugasan** → kembali → **Ubah status** sampai Terkonfirmasi → Lainnya → **Log audit**.
- Catat koreksi dari Kabag dengan `KOREKSI:` (susunan dasbor = PH-11 di `apps/web/src/konfigurasi.ts`).

## 9. Gate
Lolos di Windows PowerShell 5.1 (Node 20.20). Belum diulang di Node 22 pada tahap ini.

## 10. Langkah berikutnya
**Tahap 1.5** (notifikasi dan teks siap tempel WhatsApp, ekspor teks/PDF, mode luring baca-saja dan sinkronisasi). Ketik `TAHAP 1.5` untuk Lembar Tahap.

## 11. Cara melanjutkan
Sesi baru: **"Baca CLAUDE.md dan STATUS.md, lalu LANJUT."**
