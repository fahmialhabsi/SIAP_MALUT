import { randomUUID } from 'node:crypto';
import Fastify, { type FastifyInstance } from 'fastify';
import type { ApiConfig } from '@siap/shared';
import type { Koneksi } from './db/klien.js';

export interface BuildOptions {
  /** Matikan log (untuk pengujian). */
  silent?: boolean;
  /** Koneksi basis data; bila ada, `/ready` memeriksanya dan ditutup saat aplikasi ditutup. */
  koneksi?: Koneksi;
}

/**
 * Membangun aplikasi API. Log berformat JSON dengan ID permintaan (`reqId`, bawaan Fastify).
 * Titik kesehatan: `/health` (hidup) dan `/ready` (siap melayani, termasuk basis data).
 */
export function buildApp(config: ApiConfig, options: BuildOptions = {}): FastifyInstance {
  const app = Fastify({
    logger: options.silent ? false : { level: config.logLevel },
    requestIdHeader: 'x-request-id',
    genReqId: () => randomUUID(),
  });

  app.addHook('onSend', async (request, reply) => {
    reply.header('x-request-id', request.id);
  });

  if (options.koneksi) {
    const koneksi = options.koneksi;
    app.addHook('onClose', async () => {
      await koneksi.tutup();
    });
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
