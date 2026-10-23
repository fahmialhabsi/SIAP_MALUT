import { desc, eq, sql } from 'drizzle-orm';
import type { Db } from './klien.js';
import { logAudit } from './schema.js';

export interface EntriAudit {
  aktor: string;
  aktorPeran?: string;
  aksi: string;
  entitas?: string;
  entitasId?: string;
  sebelum?: unknown;
  sesudah?: unknown;
  alasan?: string;
  reqId?: string;
  ip?: string;
}

/** Konteks umum pencatatan audit (dapat dipakai di dalam transaksi). */
export type DbAtauTx = Pick<Db, 'insert' | 'select' | 'execute'>;

export async function catatAudit(db: DbAtauTx, e: EntriAudit): Promise<void> {
  await db.insert(logAudit).values({
    aktor: e.aktor,
    aktorPeran: e.aktorPeran ?? null,
    aksi: e.aksi,
    entitas: e.entitas ?? null,
    entitasId: e.entitasId ?? null,
    sebelum: (e.sebelum ?? null) as never,
    sesudah: (e.sesudah ?? null) as never,
    alasan: e.alasan ?? null,
    reqId: e.reqId ?? null,
    ip: e.ip ?? null,
  });
}

export async function hitungAudit(db: DbAtauTx): Promise<number> {
  const [baris] = await db.select({ n: sql<number>`count(*)::int` }).from(logAudit);
  return baris?.n ?? 0;
}

export async function daftarAudit(db: Db, batas = 100, entitasId?: string) {
  const dasar = db.select().from(logAudit);
  const disaring = entitasId ? dasar.where(eq(logAudit.entitasId, entitasId)) : dasar;
  return disaring.orderBy(desc(logAudit.id)).limit(batas);
}
