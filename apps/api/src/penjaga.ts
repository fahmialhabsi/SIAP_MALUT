import type { AppMode } from '@siap/shared';

/**
 * Penjaga produksi (KB-034): pada mode `production` aplikasi menolak mulai bila masih ada data
 * contoh (`is_contoh = true`). Pemeriksaan jumlah data contoh dihubungkan ke basis data di Tahap 1.3.
 */
export class DataContohDiProduksiError extends Error {
  constructor(public readonly jumlah: number) {
    super(`Mode production menolak mulai: terdapat ${jumlah} data contoh (is_contoh).`);
    this.name = 'DataContohDiProduksiError';
  }
}

export function pastikanTanpaDataContoh(mode: AppMode, jumlahDataContoh: number): void {
  if (mode === 'production' && jumlahDataContoh > 0) {
    throw new DataContohDiProduksiError(jumlahDataContoh);
  }
}
