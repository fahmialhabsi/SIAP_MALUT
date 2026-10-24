import { eq } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';
import { loadApiConfig } from '@siap/shared';
import { buildApp } from './app.js';
import { JENIS_UJI, tutupSemua } from './db/uji-db.helper.js';
import { logAudit, pengguna, sesi } from './db/schema.js';
import { MAKS_GAGAL } from './keamanan/masuk.js';
import { ProfilSkema } from './skema-dto.js';
import { SANDI_ADMIN_UJI, siapkanAppUji } from './uji-api.helper.js';

afterAll(tutupSemua);

function ambilKuki(res: { headers: Record<string, unknown> }): string {
  const set = res.headers['set-cookie'];
  return Array.isArray(set) ? String(set[0]) : String(set ?? '');
}

describe.each(JENIS_UJI)('autentikasi (%s)', (jenis) => {
  it('KB-041: masuk berhasil mengembalikan profil sesuai skema dan kuki httpOnly SameSite=Strict', async () => {
    const t = await siapkanAppUji(jenis);
    const res = await t.panggil({
      method: 'POST',
      url: '/api/sesi',
      payload: { username: 'admin.owner', sandi: SANDI_ADMIN_UJI },
    });
    expect(res.statusCode).toBe(200);
    const profil = ProfilSkema.parse(res.json());
    expect(profil).toMatchObject({
      username: 'admin.owner',
      peran: 'admin',
      mode: 'demo',
      sebagaiPersona: false,
    });
    expect(profil.izin).toContain('audit.baca');
    const kuki = ambilKuki(res);
    expect(kuki).toMatch(/^siap_sesi=/);
    expect(kuki).toMatch(/HttpOnly/i);
    expect(kuki).toMatch(/SameSite=Strict/i);
    expect(kuki).not.toMatch(/Secure/i); // mode demo (http)
    expect(res.headers['cache-control']).toBe('no-store');
    await t.app.close();
  });

  it('KB-041: pada mode production kuki bertanda Secure', async () => {
    const t = await siapkanAppUji(jenis, { mode: 'production' });
    const res = await t.panggil({
      method: 'POST',
      url: '/api/sesi',
      payload: { username: 'admin.owner', sandi: SANDI_ADMIN_UJI },
    });
    expect(res.statusCode).toBe(200);
    expect(ambilKuki(res)).toMatch(/Secure/i);
    await t.app.close();
  });

  it('KB-041: kuki hasil masuk dapat dipakai; hanya hash token tersimpan di basis data', async () => {
    const t = await siapkanAppUji(jenis);
    const res = await t.panggil({
      method: 'POST',
      url: '/api/sesi',
      payload: { username: 'admin.owner', sandi: SANDI_ADMIN_UJI },
    });
    const token = ambilKuki(res).split(';')[0]?.split('=')[1] ?? '';
    const saya = await t.panggil({ method: 'GET', url: '/api/saya', cookie: `siap_sesi=${token}` });
    expect(saya.statusCode).toBe(200);
    const baris = await t.koneksi.db.select().from(sesi);
    expect(baris.length).toBeGreaterThan(0);
    expect(baris.some((b) => b.idHash === token)).toBe(false);
    expect(baris.every((b) => /^[0-9a-f]{64}$/.test(b.idHash))).toBe(true);
    await t.app.close();
  });

  it('KB-041: kata sandi salah dan pengguna tak dikenal menghasilkan pesan yang sama (401)', async () => {
    const t = await siapkanAppUji(jenis);
    const salah = await t.panggil({
      method: 'POST',
      url: '/api/sesi',
      payload: { username: 'admin.owner', sandi: 'salah-total' },
    });
    const asing = await t.panggil({
      method: 'POST',
      url: '/api/sesi',
      payload: { username: 'tidak.ada', sandi: 'salah-total' },
    });
    expect(salah.statusCode).toBe(401);
    expect(asing.statusCode).toBe(401);
    expect(salah.json()).toEqual(asing.json());
    await t.app.close();
  });

  it('KB-041: persona tanpa kata sandi tidak dapat masuk', async () => {
    const t = await siapkanAppUji(jenis);
    const res = await t.panggil({
      method: 'POST',
      url: '/api/sesi',
      payload: { username: 'demo.gubernur', sandi: 'apa-saja-123' },
    });
    expect(res.statusCode).toBe(401);
    await t.app.close();
  });

  it('KB-041: lima kegagalan beruntun mengunci akun; sandi benar pun ditolak (423) sampai waktu lewat', async () => {
    const t = await siapkanAppUji(jenis);
    for (let i = 0; i < MAKS_GAGAL; i++) {
      const r = await t.panggil({
        method: 'POST',
        url: '/api/sesi',
        payload: { username: 'admin.owner', sandi: `salah-${i}` },
      });
      expect(r.statusCode).toBe(401);
    }
    const terkunci = await t.panggil({
      method: 'POST',
      url: '/api/sesi',
      payload: { username: 'admin.owner', sandi: SANDI_ADMIN_UJI },
    });
    expect(terkunci.statusCode).toBe(423);
    expect(terkunci.json().galat.kode).toBe('terkunci');
    // Setelah 16 menit akun terbuka lagi.
    t.jam.sekarang = new Date(t.jam.sekarang.getTime() + 16 * 60_000);
    const terbuka = await t.panggil({
      method: 'POST',
      url: '/api/sesi',
      payload: { username: 'admin.owner', sandi: SANDI_ADMIN_UJI },
    });
    expect(terbuka.statusCode).toBe(200);
    await t.app.close();
  });

  it('KB-041: masuk berhasil mengatur ulang hitungan gagal', async () => {
    const t = await siapkanAppUji(jenis);
    for (let i = 0; i < MAKS_GAGAL - 1; i++) {
      await t.panggil({
        method: 'POST',
        url: '/api/sesi',
        payload: { username: 'admin.owner', sandi: `salah-${i}` },
      });
    }
    const ok = await t.panggil({
      method: 'POST',
      url: '/api/sesi',
      payload: { username: 'admin.owner', sandi: SANDI_ADMIN_UJI },
    });
    expect(ok.statusCode).toBe(200);
    const [akun] = await t.koneksi.db
      .select()
      .from(pengguna)
      .where(eq(pengguna.username, 'admin.owner'));
    expect(akun?.gagalMasuk).toBe(0);
    await t.app.close();
  });

  it('KB-041: keluar mengakhiri sesi dan menghapus kuki', async () => {
    const t = await siapkanAppUji(jenis);
    const cookie = await t.cookie('admin.owner');
    const keluar = await t.panggil({ method: 'DELETE', url: '/api/sesi', cookie });
    expect(keluar.statusCode).toBe(204);
    expect(ambilKuki(keluar)).toMatch(/siap_sesi=;/);
    const lagi = await t.panggil({ method: 'GET', url: '/api/saya', cookie });
    expect(lagi.statusCode).toBe(401);
    await t.app.close();
  });

  it('KB-041: sesi kedaluwarsa ditolak (401)', async () => {
    const t = await siapkanAppUji(jenis);
    const cookie = await t.cookie('admin.owner');
    expect((await t.panggil({ method: 'GET', url: '/api/saya', cookie })).statusCode).toBe(200);
    t.jam.sekarang = new Date(t.jam.sekarang.getTime() + 13 * 3_600_000);
    expect((await t.panggil({ method: 'GET', url: '/api/saya', cookie })).statusCode).toBe(401);
    await t.app.close();
  });

  it('KB-041: tanpa kuki atau kuki palsu ditolak (401)', async () => {
    const t = await siapkanAppUji(jenis);
    expect((await t.panggil({ method: 'GET', url: '/api/saya' })).statusCode).toBe(401);
    expect(
      (await t.panggil({ method: 'GET', url: '/api/saya', cookie: 'siap_sesi=palsu' })).statusCode,
    ).toBe(401);
    await t.app.close();
  });

  it('KB-041: akun yang dinonaktifkan tidak dapat memakai sesi lamanya', async () => {
    const t = await siapkanAppUji(jenis);
    const cookie = await t.cookie('demo.protokol01');
    await t.koneksi.db
      .update(pengguna)
      .set({ aktif: false })
      .where(eq(pengguna.username, 'demo.protokol01'));
    expect((await t.panggil({ method: 'GET', url: '/api/saya', cookie })).statusCode).toBe(401);
    await t.app.close();
  });

  it('KB-016: masuk dan keluar tercatat; kata sandi tidak pernah masuk log audit', async () => {
    const t = await siapkanAppUji(jenis);
    await t.panggil({
      method: 'POST',
      url: '/api/sesi',
      payload: { username: 'admin.owner', sandi: 'sandi-salah-rahasia' },
    });
    await t.panggil({
      method: 'POST',
      url: '/api/sesi',
      payload: { username: 'admin.owner', sandi: SANDI_ADMIN_UJI },
    });
    const log = await t.koneksi.db.select().from(logAudit);
    const aksi = log.map((l) => l.aksi);
    expect(aksi).toContain('masuk.gagal');
    expect(aksi).toContain('masuk.berhasil');
    const semua = JSON.stringify(log);
    expect(semua).not.toContain('sandi-salah-rahasia');
    expect(semua).not.toContain(SANDI_ADMIN_UJI);
    await t.app.close();
  });

  it('KB-041: masukan tidak valid ditolak (400) dengan rincian', async () => {
    const t = await siapkanAppUji(jenis);
    const res = await t.panggil({ method: 'POST', url: '/api/sesi', payload: { username: '' } });
    expect(res.statusCode).toBe(400);
    expect(res.json().galat.kode).toBe('tidak_valid');
    expect(res.json().galat.rincian.length).toBeGreaterThan(0);
    await t.app.close();
  });
});

