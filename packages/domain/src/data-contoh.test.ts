import { readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { bacaMentah } from './data-uji.helper.js';

/** Mengumpulkan semua nilai teks pada JSON, mengabaikan kunci berawalan "_" (catatan). */
function kumpulkanTeks(nilai: unknown, jalur = '', hasil: { jalur: string; teks: string }[] = []) {
  if (typeof nilai === 'string') hasil.push({ jalur, teks: nilai });
  else if (Array.isArray(nilai)) nilai.forEach((v, i) => kumpulkanTeks(v, `${jalur}[${i}]`, hasil));
  else if (nilai && typeof nilai === 'object') {
    for (const [k, v] of Object.entries(nilai)) {
      if (!k.startsWith('_')) kumpulkanTeks(v, `${jalur}.${k}`, hasil);
    }
  }
  return hasil;
}

const berkas = readdirSync(new URL('../../../data/contoh/', import.meta.url)).filter((n) =>
  n.endsWith('.json'),
);

describe('KB-031: data contoh tidak memuat data nyata', () => {
  it('KB-031: ada berkas data contoh yang diperiksa', () => {
    expect(berkas.length).toBeGreaterThan(0);
  });

  it('KB-031: tidak ada pola ID rapat, telepon, sandi, atau kata kunci rahasia', () => {
    const terlarang: [string, RegExp][] = [
      ['ID rapat (angka 9-11 digit)', /\b\d{3}[ -]?\d{3,4}[ -]?\d{3,4}\b/],
      ['telepon Indonesia', /(?:\+62|\b08\d{8,11}\b)/],
      ['kata sandi', /\b(?:pass(?:word)?|kata sandi|meeting id)\b/i],
      ['tautan rapat', /(?:zoom\.us|meet\.google|teams\.microsoft)/i],
    ];
    for (const nama of berkas) {
      const teks = kumpulkanTeks(JSON.parse(bacaMentah(nama)));
      for (const { jalur, teks: isi } of teks) {
        for (const [label, pola] of terlarang) {
          expect(pola.test(isi), `${nama}${jalur}: ${label}`).toBe(false);
        }
      }
    }
  });

  it('KB-031: seluruh nama orang/jabatan pada agenda uji berlabel (CONTOH)', () => {
    const data = JSON.parse(bacaMentah('agenda-uji.json')) as {
      pihak: Record<string, { nama: string }>;
    };
    for (const [id, p] of Object.entries(data.pihak)) {
      expect(p.nama.endsWith('(CONTOH)'), id).toBe(true);
    }
  });

  it('KB-031: judul kegiatan contoh menandai CONTOH atau fiktif', () => {
    const data = JSON.parse(bacaMentah('agenda-uji.json')) as {
      kegiatan: { id: string; judul: string }[];
    };
    for (const k of data.kegiatan) {
      expect(/CONTOH|Contoh/.test(k.judul), k.id).toBe(true);
    }
  });
});
