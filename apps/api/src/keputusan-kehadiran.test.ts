import { afterAll, describe, expect, it } from 'vitest';
import { JENIS_UJI, tutupSemua } from './db/uji-db.helper.js';
import { logAudit } from './db/schema.js';
import { HasilKeputusanSkema, KegiatanSkema } from './skema-dto.js';
import { siapkanAppUji, type AppUji } from './uji-api.helper.js';

afterAll(tutupSemua);

const KABAG = 'demo.kabag-protokol';
const GUBERNUR = 'demo.gubernur';

const putuskan = async (t: AppUji, akun: string, id: string, payload: unknown) =>
  t.panggil({
    method: 'POST',
    url: `/api/kegiatan/${id}/keputusan-kehadiran`,
    payload: payload as object,
    cookie: await t.cookie(akun),
  });

const ambil = async (t: AppUji, id: string) =>
  KegiatanSkema.parse(
    (
      await t.panggil({ method: 'GET', url: `/api/kegiatan/${id}`, cookie: await t.cookie(KABAG) })
    ).json(),
  );

/** Log audit bersifat append-only dan dibagi antaruji: bandingkan dengan jumlah sebelum permintaan. */
const semuaAudit = async (t: AppUji) =>
  (await t.koneksi.db.select().from(logAudit))
    .filter((l) => l.aksi === 'kegiatan.keputusan_kehadiran')
    .sort((x, y) => x.id - y.id);

