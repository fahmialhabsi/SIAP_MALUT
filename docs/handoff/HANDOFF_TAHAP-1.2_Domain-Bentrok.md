# Handoff Tahap 1.2: Logika Domain Agenda, Bentrok, Status, dan `npm run dev`

| | |
|---|---|
| Tanggal | 23 Oktober 2026 |
| Tahap | 1.2 |
| Lembar Tahap | `docs/handoff/LEMBAR_TAHAP-1.2_Domain-Bentrok.md` (disetujui, KP-013) |
| Commit | dibuat saat owner menjalankan `scripts/patch/tahap-1.2.ps1` |
| Penyusun | Claude (Sonnet 5.5) |
| Status | Selesai dan diverifikasi lokal; commit/push menunggu owner |

## 1. Tujuan
Inti logika agenda di `packages/domain` (murni): deteksi bentrok jam dan sumber daya, aturan status; ditambah permintaan owner: `npm run dev` untuk backend dan frontend sekaligus (KOR-002).

## 2. Yang dikerjakan
- **Domain:** `model.ts` (Kegiatan, Pihak, kedudukan), `waktu.ts` (ISO 8601 + zona, interval setengah terbuka), `bentrok.ts` (`cariBentrok`, `bentrokUntukKegiatan`), `status.ts` (16 perpindahan sah, `periksaSyarat`, `pindahStatus`, peristiwa, diagram Mermaid).
- **Keputusan owner (KP-013) diterapkan:** durasi bawaan 2 jam dari konfigurasi; bentrok = peringatan dengan override beralasan; aturan status ikut.
- **Data uji fiktif:** `data/contoh/agenda-uji.json` (bentuk agenda 22, 24, 26 Okt) dan `aturan-awal.json`; uji bahwa tidak ada data nyata (pola ID rapat/telepon/sandi; semua nama berlabel CONTOH).
- **`npm run dev` / `dev:lan`:** `scripts/dev.mjs` (concurrently) menjalankan API (`tsx watch`) dan Vite; paket bersama punya kondisi ekspor `development` ke sumber, jadi **tanpa build lebih dulu**. Port khusus **3180 (API) dan 5180 (web)** dengan `strictPort`.
- **Dokumen:** `ALUR_PROSES.md` (dihasilkan dari kode, `npm run docs:status`), `ATURAN_BISNIS.md`, `SRS.md` v0.1; pembaruan RTM (KB-004/008/010/016/031/038/039/040), KEPUTUSAN (KP-013, KP-014), KOR-002, risiko RS-26/27, PEMASANGAN, ARSITEKTUR, RENCANA_UJI, FOLDER_STRUKTUR, CLAUDE.md.
- **Sisa dari 1.1:** bukti verifikasi Docker, RS-25 ditutup.

## 3. Berkas yang dibuat atau diubah (ringkas)
Baru: `packages/domain/src/{model,waktu,bentrok,status}.ts` + 4 berkas uji + `data-uji.helper.ts`; `data/contoh/*.json`; `scripts/{dev,buat-diagram-status}.mjs`; `docs/rekayasa/{ALUR_PROSES,ATURAN_BISNIS,SRS}.md`; `docs/audit/bukti-gate/*`; `scripts/patch/tahap-1.2.ps1`; `docs/handoff/LEMBAR_TAHAP-1.2_…`, berkas ini.
Diubah: `package.json` (+ `tsx`, `concurrently`, skrip `dev`, `dev:lan`, `docs:status`), `package-lock.json`, `packages/*/package.json` (ekspor `development`), `apps/api/package.json` (skrip `dev`), `packages/domain/tsconfig.json`, `STATUS.md`, dokumen audit dan standar yang tersebut di atas.

## 4. Hasil verifikasi (oleh asisten, lokal)
| Pemeriksaan | Hasil |
|---|---|
| `npm run lint` | Lolos |
| `npm test` | **76 uji lulus**: shared 8, domain 51, api 8, web 4, skrip 5 (Node 20.20.0 **dan** 22.22.0) |
| `npm run build` | Lolos (kedua Node) |
| `gate.ps1` (PowerShell) | Lolos; `docs/audit/bukti-gate/gate-tahap-1.2-asisten.txt` |
| `docker compose build` | Lolos (kedua gambar) |
| `npm run dev` dari keadaan **tanpa `dist`** | API `/health` dan `/ready` (mode demo) hidup di 3180; Vite hidup di 5180; `App.tsx` mengimpor `packages/domain/src` dan `packages/shared/src`; halaman menampilkan spanduk DATA CONTOH dan empat langkah alur; `Ctrl+C`/penghentian mematikan keduanya |
| Kontras dengan proyek lain | Port 3000 dan 5173 dipakai proyek **MDBKA** milik owner (tidak disentuh); itu sebabnya dev memakai 3180/5180 |
| `npm run dev:lan` | **Belum dicoba** dari ponsel nyata |
| Pemuatan ulang panas (hot reload) API dan web | **Belum diamati** (hanya start dan layanan) |
| `patch/tahap-1.2.ps1` dijalankan | Belum (dijalankan owner) |

### Dokumen audit terdampak (Aturan 9)
- [x] `DAFTAR_DOKUMEN_AUDIT.md`: RK-06, RK-07, TG-09 menjadi Ada
- [x] `MATRIKS_KETERLUSURAN.md`: KB-004, 008, 010, 016, 031 diperbarui; KB-038, 039, 040 baru
- [x] `REGISTER_RISIKO.md`: RS-25 tertutup; RS-26, RS-27
- [x] Dokumen dari kode dibangkitkan: `ALUR_PROSES.md` (uji menjaga kesesuaian), SBOM saat patch
- [x] `audit-check` lolos
- Dokumen Belum yang tahapnya terlewati: AK-01, AK-03 (tahap 0); RK-02..05, KM-01/02/05/09 (jatuh di 1.3, belum waktunya)

## 5. Keputusan dan penyimpangan
- Tafsiran: "bentrok langsung" = pihak pimpinan, "sumber daya" = pejabat/petugas; "pasti" = kedua sisi sudah ditugaskan/diterima, "potensi" = salah satunya baru diundang. Dikonfirmasi ke Kabag di akhir (KT-03; `ATURAN_BISNIS.md` bagian 5).
- Model `Pihak.kedudukan` menggabungkan siklus (diundang/ditugaskan/diterima/ditolak) menggantikan dua bidang terpisah pada Lembar; fungsinya sama dan lebih sederhana.
- Ekspor `development` hanya untuk pengembangan; Docker/produksi memakai `dist`.
- `concurrently` dipasang **versi 9** (versi 10 meminta Node 22+).

## 6. Belum selesai
- Bentrok perjalanan antarpulau (KB-009), pengganti (KB-011/012): Tahap 2.
- Penyimpanan, API, akun, log audit: 1.3. Antarmuka agenda: 1.4.
- KT-01..04, AK-01, AK-03.
- Jawaban Kabag atas aturan bisnis (KT-03).

## 7. Risiko
RS-26 (tafsiran aturan), RS-27 (port; tertutup). Pembaruan massal dependensi tetap dihindari.

## 8. Langkah berikutnya
1. Owner menjalankan patch 1.2, lalu mencoba `npm run dev`.
2. Ketik `TAHAP 1.3` (API + PostgreSQL + seed data contoh + akun/peran + log audit + OpenAPI/kamus data).

## 9. Cara melanjutkan
Sesi baru: **"Baca CLAUDE.md dan STATUS.md, lalu LANJUT."**
