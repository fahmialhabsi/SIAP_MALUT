# Manajemen Perubahan (OP-06)

**Versi:** Tahap 1.1. Selaras dengan `docs/standar/CARA_KERJA.md` dan `CLAUDE.md`.

## 1. Jenis Perubahan
| Jenis | Contoh | Jalur |
|---|---|---|
| Koreksi A (teks) | Istilah di dokumen/UI | Register Koreksi, patch tahap berjalan |
| Koreksi B (data/aturan) | Nama, aturan kewenangan, tenggat | Register Koreksi, ubah data/konfigurasi |
| Perubahan C (fitur) | Kolom, layar, status baru | Kebutuhan baru di RTM, Lembar Tahap, SETUJU |
| Perubahan D (struktur/arsitektur) | Pindah folder, ganti tumpukan | `KEPUTUSAN:` owner dan ADR baru |
| Darurat | Perbaikan cacat kritis | Patch cepat dengan gate penuh, dicatat di handoff |

## 2. Alur Perubahan Kode (Rilis)
1. Permintaan tercatat (Register Koreksi atau Lembar Tahap), disetujui owner (`SETUJU`).
2. Perubahan dibuat; uji ditambah/diperbarui (nama uji memuat ID KB).
3. **Gate**: lint, test, build, audit-check harus lolos (tanpa `--no-verify`).
4. Patch `scripts/patch/tahap-<nomor>.ps1`: gate, add, commit, push; keluaran gate disimpan di `docs/audit/bukti-gate/`.
5. Handoff dan `STATUS.md` diperbarui; dokumen audit terdampak dicentang di handoff.
6. Riwayat Git (commit per tahap) menjadi jejak persetujuan dan perubahan.

Catatan teknis: skrip patch memanggil perintah eksternal lewat `scripts/native.ps1` (`Invoke-Native`) agar peringatan di stderr tidak dianggap galat di Windows PowerShell 5.1; kode keluar yang menentukan (KOR-004).

## 3. Pembatalan (Rollback)
Pulihkan ke commit/tag sebelumnya dengan `git revert` (bukan menulis ulang riwayat); jalankan gate; catat di handoff. Dilarang `--force` dan menimpa riwayat tanpa izin owner.

## 4. Pemisahan Tugas
Tahap saat ini: owner menyetujui dan menjalankan patch; asisten menulis dan mengevaluasi. Setelah serah terima, formulir persetujuan perubahan (CAB) disesuaikan dengan pemilik sistem di Diskominfosan.

## 5. Bukti
Riwayat Git, Lembar Tahap, handoff, bukti gate, Register Koreksi, `KEPUTUSAN.md`.
