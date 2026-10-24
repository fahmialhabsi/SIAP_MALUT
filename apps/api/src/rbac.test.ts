import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { sql } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';
import { loadApiConfig } from '@siap/shared';
import { JENIS_UJI, tutupSemua } from './db/uji-db.helper.js';
import { peranIzin } from './db/schema.js';
import { IZIN, adalahIzin } from './keamanan/izin.js';
import { daftarRute } from './rute/index.js';
import type { Deps } from './rute.js';
import { KegiatanSkema } from './skema-dto.js';
import { AKUN_PERAN, siapkanAppUji } from './uji-api.helper.js';

afterAll(tutupSemua);

const akar = fileURLToPath(new URL('../../../', import.meta.url));
const matriks = JSON.parse(readFileSync(`${akar}data/contoh/hak-akses.json`, 'utf8')) as {
  peran: Record<string, string[]>;
};
const daftar = daftarRute({ config: loadApiConfig({ APP_MODE: 'demo' }) } as unknown as Deps);
const PERAN = Object.keys(matriks.peran);

describe('KB-029: matriks hak akses sebagai data', () => {
  it('KB-029: seluruh izin pada matriks dikenal aplikasi dan admin memiliki semuanya', () => {
    for (const [peran, izin] of Object.entries(matriks.peran)) {
      for (const i of izin) expect(adalahIzin(i), `${peran}: ${i}`).toBe(true);
    }
    expect([...(matriks.peran.admin ?? [])].sort()).toEqual([...IZIN].sort());
  });

  it('KB-029: setiap peran pengguna yang dikenal skema ada pada matriks', () => {
    expect(PERAN.sort()).toEqual(Object.keys(AKUN_PERAN).sort());
  });

  it('KB-029: setiap rute non-publik menyebut izin yang dikenal atau hanyaMasuk', () => {
    for (const d of daftar) {
      if (d.publik) continue;
      expect(d.hanyaMasuk === true || (d.izin?.length ?? 0) > 0, `${d.metode} ${d.jalur}`).toBe(
        true,
      );
      for (const i of d.izin ?? []) expect(adalahIzin(i), `${d.jalur}: ${i}`).toBe(true);
    }
  });

  it('KB-029: setiap izin dipakai oleh minimal satu rute atau pembatasan data', () => {
    const dipakaiRute = new Set(daftar.flatMap((d) => [...(d.izin ?? [])]));
    // Dipakai sebagai pembatas data (bukan izin rute): tautan_rapat.lihat_semua.
    const pembatasData = new Set(['tautan_rapat.lihat_semua']);
    for (const i of IZIN) expect(dipakaiRute.has(i) || pembatasData.has(i), i).toBe(true);
  });
});

describe.each(JENIS_UJI)('KB-029: hak akses pada basis data (%s)', (jenis) => {
  it('KB-029: tabel peran_izin hasil seed sama persis dengan hak-akses.json', async () => {
    const t = await siapkanAppUji(jenis);
    const baris = await t.koneksi.db.select().from(peranIzin);
    const dariDb: Record<string, string[]> = {};
    for (const b of baris) (dariDb[b.peran] ??= []).push(b.izin);
    for (const [peran, izin] of Object.entries(matriks.peran)) {
      expect((dariDb[peran] ?? []).sort(), peran).toEqual([...izin].sort());
    }
    expect(baris.every((b) => b.isContoh)).toBe(true);
    await t.app.close();
  });

  it('KB-029: tanpa kuki, setiap rute non-publik menjawab 401', async () => {
    const t = await siapkanAppUji(jenis);
    for (const d of daftar.filter((x) => !x.publik)) {
      const res = await t.panggil({
        method: d.metode.toUpperCase() as 'GET',
        url: d.jalur.replace(/:[A-Za-z]+/g, 'X'),
      });
      expect(res.statusCode, `${d.metode} ${d.jalur}`).toBe(401);
    }
    await t.app.close();
  });

  it('KB-029: lintas peran x rute: 403 tepat bila peran tidak punya satu pun izin yang disyaratkan', async () => {
    const t = await siapkanAppUji(jenis);
    let jumlah = 0;
    // Keluar (DELETE /api/sesi) mengakhiri sesi yang dipakai uji ini; perilakunya diuji di auth.test.ts.
    const ruteUji = daftar.filter(
      (x) => !x.publik && !(x.metode === 'delete' && x.jalur === '/api/sesi'),
    );
    for (const peran of PERAN) {
      const cookie = await t.cookie(AKUN_PERAN[peran] ?? '');
      const izinPeran = new Set(matriks.peran[peran] ?? []);
      for (const d of ruteUji) {
        const diizinkan = d.hanyaMasuk === true || (d.izin ?? []).some((i) => izinPeran.has(i));
        const res = await t.panggil({
          method: d.metode.toUpperCase() as 'GET',
          url: d.jalur.replace(/:[A-Za-z]+/g, 'X'),
          cookie,
        });
        const label = `${peran} ${d.metode.toUpperCase()} ${d.jalur} -> ${res.statusCode}`;
        if (diizinkan) {
          expect([401, 403, 500], label).not.toContain(res.statusCode);
        } else {
          expect(res.statusCode, label).toBe(403);
        }
        jumlah++;
      }
    }
    expect(jumlah).toBe(PERAN.length * ruteUji.length);
    await t.app.close();
  });
});

