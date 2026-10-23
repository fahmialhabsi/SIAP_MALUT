/**
 * Hash kata sandi memakai scrypt bawaan Node (tanpa dependensi tambahan).
 * Format: scrypt$N$r$p$<garam base64url>$<hash base64url>. Kata sandi tidak pernah disimpan atau dicatat.
 */
import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from 'node:crypto';

const N = 2 ** 15;
const R = 8;
const P = 1;
const PANJANG = 64;
const MAXMEM = 128 * N * R * 2;

function turunkan(sandi: string, garam: Buffer, opsi: ScryptOptions): Promise<Buffer> {
  return new Promise((selesai, gagal) => {
    scrypt(sandi.normalize('NFKC'), garam, PANJANG, opsi, (err, kunci) =>
      err ? gagal(err) : selesai(kunci),
    );
  });
}

export async function hashSandi(sandi: string): Promise<string> {
  if (sandi.length === 0) throw new RangeError('Kata sandi tidak boleh kosong.');
  const garam = randomBytes(16);
  const kunci = await turunkan(sandi, garam, { N, r: R, p: P, maxmem: MAXMEM });
  return ['scrypt', N, R, P, garam.toString('base64url'), kunci.toString('base64url')].join('$');
}

/** Memeriksa kata sandi terhadap hash; `false` untuk hash kosong/rusak (tanpa melempar). */
export async function periksaSandi(
  sandi: string,
  hash: string | null | undefined,
): Promise<boolean> {
  if (!hash) return false;
  const bagian = hash.split('$');
  if (bagian.length !== 6 || bagian[0] !== 'scrypt') return false;
  const [, n, r, p, garamB64, hashB64] = bagian as [string, string, string, string, string, string];
  try {
    const garam = Buffer.from(garamB64, 'base64url');
    const diharapkan = Buffer.from(hashB64, 'base64url');
    const kunci = await turunkan(sandi, garam, {
      N: Number(n),
      r: Number(r),
      p: Number(p),
      maxmem: MAXMEM,
    });
    return kunci.length === diharapkan.length && timingSafeEqual(kunci, diharapkan);
  } catch {
    return false;
  }
}

/** Kata sandi acak untuk admin awal (tampil sekali di terminal, tidak disimpan). */
export function buatSandiAcak(): string {
  return randomBytes(12).toString('base64url');
}
