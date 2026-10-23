# Standar Pengodean (MU-02)

**Versi:** Tahap 1.1. Ditegakkan otomatis oleh `npm run lint` (bagian dari gate).

## 1. Bahasa dan Alat

| Hal | Ketentuan |
|---|---|
| Bahasa | TypeScript mode ketat (`strict`, `noUncheckedIndexedAccess`); `.mjs` hanya untuk skrip di `scripts/` |
| Linter | ESLint (`eslint.config.js`): rekomendasi `@eslint/js` dan `typescript-eslint`; `eqeqeq` wajib; variabel tak terpakai dilarang (awalan `_` dikecualikan); `console` hanya `console.error` |
| Format | Prettier (`.prettierrc.json`): tanda kutip tunggal, titik koma, lebar 100; diperiksa di lint (`prettier --check`); perbaiki dengan `npm run format` |
| Token desain | Pemeriksa `scripts/cek-token.mjs` menolak warna heksadesimal/`rgb()`/`hsl()` di `apps/web/src` (Aturan 1) |
| Berkas | Teks UI hanya di `apps/web/src/teks-ui.ts`; data dan aturan yang rawan berubah sebagai data/konfigurasi (Aturan 12) |

## 2. Penamaan

- Kode dan identifier domain memakai **Bahasa Indonesia** untuk istilah bisnis (agenda, penugasan, status) dan Inggris untuk istilah teknis baku (config, request).
- Berkas: `kebab-case`; komponen React `PascalCase.tsx`; uji `*.test.ts(x)` di samping berkas yang diuji.
- Nama uji **wajib menyebut ID kebutuhan**: `KB-xxx: perilaku yang diuji` (keterlusuran RTM).

## 3. Tinjauan Kode

Setiap tahap melewati Evaluasi (CARA_KERJA.md bagian 6). Perubahan masuk lewat patch per tahap; riwayat commit dan handoff menjadi jejak tinjauan. Pengecualian aturan lint ditulis di tempat dengan komentar alasan dan dicatat di handoff.

## 4. Keamanan Kode

Tidak ada rahasia, data pribadi nyata, atau ID rapat di repo. Konfigurasi lewat variabel lingkungan. Dependensi dikunci oleh `package-lock.json`; daftar komponen dan lisensi dibuat otomatis (`npm run sbom`).
