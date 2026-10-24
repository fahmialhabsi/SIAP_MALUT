import { randomUUID } from 'node:crypto';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { keEpoch } from '@siap/domain';
import { catatAudit } from '../db/audit.js';
import { kegiatan, kegiatanPihak, pejabat } from '../db/schema.js';
import {
  ambilKegiatanMentah,
  ambilKegiatanUntuk,
  bolehBaca,
  daftarKegiatanUntuk,
} from '../layanan/kegiatan-detail.js';
import { bentrokAgenda, pindahStatusKegiatan } from '../layanan/kegiatan.js';
import { putuskanKehadiran } from '../layanan/keputusan-kehadiran.js';
import { GalatApi, balas, rute, type Deps } from '../rute.js';
import {
  BentrokSkema,
  BuatKegiatanInput,
  DaftarKegiatanQuery,
  GalatSkema,
  HasilKeputusanSkema,
  HasilPindahSkema,
  IdParams,
  IdPihakParams,
  KegiatanSkema,
  KeputusanKehadiranInput,
  PejabatSkema,
  PihakInput,
  PindahStatusInput,
  TanggalQuery,
  UbahKegiatanInput,
  type KegiatanDto,
} from '../skema-dto.js';
import { SAMAR, aktorAudit, konteksAudit } from './umum.js';

const STATUS_TERKUNCI = ['berlangsung', 'selesai', 'dibatalkan'];
const tidakDitemukan = () => new GalatApi(404, 'tidak_ditemukan', 'Kegiatan tidak ditemukan.');

/** Salinan DTO untuk log audit: tautan rapat (rahasia) disamarkan. */
const untukAudit = (k: KegiatanDto) => ({ ...k, tautanRapat: k.tautanRapat ? SAMAR : null });

