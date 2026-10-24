import { afterAll, describe, expect, it } from 'vitest';
import { JENIS_UJI, tutupSemua } from './db/uji-db.helper.js';
import { aturSandiAkun } from './db/seed.js';
import { logAudit } from './db/schema.js';
import { ProfilSkema } from './skema-dto.js';
import { siapkanAppUji } from './uji-api.helper.js';

afterAll(tutupSemua);

const SANDI_KABAG = 'sandi-kabag-uji-123';

describe.each(JENIS_UJI)('KB-051: akun demo bersandi bagi peninjau jarak jauh (%s)', (jenis) => {
  it('KB-051: akun demo yang diberi kata sandi dapat masuk dengan hak perannya sendiri, bukan hak admin', async () => {
    const t = await siapkanAppUji(jenis);
    const hasil = await aturSandiAkun(t.koneksi.db, 'demo.kabag-protokol', SANDI_KABAG);
    expect(hasil.sandiSementara).toBeUndefined();

    const masuk = await t.panggil({
      method: 'POST',
      url: '/api/sesi',
      payload: { username: 'demo.kabag-protokol', sandi: SANDI_KABAG },
    });
    expect(masuk.statusCode).toBe(200);
    const profil = ProfilSkema.parse(masuk.json());
    expect(profil).toMatchObject({ peran: 'kabag_protokol', sebagaiPersona: false, mode: 'demo' });
    expect(profil.izin).not.toContain('pengaturan.ubah');
    expect(profil.izin).not.toContain('demo.pindah_persona');
    expect(profil.izin).toContain('kegiatan.buat');

    const kuki = String(masuk.headers['set-cookie']).split(';')[0] ?? '';
    const persona = await t.panggil({ method: 'GET', url: '/api/demo/persona', cookie: kuki });
    expect(persona.statusCode).toBe(403);
    const ubah = await t.panggil({
      method: 'PUT',
      url: '/api/pengaturan/durasiBawaanMenit',
      payload: { nilai: 60 },
      cookie: kuki,
    });
    expect(ubah.statusCode).toBe(403);
  });

  it('KB-051: tanpa kata sandi akun demo tetap tidak dapat masuk; sandi pendek ditolak; sandi acak dicetak sekali', async () => {
    const t = await siapkanAppUji(jenis);
    const tanpa = await t.panggil({
      method: 'POST',
      url: '/api/sesi',
      payload: { username: 'demo.ajudan', sandi: 'apa-saja-12345' },
    });
    expect(tanpa.statusCode).toBe(401);
    await expect(aturSandiAkun(t.koneksi.db, 'demo.ajudan', 'pendek')).rejects.toThrow(
      'minimal 12',
    );
    await expect(aturSandiAkun(t.koneksi.db, 'tidak.ada', SANDI_KABAG)).rejects.toThrow(
      'tidak ditemukan',
    );
    const acak = await aturSandiAkun(t.koneksi.db, 'demo.ajudan');
    expect(acak.sandiSementara?.length).toBeGreaterThanOrEqual(12);
    const masuk = await t.panggil({
      method: 'POST',
      url: '/api/sesi',
      payload: { username: 'demo.ajudan', sandi: acak.sandiSementara },
    });
    expect(masuk.statusCode).toBe(200);
  });

  it('KB-051: pengaturan sandi akun tercatat di log audit tanpa memuat kata sandi', async () => {
    const t = await siapkanAppUji(jenis);
    await aturSandiAkun(t.koneksi.db, 'demo.kabag-protokol', SANDI_KABAG);
    const log = (await t.koneksi.db.select().from(logAudit)).filter(
      (l) => l.aksi === 'admin.atur_sandi' && l.entitasId === 'demo.kabag-protokol',
    );
    expect(log.length).toBeGreaterThan(0);
    expect(JSON.stringify(log)).not.toContain(SANDI_KABAG);
  });
});
