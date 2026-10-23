import { sql } from 'drizzle-orm';
import type { AppMode } from '@siap/shared';
import type { Db } from './klien.js';
import { TABEL_BERPENANDA_CONTOH } from './schema.js';
import { pastikanTanpaDataContoh } from '../penjaga.js';

/** Menghitung baris berpenanda `is_contoh` pada seluruh tabel orang/agenda. */
export async function hitungDataContoh(db: Pick<Db, 'select'>): Promise<number> {
  let total = 0;
  for (const tabel of TABEL_BERPENANDA_CONTOH) {
    const [baris] = await db
      .select({ n: sql<number>`count(*) filter (where ${tabel.isContoh})::int` })
      .from(tabel);
    total += baris?.n ?? 0;
  }
  return total;
}

/** Penjaga produksi sungguhan (KB-034): `production` menolak start bila ada data contoh. */
export async function jagaProduksi(db: Pick<Db, 'select'>, mode: AppMode): Promise<number> {
  const jumlah = await hitungDataContoh(db);
  pastikanTanpaDataContoh(mode, jumlah);
  return jumlah;
}
