import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from '@playwright/test';

/**
 * Uji ujung ke ujung (KB-050): aplikasi nyata (API + web, PGlite berkas sementara, data contoh) pada layar ponsel.
 * Di luar gate bawaan; jalankan `npm run test:e2e` (butuh `npx playwright install chromium` sekali).
 * Kata sandi di bawah adalah NILAI UJI untuk basis data sementara lokal, bukan rahasia.
 */
const akar = fileURLToPath(new URL('../..', import.meta.url));
const portApi = '3191';
const portWeb = '5191';
const SANDI_UJI = 'sandi-uji-e2e-lokal-123';

export default defineConfig({
  testDir: './e2e',
  outputDir: './test-results',
  timeout: 60_000,
  workers: 1,
  reporter: [['list']],
  use: { baseURL: `http://localhost:${portWeb}`, locale: 'id-ID', timezoneId: 'Asia/Jayapura' },
  projects: [
    {
      name: 'ponsel-360-terang',
      use: {
        browserName: 'chromium',
        viewport: { width: 360, height: 740 },
        colorScheme: 'light',
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'ponsel-412-gelap',
      use: {
        browserName: 'chromium',
        viewport: { width: 412, height: 915 },
        colorScheme: 'dark',
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: {
    command: 'node scripts/dev.mjs',
    cwd: akar,
    // /api/saya menjawab 401 hanya bila API sudah siap (PGlite butuh ±60 detik untuk migrasi dan seed pertama).
    url: `http://localhost:${portWeb}/api/saya`,
    reuseExistingServer: false,
    timeout: 180_000,
    env: {
      APP_MODE: 'demo',
      SIAP_API_PORT: portApi,
      SIAP_WEB_PORT: portWeb,
      SIAP_DB_DIR: join(mkdtempSync(join(tmpdir(), 'siap-e2e-')), 'pgdata'),
      SIAP_UNGGAHAN_DIR: join(mkdtempSync(join(tmpdir(), 'siap-e2e-')), 'unggahan'),
      SIAP_ADMIN_PASSWORD: SANDI_UJI,
      LOG_LEVEL: 'warn',
    },
  },
});
