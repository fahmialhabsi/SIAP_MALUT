import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { eq } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';
import { z } from 'zod';
import { JENIS_UJI, tutupSemua } from './db/uji-db.helper.js';
import { kegiatan, logAudit } from './db/schema.js';
import {
  AuditSkema,
  BentrokSkema,
  HakAksesSkema,
  HasilPindahSkema,
  KegiatanSkema,
  PejabatSkema,
} from './skema-dto.js';
import { siapkanAppUji, type AppUji } from './uji-api.helper.js';

afterAll(tutupSemua);

const akar = fileURLToPath(new URL('../../../', import.meta.url));
const matriks = JSON.parse(readFileSync(`${akar}data/contoh/hak-akses.json`, 'utf8')) as {
  peran: Record<string, string[]>;
};

const PROTOKOL = 'demo.protokol01';
const KABAG = 'demo.kabag-protokol';
const ADMIN = 'admin.owner';

async function dengan(t: AppUji, akun: string, opsi: Parameters<AppUji['panggil']>[0]) {
  return t.panggil({ ...opsi, cookie: await t.cookie(akun) });
}

const baruValid = {
  judul: 'Pembukaan Acara Uji CONTOH',
  jenis: 'pembukaan',
  mulai: '2026-11-02T09:00:00+09:00',
  selesai: '2026-11-02T11:00:00+09:00',
  lokasi: { nama: 'Lokasi Contoh Z', pulau: 'Ternate' },
  penyelenggara: 'Penyelenggara Contoh A',
  picProtokolId: 'petugas-protokol-01',
  picPengundang: { nama: 'PIC Contoh', kontak: '0800-000-0001' },
  pihak: [{ pihakId: 'gubernur' }, { pihakId: 'wagub', kedudukan: 'ditugaskan', peran: 'utama' }],
};

