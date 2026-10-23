// Pemeriksa token desain (CLAUDE.md Aturan 1, docs/standar/STANDAR_DESAIN.md bagian 1).
// Menolak warna yang ditulis langsung (heksadesimal, rgb(), hsl()) pada kode antarmuka.
// Warna hanya boleh lewat token var(--...) dari src/styles/design-tokens.css.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const POLA_WARNA = /#[0-9a-fA-F]{3,8}\b|\b(?:rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch)\s*\(/g;
const EKSTENSI = new Set(['.css', '.ts', '.tsx']);

/** Mengembalikan daftar pelanggaran { baris, kutipan } pada isi berkas. */
export function cariPelanggaran(isi) {
  const hasil = [];
  isi.split(/\r?\n/).forEach((teks, indeks) => {
    for (const cocok of teks.matchAll(POLA_WARNA)) {
      hasil.push({ baris: indeks + 1, kutipan: cocok[0] });
    }
  });
  return hasil;
}

function kumpulkanBerkas(folder) {
  const daftar = [];
  for (const nama of readdirSync(folder)) {
    const jalur = join(folder, nama);
    if (statSync(jalur).isDirectory()) {
      daftar.push(...kumpulkanBerkas(jalur));
    } else if (EKSTENSI.has(nama.slice(nama.lastIndexOf('.'))) && !/\.test\.[tj]sx?$/.test(nama)) {
      daftar.push(jalur);
    }
  }
  return daftar;
}

export function periksaFolder(folder, akar = folder) {
  const temuan = [];
  for (const berkas of kumpulkanBerkas(folder)) {
    for (const p of cariPelanggaran(readFileSync(berkas, 'utf8'))) {
      temuan.push({ berkas: relative(akar, berkas).split(sep).join('/'), ...p });
    }
  }
  return temuan;
}

const dijalankanLangsung = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (dijalankanLangsung) {
  const akar = fileURLToPath(new URL('..', import.meta.url));
  const sasaran = join(akar, 'apps', 'web', 'src');
  const temuan = periksaFolder(sasaran, akar);
  if (temuan.length > 0) {
    for (const t of temuan) {
      console.error(
        `[token] ${t.berkas}:${t.baris} warna langsung "${t.kutipan}" (pakai var(--...))`,
      );
    }
    console.error(`[token] GAGAL: ${temuan.length} pelanggaran token desain.`);
    process.exit(1);
  }
  process.stdout.write('[token] LOLOS: tidak ada warna yang ditulis langsung pada apps/web/src.\n');
}
