/**
 * Skema Zod untuk masukan dan keluaran API. Dipakai untuk validasi, dokumentasi OpenAPI, dan uji kesesuaian
 * (isi respons pada uji harus lolos skema yang sama, sehingga dokumen tidak melenceng).
 */
import { z } from 'zod';
import { keEpoch, STATUS_AGENDA } from '@siap/domain';
import { APP_MODES } from '@siap/shared';
import { IZIN } from './keamanan/izin.js';
import { GOLONGAN, KEDUDUKAN, PERAN_PENGGUNA, PERAN_PIHAK } from './db/schema.js';

const teksIsi = (maks = 300) => z.string().trim().min(1).max(maks);

export const WaktuMasuk = z.string().refine(
  (s) => {
    try {
      keEpoch(s);
      return true;
    } catch {
      return false;
    }
  },
  { message: 'Waktu harus berformat ISO 8601 beserta zona, mis. 2026-10-24T20:00:00+09:00' },
);

export const GalatSkema = z.object({
  galat: z.object({
    kode: z.string(),
    pesan: z.string(),
    rincian: z.array(z.object({ jalur: z.string(), pesan: z.string() })).optional(),
  }),
});

export const ProfilSkema = z.object({
  username: z.string(),
  nama: z.string(),
  peran: z.enum(PERAN_PENGGUNA),
  pejabatId: z.string().nullable(),
  izin: z.array(z.enum(IZIN)),
  mode: z.enum(APP_MODES),
  sebagaiPersona: z.boolean(),
  akunAsli: z.string().nullable(),
});

export const MasukInput = z.object({
  username: z.string().trim().min(1).max(100),
  sandi: z.string().min(1).max(200),
});

export const PejabatSkema = z.object({
  id: z.string(),
  nama: z.string(),
  golongan: z.enum(GOLONGAN),
  jabatan: z.string().nullable(),
  instansi: z.string().nullable(),
  urutanTataTempat: z.number().int().nullable(),
  isContoh: z.boolean(),
});

export const PihakSkema = z.object({
  id: z.string(),
  nama: z.string(),
  golongan: z.enum(GOLONGAN),
  kedudukan: z.enum(KEDUDUKAN),
  peran: z.enum(PERAN_PIHAK).nullable(),
});

export const KegiatanSkema = z.object({
  id: z.string(),
  judul: z.string(),
  jenis: z.string().nullable(),
  mulai: z.string(),
  selesai: z.string().nullable(),
  lokasi: z.object({ nama: z.string(), pulau: z.string().nullable() }).nullable(),
  status: z.enum(STATUS_AGENDA),
  penyelenggara: z.string().nullable(),
  picProtokolId: z.string().nullable(),
  picPengundang: z
    .object({ nama: z.string().nullable(), kontak: z.string().nullable() })
    .nullable(),
  /** Hanya terisi bagi pihak yang ditugaskan dan peran yang berhak (KB-019); selain itu null. */
  tautanRapat: z.string().nullable(),
  catatan: z.string().nullable(),
  isContoh: z.boolean(),
  pihak: z.array(PihakSkema),
  dibuat: z.string(),
  diubah: z.string(),
});
export type KegiatanDto = z.infer<typeof KegiatanSkema>;
export type PihakDto = z.infer<typeof PihakSkema>;

export const DaftarKegiatanQuery = z.object({
  tanggal: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal YYYY-MM-DD (WIT)')
    .optional(),
  status: z.enum(STATUS_AGENDA).optional(),
});

export const IdParams = z.object({ id: teksIsi(100) });
export const IdPihakParams = z.object({ id: teksIsi(100), pihakId: teksIsi(100) });

export const BuatKegiatanInput = z
  .object({
    judul: teksIsi(300),
    jenis: teksIsi(100).optional(),
    mulai: WaktuMasuk,
    selesai: WaktuMasuk.optional(),
    lokasi: z.object({ nama: teksIsi(200), pulau: teksIsi(100).optional() }).optional(),
    penyelenggara: teksIsi(200).optional(),
    picProtokolId: teksIsi(100).optional(),
    picPengundang: z
      .object({ nama: teksIsi(200).optional(), kontak: teksIsi(100).optional() })
      .optional(),
    tautanRapat: z.string().trim().min(1).max(500).optional(),
    catatan: z.string().trim().max(2000).optional(),
    pihak: z
      .array(
        z.object({
          pihakId: teksIsi(100),
          kedudukan: z.enum(KEDUDUKAN).default('diundang'),
          peran: z.enum(PERAN_PIHAK).optional(),
        }),
      )
      .max(50)
      .optional(),
  })
  .refine(
    (d) => {
      if (!d.selesai) return true;
      try {
        return keEpoch(d.selesai) > keEpoch(d.mulai);
      } catch {
        return true; // waktu tidak valid dilaporkan oleh aturan kolomnya masing-masing
      }
    },
    {
      message: 'Waktu selesai harus setelah waktu mulai',
      path: ['selesai'],
    },
  );

