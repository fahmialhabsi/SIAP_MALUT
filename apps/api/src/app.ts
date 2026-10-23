import { randomUUID } from 'node:crypto';
import Fastify, { type FastifyInstance } from 'fastify';
import type { ApiConfig } from '@siap/shared';

export interface BuildOptions {
  /** Matikan log (untuk pengujian). */
  silent?: boolean;
}

/**
 * Membangun aplikasi API. Log berformat JSON dengan ID permintaan (`reqId`, bawaan Fastify).
 * Titik kesehatan: `/health` (hidup) dan `/ready` (siap melayani).
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

  app.get('/health', async () => ({ status: 'ok' }));

  app.get('/ready', async () => ({
    status: 'ready',
    mode: config.appMode,
    // Pemeriksaan ketergantungan (basis data, penyimpanan) ditambahkan di Tahap 1.3.
    checks: {},
  }));

  return app;
}
