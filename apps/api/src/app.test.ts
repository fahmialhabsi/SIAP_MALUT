import { describe, expect, it } from 'vitest';
import { loadApiConfig } from '@siap/shared';
import { buildApp } from './app.js';
import { bukaDatabase } from './db/klien.js';
import { DataContohDiProduksiError, pastikanTanpaDataContoh } from './penjaga.js';

const config = loadApiConfig({});

describe('KB-030: titik kesehatan', () => {
  it('KB-030: GET /health mengembalikan 200 dan status ok', async () => {
    const app = buildApp(config, { silent: true });
    const res = await app.inject({ method: 'GET', url: '/health' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: 'ok' });
    await app.close();
  });

  it('KB-030: GET /ready mengembalikan 200 beserta mode', async () => {
    const app = buildApp(loadApiConfig({ APP_MODE: 'demo' }), { silent: true });
    const res = await app.inject({ method: 'GET', url: '/ready' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: 'ready', mode: 'demo', checks: {} });
    await app.close();
  });

  it('KB-030: ID permintaan dibuat dan dikembalikan di header', async () => {
    const app = buildApp(config, { silent: true });
    const res = await app.inject({ method: 'GET', url: '/health' });
    expect(res.headers['x-request-id']).toMatch(/^[0-9a-f-]{36}$/);
    await app.close();
  });

  it('KB-030: ID permintaan dari klien dipertahankan', async () => {
    const app = buildApp(config, { silent: true });
    const res = await app.inject({
      method: 'GET',
      url: '/health',
      headers: { 'x-request-id': 'uji-123' },
    });
    expect(res.headers['x-request-id']).toBe('uji-123');
    await app.close();
  });

  it('KB-030: rute tak dikenal mengembalikan 404', async () => {
    const app = buildApp(config, { silent: true });
    const res = await app.inject({ method: 'GET', url: '/tidak-ada' });
    expect(res.statusCode).toBe(404);
    await app.close();
  });
});

describe('KB-034: penjaga produksi', () => {
  it('KB-034: production menolak bila ada data contoh', () => {
    expect(() => pastikanTanpaDataContoh('production', 3)).toThrow(DataContohDiProduksiError);
  });

  it('KB-034: production tanpa data contoh diizinkan', () => {
    expect(() => pastikanTanpaDataContoh('production', 0)).not.toThrow();
  });

  it('KB-034: demo boleh memuat data contoh', () => {
    expect(() => pastikanTanpaDataContoh('demo', 25)).not.toThrow();
  });
});

describe('KB-030: /ready memeriksa basis data', () => {
  it('KB-030: basis data sehat = 200 dan checks.basisData ok', async () => {
    const koneksi = await bukaDatabase({});
    await koneksi.migrasi();
    const app = buildApp(config, { silent: true, koneksi });
    const res = await app.inject({ method: 'GET', url: '/ready' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ status: 'ready', checks: { basisData: 'ok' } });
    await app.close();
  });

  it('KB-030: basis data tidak dapat dijangkau = 503 not_ready', async () => {
    const koneksi = await bukaDatabase({});
    await koneksi.migrasi();
    await koneksi.tutup();
    const app = buildApp(config, { silent: true, koneksi });
    const res = await app.inject({ method: 'GET', url: '/ready' });
    expect(res.statusCode).toBe(503);
    expect(res.json()).toMatchObject({ status: 'not_ready', checks: { basisData: 'gagal' } });
    await app.close();
  });

  it('KB-030: /health tetap 200 walau basis data mati (hanya menandakan proses hidup)', async () => {
    const koneksi = await bukaDatabase({});
    await koneksi.tutup();
    const app = buildApp(config, { silent: true, koneksi });
    expect((await app.inject({ method: 'GET', url: '/health' })).statusCode).toBe(200);
    await app.close();
  });
});
