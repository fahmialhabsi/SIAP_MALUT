/**
 * Registri rute: setiap rute dideklarasikan sekali (metode, jalur, izin, skema Zod untuk params/query/body/respons)
 * lalu dipakai untuk (1) memasang rute di Fastify dengan urutan tetap autentikasi -> izin -> validasi -> penangan,
 * dan (2) menghasilkan OpenAPI (docs/rekayasa/openapi.json). Satu sumber, sehingga dokumen tidak melenceng (KB-043).
 */
import '@fastify/cookie';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import type { ApiConfig } from '@siap/shared';
import type { Db } from './db/klien.js';
import type { Izin } from './keamanan/izin.js';
import { NAMA_KUKI, cariSesi, type PenggunaAktif } from './keamanan/sesi.js';
import type { Penyimpanan } from './penyimpanan.js';

export type Metode = 'get' | 'post' | 'put' | 'patch' | 'delete';

export interface Deps {
  db: Db;
  config: ApiConfig;
  penyimpanan: Penyimpanan;
  /** Penyuntik waktu (uji). */
  sekarang: () => Date;
  /** Batas ukuran unggahan (byte). */
  maksUnggahByte: number;
}

export interface Konteks<P, Q, B> {
  req: FastifyRequest;
  reply: FastifyReply;
  deps: Deps;
  /** Null hanya pada rute publik. */
  pengguna: PenggunaAktif | null;
  params: P;
  query: Q;
  body: B;
}

export interface ResponsDef {
  deskripsi: string;
  skema?: z.ZodType;
  /** Tipe isi selain JSON (mis. unduhan berkas). */
  tipeIsi?: string;
}

export interface DefRute {
  metode: Metode;
  /** Gaya Fastify: /api/kegiatan/:id */
  jalur: string;
  ringkasan: string;
  tag: string;
  publik?: boolean;
  /** Salah satu izin ini cukup (any-of). Wajib pada rute non-publik, kecuali `hanyaMasuk`. */
  izin?: readonly Izin[];
  /** Cukup sudah masuk (tanpa izin tertentu), mis. profil sendiri. */
  hanyaMasuk?: boolean;
  /** Periksa izin pada akun asli (bukan persona demo), agar admin dapat kembali dari persona. */
  izinAkunAsli?: boolean;
  params?: z.ZodType;
  query?: z.ZodType;
  body?: z.ZodType;
  multipart?: boolean;
  respons: Record<number, ResponsDef>;
  penangan: (k: Konteks<never, never, never>) => Promise<unknown> | unknown;
}

export class Balasan {
  constructor(
    public readonly kode: number,
    public readonly isi?: unknown,
    public readonly tipe?: string,
    public readonly header: Record<string, string> = {},
  ) {}
}
export const balas = (
  kode: number,
  isi?: unknown,
  tipe?: string,
  header?: Record<string, string>,
) => new Balasan(kode, isi, tipe, header);

/** Galat yang dapat ditampilkan kepada klien. */
export class GalatApi extends Error {
  constructor(
    public readonly status: number,
    public readonly kode: string,
    pesan: string,
    public readonly rincian?: unknown,
  ) {
    super(pesan);
    this.name = 'GalatApi';
  }
}

export function rute<
  P extends z.ZodType = z.ZodUndefined,
  Q extends z.ZodType = z.ZodUndefined,
  B extends z.ZodType = z.ZodUndefined,
>(
  def: Omit<DefRute, 'penangan' | 'params' | 'query' | 'body'> & {
    params?: P;
    query?: Q;
    body?: B;
    penangan: (k: Konteks<z.infer<P>, z.infer<Q>, z.infer<B>>) => Promise<unknown> | unknown;
  },
): DefRute {
  return def as unknown as DefRute;
}

function rincianZod(e: z.ZodError) {
  return e.issues.map((i) => ({ jalur: i.path.join('.') || '(isi)', pesan: i.message }));
}

function validasi(skema: z.ZodType | undefined, nilai: unknown, bagian: string) {
  if (!skema) return undefined;
  const hasil = skema.safeParse(nilai ?? {});
  if (!hasil.success) {
    throw new GalatApi(
      400,
      'tidak_valid',
      `Data tidak valid (${bagian}).`,
      rincianZod(hasil.error),
    );
  }
  return hasil.data;
}

/** Memasang seluruh rute dengan urutan: autentikasi, izin, validasi, penangan. */
export function pasangRute(app: FastifyInstance, daftar: readonly DefRute[], deps: Deps): void {
  for (const def of daftar) {
    app.route({
      method: def.metode.toUpperCase() as Uppercase<Metode>,
      url: def.jalur,
      handler: async (req: FastifyRequest, reply: FastifyReply) => {
        let pengguna: PenggunaAktif | null = null;
        if (!def.publik) {
          const token = req.cookies?.[NAMA_KUKI];
          pengguna = token ? await cariSesi(deps.db, token, deps.sekarang()) : null;
          if (!pengguna) {
            throw new GalatApi(401, 'belum_masuk', 'Silakan masuk terlebih dahulu.');
          }
          if (def.izin && def.izin.length > 0) {
            const punya = def.izinAkunAsli ? pengguna.izinAsli : pengguna.izin;
            if (!def.izin.some((i) => punya.has(i))) {
              throw new GalatApi(403, 'dilarang', 'Anda tidak memiliki izin untuk tindakan ini.');
            }
          }
        }
        const params = validasi(def.params, req.params, 'jalur');
        const query = validasi(def.query, req.query, 'parameter');
        const body = def.multipart ? undefined : validasi(def.body, req.body, 'isi');

        const hasil = await def.penangan({
          req,
          reply,
          deps,
          pengguna,
          params,
          query,
          body,
        } as never);
        if (reply.sent) return reply;
        if (hasil instanceof Balasan) {
          for (const [k, v] of Object.entries(hasil.header)) reply.header(k, v);
          if (hasil.tipe) reply.type(hasil.tipe);
          return reply.code(hasil.kode).send(hasil.isi);
        }
        if (hasil === undefined) return reply.code(204).send();
        return reply.code(200).send(hasil);
      },
    });
  }
}
