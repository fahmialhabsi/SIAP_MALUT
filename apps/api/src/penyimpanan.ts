/**
 * Penyimpanan berkas di balik antarmuka `Penyimpanan` (tidak terkunci vendor; siap diganti penyimpanan objek).
 * Implementasi disk menyimpan berkas dengan nama acak (nama asli pengguna tidak pernah menjadi jalur).
 */
import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export interface BerkasTersimpan {
  jalur: string;
  hashIsi: string;
  ukuran: number;
}

export interface Penyimpanan {
  simpan(isi: Buffer, ekstensi: string): Promise<BerkasTersimpan>;
  baca(jalur: string): Promise<Buffer>;
}

export class PenyimpananDisk implements Penyimpanan {
  constructor(private readonly folder: string) {}

  async simpan(isi: Buffer, ekstensi: string): Promise<BerkasTersimpan> {
    await mkdir(this.folder, { recursive: true });
    const aman = ekstensi
      .replace(/[^a-z0-9]/gi, '')
      .slice(0, 5)
      .toLowerCase();
    const jalur = `${randomUUID()}${aman ? `.${aman}` : ''}`;
    await writeFile(join(this.folder, jalur), isi, { flag: 'wx' });
    return { jalur, hashIsi: createHash('sha256').update(isi).digest('hex'), ukuran: isi.length };
  }

  async baca(jalur: string): Promise<Buffer> {
    // Jalur hanya boleh nama berkas hasil simpan() (tanpa pemisah direktori).
    if (!/^[0-9a-f-]{36}(\.[a-z0-9]{1,5})?$/.test(jalur))
      throw new Error('Jalur berkas tidak valid.');
    return readFile(join(this.folder, jalur));
  }
}

/** Penyimpanan di memori untuk uji. */
export class PenyimpananMemori implements Penyimpanan {
  readonly isi = new Map<string, Buffer>();

  async simpan(isi: Buffer, ekstensi: string): Promise<BerkasTersimpan> {
    const jalur = `${randomUUID()}.${ekstensi
      .replace(/[^a-z0-9]/gi, '')
      .slice(0, 5)
      .toLowerCase()}`;
    this.isi.set(jalur, isi);
    return { jalur, hashIsi: createHash('sha256').update(isi).digest('hex'), ukuran: isi.length };
  }

  async baca(jalur: string): Promise<Buffer> {
    const b = this.isi.get(jalur);
    if (!b) throw new Error('Berkas tidak ditemukan.');
    return b;
  }
}

export type JenisBerkas = { tipe: string; ekstensi: string };

/** Mengenali jenis berkas dari isi (magic bytes), bukan dari nama atau tipe kiriman klien. */
export function kenaliJenis(isi: Buffer): JenisBerkas | null {
  if (isi.length >= 5 && isi.subarray(0, 5).toString('latin1') === '%PDF-') {
    return { tipe: 'application/pdf', ekstensi: 'pdf' };
  }
  if (isi.length >= 3 && isi[0] === 0xff && isi[1] === 0xd8 && isi[2] === 0xff) {
    return { tipe: 'image/jpeg', ekstensi: 'jpg' };
  }
  if (
    isi.length >= 8 &&
    isi.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return { tipe: 'image/png', ekstensi: 'png' };
  }
  return null;
}

/** Nama berkas yang aman untuk ditampilkan/diunduh (tanpa jalur dan karakter kendali). */
export function namaAman(nama: string): string {
  const dasar = nama.split(/[\\/]/).pop() ?? 'berkas';
  const bersih = [...dasar]
    .map((c) => (c.charCodeAt(0) < 32 || '"<>:|?*'.includes(c) ? '_' : c))
    .join('')
    .trim()
    .slice(0, 120);
  return bersih.length > 0 ? bersih : 'berkas';
}
