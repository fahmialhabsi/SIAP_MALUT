import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@siap/shared': fileURLToPath(new URL('../../packages/shared/src/index.ts', import.meta.url)),
      '@siap/domain': fileURLToPath(new URL('../../packages/domain/src/index.ts', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    testTimeout: 120000,
    hookTimeout: 180000,
    // Setiap berkas uji membuka PGlite (WASM); terlalu banyak paralel membuat komputer yang lambat kehabisan waktu.
    maxWorkers: 3,
    // PostgreSQL asli dipakai bersama oleh seluruh berkas uji: jalankan berurutan agar tidak saling menghapus.
    fileParallelism: !process.env.SIAP_TEST_DATABASE_URL,
  },
});
