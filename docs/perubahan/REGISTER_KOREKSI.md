# Register Koreksi SIAP MALUT

Semua koreksi atau permintaan tambahan dari **owner** maupun **Kabag Protokol** dicatat di sini sebelum dikerjakan (lihat `docs/standar/CARA_KERJA.md` bagian 5).

**Jenis:** A = teks/label/isi dokumen; B = data dan aturan; C = fitur/perilaku baru; D = struktur/arsitektur (wajib `KEPUTUSAN:`).
**Status:** Baru, Dianalisis, Dijadwalkan, Dikerjakan, Selesai, Ditolak.

| ID | Tanggal | Sumber | Isi koreksi | Jenis | Dampak (dokumen, KB, kode, data) | Tahap | Status | Bukti penutupan |
|---|---|---|---|---|---|---|---|---|
| KOR-001 | 2026-10-23 | Owner | Antisipasi koreksi tambahan agar tidak merusak struktur folder | D | Struktur folder dibekukan; pedoman cara kerja | 0.6 | Selesai | KP-010, `FOLDER_STRUKTUR.md` |
| KOR-002 | 2026-10-23 | Owner | Cukup menjalankan `npm run dev` untuk server backend dan frontend Vite sekaligus | C | KB-040; `package.json`, `scripts/dev.mjs`, `apps/api` (tsx), paket (kondisi `development`), `PEMASANGAN.md` | 1.2 | Selesai | Patch 1.2; diverifikasi manual (API `/health` dan web hidup tanpa `dist`) |

*(Tambahkan baris baru di bawah. Jangan menghapus baris lama.)*