export function ruteKegiatan(_deps: Deps) {
  return [
    rute({
      metode: 'get',
      jalur: '/api/pejabat',
      ringkasan: 'Direktori pihak (pimpinan, pejabat, petugas)',
      tag: 'Direktori',
      izin: ['pejabat.baca'],
      respons: {
        200: { deskripsi: 'Daftar pihak', skema: z.array(PejabatSkema) },
        401: { deskripsi: 'Belum masuk', skema: GalatSkema },
        403: { deskripsi: 'Tidak berizin', skema: GalatSkema },
      },
      penangan: async ({ deps }) => {
        const baris = await deps.db
          .select()
          .from(pejabat)
          .orderBy(pejabat.urutanTataTempat, pejabat.id);
        return baris.map((b) => ({
          id: b.id,
          nama: b.nama,
          golongan: b.golongan,
          jabatan: b.jabatan,
          instansi: b.instansi,
          urutanTataTempat: b.urutanTataTempat,
          isContoh: b.isContoh,
        }));
      },
    }),

    rute({
      metode: 'get',
      jalur: '/api/kegiatan',
      ringkasan: 'Daftar kegiatan (menurut tanggal WIT dan status)',
      tag: 'Kegiatan',
      izin: ['kegiatan.baca_semua', 'kegiatan.baca_terkait'],
      query: DaftarKegiatanQuery,
      respons: {
        200: { deskripsi: 'Daftar kegiatan sesuai hak akses', skema: z.array(KegiatanSkema) },
        400: { deskripsi: 'Parameter tidak valid', skema: GalatSkema },
        401: { deskripsi: 'Belum masuk', skema: GalatSkema },
        403: { deskripsi: 'Tidak berizin', skema: GalatSkema },
      },
      penangan: async ({ deps, pengguna, query }) =>
        pengguna ? daftarKegiatanUntuk(deps.db, pengguna, query) : [],
    }),

    rute({
      metode: 'get',
      jalur: '/api/kegiatan/:id',
      ringkasan: 'Rincian satu kegiatan',
      tag: 'Kegiatan',
      izin: ['kegiatan.baca_semua', 'kegiatan.baca_terkait'],
      params: IdParams,
      respons: {
        200: { deskripsi: 'Kegiatan', skema: KegiatanSkema },
        401: { deskripsi: 'Belum masuk', skema: GalatSkema },
        403: { deskripsi: 'Tidak berizin', skema: GalatSkema },
        404: { deskripsi: 'Tidak ditemukan atau di luar hak akses', skema: GalatSkema },
      },
      penangan: async ({ deps, pengguna, params }) => {
        const k = pengguna ? await ambilKegiatanUntuk(deps.db, pengguna, params.id) : null;
        if (!k) throw tidakDitemukan();
        return k;
      },
    }),

    rute({
      metode: 'post',
      jalur: '/api/kegiatan',
      ringkasan: 'Mencatat undangan/kegiatan baru (status Baru)',
      tag: 'Kegiatan',
      izin: ['kegiatan.buat'],
      body: BuatKegiatanInput,
      respons: {
        201: { deskripsi: 'Kegiatan dibuat', skema: KegiatanSkema },
        400: { deskripsi: 'Data tidak valid', skema: GalatSkema },
        401: { deskripsi: 'Belum masuk', skema: GalatSkema },
        403: { deskripsi: 'Tidak berizin', skema: GalatSkema },
      },
      penangan: async ({ req, deps, pengguna, body }) => {
        if (!pengguna) throw tidakDitemukan();
        const idPihak = [
          ...(body.pihak?.map((p) => p.pihakId) ?? []),
          ...(body.picProtokolId ? [body.picProtokolId] : []),
        ];
        const dikenal = new Set(
          (await deps.db.select({ id: pejabat.id }).from(pejabat)).map((p) => p.id),
        );
        const asing = idPihak.filter((i) => !dikenal.has(i));
        if (asing.length > 0) {
          throw new GalatApi(
            400,
            'tidak_valid',
            'Ada pihak yang tidak dikenal.',
            asing.map((i) => ({ jalur: 'pihak', pesan: `Tidak dikenal: ${i}` })),
          );
        }
        const id = `K${randomUUID().slice(0, 8).toUpperCase()}`;
        const sekarang = deps.sekarang();
        await deps.db.transaction(async (tx) => {
          await tx.insert(kegiatan).values({
            id,
            judul: body.judul,
            jenis: body.jenis ?? null,
            mulai: new Date(keEpoch(body.mulai)),
            selesai: body.selesai ? new Date(keEpoch(body.selesai)) : null,
            lokasiNama: body.lokasi?.nama ?? null,
            lokasiPulau: body.lokasi?.pulau ?? null,
            status: 'baru',
            penyelenggara: body.penyelenggara ?? null,
            picProtokolId: body.picProtokolId ?? null,
            picPengundangNama: body.picPengundang?.nama ?? null,
            picPengundangKontak: body.picPengundang?.kontak ?? null,
            tautanRapat: body.tautanRapat ?? null,
            catatan: body.catatan ?? null,
            isContoh: deps.config.appMode === 'demo',
            dibuat: sekarang,
            diubah: sekarang,
          });
          if (body.pihak && body.pihak.length > 0) {
            await tx.insert(kegiatanPihak).values(
              body.pihak.map((p) => ({
                kegiatanId: id,
                pihakId: p.pihakId,
                kedudukan: p.kedudukan,
                peran: p.peran ?? null,
              })),
            );
          }
          const baru = await ambilKegiatanMentah(tx, id);
          await catatAudit(tx, {
            ...aktorAudit(pengguna),
            aksi: 'kegiatan.buat',
            entitas: 'kegiatan',
            entitasId: id,
            sesudah: baru ? untukAudit(baru) : null,
            ...konteksAudit(req),
          });
        });
        const dto = await ambilKegiatanUntuk(deps.db, pengguna, id);
        return balas(201, dto, undefined, { Location: `/api/kegiatan/${id}` });
      },
    }),

    rute({
      metode: 'patch',
      jalur: '/api/kegiatan/:id',
      ringkasan: 'Mengubah data kegiatan (bukan status dan bukan pihak)',
      tag: 'Kegiatan',
      izin: ['kegiatan.ubah'],
      params: IdParams,
      body: UbahKegiatanInput,
      respons: {
        200: { deskripsi: 'Kegiatan setelah diubah', skema: KegiatanSkema },
        400: { deskripsi: 'Data tidak valid', skema: GalatSkema },
        401: { deskripsi: 'Belum masuk', skema: GalatSkema },
        403: { deskripsi: 'Tidak berizin', skema: GalatSkema },
        404: { deskripsi: 'Tidak ditemukan', skema: GalatSkema },
        409: {
          deskripsi: 'Status mengunci perubahan (berlangsung/selesai/dibatalkan)',
          skema: GalatSkema,
        },
      },
      penangan: async ({ req, deps, pengguna, params, body }) => {
        if (!pengguna) throw tidakDitemukan();
        const lama = await ambilKegiatanMentah(deps.db, params.id);
        if (!lama) throw tidakDitemukan();
        if (STATUS_TERKUNCI.includes(lama.status)) {
          throw new GalatApi(
            409,
            'status_terkunci',
            `Kegiatan berstatus ${lama.status} tidak dapat diubah.`,
          );
        }
        const mulaiBaru = body.mulai ?? lama.mulai;
        const selesaiBaru = body.selesai === undefined ? lama.selesai : body.selesai;
        if (selesaiBaru && keEpoch(selesaiBaru) <= keEpoch(mulaiBaru)) {
          throw new GalatApi(400, 'tidak_valid', 'Waktu selesai harus setelah waktu mulai.', [
            { jalur: 'selesai', pesan: 'Waktu selesai harus setelah waktu mulai' },
          ]);
        }
        if (body.picProtokolId) {
          const [ada] = await deps.db
            .select({ id: pejabat.id })
            .from(pejabat)
            .where(eq(pejabat.id, body.picProtokolId));
          if (!ada) throw new GalatApi(400, 'tidak_valid', 'PIC protokol tidak dikenal.');
        }
        const set: Partial<typeof kegiatan.$inferInsert> = { diubah: deps.sekarang() };
        if (body.judul !== undefined) set.judul = body.judul;
        if (body.jenis !== undefined) set.jenis = body.jenis;
        if (body.mulai !== undefined) set.mulai = new Date(keEpoch(body.mulai));
        if (body.selesai !== undefined)
          set.selesai = body.selesai ? new Date(keEpoch(body.selesai)) : null;
        if (body.lokasi !== undefined) {
          set.lokasiNama = body.lokasi?.nama ?? null;
          set.lokasiPulau = body.lokasi?.pulau ?? null;
        }
        if (body.penyelenggara !== undefined) set.penyelenggara = body.penyelenggara;
        if (body.picProtokolId !== undefined) set.picProtokolId = body.picProtokolId;
        if (body.picPengundang !== undefined) {
          set.picPengundangNama = body.picPengundang?.nama ?? null;
          set.picPengundangKontak = body.picPengundang?.kontak ?? null;
        }
        if (body.tautanRapat !== undefined) set.tautanRapat = body.tautanRapat;
        if (body.catatan !== undefined) set.catatan = body.catatan;

        await deps.db.transaction(async (tx) => {
          await tx.update(kegiatan).set(set).where(eq(kegiatan.id, params.id));
          const baru = await ambilKegiatanMentah(tx, params.id);
          await catatAudit(tx, {
            ...aktorAudit(pengguna),
            aksi: 'kegiatan.ubah',
            entitas: 'kegiatan',
            entitasId: params.id,
            sebelum: untukAudit(lama),
            sesudah: baru ? untukAudit(baru) : null,
            ...konteksAudit(req),
          });
        });
        return ambilKegiatanUntuk(deps.db, pengguna, params.id);
      },
    }),

    rute({
      metode: 'put',
      jalur: '/api/kegiatan/:id/pihak/:pihakId',
      ringkasan: 'Menetapkan kedudukan pihak pada kegiatan (undang, tugaskan, terima, tolak)',
      tag: 'Kegiatan',
      izin: ['pihak.kelola', 'pihak.konfirmasi_sendiri'],
      params: IdPihakParams,
      body: PihakInput,
      respons: {
        200: { deskripsi: 'Kegiatan setelah diubah', skema: KegiatanSkema },
        400: { deskripsi: 'Data tidak valid', skema: GalatSkema },
        401: { deskripsi: 'Belum masuk', skema: GalatSkema },
        403: {
          deskripsi: 'Tidak berizin (pejabat hanya boleh menerima/menolak penugasan dirinya)',
          skema: GalatSkema,
        },
        404: { deskripsi: 'Tidak ditemukan', skema: GalatSkema },
        409: { deskripsi: 'Kegiatan sudah selesai atau dibatalkan', skema: GalatSkema },
      },
      penangan: async ({ req, deps, pengguna, params, body }) => {
        if (!pengguna) throw tidakDitemukan();
        const lama = await ambilKegiatanMentah(deps.db, params.id);
        if (!lama || !bolehBaca(pengguna, lama)) throw tidakDitemukan();
        if (['selesai', 'dibatalkan'].includes(lama.status)) {
          throw new GalatApi(
            409,
            'status_terkunci',
            `Kegiatan berstatus ${lama.status} tidak dapat diubah.`,
          );
        }
        const sebelumRow = lama.pihak.find((x) => x.id === params.pihakId);
        if (!pengguna.izin.has('pihak.kelola')) {
          // Hanya konfirmasi diri sendiri: terima/tolak penugasan yang sudah diberikan.
          const diriSendiri = pengguna.efektif.pejabatId === params.pihakId;
          const sah =
            diriSendiri &&
            sebelumRow !== undefined &&
            ['ditugaskan', 'diterima', 'ditolak'].includes(sebelumRow.kedudukan) &&
            ['diterima', 'ditolak'].includes(body.kedudukan);
          if (!sah) {
            throw new GalatApi(
              403,
              'dilarang',
              'Anda hanya dapat menerima atau menolak penugasan untuk diri sendiri.',
            );
          }
        }
        const [ada] = await deps.db
          .select({ id: pejabat.id })
          .from(pejabat)
          .where(eq(pejabat.id, params.pihakId));
        if (!ada) throw new GalatApi(404, 'tidak_ditemukan', 'Pihak tidak dikenal.');

        await deps.db.transaction(async (tx) => {
          await tx
            .insert(kegiatanPihak)
            .values({
              kegiatanId: params.id,
              pihakId: params.pihakId,
              kedudukan: body.kedudukan,
              peran: body.peran ?? null,
            })
            .onConflictDoUpdate({
              target: [kegiatanPihak.kegiatanId, kegiatanPihak.pihakId],
              set: { kedudukan: body.kedudukan, peran: body.peran ?? null },
            });
          await tx
            .update(kegiatan)
            .set({ diubah: deps.sekarang() })
            .where(eq(kegiatan.id, params.id));
          await catatAudit(tx, {
            ...aktorAudit(pengguna),
            aksi: 'kegiatan.pihak.set',
            entitas: 'kegiatan',
            entitasId: params.id,
            sebelum: sebelumRow
              ? {
                  pihakId: params.pihakId,
                  kedudukan: sebelumRow.kedudukan,
                  peran: sebelumRow.peran,
                }
              : null,
            sesudah: {
              pihakId: params.pihakId,
              kedudukan: body.kedudukan,
              peran: body.peran ?? null,
            },
            ...konteksAudit(req),
          });
        });
        return ambilKegiatanUntuk(deps.db, pengguna, params.id);
      },
    }),

    rute({
      metode: 'delete',
      jalur: '/api/kegiatan/:id/pihak/:pihakId',
      ringkasan: 'Menghapus pihak dari kegiatan',
      tag: 'Kegiatan',
      izin: ['pihak.kelola'],
      params: IdPihakParams,
      respons: {
        200: { deskripsi: 'Kegiatan setelah diubah', skema: KegiatanSkema },
        401: { deskripsi: 'Belum masuk', skema: GalatSkema },
        403: { deskripsi: 'Tidak berizin', skema: GalatSkema },
        404: { deskripsi: 'Tidak ditemukan', skema: GalatSkema },
        409: { deskripsi: 'Kegiatan sudah selesai atau dibatalkan', skema: GalatSkema },
      },
      penangan: async ({ req, deps, pengguna, params }) => {
        if (!pengguna) throw tidakDitemukan();
        const lama = await ambilKegiatanMentah(deps.db, params.id);
        if (!lama || !bolehBaca(pengguna, lama)) throw tidakDitemukan();
        if (['selesai', 'dibatalkan'].includes(lama.status)) {
          throw new GalatApi(
            409,
            'status_terkunci',
            `Kegiatan berstatus ${lama.status} tidak dapat diubah.`,
          );
        }
        const sebelumRow = lama.pihak.find((x) => x.id === params.pihakId);
        if (!sebelumRow)
          throw new GalatApi(404, 'tidak_ditemukan', 'Pihak tidak terdaftar pada kegiatan ini.');
        await deps.db.transaction(async (tx) => {
          await tx
            .delete(kegiatanPihak)
            .where(
              and(
                eq(kegiatanPihak.kegiatanId, params.id),
                eq(kegiatanPihak.pihakId, params.pihakId),
              ),
            );
          await tx
            .update(kegiatan)
            .set({ diubah: deps.sekarang() })
            .where(eq(kegiatan.id, params.id));
          await catatAudit(tx, {
            ...aktorAudit(pengguna),
            aksi: 'kegiatan.pihak.hapus',
            entitas: 'kegiatan',
            entitasId: params.id,
            sebelum: {
              pihakId: params.pihakId,
              kedudukan: sebelumRow.kedudukan,
              peran: sebelumRow.peran,
            },
            ...konteksAudit(req),
          });
        });
        return ambilKegiatanUntuk(deps.db, pengguna, params.id);
      },
    }),

    rute({
      metode: 'post',
      jalur: '/api/kegiatan/:id/pindah-status',
      ringkasan: 'Memindahkan status kegiatan (aturan domain; bentrok pasti butuh alasan)',
      tag: 'Kegiatan',
      izin: ['kegiatan.pindah_status'],
      params: IdParams,
      body: PindahStatusInput,
      respons: {
        200: {
          deskripsi: 'Status dipindahkan; peristiwa dan peringatan bentrok',
          skema: HasilPindahSkema,
        },
        400: { deskripsi: 'Data tidak valid', skema: GalatSkema },
        401: { deskripsi: 'Belum masuk', skema: GalatSkema },
        403: { deskripsi: 'Tidak berizin', skema: GalatSkema },
        404: { deskripsi: 'Tidak ditemukan', skema: GalatSkema },
        409: { deskripsi: 'Status berubah oleh pengguna lain', skema: GalatSkema },
        422: { deskripsi: 'Perpindahan ditolak aturan (rincian di rincian[])', skema: GalatSkema },
      },
      penangan: async ({ req, deps, pengguna, params, body }) => {
        if (!pengguna) throw tidakDitemukan();
        const mentah = await ambilKegiatanMentah(deps.db, params.id);
        if (!mentah || !bolehBaca(pengguna, mentah)) throw tidakDitemukan();
        const a = aktorAudit(pengguna);
        const hasil = await pindahStatusKegiatan(deps.db, {
          kegiatanId: params.id,
          ke: body.ke,
          oleh: a.aktor,
          ...(a.aktorPeran ? { aktorPeran: a.aktorPeran } : {}),
          ...(body.alasan !== undefined ? { alasan: body.alasan } : {}),
          ...(body.alasanBentrok !== undefined ? { alasanBentrok: body.alasanBentrok } : {}),
          reqId: req.id,
          ip: req.ip,
          sekarang: deps.sekarang(),
        });
        if (!hasil.ok) {
          if (hasil.kode === 'tidak_ditemukan') throw tidakDitemukan();
          if (hasil.kode === 'berubah_bersamaan')
            throw new GalatApi(409, 'berubah_bersamaan', hasil.alasan.join(' '));
          throw new GalatApi(
            422,
            'ditolak_aturan',
            'Perpindahan status ditolak.',
            hasil.alasan.map((pesan) => ({ jalur: 'status', pesan })),
          );
        }
        const dto = await ambilKegiatanUntuk(deps.db, pengguna, params.id);
        return {
          kegiatan: dto as KegiatanDto,
          peristiwa: hasil.peristiwa,
          peringatan: hasil.peringatan,
        };
      },
    }),

    rute({
      metode: 'post',
      jalur: '/api/kegiatan/:id/keputusan-kehadiran',
      ringkasan:
        'Keputusan kehadiran pimpinan secara atomik: hadir sendiri, wakilkan, tidak hadir, atau tunda (opsional sekaligus menetapkan)',
      tag: 'Kegiatan',
      izin: ['pihak.kelola'],
      params: IdParams,
      body: KeputusanKehadiranInput,
      respons: {
        200: {
          deskripsi: 'Keputusan tersimpan; kegiatan, peristiwa status, peringatan bentrok',
          skema: HasilKeputusanSkema,
        },
        400: { deskripsi: 'Data tidak valid', skema: GalatSkema },
        401: { deskripsi: 'Belum masuk', skema: GalatSkema },
        403: { deskripsi: 'Tidak berizin', skema: GalatSkema },
        404: { deskripsi: 'Tidak ditemukan atau di luar hak akses', skema: GalatSkema },
        409: { deskripsi: 'Status mengunci perubahan atau berubah bersamaan', skema: GalatSkema },
        422: {
          deskripsi: 'Ditolak aturan (tidak ada perubahan yang tersimpan)',
          skema: GalatSkema,
        },
      },
      penangan: async ({ req, deps, pengguna, params, body }) => {
        if (!pengguna) throw tidakDitemukan();
        const lama = await ambilKegiatanMentah(deps.db, params.id);
        if (!lama || !bolehBaca(pengguna, lama)) throw tidakDitemukan();
        const a = aktorAudit(pengguna);
        const hasil = await putuskanKehadiran(deps.db, {
          kegiatanId: params.id,
          pimpinanId: body.pimpinanId,
          keputusan: body.keputusan,
          penggantiId: body.penggantiId,
          alasan: body.alasan,
          tetapkan: body.tetapkan,
          alasanBentrok: body.alasanBentrok,
          oleh: a.aktor,
          aktorPeran: a.aktorPeran,
          reqId: req.id,
          ip: req.ip,
          sekarang: deps.sekarang(),
        });
        if (!hasil.ok) {
          if (hasil.kode === 'tidak_ditemukan') throw tidakDitemukan();
          if (hasil.kode === 'terkunci' || hasil.kode === 'berubah_bersamaan') {
            throw new GalatApi(
              409,
              hasil.kode === 'terkunci' ? 'status_terkunci' : 'berubah_bersamaan',
              hasil.alasan.join(' '),
            );
          }
          throw new GalatApi(
            422,
            'ditolak_aturan',
            'Keputusan ditolak; tidak ada perubahan yang tersimpan.',
            hasil.alasan.map((pesan) => ({ jalur: 'keputusan', pesan })),
          );
        }
        const dto = await ambilKegiatanUntuk(deps.db, pengguna, params.id);
        return {
          kegiatan: dto as KegiatanDto,
          peristiwa: hasil.peristiwa,
          peringatan: hasil.peringatan,
        };
      },
    }),

    rute({
      metode: 'get',
      jalur: '/api/bentrok',
      ringkasan: 'Bentrok jadwal (jam dan sumber daya), seluruhnya atau pada satu tanggal WIT',
      tag: 'Kegiatan',
      izin: ['bentrok.baca'],
      query: TanggalQuery,
      respons: {
        200: {
          deskripsi: 'Daftar bentrok (peringatan, bukan pemblokiran)',
          skema: z.array(BentrokSkema),
        },
        400: { deskripsi: 'Parameter tidak valid', skema: GalatSkema },
        401: { deskripsi: 'Belum masuk', skema: GalatSkema },
        403: { deskripsi: 'Tidak berizin', skema: GalatSkema },
      },
      penangan: async ({ deps, query }) => bentrokAgenda(deps.db, query.tanggal),
    }),
  ];
}
