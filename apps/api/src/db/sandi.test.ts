import { describe, expect, it } from 'vitest';
import { buatSandiAcak, hashSandi, periksaSandi } from './sandi.js';

describe('KB-041: hash kata sandi', () => {
  it('KB-041: sandi benar lolos, sandi salah ditolak', async () => {
    const hash = await hashSandi('sandi-uji-yang-panjang');
    expect(await periksaSandi('sandi-uji-yang-panjang', hash)).toBe(true);
    expect(await periksaSandi('sandi-uji-yang-salah', hash)).toBe(false);
  });

  it('KB-041: hash tidak memuat sandi dan berformat scrypt', async () => {
    const hash = await hashSandi('rahasia-banget-123');
    expect(hash.startsWith('scrypt$')).toBe(true);
    expect(hash).not.toContain('rahasia-banget-123');
  });

  it('KB-041: garam acak membuat hash berbeda untuk sandi yang sama', async () => {
    const [a, b] = await Promise.all([
      hashSandi('sandi-sama-123456'),
      hashSandi('sandi-sama-123456'),
    ]);
    expect(a).not.toBe(b);
  });

  it('KB-041: hash kosong atau rusak ditolak tanpa melempar', async () => {
    expect(await periksaSandi('apa-saja', null)).toBe(false);
    expect(await periksaSandi('apa-saja', '')).toBe(false);
    expect(await periksaSandi('apa-saja', 'bukan-hash')).toBe(false);
    expect(await periksaSandi('apa-saja', 'scrypt$1$2$3$x$y')).toBe(false);
  });

  it('KB-041: sandi kosong tidak dapat di-hash', async () => {
    await expect(hashSandi('')).rejects.toThrow(RangeError);
  });

  it('KB-041: sandi acak cukup panjang dan berbeda tiap kali', () => {
    const a = buatSandiAcak();
    const b = buatSandiAcak();
    expect(a.length).toBeGreaterThanOrEqual(16);
    expect(a).not.toBe(b);
  });
});
