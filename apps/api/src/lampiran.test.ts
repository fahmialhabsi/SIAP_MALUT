import { createHash } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';
import { z } from 'zod';
import { JENIS_UJI, tutupSemua } from './db/uji-db.helper.js';
import { lampiran, logAudit } from './db/schema.js';
import { LampiranSkema } from './skema-dto.js';
import {
  PDF_KECIL,
  PNG_KECIL,
  buatMultipart,
  siapkanAppUji,
  type AppUji,
} from './uji-api.helper.js';

afterAll(tutupSemua);

const PROTOKOL = 'demo.protokol01';

async function unggah(
  t: AppUji,
  akun: string,
  kegiatanId: string,
  nama: string,
  isi: Buffer,
  tipe?: string,
) {
  const { payload, headers } = buatMultipart(nama, isi, tipe);
  return t.panggil({
    method: 'POST',
    url: `/api/kegiatan/${kegiatanId}/lampiran`,
    cookie: await t.cookie(akun),
    payload,
    headers,
  });
}

describe.each(JENIS_UJI)('lampiran undangan (%s)', (jenis) => {
  it('KB-042: unggah PDF berhasil; metadata, hash, dan isi tersimpan; log audit tanpa isi berkas', async () => {
    const t = await siapkanAppUji(jenis);
    const res = await unggah(
      t,
      PROTOKOL,
      'K22-05',
      'Undangan Contoh.pdf',
      PDF_KECIL,
      'application/pdf',
    );
    expect(res.statusCode).toBe(201);
    const l = LampiranSkema.parse(res.json());
    expect(l).toMatchObject({
      kegiatanId: 'K22-05',
      namaBerkas: 'Undangan Contoh.pdf',
      tipe: 'application/pdf',
      ukuran: PDF_KECIL.length,
    });
    expect(l.hashIsi).toBe(createHash('sha256').update(PDF_KECIL).digest('hex'));
    expect(res.headers.location).toBe(`/api/lampiran/${l.id}`);
    expect(t.penyimpanan.isi.size).toBe(1);
    const [log] = await t.koneksi.db
      .select()
      .from(logAudit)
      .where(eq(logAudit.aksi, 'lampiran.unggah'));
    expect(JSON.stringify(log)).not.toContain('%PDF');
    expect(log?.entitasId).toBe('K22-05');
    await t.app.close();
  });

  it('KB-042: jenis dikenali dari isi, bukan dari nama atau tipe kiriman (teks bernama .pdf ditolak 415)', async () => {
    const t = await siapkanAppUji(jenis);
    const palsu = await unggah(
      t,
      PROTOKOL,
      'K22-05',
      'virus.pdf',
      Buffer.from('MZ bukan pdf, hanya teks'),
      'application/pdf',
    );
    expect(palsu.statusCode).toBe(415);
    expect(palsu.json().galat.kode).toBe('tipe_tidak_didukung');
    const png = await unggah(t, PROTOKOL, 'K22-05', 'foto.png', PNG_KECIL, 'image/png');
    expect(png.statusCode).toBe(201);
    expect(png.json().tipe).toBe('image/png');
    expect(t.penyimpanan.isi.size).toBe(1);
    await t.app.close();
  });

  it('KB-042: berkas melebihi batas ditolak (413) dan tidak tersimpan', async () => {
    const t = await siapkanAppUji(jenis, { maksUnggahByte: 2048 });
    const besar = Buffer.concat([PDF_KECIL, Buffer.alloc(8192, 0x41)]);
    const res = await unggah(t, PROTOKOL, 'K22-05', 'besar.pdf', besar, 'application/pdf');
    expect(res.statusCode).toBe(413);
    expect(t.penyimpanan.isi.size).toBe(0);
    expect((await t.koneksi.db.select().from(lampiran)).length).toBe(0);
    await t.app.close();
  });

  it('KB-042: nama berkas dibersihkan dari jalur dan karakter berbahaya', async () => {
    const t = await siapkanAppUji(jenis);
    const res = await unggah(t, PROTOKOL, 'K22-05', '../../etc/passwd.pdf', PDF_KECIL);
    expect(res.statusCode).toBe(201);
    expect(res.json().namaBerkas).toBe('passwd.pdf');
    const [baris] = await t.koneksi.db.select().from(lampiran);
    expect(baris?.jalur).toMatch(/^[0-9a-f-]{36}\.pdf$/); // nama simpan acak, tidak memuat nama pengguna
    await t.app.close();
  });

  it('KB-042: permintaan bukan multipart ditolak; kegiatan tidak ada = 404', async () => {
    const t = await siapkanAppUji(jenis);
    const json = await t.panggil({
      method: 'POST',
      url: '/api/kegiatan/K22-05/lampiran',
      cookie: await t.cookie(PROTOKOL),
      payload: { a: 1 },
    });
    expect([400, 406, 415]).toContain(json.statusCode);
    expect((await unggah(t, PROTOKOL, 'NIHIL', 'a.pdf', PDF_KECIL)).statusCode).toBe(404);
    await t.app.close();
  });

  it('KB-042: daftar dan unduh oleh yang berhak; unduhan berupa lampiran dengan header aman', async () => {
    const t = await siapkanAppUji(jenis);
    const id = (await unggah(t, PROTOKOL, 'K22-05', 'Undangan Contoh.pdf', PDF_KECIL)).json()
      .id as string;
    const daftar = await t.panggil({
      method: 'GET',
      url: '/api/kegiatan/K22-05/lampiran',
      cookie: await t.cookie('demo.kabag-protokol'),
    });
    expect(
      z
        .array(LampiranSkema)
        .parse(daftar.json())
        .map((x) => x.id),
    ).toEqual([id]);

    const unduh = await t.panggil({
      method: 'GET',
      url: `/api/lampiran/${id}`,
      cookie: await t.cookie('demo.gubernur'),
    });
    expect(unduh.statusCode).toBe(200);
    expect(unduh.rawPayload.equals(PDF_KECIL)).toBe(true);
    expect(unduh.headers['content-type']).toContain('application/pdf');
    expect(String(unduh.headers['content-disposition'])).toMatch(
      /^attachment; filename\*=UTF-8''Undangan%20Contoh\.pdf$/,
    );
    expect(unduh.headers['x-content-type-options']).toBe('nosniff');
    expect(String(unduh.headers['cache-control'])).toContain('no-store');
    await t.app.close();
  });

  it('KB-042: pembatasan akses: pejabat tidak dapat mengunggah; hanya terkait yang melihat; pemohon dan publik ditolak', async () => {
    const t = await siapkanAppUji(jenis);
    const id = (await unggah(t, PROTOKOL, 'K22-05', 'a.pdf', PDF_KECIL)).json().id as string;
    const pejabat = 'demo.kadis-pangan';
    expect((await unggah(t, pejabat, 'K22-05', 'x.pdf', PDF_KECIL)).statusCode).toBe(403);
    // Pejabat terkait dapat melihat daftar dan mengunduh lampiran kegiatannya.
    expect(
      (
        await t.panggil({
          method: 'GET',
          url: '/api/kegiatan/K22-05/lampiran',
          cookie: await t.cookie(pejabat),
        })
      ).statusCode,
    ).toBe(200);
    expect(
      (
        await t.panggil({
          method: 'GET',
          url: `/api/lampiran/${id}`,
          cookie: await t.cookie(pejabat),
        })
      ).statusCode,
    ).toBe(200);
    // Pejabat lain (tidak terkait) tidak dapat.
    const lain = 'demo.kadis-pendidikan';
    expect(
      (await t.panggil({ method: 'GET', url: `/api/lampiran/${id}`, cookie: await t.cookie(lain) }))
        .statusCode,
    ).toBe(404);
    expect(
      (
        await t.panggil({
          method: 'GET',
          url: '/api/kegiatan/K22-05/lampiran',
          cookie: await t.cookie(lain),
        })
      ).statusCode,
    ).toBe(404);
    for (const akun of ['demo.pemohon', 'demo.publik']) {
      expect(
        (
          await t.panggil({
            method: 'GET',
            url: `/api/lampiran/${id}`,
            cookie: await t.cookie(akun),
          })
        ).statusCode,
        akun,
      ).toBe(403);
    }
    expect(
      (
        await t.panggil({
          method: 'GET',
          url: '/api/lampiran/TIDAK-ADA',
          cookie: await t.cookie(PROTOKOL),
        })
      ).statusCode,
    ).toBe(404);
    await t.app.close();
  });
});