describe.each(JENIS_UJI)('KB-029 dan KB-019: pembatasan data menurut peran (%s)', (jenis) => {
  it('KB-029: pimpinan melihat semua kegiatan; pejabat hanya yang memuat dirinya; publik dan pemohon ditolak', async () => {
    const t = await siapkanAppUji(jenis);
    const semua = await t.panggil({
      method: 'GET',
      url: '/api/kegiatan',
      cookie: await t.cookie('demo.gubernur'),
    });
    expect(semua.statusCode).toBe(200);
    expect(semua.json()).toHaveLength(14);
    for (const k of semua.json()) KegiatanSkema.parse(k);

    const terkait = await t.panggil({
      method: 'GET',
      url: '/api/kegiatan',
      cookie: await t.cookie('demo.kadis-pangan'),
    });
    expect(terkait.json().map((k: { id: string }) => k.id)).toEqual(['K22-05']);

    for (const akun of ['demo.pemohon', 'demo.publik']) {
      const res = await t.panggil({
        method: 'GET',
        url: '/api/kegiatan',
        cookie: await t.cookie(akun),
      });
      expect(res.statusCode, akun).toBe(403);
    }
    await t.app.close();
  });

  it('KB-029: pejabat tidak dapat membuka kegiatan yang bukan miliknya (404, bukan 403)', async () => {
    const t = await siapkanAppUji(jenis);
    const cookie = await t.cookie('demo.kadis-pangan');
    expect(
      (await t.panggil({ method: 'GET', url: '/api/kegiatan/K22-05', cookie })).statusCode,
    ).toBe(200);
    expect(
      (await t.panggil({ method: 'GET', url: '/api/kegiatan/K22-01', cookie })).statusCode,
    ).toBe(404);
    await t.app.close();
  });

  it('KB-019: tautan rapat hanya terlihat oleh yang ditugaskan dan peran Protokol', async () => {
    const t = await siapkanAppUji(jenis);
    const protokol = await t.cookie('demo.protokol01');
    const ubah = await t.panggil({
      method: 'PATCH',
      url: '/api/kegiatan/K22-05',
      cookie: protokol,
      payload: { tautanRapat: 'https://rapat.contoh.invalid/ruang-contoh' },
    });
    expect(ubah.statusCode).toBe(200);
    expect(ubah.json().tautanRapat).toBe('https://rapat.contoh.invalid/ruang-contoh');

    const lihat = async (akun: string) =>
      (
        await t.panggil({
          method: 'GET',
          url: '/api/kegiatan/K22-05',
          cookie: await t.cookie(akun),
        })
      ).json().tautanRapat;
    expect(await lihat('demo.kabag-protokol')).toBe('https://rapat.contoh.invalid/ruang-contoh'); // izin peran
    expect(await lihat('demo.kepala-biro')).toBe('https://rapat.contoh.invalid/ruang-contoh'); // izin peran
    expect(await lihat('demo.kadis-pangan')).toBe('https://rapat.contoh.invalid/ruang-contoh'); // pihak diterima
    expect(await lihat('demo.wagub')).toBe('https://rapat.contoh.invalid/ruang-contoh'); // pihak diterima
    expect(await lihat('demo.gubernur')).toBeNull(); // baca semua, tetapi bukan pihak dan bukan Protokol
    expect(await lihat('demo.ajudan')).toBeNull();

    // Pada daftar pun disamarkan.
    const daftarGub = await t.panggil({
      method: 'GET',
      url: '/api/kegiatan?tanggal=2026-10-22',
      cookie: await t.cookie('demo.gubernur'),
    });
    expect(daftarGub.json().find((k: { id: string }) => k.id === 'K22-05').tautanRapat).toBeNull();
    await t.app.close();
  });

  it('KB-019: tautan rapat tidak tersimpan terbuka di log audit (disamarkan)', async () => {
    const t = await siapkanAppUji(jenis);
    await t.panggil({
      method: 'PATCH',
      url: '/api/kegiatan/K22-05',
      cookie: await t.cookie('demo.protokol01'),
      payload: { tautanRapat: 'https://rapat.contoh.invalid/rahasia-contoh' },
    });
    const log = await t.koneksi.db.execute(
      sql`select sebelum, sesudah from log_audit where aksi = 'kegiatan.ubah'`,
    );
    const teks = JSON.stringify(Array.isArray(log) ? log : (log as { rows: unknown[] }).rows);
    expect(teks).not.toContain('rahasia-contoh');
    expect(teks).toContain('[disamarkan]');
    await t.app.close();
  });
});