describe.each(JENIS_UJI)('API kegiatan (%s)', (jenis) => {
  it('KB-006: daftar menurut tanggal WIT dan status; skema terpenuhi', async () => {
    const t = await siapkanAppUji(jenis);
    const hitung = async (q: string) => {
      const res = await dengan(t, 'demo.gubernur', { method: 'GET', url: `/api/kegiatan${q}` });
      expect(res.statusCode).toBe(200);
      return z.array(KegiatanSkema).parse(res.json());
    };
    expect(await hitung('')).toHaveLength(14);
    expect(await hitung('?tanggal=2026-10-22')).toHaveLength(7);
    expect(await hitung('?tanggal=2026-10-24')).toHaveLength(3);
    expect(await hitung('?tanggal=2026-10-26')).toHaveLength(4);
    expect((await hitung('?status=terkonfirmasi')).length).toBe(7);
    const k = (await hitung('?tanggal=2026-10-24')).find((x) => x.id === 'K24-03');
    expect(k).toMatchObject({
      mulai: '2026-10-24T20:00:00+09:00',
      status: 'ditetapkan',
      isContoh: true,
    });
    const buruk = await dengan(t, 'demo.gubernur', {
      method: 'GET',
      url: '/api/kegiatan?tanggal=24-10-2026',
    });
    expect(buruk.statusCode).toBe(400);
    await t.app.close();
  });

  it('KB-001: membuat kegiatan baru berstatus Baru, berlabel contoh, lengkap dengan pihak dan PIC', async () => {
    const t = await siapkanAppUji(jenis);
    const res = await dengan(t, PROTOKOL, {
      method: 'POST',
      url: '/api/kegiatan',
      payload: baruValid,
    });
    expect(res.statusCode).toBe(201);
    const k = KegiatanSkema.parse(res.json());
    expect(k).toMatchObject({
      status: 'baru',
      mulai: '2026-11-02T09:00:00+09:00',
      selesai: '2026-11-02T11:00:00+09:00',
      isContoh: true,
      picProtokolId: 'petugas-protokol-01',
      picPengundang: { nama: 'PIC Contoh', kontak: '0800-000-0001' },
    });
    expect(k.pihak.map((p) => `${p.id}:${p.kedudukan}`).sort()).toEqual([
      'gubernur:diundang',
      'wagub:ditugaskan',
    ]);
    expect(res.headers.location).toBe(`/api/kegiatan/${k.id}`);
    const log = await t.koneksi.db.select().from(logAudit).where(eq(logAudit.entitasId, k.id));
    expect(log.map((l) => l.aksi)).toEqual(['kegiatan.buat']);
    expect(log[0]?.aktor).toBe(PROTOKOL);
    await t.app.close();
  });

  it('KB-003: PIC protokol dan PIC pengundang tersimpan (kontak termasuk data pribadi, tidak di log ringkas)', async () => {
    const t = await siapkanAppUji(jenis);
    const res = await dengan(t, PROTOKOL, {
      method: 'POST',
      url: '/api/kegiatan',
      payload: baruValid,
    });
    const baru = KegiatanSkema.parse(res.json());
    const ambil = await dengan(t, PROTOKOL, { method: 'GET', url: `/api/kegiatan/${baru.id}` });
    expect(ambil.json().picPengundang.nama).toBe('PIC Contoh');
    await t.app.close();
  });

  it('KB-001: masukan tidak valid ditolak dengan rincian (waktu tanpa zona, selesai sebelum mulai, pihak asing, judul kosong)', async () => {
    const t = await siapkanAppUji(jenis);
    const coba = async (payload: unknown) =>
      dengan(t, PROTOKOL, { method: 'POST', url: '/api/kegiatan', payload: payload as object });
    const tanpaZona = await coba({ ...baruValid, mulai: '2026-11-02T09:00:00' });
    expect(tanpaZona.statusCode).toBe(400);
    expect(tanpaZona.json().galat.rincian.some((r: { jalur: string }) => r.jalur === 'mulai')).toBe(
      true,
    );
    const terbalik = await coba({ ...baruValid, selesai: '2026-11-02T08:00:00+09:00' });
    expect(terbalik.statusCode).toBe(400);
    const asing = await coba({ ...baruValid, pihak: [{ pihakId: 'tidak-ada' }] });
    expect(asing.statusCode).toBe(400);
    const kosong = await coba({ ...baruValid, judul: '   ' });
    expect(kosong.statusCode).toBe(400);
    const sisa = await t.koneksi.db.select().from(kegiatan);
    expect(sisa).toHaveLength(14);
    await t.app.close();
  });

  it('KB-034: pada mode production kegiatan baru tidak berpenanda contoh', async () => {
    const t = await siapkanAppUji(jenis, { mode: 'production' });
    const res = await dengan(t, PROTOKOL, {
      method: 'POST',
      url: '/api/kegiatan',
      payload: baruValid,
    });
    expect(res.statusCode).toBe(201);
    expect(res.json().isContoh).toBe(false);
    await t.app.close();
  });

  it('KB-001: mengubah data kegiatan tercatat sebelum-sesudah; tidak mengubah status', async () => {
    const t = await siapkanAppUji(jenis);
    const res = await dengan(t, PROTOKOL, {
      method: 'PATCH',
      url: '/api/kegiatan/K24-02',
      payload: {
        judul: 'Penutupan Acara Adat CONTOH (ubah)',
        selesai: '2026-10-24T22:00:00+09:00',
        catatan: 'Bawa pakaian adat',
      },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({
      judul: 'Penutupan Acara Adat CONTOH (ubah)',
      selesai: '2026-10-24T22:00:00+09:00',
      status: 'menunggu_arahan',
    });
    const [log] = await t.koneksi.db
      .select()
      .from(logAudit)
      .where(eq(logAudit.aksi, 'kegiatan.ubah'));
    expect((log?.sebelum as { judul: string }).judul).toBe('Penutupan Acara Adat CONTOH');
    expect((log?.sesudah as { judul: string }).judul).toBe('Penutupan Acara Adat CONTOH (ubah)');
    await t.app.close();
  });

  it('KB-001: ubah ditolak untuk isi kosong, waktu terbalik, dan kegiatan tak ada; status terkunci = 409', async () => {
    const t = await siapkanAppUji(jenis);
    expect(
      (await dengan(t, PROTOKOL, { method: 'PATCH', url: '/api/kegiatan/K24-02', payload: {} }))
        .statusCode,
    ).toBe(400);
    expect(
      (
        await dengan(t, PROTOKOL, {
          method: 'PATCH',
          url: '/api/kegiatan/K24-02',
          payload: { selesai: '2026-10-24T10:00:00+09:00' },
        })
      ).statusCode,
    ).toBe(400);
    expect(
      (
        await dengan(t, PROTOKOL, {
          method: 'PATCH',
          url: '/api/kegiatan/NIHIL',
          payload: { judul: 'x' },
        })
      ).statusCode,
    ).toBe(404);
    await t.koneksi.db.update(kegiatan).set({ status: 'selesai' }).where(eq(kegiatan.id, 'K24-02'));
    const terkunci = await dengan(t, PROTOKOL, {
      method: 'PATCH',
      url: '/api/kegiatan/K24-02',
      payload: { judul: 'baru' },
    });
    expect(terkunci.statusCode).toBe(409);
    expect(terkunci.json().galat.kode).toBe('status_terkunci');
    await t.app.close();
  });

  it('KB-005: protokol menugaskan pihak, pejabat menerima penugasan dirinya, dan tidak dapat menugaskan pihak lain', async () => {
    const t = await siapkanAppUji(jenis);
    const tugaskan = await dengan(t, PROTOKOL, {
      method: 'PUT',
      url: '/api/kegiatan/K22-05/pihak/kadis-pangan',
      payload: { kedudukan: 'ditugaskan', peran: 'mewakili' },
    });
    expect(tugaskan.statusCode).toBe(200);
    expect(
      tugaskan.json().pihak.find((p: { id: string }) => p.id === 'kadis-pangan'),
    ).toMatchObject({ kedudukan: 'ditugaskan', peran: 'mewakili' });

    const pejabat = 'demo.kadis-pangan';
    const terima = await dengan(t, pejabat, {
      method: 'PUT',
      url: '/api/kegiatan/K22-05/pihak/kadis-pangan',
      payload: { kedudukan: 'diterima' },
    });
    expect(terima.statusCode).toBe(200);
    // Tidak boleh menetapkan dirinya ke kedudukan lain, atau mengubah pihak lain.
    expect(
      (
        await dengan(t, pejabat, {
          method: 'PUT',
          url: '/api/kegiatan/K22-05/pihak/kadis-pangan',
          payload: { kedudukan: 'ditugaskan' },
        })
      ).statusCode,
    ).toBe(403);
    expect(
      (
        await dengan(t, pejabat, {
          method: 'PUT',
          url: '/api/kegiatan/K22-05/pihak/wagub',
          payload: { kedudukan: 'ditolak' },
        })
      ).statusCode,
    ).toBe(403);
    // Kegiatan yang bukan miliknya tidak terlihat.
    expect(
      (
        await dengan(t, pejabat, {
          method: 'PUT',
          url: '/api/kegiatan/K22-01/pihak/kadis-pangan',
          payload: { kedudukan: 'diterima' },
        })
      ).statusCode,
    ).toBe(404);
    // Pihak tak dikenal.
    expect(
      (
        await dengan(t, PROTOKOL, {
          method: 'PUT',
          url: '/api/kegiatan/K22-05/pihak/hantu',
          payload: { kedudukan: 'diundang' },
        })
      ).statusCode,
    ).toBe(404);
    const log = await t.koneksi.db
      .select()
      .from(logAudit)
      .where(eq(logAudit.aksi, 'kegiatan.pihak.set'));
    expect(log).toHaveLength(2);
    await t.app.close();
  });

  it('KB-005: menghapus pihak dari kegiatan tercatat; pejabat tidak berizin', async () => {
    const t = await siapkanAppUji(jenis);
    expect(
      (
        await dengan(t, 'demo.kadis-pangan', {
          method: 'DELETE',
          url: '/api/kegiatan/K22-05/pihak/kadis-pangan',
        })
      ).statusCode,
    ).toBe(403);
    const res = await dengan(t, PROTOKOL, {
      method: 'DELETE',
      url: '/api/kegiatan/K22-05/pihak/kadis-pangan',
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().pihak.map((p: { id: string }) => p.id)).toEqual(['wagub']);
    expect(
      (
        await dengan(t, PROTOKOL, {
          method: 'DELETE',
          url: '/api/kegiatan/K22-05/pihak/kadis-pangan',
        })
      ).statusCode,
    ).toBe(404);
    await t.app.close();
  });

  it('KB-004: pindah status sah menghasilkan peristiwa dan tercatat; skema respons terpenuhi', async () => {
    const t = await siapkanAppUji(jenis);
    const res = await dengan(t, KABAG, {
      method: 'POST',
      url: '/api/kegiatan/K22-05/pindah-status',
      payload: { ke: 'ditetapkan' },
    });
    expect(res.statusCode).toBe(200);
    const hasil = HasilPindahSkema.parse(res.json());
    expect(hasil.kegiatan.status).toBe('ditetapkan');
    expect(hasil.peristiwa).toMatchObject({
      dari: 'terkonfirmasi',
      ke: 'ditetapkan',
      oleh: KABAG,
      waktu: '2026-10-23T14:00:00+09:00',
    });
    const [log] = await t.koneksi.db
      .select()
      .from(logAudit)
      .where(eq(logAudit.aksi, 'kegiatan.pindah_status'));
    expect(log).toMatchObject({ aktor: KABAG, aktorPeran: 'kabag_protokol', entitasId: 'K22-05' });
    await t.app.close();
  });

  it('KB-004: perpindahan ditolak aturan = 422 dengan rincian; status dan log tidak berubah; tidak ada = 404; pejabat = 403', async () => {
    const t = await siapkanAppUji(jenis);
    const sebelum = (await t.koneksi.db.select().from(logAudit)).length;
    const tidakSah = await dengan(t, KABAG, {
      method: 'POST',
      url: '/api/kegiatan/K24-02/pindah-status',
      payload: { ke: 'terkonfirmasi' },
    });
    expect(tidakSah.statusCode).toBe(422);
    expect(tidakSah.json().galat.rincian[0].pesan).toContain('tidak diperbolehkan');
    const syarat = await dengan(t, KABAG, {
      method: 'POST',
      url: '/api/kegiatan/K24-02/pindah-status',
      payload: { ke: 'ditetapkan' },
    });
    expect(syarat.statusCode).toBe(422);
    expect(
      (
        await dengan(t, KABAG, {
          method: 'POST',
          url: '/api/kegiatan/NIHIL/pindah-status',
          payload: { ke: 'ditetapkan' },
        })
      ).statusCode,
    ).toBe(404);
    expect(
      (
        await dengan(t, 'demo.kadis-pangan', {
          method: 'POST',
          url: '/api/kegiatan/K22-05/pindah-status',
          payload: { ke: 'ditetapkan' },
        })
      ).statusCode,
    ).toBe(403);
    expect(
      (
        await dengan(t, KABAG, {
          method: 'POST',
          url: '/api/kegiatan/K24-02/pindah-status',
          payload: { ke: 'bukan-status' },
        })
      ).statusCode,
    ).toBe(400);
    const [k] = await t.koneksi.db.select().from(kegiatan).where(eq(kegiatan.id, 'K24-02'));
    expect(k?.status).toBe('menunggu_arahan');
    expect((await t.koneksi.db.select().from(logAudit)).length).toBe(sebelum);
    await t.app.close();
  });

  it('KB-038: bentrok pasti menuntut alasan; dengan alasan diizinkan dan masuk log audit', async () => {
    const t = await siapkanAppUji(jenis);
    const atur = await dengan(t, ADMIN, {
      method: 'PUT',
      url: '/api/pengaturan/durasiBawaanMenit',
      payload: { nilai: 180 },
    });
    expect(atur.statusCode).toBe(200);
    const tanpa = await dengan(t, KABAG, {
      method: 'POST',
      url: '/api/kegiatan/K22-05/pindah-status',
      payload: { ke: 'ditetapkan' },
    });
    expect(tanpa.statusCode).toBe(422);
    expect(JSON.stringify(tanpa.json())).toContain('bentrok pasti');
    const dengan_ = await dengan(t, KABAG, {
      method: 'POST',
      url: '/api/kegiatan/K22-05/pindah-status',
      payload: { ke: 'ditetapkan', alasanBentrok: 'Arahan Gubernur: pangan murah dimajukan' },
    });
    expect(dengan_.statusCode).toBe(200);
    expect(HasilPindahSkema.parse(dengan_.json()).peringatan.length).toBeGreaterThan(0);
    const log = await t.koneksi.db
      .select()
      .from(logAudit)
      .where(eq(logAudit.aksi, 'kegiatan.pindah_status'));
    expect(JSON.stringify(log)).toContain('Arahan Gubernur: pangan murah dimajukan');
    await t.app.close();
  });

  it('KB-008 dan KB-010: endpoint bentrok = hasil domain (14 total; 26 Okt: 13); 400 untuk tanggal salah; pejabat 403', async () => {
    const t = await siapkanAppUji(jenis);
    const semua = await dengan(t, 'demo.sekda', { method: 'GET', url: '/api/bentrok' });
    expect(z.array(BentrokSkema).parse(semua.json())).toHaveLength(14);
    expect(
      (
        await dengan(t, 'demo.sekda', { method: 'GET', url: '/api/bentrok?tanggal=2026-10-26' })
      ).json(),
    ).toHaveLength(13);
    expect(
      (
        await dengan(t, 'demo.sekda', { method: 'GET', url: '/api/bentrok?tanggal=2026-10-22' })
      ).json(),
    ).toHaveLength(0);
    expect(
      (await dengan(t, 'demo.sekda', { method: 'GET', url: '/api/bentrok?tanggal=besok' }))
        .statusCode,
    ).toBe(400);
    expect(
      (await dengan(t, 'demo.kadis-pangan', { method: 'GET', url: '/api/bentrok' })).statusCode,
    ).toBe(403);
    await t.app.close();
  });

  it('KB-036 dan KB-039: pengaturan dapat dibaca; hanya admin mengubah; nilai tidak valid ditolak; mengubah hasil bentrok', async () => {
    const t = await siapkanAppUji(jenis);
    const baca = await dengan(t, KABAG, { method: 'GET', url: '/api/pengaturan' });
    expect(baca.json()).toEqual([{ kunci: 'durasiBawaanMenit', nilai: 120 }]);
    expect(
      (
        await dengan(t, KABAG, {
          method: 'PUT',
          url: '/api/pengaturan/durasiBawaanMenit',
          payload: { nilai: 180 },
        })
      ).statusCode,
    ).toBe(403);
    for (const nilai of [0, -5, 5000, 1.5, 'abc']) {
      expect(
        (
          await dengan(t, ADMIN, {
            method: 'PUT',
            url: '/api/pengaturan/durasiBawaanMenit',
            payload: { nilai },
          })
        ).statusCode,
        String(nilai),
      ).toBe(400);
    }
    expect(
      (
        await dengan(t, ADMIN, {
          method: 'PUT',
          url: '/api/pengaturan/tidak-dikenal',
          payload: { nilai: 60 },
        })
      ).statusCode,
    ).toBe(400);
    await dengan(t, ADMIN, {
      method: 'PUT',
      url: '/api/pengaturan/durasiBawaanMenit',
      payload: { nilai: 180 },
    });
    expect(
      (
        await dengan(t, 'demo.sekda', { method: 'GET', url: '/api/bentrok?tanggal=2026-10-22' })
      ).json(),
    ).toHaveLength(1);
    const log = await t.koneksi.db
      .select()
      .from(logAudit)
      .where(eq(logAudit.aksi, 'pengaturan.ubah'));
    expect(log[0]).toMatchObject({ sebelum: { nilai: 120 }, sesudah: { nilai: 180 } });
    await t.app.close();
  });

  it('KB-016: log audit dapat dibaca admin dan kepala biro saja, terbaru lebih dulu, sesuai skema', async () => {
    const t = await siapkanAppUji(jenis);
    await dengan(t, KABAG, {
      method: 'POST',
      url: '/api/kegiatan/K22-05/pindah-status',
      payload: { ke: 'ditetapkan' },
    });
    const res = await dengan(t, 'demo.kepala-biro', {
      method: 'GET',
      url: '/api/audit?entitasId=K22-05',
    });
    expect(res.statusCode).toBe(200);
    const daftar = z.array(AuditSkema).parse(res.json());
    expect(daftar[0]?.aksi).toBe('kegiatan.pindah_status');
    expect(daftar[0]?.waktu).toMatch(/\+09:00$/);
    expect((await dengan(t, PROTOKOL, { method: 'GET', url: '/api/audit' })).statusCode).toBe(403);
    expect((await dengan(t, ADMIN, { method: 'GET', url: '/api/audit?batas=0' })).statusCode).toBe(
      400,
    );
    await t.app.close();
  });

  it('KB-029: direktori pejabat dan matriks hak akses mengikuti data', async () => {
    const t = await siapkanAppUji(jenis);
    const dir = await dengan(t, 'demo.ajudan', { method: 'GET', url: '/api/pejabat' });
    const daftar = z.array(PejabatSkema).parse(dir.json());
    expect(daftar).toHaveLength(11);
    expect(daftar.map((p) => p.urutanTataTempat)).toEqual(
      [...daftar.map((p) => p.urutanTataTempat)].sort((a, b) => (a ?? 0) - (b ?? 0)),
    );
    const hak = HakAksesSkema.parse(
      (await dengan(t, 'demo.kepala-biro', { method: 'GET', url: '/api/hak-akses' })).json(),
    );
    for (const [peran, izin] of Object.entries(matriks.peran)) {
      if (izin.length > 0)
        expect([...(hak.peran[peran] ?? [])].sort(), peran).toEqual([...izin].sort());
    }
    await t.app.close();
  });
});
