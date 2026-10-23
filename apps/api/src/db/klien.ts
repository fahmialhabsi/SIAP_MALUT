import { PGlite } from '@electric-sql/pglite';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import { migrate as migratePglite } from 'drizzle-orm/pglite/migrator';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { migrate as migratePg } from 'drizzle-orm/node-postgres/migrator';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import * as skema from './schema.js';

export type Db = PgDatabase<PgQueryResultHKT, typeof skema>;

export type JenisDb = 'pglite' | 'postgres';

export interface Koneksi {
  db: Db;
  jenis: JenisDb;
  /** Menjalankan migrasi dari apps/api/drizzle. */
  migrasi(): Promise<void>;
  /** Pemeriksaan cepat: dapat menjalankan `select 1`. */
  sehat(): Promise<boolean>;
  tutup(): Promise<void>;
}

export interface OpsiDb {
  /** URL PostgreSQL (produksi/kontainer). Bila ada, dipakai di atas dirDb. */
  databaseUrl?: string | undefined;
  /** Folder data PGlite (pengembangan). Kosong atau `memory://` = di memori (hilang saat berhenti). */
  dirDb?: string | undefined;
}

const folder = fileURLToPath(new URL('../../drizzle', import.meta.url));

/** Membuka basis data: PostgreSQL asli bila `databaseUrl` ada, selain itu PGlite. */
export async function bukaDatabase(opsi: OpsiDb): Promise<Koneksi> {
  if (opsi.databaseUrl) {
    const pool = new pg.Pool({ connectionString: opsi.databaseUrl });
    const db = drizzlePg(pool, { schema: skema });
    return {
      db,
      jenis: 'postgres',
      migrasi: () => migratePg(db, { migrationsFolder: folder }),
      sehat: async () => {
        try {
          await db.execute(sql`select 1`);
          return true;
        } catch {
          return false;
        }
      },
      tutup: () => pool.end(),
    };
  }

  const dir = !opsi.dirDb || opsi.dirDb === 'memory://' ? undefined : opsi.dirDb;
  const klien = new PGlite(dir);
  await klien.waitReady;
  const db = drizzlePglite(klien, { schema: skema });
  return {
    db,
    jenis: 'pglite',
    migrasi: () => migratePglite(db, { migrationsFolder: folder }),
    sehat: async () => {
      try {
        await db.execute(sql`select 1`);
        return true;
      } catch {
        return false;
      }
    },
    tutup: async () => {
      if (!klien.closed) await klien.close();
    },
  };
}
