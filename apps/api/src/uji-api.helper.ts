/**
 * Pembantu uji API: membangun aplikasi di atas basis data bersama (PGlite memori atau PostgreSQL uji),
 * membuat sesi untuk persona tanpa melalui kata sandi, dan memanggil rute lewat `inject`.
 */
import type { FastifyInstance, InjectOptions } from 'fastify';
import { loadApiConfig, type AppMode } from '@siap/shared';
import { buildApp } from './app.js';
import type { JenisDb, Koneksi } from './db/klien.js';
import { aturSandiAdmin } from './db/seed.js';
import { pengguna } from './db/schema.js';
import { buatSesi, NAMA_KUKI } from './keamanan/sesi.js';
import { PenyimpananMemori } from './penyimpanan.js';
import { eq } from 'drizzle-orm';
import { siapkanBersama } from './db/uji-db.helper.js';

export const SANDI_ADMIN_UJI = 'sandi-admin-uji-12345';

/** Peran -> akun contoh yang mewakilinya. */
export const AKUN_PERAN: Record<string, string> = {
  admin: 'admin.owner',
  kepala_biro: 'demo.kepala-biro',
  kabag_protokol: 'demo.kabag-protokol',
  protokol: 'demo.protokol01',
  ajudan: 'demo.ajudan',
  pimpinan: 'demo.gubernur',
  pejabat: 'demo.kadis-pangan',
  pemohon: 'demo.pemohon',
  publik: 'demo.publik',
};

export interface AppUji {
  app: FastifyInstance;
  koneksi: Koneksi;
  penyimpanan: PenyimpananMemori;
  /** Jam yang dapat digeser oleh uji. */
  jam: { sekarang: Date };
  cookie(username: string): Promise<string>;
  panggil(opsi: InjectOptions & { cookie?: string }): ReturnType<FastifyInstance['inject']>;
}

export async function siapkanAppUji(
  jenis: JenisDb,
  opsi: { mode?: AppMode; maksUnggahByte?: number; sekarang?: Date } = {},
): Promise<AppUji> {
  const koneksi = await siapkanBersama(jenis, true);
  // Akun uji: admin dengan sandi diketahui, dan satu akun 'publik' (tidak ada pada seed).
  await aturSandiAdmin(koneksi.db, SANDI_ADMIN_UJI);
  await koneksi.db
    .insert(pengguna)
    .values({
      id: 'demo.publik',
      username: 'demo.publik',
      nama: 'Publik (CONTOH)',
      peran: 'publik',
      isContoh: true,
    })
    .onConflictDoNothing();

  const jam = { sekarang: opsi.sekarang ?? new Date('2026-10-23T05:00:00Z') };
  const penyimpanan = new PenyimpananMemori();
  const config = loadApiConfig({ APP_MODE: opsi.mode ?? 'demo' });
  const app = buildApp(config, {
    silent: true,
    koneksi,
    penyimpanan,
    sekarang: () => jam.sekarang,
    tutupKoneksi: false,
    ...(opsi.maksUnggahByte ? { maksUnggahByte: opsi.maksUnggahByte } : {}),
  });
  await app.ready();

  const cache = new Map<string, string>();
  return {
    app,
    koneksi,
    penyimpanan,
    jam,
    async cookie(username) {
      const ada = cache.get(username);
      if (ada) return ada;
      const [akun] = await koneksi.db
        .select({ id: pengguna.id })
        .from(pengguna)
        .where(eq(pengguna.username, username));
      if (!akun) throw new Error(`Akun uji tidak ada: ${username}`);
      const { token } = await buatSesi(koneksi.db, akun.id, { sekarang: jam.sekarang });
      const nilai = `${NAMA_KUKI}=${token}`;
      cache.set(username, nilai);
      return nilai;
    },
    panggil({ cookie, headers, ...sisa }) {
      return app.inject({
        ...sisa,
        headers: { ...(cookie ? { cookie } : {}), ...(headers ?? {}) },
      } as InjectOptions);
    },
  };
}

/** Membuat isi multipart/form-data untuk satu berkas pada kolom "berkas". */
export function buatMultipart(nama: string, isi: Buffer, tipe = 'application/octet-stream') {
  const batas = '----siap-uji-batas';
  const kepala = Buffer.from(
    `--${batas}\r\nContent-Disposition: form-data; name="berkas"; filename="${nama}"\r\nContent-Type: ${tipe}\r\n\r\n`,
  );
  const ekor = Buffer.from(`\r\n--${batas}--\r\n`);
  return {
    payload: Buffer.concat([kepala, isi, ekor]),
    headers: { 'content-type': `multipart/form-data; boundary=${batas}` },
  };
}

export const PDF_KECIL = Buffer.from('%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n');
export const PNG_KECIL = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  Buffer.from('data-uji'),
]);
