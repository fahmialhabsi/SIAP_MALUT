# Handoff Tahap 0.6: Cara Kerja, Struktur Folder Baku, dan Data Contoh

| | |
|---|---|
| Tanggal | 23 Oktober 2026 |
| Tahap | 0.6 |
| Commit | dibuat saat owner menjalankan `scripts/patch/tahap-0.6.ps1` |
| Penyusun | Claude (Sonnet 5.5) |
| Status | Berkas selesai; commit dan push menunggu owner menjalankan patch |

## 1. Tujuan tahap
Menuangkan hasil diskusi: (a) permintaan Kabag Protokol (bangun mandiri, placeholder, lihat setelah jadi), (b) kebutuhan owner (dasar kerja mengikat, perintah lanjutan tidak melanggar pedoman, kontinuitas), (c) tambahan owner: antisipasi koreksi agar struktur folder tidak rusak.

## 2. Yang dikerjakan
- `docs/standar/CARA_KERJA.md`: urutan pedoman, siklus tahap, Lembar Tahap, perintah owner, penanganan perintah yang bertabrakan, **penanganan koreksi A–D**, evaluasi, kontinuitas.
- `docs/standar/FOLDER_STRUKTUR.md`: struktur **dibekukan** (tambah, jangan pindah), pohon baku, tempat koreksi umum.
- `docs/standar/STANDAR_DATA_CONTOH.md`: label CONTOH, penamaan, persona demo, owner sebagai admin, `APP_MODE`, penjaga produksi, Tahap P.
- `docs/keputusan/KEPUTUSAN.md` (KP-001..011, keputusan terbuka KT-01..04), `docs/perubahan/REGISTER_KOREKSI.md`, `docs/audit/DAFTAR_PLACEHOLDER.md` (PH-01..12), `docs/handoff/_TEMPLATE_LEMBAR_TAHAP.md`, `STATUS.md`.
- `CLAUDE.md`: bagian "Mulai di sini", peta folder ringkas, Aturan 10–13.
- Daftar induk audit: status baru **Placeholder**, TG-14..19 (total 71 dokumen); RTM KB-031..037; risiko RS-21..23; Rancangan 12.5 dan Tahap P.
- Kerangka folder baku dibuat (dengan `.gitkeep`).
- `audit-check.ps1` kini juga memeriksa struktur folder (folder baku harus ada; folder tingkat atas asing ditolak).

## 3. Berkas yang dibuat atau diubah
Baru: tiga standar di atas, `KEPUTUSAN.md`, `REGISTER_KOREKSI.md`, `DAFTAR_PLACEHOLDER.md`, `_TEMPLATE_LEMBAR_TAHAP.md`, `STATUS.md`, folder kerangka (`apps/`, `packages/`, `data/contoh/`, `docs/rekayasa|mutu|keamanan|operasi|pengguna`, subfolder `docs/audit/*`, `docs/keputusan`, `docs/perubahan`), `scripts/patch/tahap-0.6.ps1`.
Diubah: `CLAUDE.md`, `scripts/audit-check.ps1`, `docs/audit/DAFTAR_DOKUMEN_AUDIT.md`, `MATRIKS_KETERLUSURAN.md`, `REGISTER_RISIKO.md`, rancangan (12.5).

## 4. Keputusan
KP-005 sampai KP-011 (lihat `KEPUTUSAN.md`). Ringkas: mandiri, placeholder berlabel, owner = admin, mode demo, Lembar Tahap hanya untuk tahap besar, perintah singkat, struktur dibekukan, risiko "Kabag melihat di akhir" diterima.

## 5. Asumsi
- Perintah singkat dan nama persona demo adalah usulan; dapat disesuaikan lewat `KEPUTUSAN:`.
- Tahap P ditempatkan setelah tahap 3 dan sebelum peluncuran.

## 6. Verifikasi
| Pemeriksaan | Hasil |
|---|---|
| Sintaks `audit-check.ps1` | 0 galat |
| `gate.ps1` | Lolos: Ada=15, Draf=2, Placeholder=1, Belum=53 (jumlah 71); struktur sesuai |
| Uji negatif | Folder asing `zzz_uji` ditolak dengan pesan jelas, lalu dihapus |
| Patch dijalankan | Belum (dijalankan owner) |

### Dokumen audit terdampak (Aturan 9)
- [x] `DAFTAR_DOKUMEN_AUDIT.md` (TG-14..19, status Placeholder)
- [x] `MATRIKS_KETERLUSURAN.md` (KB-031..037)
- [x] `REGISTER_RISIKO.md` (RS-21..23)
- [ ] Dokumen dari kode: belum berlaku
- [x] `scripts/audit-check.ps1` lolos
- Dokumen Belum yang tahapnya terlewati: AK-01, AK-03 (tahap 0); TG-05 kini Placeholder

## 7. Belum selesai
- Keputusan terbuka KT-01..04.
- Rancangan bagian lama (mis. Bab VII peta jalan, daftar peta tahap di audit) belum menampilkan Tahap P secara tabel penuh; ditambahkan sebagai catatan 12.5 dan baris di peta tahap audit.
- Aturan 1–9 di `CLAUDE.md` tidak diubah isinya, kecuali Aturan 8 (data nyata) yang diselaraskan dengan Aturan 11.

## 8. Risiko
RS-21 (placeholder dianggap nyata), RS-22 (revisi besar), RS-23 (koreksi merusak struktur): dimitigasi, lihat register.

## 9. Langkah berikutnya
1. Owner menjalankan patch 0.6.
2. Ketik `TAHAP 1.1` agar asisten menerbitkan Lembar Tahap (kerangka repo + gate npm).

## 10. Cara melanjutkan
Sesi baru: **"Baca CLAUDE.md dan STATUS.md, lalu LANJUT."**
