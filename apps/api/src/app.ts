import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import fastifyCookie from '@fastify/cookie';
import fastifyMultipart from '@fastify/multipart';
import Fastify, { type FastifyInstance } from 'fastify';
import type { ApiConfig } from '@siap/shared';
import type { Koneksi } from './db/klien.js';
import { PenyimpananDisk, type Penyimpanan } from './penyimpanan.js';
import { GalatApi, pasangRute, type Deps } from './rute.js';
import { daftarRute } from './rute/index.js';

/** Batas bawaan unggahan lampiran: 10 MB. */
export const MAKS_UNGGAH_BYTE = 10 * 1024 * 1024;

export interface BuildOptions {
  /** Matikan log (untuk pengujian). */
  silent?: boolean;
  /** Koneksi basis data; bila ada, rute aplikasi dipasang, `/ready` memeriksanya, dan ditutup saat aplikasi ditutup. */
  koneksi?: Koneksi;
  /** Penyimpanan berkas (bawaan: disk di SIAP_UNGGAHAN_DIR atau data/unggahan). */
  penyimpanan?: Penyimpanan;
  /** Penyuntik waktu (uji). */
  sekarang?: () => Date;
  maksUnggahByte?: number;
  /** Tutup koneksi saat aplikasi ditutup (bawaan benar; uji dengan koneksi bersama mematikannya). */
  tutupKoneksi?: boolean;
}

/**
 * Membangun aplikasi API. Log berformat JSON dengan ID permintaan (`reqId`, bawaan Fastify).
 * Titik kesehatan: `/health` (hidup) dan `/ready` (siap melayani, termasuk basis data).
 * Urutan penanganan rute aplikasi: autentikasi -> izin -> validasi -> penangan (lihat rute.ts).
 */
export function buildApp(config: ApiConfig, options: BuildOptions = {}): FastifyInstance {
  const maksUnggahByte = options.maksUnggahByte ?? MAKS_UNGGAH_BYTE;
  const app = Fastify({
    logger: options.silent ? false : { level: config.logLevel },
    requestIdHeader: 'x-request-id',
    genReqId: () => randomUUID(),
    bodyLimit: 1024 * 1024,
    trustProxy: config.trustProxy ?? false,
  });

  void app.register(fastifyCookie);
  void app.register(fastifyMultipart, {
    limits: { fileSize: maksUnggahByte, files: 1, fields: 5 },
  });

  // Perlindungan CSRF tambahan di atas SameSite=Strict: permintaan pengubah dengan Origin harus satu asal dengan Host.
  app.addHook('onRequest', async (request) => {
    const metode = request.method;
    if (metode === 'GET' || metode === 'HEAD' || metode === 'OPTIONS') return;
    const asal = request.headers.origin;
    if (!asal) return;
    let host: string | null;
    try {
      host = new URL(asal).host;
    } catch {
      host = null;
    }
    if (host !== request.headers.host) {
      throw new GalatApi(403, 'asal_ditolak', 'Permintaan dari asal yang tidak diizinkan.');
    }
  });

  app.addHook('onSend', async (request, reply) => {
    reply.header('x-request-id', request.id);
    reply.header('x-content-type-options', 'nosniff');
    reply.header('referrer-policy', 'no-referrer');
    if (request.url.startsWith('/api') && !reply.hasHeader('cache-control')) {
      reply.header('cache-control', 'no-store');
    }
  });

  app.setErrorHandler((err, request, reply) => {
    if (err instanceof GalatApi) {
      return reply.code(err.status).send({
        galat: {
          kode: err.kode,
          pesan: err.message,
          ...(err.rincian ? { rincian: err.rincian } : {}),
        },
      });
    }
    const status = (err as { statusCode?: number }).statusCode;
    if (status && status >= 400 && status < 500) {
      const pesan =
        status === 413
          ? 'Isi permintaan terlalu besar.'
          : status === 415
            ? 'Jenis isi permintaan tidak didukung.'
            : 'Permintaan tidak valid.';
      return reply.code(status).send({ galat: { kode: 'permintaan_tidak_valid', pesan } });
    }
    request.log.error({ err }, 'galat tak terduga');
    return reply
      .code(500)
      .send({ galat: { kode: 'galat_server', pesan: 'Terjadi kesalahan di server.' } });
  });

  app.setNotFoundHandler((_request, reply) =>
    reply.code(404).send({ galat: { kode: 'tidak_ditemukan', pesan: 'Rute tidak ditemukan.' } }),
  );

  if (options.koneksi) {
    const koneksi = options.koneksi;
    if (options.tutupKoneksi !== false) {
      app.addHook('onClose', async () => {
        await koneksi.tutup();
      });
    }
    const deps: Deps = {
      db: koneksi.db,
      config,
      penyimpanan:
        options.penyimpanan ??
        new PenyimpananDisk(config.uploadDir ?? join(process.cwd(), 'data', 'unggahan')),
      sekarang: options.sekarang ?? (() => new Date()),
      maksUnggahByte,
    };
    pasangRute(app, daftarRute(deps), deps);
  }

  app.get('/health', async () => ({ status: 'ok' }));

  app.get('/ready', async (_request, reply) => {
    const checks: Record<string, 'ok' | 'gagal'> = {};
    if (options.koneksi) {
      checks.basisData = (await options.koneksi.sehat()) ? 'ok' : 'gagal';
    }
    const siap = Object.values(checks).every((c) => c === 'ok');
    if (!siap) reply.code(503);
    return { status: siap ? 'ready' : 'not_ready', mode: config.appMode, checks };
  });

  return app;
}
