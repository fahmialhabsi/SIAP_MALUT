import { eq } from 'drizzle-orm';
import type { Db } from './klien.js';
import { pengaturan } from './schema.js';

/** Nilai bawaan bila belum diatur admin (KB-036). Durasi bawaan 2 jam: keputusan owner KP-013. */
export const PENGATURAN_BAWAAN = {
  durasiBawaanMenit: 120,
} as const;

export type KunciPengaturan = keyof typeof PENGATURAN_BAWAAN;

export async function ambilPengaturan<K extends KunciPengaturan>(
  db: Pick<Db, 'select'>,
  kunci: K,
): Promise<(typeof PENGATURAN_BAWAAN)[K]> {
  const [baris] = await db.select().from(pengaturan).where(eq(pengaturan.kunci, kunci));
  if (!baris) return PENGATURAN_BAWAAN[kunci];
  return baris.nilai as (typeof PENGATURAN_BAWAAN)[K];
}

export async function simpanPengaturan(
  db: Pick<Db, 'insert'>,
  kunci: KunciPengaturan,
  nilai: unknown,
): Promise<void> {
  await db
    .insert(pengaturan)
    .values({ kunci, nilai: nilai as never })
    .onConflictDoUpdate({
      target: pengaturan.kunci,
      set: { nilai: nilai as never, diubah: new Date() },
    });
}
