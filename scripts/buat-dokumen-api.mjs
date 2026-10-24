// Menghasilkan docs/rekayasa/openapi.json (RK-03) dan docs/rekayasa/MATRIKS_HAK_AKSES.md (RK-05) dari kode dan data.
// Pemakaian: npm run build -w apps/api && npm run docs:api
// DIHASILKAN OTOMATIS; jangan diedit tangan. Uji api memeriksa kesesuaiannya.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const akar = fileURLToPath(new URL('..', import.meta.url));
const { buatOpenApi } = await import(new URL('../apps/api/dist/openapi.js', import.meta.url));
const { daftarRute } = await import(new URL('../apps/api/dist/rute/index.js', import.meta.url));
const { IZIN } = await import(new URL('../apps/api/dist/keamanan/izin.js', import.meta.url));

// Penangan rute tidak dijalankan saat pembuatan dokumen, jadi dependensi cukup tiruan kosong.
const daftar = daftarRute({});

writeFileSync(
  join(akar, 'docs', 'rekayasa', 'openapi.json'),
  JSON.stringify(buatOpenApi(daftar), null, 2) + '\n',
);

const hakAkses = JSON.parse(readFileSync(join(akar, 'data', 'contoh', 'hak-akses.json'), 'utf8'));
const peran = Object.keys(hakAkses.peran);
const baris = [
  '# Matriks Hak Akses (RK-05)',
  '',
  '> **Status: PLACEHOLDER** (PH-05). Dihasilkan otomatis dari `data/contoh/hak-akses.json` dan registri rute oleh `scripts/buat-dokumen-api.mjs` (`npm run docs:api`). **Jangan diedit tangan.** Data yang sama dibaca aplikasi (tabel `peran_izin`) dan uji otomatis. Disahkan Biro bersama Sekda pada Tahap P.',
  '',
  'Salah satu izin pada daftar rute sudah cukup (any-of). Pembatasan data tambahan: peran dengan `kegiatan.baca_terkait` hanya melihat kegiatan yang memuat dirinya; tautan rapat hanya untuk peran berizin `tautan_rapat.lihat_semua` atau pihak yang ditugaskan/diterima (KB-019).',
  '',
  '## 1. Peran dan Izin',
  '',
  `| Izin | ${peran.join(' | ')} |`,
  `|---|${peran.map(() => ':---:').join('|')}|`,
  ...IZIN.map(
    (i) =>
      `| \`${i}\` | ${peran.map((p) => (hakAkses.peran[p].includes(i) ? 'ya' : '')).join(' | ')} |`,
  ),
  '',
  '## 2. Rute dan Izin yang Diperlukan',
  '',
  '| Metode | Jalur | Izin (salah satu) |',
  '|---|---|---|',
  ...[...daftar]
    .sort((a, b) => a.jalur.localeCompare(b.jalur) || a.metode.localeCompare(b.metode))
    .map(
      (d) =>
        `| ${d.metode.toUpperCase()} | \`${d.jalur}\` | ${
          d.publik
            ? '(publik)'
            : d.hanyaMasuk
              ? '(cukup sudah masuk)'
              : d.izin.map((i) => `\`${i}\``).join(', ')
        } |`,
    ),
  '',
];
writeFileSync(join(akar, 'docs', 'rekayasa', 'MATRIKS_HAK_AKSES.md'), baris.join('\n'));
process.stdout.write(
  `[docs] openapi.json (${daftar.length} rute) dan MATRIKS_HAK_AKSES.md dibuat.\n`,
);
