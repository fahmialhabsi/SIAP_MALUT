import { eq } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';
import { z } from 'zod';
import { JENIS_UJI, tutupSemua } from './db/uji-db.helper.js';
import { logAudit } from './db/schema.js';
import { PersonaSkema, ProfilSkema } from './skema-dto.js';
import { siapkanAppUji } from './uji-api.helper.js';

afterAll(tutupSemua);

describe.each(JENIS_UJI)('mode demo: pindah persona (%s)', (jenis) => {
  it('KB-032: admin berpindah ke persona, melihat dengan hak persona, lalu kembali', async () => {
    const t = await siapkanAppUji(jenis);
    const cookie = await t.cookie('admin.owner');

    const daftar = await t.panggil({ method: 'GET', url: '/api/demo/persona', cookie });
    expect(daftar.statusCode).toBe(200);
    const persona = z.array(PersonaSkema).parse(daftar.json());
    expect(persona.map((p) => p.username)).not.toContain('admin.owner');
    expect(persona.map((p) => p.username)).toContain('demo.gubernur');

    const pindah = await t.panggil({
      method: 'POST',
      url: '/api/demo/persona',
      cookie,
      payload: { username: 'demo.gubernur' },
    });
    expect(pindah.statusCode).toBe(200);
    expect(ProfilSkema.parse(pindah.json())).toMatchObject({
      username: 'demo.gubernur',
      peran: 'pimpinan',
      sebagaiPersona: true,
      akunAsli: 'admin.owner',
    });

    // Dengan hak persona (pimpinan): dapat membaca, tidak dapat membuat kegiatan atau melihat audit.
    const saya = ProfilSkema.parse(
      (await t.panggil({ method: 'GET', url: '/api/saya', cookie })).json(),
    );
    expect(saya.peran).toBe('pimpinan');
    expect(saya.izin).not.toContain('kegiatan.buat');
    expect((await t.panggil({ method: 'GET', url: '/api/kegiatan', cookie })).statusCode).toBe(200);
    expect(
      (
        await t.panggil({
          method: 'POST',
          url: '/api/kegiatan',
          cookie,
          payload: { judul: 'x', mulai: '2026-11-02T09:00:00+09:00' },
        })
      ).statusCode,
    ).toBe(403);
    expect((await t.panggil({ method: 'GET', url: '/api/audit', cookie })).statusCode).toBe(403);

    // Tetap dapat kembali (izin demo dari akun asli).
    expect(
      (await t.panggil({ method: 'DELETE', url: '/api/demo/persona', cookie })).statusCode,
    ).toBe(204);
    const kembali = ProfilSkema.parse(
      (await t.panggil({ method: 'GET', url: '/api/saya', cookie })).json(),
    );
    expect(kembali).toMatchObject({
      username: 'admin.owner',
      peran: 'admin',
      sebagaiPersona: false,
      akunAsli: null,
    });
    expect((await t.panggil({ method: 'GET', url: '/api/audit', cookie })).statusCode).toBe(200);
    await t.app.close();
  });

  it('KB-032: perpindahan persona dan kembalinya tercatat; tindakan sebagai persona mencatat admin dan persona', async () => {
    const t = await siapkanAppUji(jenis);
    const cookie = await t.cookie('admin.owner');
    await t.panggil({
      method: 'POST',
      url: '/api/demo/persona',
      cookie,
      payload: { username: 'demo.kabag-protokol' },
    });
    const pindahStatus = await t.panggil({
      method: 'POST',
      url: '/api/kegiatan/K22-05/pindah-status',
      cookie,
      payload: { ke: 'ditetapkan' },
    });
    expect(pindahStatus.statusCode).toBe(200);
    await t.panggil({ method: 'DELETE', url: '/api/demo/persona', cookie });
    const aksi = (await t.koneksi.db.select().from(logAudit)).map((l) => l.aksi);
    expect(aksi).toEqual(
      expect.arrayContaining(['demo.pindah_persona', 'kegiatan.pindah_status', 'demo.kembali']),
    );
    const [peristiwa] = await t.koneksi.db
      .select()
      .from(logAudit)
      .where(eq(logAudit.aksi, 'kegiatan.pindah_status'));
    expect(peristiwa?.aktor).toBe('admin.owner (sebagai demo.kabag-protokol)');
    expect(peristiwa?.aktorPeran).toBe('kabag_protokol');
    await t.app.close();
  });

  it('KB-032: persona tidak dikenal atau akun sendiri ditolak (400); sesi lain admin tidak terpengaruh', async () => {
    const t = await siapkanAppUji(jenis);
    const cookie = await t.cookie('admin.owner');
    expect(
      (
        await t.panggil({
          method: 'POST',
          url: '/api/demo/persona',
          cookie,
          payload: { username: 'hantu' },
        })
      ).statusCode,
    ).toBe(400);
    expect(
      (
        await t.panggil({
          method: 'POST',
          url: '/api/demo/persona',
          cookie,
          payload: { username: 'admin.owner' },
        })
      ).statusCode,
    ).toBe(400);
    await t.panggil({
      method: 'POST',
      url: '/api/demo/persona',
      cookie,
      payload: { username: 'demo.gubernur' },
    });
    const lain = await t.panggil({
      method: 'POST',
      url: '/api/sesi',
      payload: { username: 'admin.owner', sandi: 'sandi-admin-uji-12345' },
    });
    const kuki = String(lain.headers['set-cookie']).split(';')[0] ?? '';
    const profil = ProfilSkema.parse(
      (await t.panggil({ method: 'GET', url: '/api/saya', cookie: kuki })).json(),
    );
    expect(profil.peran).toBe('admin');
    await t.app.close();
  });

  it('KB-032: peran selain admin tidak dapat memakai fitur persona (403)', async () => {
    const t = await siapkanAppUji(jenis);
    const cookie = await t.cookie('demo.kabag-protokol');
    for (const [metode, payload] of [
      ['GET', undefined],
      ['POST', { username: 'demo.gubernur' }],
      ['DELETE', undefined],
    ] as const) {
      const res = await t.panggil({
        method: metode,
        url: '/api/demo/persona',
        cookie,
        ...(payload ? { payload } : {}),
      });
      expect(res.statusCode, metode).toBe(403);
    }
    await t.app.close();
  });

  it('KB-034: pada mode production fitur persona tidak ada (404) walau admin', async () => {
    const t = await siapkanAppUji(jenis, { mode: 'production' });
    const cookie = await t.cookie('admin.owner');
    for (const [metode, payload] of [
      ['GET', undefined],
      ['POST', { username: 'demo.gubernur' }],
      ['DELETE', undefined],
    ] as const) {
      const res = await t.panggil({
        method: metode,
        url: '/api/demo/persona',
        cookie,
        ...(payload ? { payload } : {}),
      });
      expect(res.statusCode, metode).toBe(404);
    }
    await t.app.close();
  });
});
