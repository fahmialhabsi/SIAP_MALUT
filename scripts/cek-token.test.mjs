import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { cariPelanggaran, periksaFolder } from './cek-token.mjs';

test('KB-020: warna heksadesimal ditolak', () => {
  const hasil = cariPelanggaran('a { color: #0b4a6f; }');
  assert.equal(hasil.length, 1);
  assert.equal(hasil[0].kutipan, '#0b4a6f');
});

test('KB-020: rgb() dan hsl() ditolak', () => {
  assert.equal(cariPelanggaran('a { color: rgb(1, 2, 3); }').length, 1);
  assert.equal(cariPelanggaran('a { color: hsl(10 20% 30%); }').length, 1);
});

test('KB-020: var(--token) diterima', () => {
  assert.equal(cariPelanggaran('a { color: var(--color-primary); }').length, 0);
});

test('KB-020: nomor baris dilaporkan', () => {
  const hasil = cariPelanggaran('a {}\nb { color: #fff; }');
  assert.equal(hasil[0].baris, 2);
});

test('KB-020: pemeriksa folder menemukan pelanggaran dan mengabaikan berkas uji', () => {
  const akar = mkdtempSync(join(tmpdir(), 'siap-token-'));
  try {
    mkdirSync(join(akar, 'src'));
    writeFileSync(join(akar, 'src', 'bagus.css'), 'a { color: var(--color-text); }');
    writeFileSync(join(akar, 'src', 'buruk.css'), 'a { color: #123456; }');
    writeFileSync(join(akar, 'src', 'x.test.ts'), "const w = '#abcdef';");
    const temuan = periksaFolder(akar, akar);
    assert.equal(temuan.length, 1);
    assert.equal(temuan[0].berkas, 'src/buruk.css');
  } finally {
    rmSync(akar, { recursive: true, force: true });
  }
});
