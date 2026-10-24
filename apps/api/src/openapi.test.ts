import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { loadApiConfig } from '@siap/shared';
import { IZIN } from './keamanan/izin.js';
import { buatOpenApi } from './openapi.js';
import { daftarRute } from './rute/index.js';
import type { Deps } from './rute.js';

const akar = fileURLToPath(new URL('../../../', import.meta.url));
const baca = (jalur: string) => readFileSync(`${akar}${jalur}`, 'utf8');
const daftar = daftarRute({ config: loadApiConfig({ APP_MODE: 'demo' }) } as unknown as Deps);
const hasil = buatOpenApi(daftar) as {
  openapi: string;
  paths: Record<
    string,
    Record<
      string,
      {
        operationId: string;
        'x-izin'?: string[];
        security?: unknown[];
        responses: Record<string, unknown>;
      }
    >
  >;
};
const hakAkses = JSON.parse(baca('data/contoh/hak-akses.json')) as {
  peran: Record<string, string[]>;
};

describe('KB-043: OpenAPI dihasilkan dari registri rute', () => {
  it('KB-043: openapi.json selaras dengan kode (jalankan npm run build lalu npm run docs:api bila gagal)', () => {
    expect(JSON.parse(baca('docs/rekayasa/openapi.json'))).toEqual(hasil);
  });

  it('KB-043: setiap rute terdaftar dengan metode, izin, dan jawaban 401/403 pada rute berizin', () => {
    expect(hasil.openapi).toBe('3.1.0');
    for (const d of daftar) {
      const jalur = d.jalur.replace(/:([A-Za-z0-9_]+)/g, '{$1}');
      const op = hasil.paths[jalur]?.[d.metode];
      expect(op, `${d.metode} ${d.jalur}`).toBeDefined();
      if (d.izin) {
        expect(op?.['x-izin']).toEqual([...d.izin]);
        expect(Object.keys(op?.responses ?? {}), d.jalur).toEqual(
          expect.arrayContaining(['401', '403']),
        );
      }
      if (d.publik) expect(op?.security).toEqual([]);
    }
  });

  it('KB-043: ID operasi unik; setiap rute punya sekurangnya satu jawaban sukses', () => {
    const id = Object.values(hasil.paths).flatMap((m) =>
      Object.values(m).map((o) => o.operationId),
    );
    expect(new Set(id).size).toBe(id.length);
    for (const d of daftar) {
      const sukses = Object.keys(d.respons).some((k) => Number(k) >= 200 && Number(k) < 300);
      expect(sukses, `${d.metode} ${d.jalur}`).toBe(true);
    }
  });

  it('KB-043: parameter jalur pada rute berparameter terdokumentasi', () => {
    const op = hasil.paths['/api/kegiatan/{id}/pihak/{pihakId}']?.put as unknown as {
      parameters: { name: string; in: string; required: boolean }[];
    };
    expect(op.parameters.map((p) => `${p.in}:${p.name}`).sort()).toEqual([
      'path:id',
      'path:pihakId',
    ]);
    expect(op.parameters.every((p) => p.required)).toBe(true);
  });
});

describe('KB-029: MATRIKS_HAK_AKSES.md dihasilkan dari data dan rute', () => {
  it('KB-029: memuat setiap peran, setiap izin, dan setiap rute (jalankan npm run docs:api bila gagal)', () => {
    const dokumen = baca('docs/rekayasa/MATRIKS_HAK_AKSES.md');
    for (const peran of Object.keys(hakAkses.peran)) expect(dokumen, peran).toContain(peran);
    for (const izin of IZIN) expect(dokumen, izin).toContain(`\`${izin}\``);
    for (const d of daftar) expect(dokumen, d.jalur).toContain(`\`${d.jalur}\``);
    expect(dokumen).toContain('PLACEHOLDER');
  });

  it('KB-029: sel matriks mencerminkan data (admin memiliki demo.pindah_persona, pejabat tidak)', () => {
    const baris = baca('docs/rekayasa/MATRIKS_HAK_AKSES.md')
      .split('\n')
      .find((b) => b.startsWith('| `demo.pindah_persona`'));
    expect(baris).toBeDefined();
    const sel = (baris ?? '')
      .split('|')
      .map((x) => x.trim())
      .filter((x, i) => i > 1 && i < 11);
    const peran = Object.keys(hakAkses.peran);
    expect(sel[peran.indexOf('admin')]).toBe('ya');
    expect(sel[peran.indexOf('pejabat')]).toBe('');
  });
});
