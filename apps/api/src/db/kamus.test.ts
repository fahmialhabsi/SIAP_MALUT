import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { getTableConfig } from 'drizzle-orm/pg-core';
import { describe, expect, it } from 'vitest';
import { KETERANGAN_TABEL, SEMUA_TABEL, SENSITIVITAS, TABEL_BERPENANDA_CONTOH } from './schema.js';

const akar = fileURLToPath(new URL('../../../../', import.meta.url));
const baca = (jalur: string) => readFileSync(`${akar}${jalur}`, 'utf8');
const tabel = Object.values(SEMUA_TABEL).map((t) => getTableConfig(t));

describe('KB-043: kamus data dihasilkan dari skema', () => {
  it('KB-043: setiap kolom memiliki sensitivitas dan tidak ada entri yatim', () => {
    const kolomSkema = tabel.flatMap((t) => t.columns.map((c) => `${t.name}.${c.name}`)).sort();
    expect(Object.keys(SENSITIVITAS).sort()).toEqual(kolomSkema);
  });

  it('KB-043: setiap tabel memiliki keterangan', () => {
    for (const t of tabel) expect(KETERANGAN_TABEL[t.name], t.name).toBeTruthy();
    expect(Object.keys(KETERANGAN_TABEL).sort()).toEqual(tabel.map((t) => t.name).sort());
  });

  it('KB-043: KAMUS_DATA.md memuat setiap tabel dan kolom (jalankan npm run docs:data bila gagal)', () => {
    const dokumen = baca('docs/rekayasa/KAMUS_DATA.md');
    for (const t of tabel) {
      expect(dokumen, t.name).toContain(`## ${t.name}`);
      for (const c of t.columns)
        expect(dokumen, `${t.name}.${c.name}`).toContain(`| \`${c.name}\` |`);
    }
    expect(dokumen).not.toContain('(belum ditetapkan)');
  });

  it('KM-02: INVENTARIS_DATA_PRIBADI.md memuat semua kolom pribadi dan rahasia', () => {
    const dokumen = baca('docs/keamanan/INVENTARIS_DATA_PRIBADI.md');
    for (const [kunci, s] of Object.entries(SENSITIVITAS)) {
      if (s !== 'pribadi' && s !== 'rahasia') continue;
      const [t, k] = kunci.split('.');
      expect(dokumen, kunci).toContain(`| ${t} | \`${k}\` | ${s} |`);
    }
  });

  it('KB-034: setiap tabel orang/agenda memiliki kolom is_contoh dan terdaftar pada penjaga', () => {
    for (const t of TABEL_BERPENANDA_CONTOH) {
      expect(getTableConfig(t).columns.map((c) => c.name)).toContain('is_contoh');
    }
    const berpenanda = tabel
      .filter((t) => t.columns.some((c) => c.name === 'is_contoh'))
      .map((t) => t.name);
    expect(berpenanda.sort()).toEqual(
      TABEL_BERPENANDA_CONTOH.map((t) => getTableConfig(t).name).sort(),
    );
  });
});
