import { z } from 'zod';

/** Mode aplikasi. Default `production` (aman). Lihat docs/standar/STANDAR_DATA_CONTOH.md bagian 4. */
export const APP_MODES = ['demo', 'production'] as const;
export type AppMode = (typeof APP_MODES)[number];

export const AppModeSchema = z.enum(APP_MODES);

/** Kosong/tidak diisi menjadi `production`; nilai selain `demo`/`production` melempar galat. */
export function parseAppMode(raw: string | undefined): AppMode {
  if (raw === undefined || raw.trim() === '') return 'production';
  const hasil = AppModeSchema.safeParse(raw.trim());
  if (!hasil.success) {
    throw new Error(`APP_MODE tidak valid: "${raw}". Gunakan "demo" atau "production".`);
  }
  return hasil.data;
}

export const LOG_LEVELS = ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'] as const;
export type LogLevel = (typeof LOG_LEVELS)[number];

/** Variabel lingkungan kosong (mis. dari docker compose `${VAR:-}`) dianggap tidak diisi. */
const kosongJadiTakAda = (v: unknown) => (typeof v === 'string' && v.trim() === '' ? undefined : v);

const ApiEnvSchema = z.object({
  APP_MODE: z.string().optional(),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  HOST: z.string().min(1).default('0.0.0.0'),
  LOG_LEVEL: z.enum(LOG_LEVELS).default('info'),
  DATABASE_URL: z.preprocess(kosongJadiTakAda, z.string().min(1).optional()),
  SIAP_DB_DIR: z.preprocess(kosongJadiTakAda, z.string().min(1).optional()),
  SIAP_ADMIN_PASSWORD: z.preprocess(
    kosongJadiTakAda,
    z.string().min(12, 'minimal 12 karakter').optional(),
  ),
});

export interface ApiConfig {
  appMode: AppMode;
  port: number;
  host: string;
  logLevel: LogLevel;
  /** URL PostgreSQL (produksi/kontainer). Kosong = PGlite. */
  databaseUrl?: string;
  /** Folder data PGlite (pengembangan). Kosong = di memori. */
  dbDir?: string;
  /** Kata sandi awal admin.owner (hanya untuk seed). Jangan dicatat. */
  adminPassword?: string;
}

/** Memuat konfigurasi API dari variabel lingkungan. Galat bila ada nilai tidak valid. */
export function loadApiConfig(env: Record<string, string | undefined>): ApiConfig {
  const hasil = ApiEnvSchema.safeParse(env);
  if (!hasil.success) {
    const rincian = hasil.error.issues
      .map((i) => `${i.path.join('.') || '(umum)'}: ${i.message}`)
      .join('; ');
    throw new Error(`Konfigurasi tidak valid: ${rincian}`);
  }
  const parsed = hasil.data;
  return {
    appMode: parseAppMode(parsed.APP_MODE),
    port: parsed.PORT,
    host: parsed.HOST,
    logLevel: parsed.LOG_LEVEL,
    ...(parsed.DATABASE_URL ? { databaseUrl: parsed.DATABASE_URL } : {}),
    ...(parsed.SIAP_DB_DIR ? { dbDir: parsed.SIAP_DB_DIR } : {}),
    ...(parsed.SIAP_ADMIN_PASSWORD ? { adminPassword: parsed.SIAP_ADMIN_PASSWORD } : {}),
  };
}