export const UbahKegiatanInput = z
  .object({
    judul: teksIsi(300),
    jenis: teksIsi(100).nullable(),
    mulai: WaktuMasuk,
    selesai: WaktuMasuk.nullable(),
    lokasi: z.object({ nama: teksIsi(200), pulau: teksIsi(100).optional() }).nullable(),
    penyelenggara: teksIsi(200).nullable(),
    picProtokolId: teksIsi(100).nullable(),
    picPengundang: z
      .object({ nama: teksIsi(200).optional(), kontak: teksIsi(100).optional() })
      .nullable(),
    tautanRapat: z.string().trim().min(1).max(500).nullable(),
    catatan: z.string().trim().max(2000).nullable(),
  })
  .partial()
  .refine((d) => Object.keys(d).length > 0, { message: 'Tidak ada yang diubah' });

export const PihakInput = z.object({
  kedudukan: z.enum(KEDUDUKAN),
  peran: z.enum(PERAN_PIHAK).nullable().optional(),
});

export const PindahStatusInput = z.object({
  ke: z.enum(STATUS_AGENDA),
  alasan: z.string().trim().max(1000).optional(),
  alasanBentrok: z.string().trim().max(1000).optional(),
});

export const KEPUTUSAN_KEHADIRAN = ['hadir_sendiri', 'wakilkan', 'tidak_hadir', 'tunda'] as const;

/** KB-047: keputusan kehadiran pimpinan, atomik (kedudukan pimpinan, pengganti, dan status sekaligus). */
export const KeputusanKehadiranInput = z
  .object({
    pimpinanId: teksIsi(100),
    keputusan: z.enum(KEPUTUSAN_KEHADIRAN),
    penggantiId: teksIsi(100).optional(),
    alasan: z.string().trim().max(1000).optional(),
    tetapkan: z.boolean().optional(),
    alasanBentrok: z.string().trim().max(1000).optional(),
  })
  .superRefine((d, ctx) => {
    if (d.keputusan === 'wakilkan' && !d.penggantiId) {
      ctx.addIssue({ code: 'custom', path: ['penggantiId'], message: 'Pilih pejabat pengganti' });
    }
    if (d.keputusan === 'tunda' && !d.alasan) {
      ctx.addIssue({ code: 'custom', path: ['alasan'], message: 'Alasan menunda wajib diisi' });
    }
    if (d.keputusan === 'tunda' && d.tetapkan) {
      ctx.addIssue({
        code: 'custom',
        path: ['tetapkan'],
        message: 'Menunda tidak dapat digabung dengan menetapkan',
      });
    }
  });

export const BentrokSkema = z.object({
  pihakId: z.string(),
  pihakNama: z.string(),
  golongan: z.enum(GOLONGAN),
  jenis: z.enum(['langsung', 'sumber_daya']),
  kepastian: z.enum(['pasti', 'potensi']),
  kegiatanA: z.string(),
  kegiatanB: z.string(),
  irisan: z.object({ mulai: z.string(), selesai: z.string() }),
});

export const PeristiwaSkema = z.object({
  kegiatanId: z.string(),
  dari: z.enum(STATUS_AGENDA),
  ke: z.enum(STATUS_AGENDA),
  oleh: z.string(),
  waktu: z.string(),
  alasan: z.string().optional(),
  alasanBentrok: z.string().optional(),
  bentrok: z.array(BentrokSkema),
});

export const HasilPindahSkema = z.object({
  kegiatan: KegiatanSkema,
  peristiwa: PeristiwaSkema,
  peringatan: z.array(BentrokSkema),
});

export const TanggalQuery = z.object({
  tanggal: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal YYYY-MM-DD (WIT)')
    .optional(),
});

export const LampiranSkema = z.object({
  id: z.string(),
  kegiatanId: z.string(),
  namaBerkas: z.string(),
  tipe: z.string(),
  ukuran: z.number().int(),
  hashIsi: z.string(),
  dibuat: z.string(),
});

export const PengaturanSkema = z.object({ kunci: z.string(), nilai: z.unknown() });
export const KunciParams = z.object({ kunci: z.enum(['durasiBawaanMenit']) });
export const PengaturanInput = z.object({
  nilai: z.number().int().min(1).max(1440),
});

export const AuditQuery = z.object({
  entitasId: z.string().trim().min(1).max(100).optional(),
  batas: z.coerce.number().int().min(1).max(500).default(100),
});
export const AuditSkema = z.object({
  id: z.number().int(),
  waktu: z.string(),
  aktor: z.string(),
  aktorPeran: z.string().nullable(),
  aksi: z.string(),
  entitas: z.string().nullable(),
  entitasId: z.string().nullable(),
  sebelum: z.unknown(),
  sesudah: z.unknown(),
  alasan: z.string().nullable(),
  reqId: z.string().nullable(),
  ip: z.string().nullable(),
});

export const HakAksesSkema = z.object({
  izin: z.array(z.enum(IZIN)),
  peran: z.record(z.string(), z.array(z.enum(IZIN))),
});

export const PersonaInput = z.object({ username: z.string().trim().min(1).max(100) });
export const PersonaSkema = z.object({
  username: z.string(),
  nama: z.string(),
  peran: z.enum(PERAN_PENGGUNA),
});

export const HasilKeputusanSkema = z.object({
  kegiatan: KegiatanSkema,
  peristiwa: PeristiwaSkema.nullable(),
  peringatan: z.array(BentrokSkema),
});
