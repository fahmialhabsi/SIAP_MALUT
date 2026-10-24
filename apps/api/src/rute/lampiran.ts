import '@fastify/multipart';
import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { catatAudit } from '../db/audit.js';
import { kegiatan, lampiran } from '../db/schema.js';
import { ambilKegiatanMentah, bolehBaca } from '../layanan/kegiatan-detail.js';
import { kenaliJenis, namaAman } from '../penyimpanan.js';
import { GalatApi, balas, rute, type Deps } from '../rute.js';
import { GalatSkema, IdParams, LampiranSkema } from '../skema-dto.js';
import { aktorAudit, konteksAudit } from './umum.js';
import { keIsoWit } from '../waktu.js';

type BarisLampiran = typeof lampiran.$inferSelect;
const keDto = (b: BarisLampiran): z.infer<typeof LampiranSkema> => ({
  id: b.id,
  kegiatanId: b.kegiatanId,
  namaBerkas: b.namaBerkas,
  tipe: b.tipe,
  ukuran: b.ukuran,
  hashIsi: b.hashIsi,
  dibuat: keIsoWit(b.dibuat),
});
const tidakDitemukan = () =>
  new GalatApi(404, 'tidak_ditemukan', 'Kegiatan atau lampiran tidak ditemukan.');

export function ruteLampiran(_deps: Deps) {
  return [
    rute({
      metode: 'post',
      jalur: '/api/kegiatan/:id/lampiran',
      ringkasan: 'Mengunggah lampiran undangan (PDF, JPG, PNG; jenis dikenali dari isi berkas)',
      tag: 'Lampiran',
      izin: ['lampiran.unggah'],
      multipart: true,
      params: IdParams,
      respons: {
        201: { deskripsi: 'Lampiran tersimpan', skema: LampiranSkema },
        400: { deskripsi: 'Tidak ada berkas', skema: GalatSkema },
        401: { deskripsi: 'Belum masuk', skema: GalatSkema },
        403: { deskripsi: 'Tidak berizin', skema: GalatSkema },
        404: { deskripsi: 'Kegiatan tidak ditemukan', skema: GalatSkema },
        413: { deskripsi: 'Berkas terlalu besar', skema: GalatSkema },
        415: { deskripsi: 'Jenis berkas tidak didukung', skema: GalatSkema },
      },
      penangan: async ({ req, deps, pengguna, params }) => {
        if (!pengguna) throw tidakDitemukan();
        const k = await ambilKegiatanMentah(deps.db, params.id);
        if (!k || !bolehBaca(pengguna, k)) throw tidakDitemukan();

        const berkas = await req.file({ limits: { fileSize: deps.maksUnggahByte, files: 1 } });
        if (!berkas)
          throw new GalatApi(400, 'tidak_valid', 'Sertakan satu berkas pada kolom "berkas".');
        const isi = await berkas.toBuffer();
        if (berkas.file.truncated) {
          throw new GalatApi(
            413,
            'terlalu_besar',
            `Berkas melebihi batas ${Math.round(deps.maksUnggahByte / 1024 / 1024)} MB.`,
          );
        }
        const jenis = kenaliJenis(isi);
        if (!jenis) {
          throw new GalatApi(
            415,
            'tipe_tidak_didukung',
            'Hanya berkas PDF, JPG, dan PNG yang diterima.',
          );
        }
        const tersimpan = await deps.penyimpanan.simpan(isi, jenis.ekstensi);
        const id = `L${randomUUID().slice(0, 8).toUpperCase()}`;
        const nama = namaAman(berkas.filename);
        const [baris] = await deps.db.transaction(async (tx) => {
          const hasil = await tx
            .insert(lampiran)
            .values({
              id,
              kegiatanId: params.id,
              namaBerkas: nama,
              tipe: jenis.tipe,
              ukuran: tersimpan.ukuran,
              hashIsi: tersimpan.hashIsi,
              jalur: tersimpan.jalur,
              diunggahOleh: pengguna.asli.username,
              dibuat: deps.sekarang(),
            })
            .returning();
          await tx
            .update(kegiatan)
            .set({ diubah: deps.sekarang() })
            .where(eq(kegiatan.id, params.id));
          await catatAudit(tx, {
            ...aktorAudit(pengguna),
            aksi: 'lampiran.unggah',
            entitas: 'kegiatan',
            entitasId: params.id,
            sesudah: {
              lampiranId: id,
              nama,
              tipe: jenis.tipe,
              ukuran: tersimpan.ukuran,
              hashIsi: tersimpan.hashIsi,
            },
            ...konteksAudit(req),
          });
          return hasil;
        });
        return balas(201, baris ? keDto(baris) : null, undefined, {
          Location: `/api/lampiran/${id}`,
        });
      },
    }),

    rute({
      metode: 'get',
      jalur: '/api/kegiatan/:id/lampiran',
      ringkasan: 'Daftar lampiran sebuah kegiatan',
      tag: 'Lampiran',
      izin: ['lampiran.baca'],
      params: IdParams,
      respons: {
        200: { deskripsi: 'Daftar lampiran', skema: z.array(LampiranSkema) },
        401: { deskripsi: 'Belum masuk', skema: GalatSkema },
        403: { deskripsi: 'Tidak berizin', skema: GalatSkema },
        404: { deskripsi: 'Kegiatan tidak ditemukan atau di luar hak akses', skema: GalatSkema },
      },
      penangan: async ({ deps, pengguna, params }) => {
        if (!pengguna) throw tidakDitemukan();
        const k = await ambilKegiatanMentah(deps.db, params.id);
        if (!k || !bolehBaca(pengguna, k)) throw tidakDitemukan();
        const baris = await deps.db
          .select()
          .from(lampiran)
          .where(eq(lampiran.kegiatanId, params.id))
          .orderBy(lampiran.dibuat);
        return baris.map(keDto);
      },
    }),

    rute({
      metode: 'get',
      jalur: '/api/lampiran/:id',
      ringkasan: 'Mengunduh berkas lampiran',
      tag: 'Lampiran',
      izin: ['lampiran.baca'],
      params: IdParams,
      respons: {
        200: {
          deskripsi: 'Isi berkas (PDF/JPG/PNG), sebagai unduhan',
          tipeIsi: 'application/octet-stream',
        },
        401: { deskripsi: 'Belum masuk', skema: GalatSkema },
        403: { deskripsi: 'Tidak berizin', skema: GalatSkema },
        404: { deskripsi: 'Tidak ditemukan atau di luar hak akses', skema: GalatSkema },
      },
      penangan: async ({ deps, pengguna, params }) => {
        if (!pengguna) throw tidakDitemukan();
        const [baris] = await deps.db.select().from(lampiran).where(eq(lampiran.id, params.id));
        if (!baris) throw tidakDitemukan();
        const k = await ambilKegiatanMentah(deps.db, baris.kegiatanId);
        if (!k || !bolehBaca(pengguna, k)) throw tidakDitemukan();
        const isi = await deps.penyimpanan.baca(baris.jalur);
        const unduh = encodeURIComponent(baris.namaBerkas);
        return balas(200, isi, baris.tipe, {
          'Content-Disposition': `attachment; filename*=UTF-8''${unduh}`,
          'X-Content-Type-Options': 'nosniff',
          'Cache-Control': 'private, no-store',
        });
      },
    }),
  ];
}