describe.each(JENIS_UJI)('KB-047: keputusan kehadiran atomik (%s)', (jenis) => {
  it('KB-047: hadir sendiri menjadikan pimpinan Diterima (utama), satu catatan audit', async () => {
    const t = await siapkanAppUji(jenis);
    const awal = (await semuaAudit(t)).length;
    const res = await putuskan(t, GUBERNUR, 'K24-01', {
      pimpinanId: 'gubernur',
      keputusan: 'hadir_sendiri',
    });
    expect(res.statusCode).toBe(200);
    const hasil = HasilKeputusanSkema.parse(res.json());
    expect(hasil.kegiatan.status).toBe('menunggu_arahan');
    expect(hasil.kegiatan.pihak.find((p) => p.id === 'gubernur')).toMatchObject({
      kedudukan: 'diterima',
      peran: 'utama',
    });
    const log = await semuaAudit(t);
    expect(log).toHaveLength(awal + 1);
    expect(log.at(-1)?.aktor).toBe(GUBERNUR);
  });

  it('KB-047: hadir sendiri sekaligus menetapkan memindahkan status ke Ditetapkan', async () => {
    const t = await siapkanAppUji(jenis);
    const awal = (await semuaAudit(t)).length;
    const res = await putuskan(t, KABAG, 'K24-01', {
      pimpinanId: 'gubernur',
      keputusan: 'hadir_sendiri',
      tetapkan: true,
    });
    expect(res.statusCode).toBe(200);
    const hasil = HasilKeputusanSkema.parse(res.json());
    expect(hasil.kegiatan.status).toBe('ditetapkan');
    expect(hasil.peristiwa).toMatchObject({ dari: 'menunggu_arahan', ke: 'ditetapkan' });
    expect(await semuaAudit(t)).toHaveLength(awal + 1);
  });

  it('KB-047: wakilkan menolak kehadiran pimpinan dan menugaskan pengganti (mewakili)', async () => {
    const t = await siapkanAppUji(jenis);
    const res = await putuskan(t, GUBERNUR, 'K24-02', {
      pimpinanId: 'gubernur',
      keputusan: 'wakilkan',
      penggantiId: 'kadis-pangan',
    });
    expect(res.statusCode).toBe(200);
    const k = HasilKeputusanSkema.parse(res.json()).kegiatan;
    expect(k.pihak.find((p) => p.id === 'gubernur')?.kedudukan).toBe('ditolak');
    expect(k.pihak.find((p) => p.id === 'kadis-pangan')).toMatchObject({
      kedudukan: 'ditugaskan',
      peran: 'mewakili',
    });
    expect((await semuaAudit(t)).at(-1)?.sesudah).toMatchObject({
      keputusan: 'wakilkan',
      penggantiId: 'kadis-pangan',
    });
  });

  it('KB-047: wakilkan tanpa pengganti atau dengan diri sendiri ditolak', async () => {
    const t = await siapkanAppUji(jenis);
    const tanpa = await putuskan(t, GUBERNUR, 'K24-02', {
      pimpinanId: 'gubernur',
      keputusan: 'wakilkan',
    });
    expect(tanpa.statusCode).toBe(400);
    const sendiri = await putuskan(t, GUBERNUR, 'K24-02', {
      pimpinanId: 'gubernur',
      keputusan: 'wakilkan',
      penggantiId: 'gubernur',
    });
    expect(sendiri.statusCode).toBe(422);
    expect((await ambil(t, 'K24-02')).pihak.find((p) => p.id === 'gubernur')?.kedudukan).toBe(
      'diundang',
    );
  });

  it('KB-047: tunda wajib beralasan, lalu memindahkan status ke Ditunda', async () => {
    const t = await siapkanAppUji(jenis);
    const tanpa = await putuskan(t, GUBERNUR, 'K24-01', {
      pimpinanId: 'gubernur',
      keputusan: 'tunda',
    });
    expect(tanpa.statusCode).toBe(400);
    const res = await putuskan(t, GUBERNUR, 'K24-01', {
      pimpinanId: 'gubernur',
      keputusan: 'tunda',
      alasan: 'Menunggu kepastian jadwal tamu',
    });
    expect(res.statusCode).toBe(200);
    expect(HasilKeputusanSkema.parse(res.json()).kegiatan.status).toBe('ditunda');
    expect((await semuaAudit(t)).at(-1)?.alasan).toBe('Menunggu kepastian jadwal tamu');
  });

  it('KB-047: gagal sebagian tidak meninggalkan perubahan separuh (tidak hadir lalu menetapkan tanpa yang hadir)', async () => {
    const t = await siapkanAppUji(jenis);
    const awal = (await semuaAudit(t)).length;
    const res = await putuskan(t, KABAG, 'K24-01', {
      pimpinanId: 'gubernur',
      keputusan: 'tidak_hadir',
      tetapkan: true,
    });
    expect(res.statusCode).toBe(422);
    expect(res.json().galat.rincian[0].pesan).toContain('minimal satu pihak');
    const k = await ambil(t, 'K24-01');
    expect(k.status).toBe('menunggu_arahan');
    expect(k.pihak.find((p) => p.id === 'gubernur')?.kedudukan).toBe('diundang');
    expect(await semuaAudit(t)).toHaveLength(awal);
  });

  it('KB-047: hak akses dan galat (pejabat 403, kepala biro 403, kegiatan tak ada 404, bukan pimpinan 422, tanpa kuki 401)', async () => {
    const t = await siapkanAppUji(jenis);
    const awal = (await semuaAudit(t)).length;
    const badan = { pimpinanId: 'gubernur', keputusan: 'hadir_sendiri' };
    expect((await putuskan(t, 'demo.kadis-pangan', 'K24-01', badan)).statusCode).toBe(403);
    expect((await putuskan(t, 'demo.kepala-biro', 'K24-01', badan)).statusCode).toBe(403);
    expect((await putuskan(t, KABAG, 'NIHIL', badan)).statusCode).toBe(404);
    expect(
      (
        await putuskan(t, KABAG, 'K24-01', {
          pimpinanId: 'kadis-pangan',
          keputusan: 'hadir_sendiri',
        })
      ).statusCode,
    ).toBe(422);
    const tanpaKuki = await t.panggil({
      method: 'POST',
      url: '/api/kegiatan/K24-01/keputusan-kehadiran',
      payload: badan,
    });
    expect(tanpaKuki.statusCode).toBe(401);
    expect(await semuaAudit(t)).toHaveLength(awal);
  });

  it('KB-047: kegiatan yang sudah dibatalkan atau selesai terkunci (409)', async () => {
    const t = await siapkanAppUji(jenis);
    const batal = await t.panggil({
      method: 'POST',
      url: '/api/kegiatan/K24-01/pindah-status',
      payload: { ke: 'dibatalkan', alasan: 'Uji' },
      cookie: await t.cookie(KABAG),
    });
    expect(batal.statusCode).toBe(200);
    const res = await putuskan(t, KABAG, 'K24-01', {
      pimpinanId: 'gubernur',
      keputusan: 'hadir_sendiri',
    });
    expect(res.statusCode).toBe(409);
  });
});
