import { describe, expect, it } from 'vitest';
import { loadApiConfig, parseAppMode } from './index.js';

describe('KB-030: konfigurasi dari lingkungan', () => {
  it('KB-034: APP_MODE kosong menjadi production', () => {
    expect(parseAppMode(undefined)).toBe('production');
    expect(parseAppMode('')).toBe('production');
    expect(parseAppMode('   ')).toBe('production');
  });

  it('KB-034: APP_MODE demo dan production diterima', () => {
    expect(parseAppMode('demo')).toBe('demo');
    expect(parseAppMode(' production ')).toBe('production');
  });

  it('KB-034: APP_MODE tidak valid melempar galat', () => {
    expect(() => parseAppMode('staging')).toThrow();
    expect(() => parseAppMode('DEMO')).toThrow();
  });

  it('KB-034: pesan galat APP_MODE jelas dan berbahasa Indonesia', () => {
    expect(() => parseAppMode('staging')).toThrow(/APP_MODE tidak valid: "staging"/);
  });

  it('KB-030: pesan galat konfigurasi menyebut nama variabel', () => {
    expect(() => loadApiConfig({ PORT: 'abc' })).toThrow(/PORT/);
  });

  it('KB-030: nilai bawaan konfigurasi API', () => {
    expect(loadApiConfig({})).toEqual({
      appMode: 'production',
      port: 3000,
      host: '0.0.0.0',
      logLevel: 'info',
    });
  });

  it('KB-030: konfigurasi dibaca dari lingkungan', () => {
    const cfg = loadApiConfig({
      APP_MODE: 'demo',
      PORT: '8081',
      HOST: '127.0.0.1',
      LOG_LEVEL: 'warn',
    });
    expect(cfg).toEqual({ appMode: 'demo', port: 8081, host: '127.0.0.1', logLevel: 'warn' });
  });

  it('KB-030: port atau tingkat log tidak valid melempar galat', () => {
    expect(() => loadApiConfig({ PORT: '0' })).toThrow();
    expect(() => loadApiConfig({ PORT: 'abc' })).toThrow();
    expect(() => loadApiConfig({ LOG_LEVEL: 'berisik' })).toThrow();
  });

  it('KB-030: konfigurasi basis data dan admin dibaca dari lingkungan', () => {
    const cfg = loadApiConfig({
      DATABASE_URL: 'postgres://siap:x@db:5432/siap',
      SIAP_DB_DIR: 'E:/data/dev',
      SIAP_ADMIN_PASSWORD: 'sandi-admin-panjang',
    });
    expect(cfg).toMatchObject({
      databaseUrl: 'postgres://siap:x@db:5432/siap',
      dbDir: 'E:/data/dev',
      adminPassword: 'sandi-admin-panjang',
    });
  });

  it('KB-041: kata sandi admin dari lingkungan minimal 12 karakter', () => {
    expect(() => loadApiConfig({ SIAP_ADMIN_PASSWORD: 'pendek' })).toThrow(/SIAP_ADMIN_PASSWORD/);
  });

  it('KB-030: kunci basis data tidak ada bila tidak diisi (menggunakan PGlite)', () => {
    const cfg = loadApiConfig({});
    expect(cfg.databaseUrl).toBeUndefined();
    expect(cfg.dbDir).toBeUndefined();
  });

  it('KB-030: variabel kosong (docker compose ${VAR:-}) dianggap tidak diisi', () => {
    const cfg = loadApiConfig({ DATABASE_URL: '', SIAP_DB_DIR: ' ', SIAP_ADMIN_PASSWORD: '' });
    expect(cfg.databaseUrl).toBeUndefined();
    expect(cfg.dbDir).toBeUndefined();
    expect(cfg.adminPassword).toBeUndefined();
  });
});