describe('keamanan lintas-asal dan header', () => {
  it('KB-041: permintaan pengubah dari asal berbeda ditolak (403)', async () => {
    const t = await siapkanAppUji('pglite');
    const res = await t.panggil({
      method: 'POST',
      url: '/api/sesi',
      headers: { origin: 'https://situs-jahat.example', host: 'localhost:3180' },
      payload: { username: 'admin.owner', sandi: SANDI_ADMIN_UJI },
    });
    expect(res.statusCode).toBe(403);
    expect(res.json().galat.kode).toBe('asal_ditolak');
    await t.app.close();
  });

  it('KB-041: permintaan satu asal (Origin = Host) diterima', async () => {
    const t = await siapkanAppUji('pglite');
    const res = await t.panggil({
      method: 'POST',
      url: '/api/sesi',
      headers: { origin: 'http://localhost:5180', host: 'localhost:5180' },
      payload: { username: 'admin.owner', sandi: SANDI_ADMIN_UJI },
    });
    expect(res.statusCode).toBe(200);
    await t.app.close();
  });

  it('KB-041: header keamanan dan ID permintaan hadir pada respons', async () => {
    const t = await siapkanAppUji('pglite');
    const res = await t.panggil({ method: 'GET', url: '/api/saya' });
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['referrer-policy']).toBe('no-referrer');
    expect(res.headers['x-request-id']).toBeTruthy();
    await t.app.close();
  });

  it('KB-041: tanpa basis data tidak ada rute aplikasi (hanya health/ready)', async () => {
    const app = buildApp(loadApiConfig({}), { silent: true });
    expect((await app.inject({ method: 'GET', url: '/api/saya' })).statusCode).toBe(404);
    await app.close();
  });
});
