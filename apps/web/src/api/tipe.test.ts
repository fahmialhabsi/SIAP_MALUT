import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const baca = (relatif: string) =>
  readFileSync(fileURLToPath(new URL(relatif, import.meta.url)), 'utf8');

describe('KB-049: tipe API dihasilkan dari OpenAPI', () => {
  it('KB-049: setiap jalur di openapi.json ada di skema.d.ts (jalankan npm run api:tipe bila gagal)', () => {
    const openapi = JSON.parse(baca('../../../../docs/rekayasa/openapi.json')) as {
      paths: Record<string, unknown>;
    };
    const tipe = baca('./skema.d.ts');
    for (const jalur of Object.keys(openapi.paths)) {
      expect(tipe.replace(/'/g, '"'), `jalur ${jalur}`).toContain(`"${jalur}": {`);
    }
  });
});
