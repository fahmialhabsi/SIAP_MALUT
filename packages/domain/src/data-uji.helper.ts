/**
 * Pembantu uji: memuat data contoh (fiktif) dari data/contoh/. Tidak ikut dibangun (lihat tsconfig).
 */
import { readFileSync } from 'node:fs';
import type { GolonganPihak, KedudukanPihak, Kegiatan, PeranPihak } from './model.js';
import type { StatusAgenda } from './status.js';

interface BerkasPihak {
  nama: string;
  golongan: GolonganPihak;
}
interface BerkasKegiatan {
  id: string;
  judul: string;
  mulai: string;
  selesai?: string;
  lokasi?: { nama: string; pulau?: string };
  status: StatusAgenda;
  pihak: { id: string; kedudukan: KedudukanPihak; peran?: PeranPihak }[];
}
interface BerkasAgenda {
  pihak: Record<string, BerkasPihak>;
  kegiatan: BerkasKegiatan[];
}

const folder = new URL('../../../data/contoh/', import.meta.url);

export function bacaMentah(nama: string): string {
  return readFileSync(new URL(nama, folder), 'utf8');
}

export function bacaDokumen(jalurDariAkar: string): string {
  return readFileSync(new URL(jalurDariAkar, new URL('../../../', import.meta.url)), 'utf8');
}

export function muatAturanAwal(): { durasiBawaanMenit: number } {
  return JSON.parse(bacaMentah('aturan-awal.json')) as { durasiBawaanMenit: number };
}

export function muatKegiatanUji(): Kegiatan[] {
  const berkas = JSON.parse(bacaMentah('agenda-uji.json')) as BerkasAgenda;
  return berkas.kegiatan.map((k) => ({
    id: k.id,
    judul: k.judul,
    mulai: k.mulai,
    ...(k.selesai !== undefined ? { selesai: k.selesai } : {}),
    ...(k.lokasi !== undefined ? { lokasi: k.lokasi } : {}),
    status: k.status,
    pihak: k.pihak.map((p) => {
      const data = berkas.pihak[p.id];
      if (!data) throw new Error(`Pihak tidak dikenal di data contoh: ${p.id}`);
      return {
        id: p.id,
        nama: data.nama,
        golongan: data.golongan,
        kedudukan: p.kedudukan,
        ...(p.peran !== undefined ? { peran: p.peran } : {}),
      };
    }),
  }));
}

export function kegiatanPadaTanggal(semua: Kegiatan[], tanggal: string): Kegiatan[] {
  return semua.filter((k) => k.mulai.startsWith(tanggal));
}
