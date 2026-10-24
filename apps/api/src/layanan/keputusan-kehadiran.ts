/**
 * Keputusan kehadiran pimpinan secara atomik (KB-005, KB-047): satu permintaan mengatur kedudukan pimpinan dan
 * pengganti dan, bila diminta, memindahkan status; semuanya dalam satu transaksi dengan satu catatan audit.
 * Gagal sebagian tidak meninggalkan perubahan separuh.
 */
import { and, eq } from 'drizzle-orm';
import {
  pindahStatus,
  type Bentrok,
  type Kegiatan,
  type PeristiwaStatus,
  type StatusAgenda,
} from '@siap/domain';
import { catatAudit } from '../db/audit.js';
import type { Db } from '../db/klien.js';
import { ambilPengaturan } from '../db/pengaturan.js';
import { kegiatan, kegiatanPihak, pejabat } from '../db/schema.js';
import { keIsoWit } from '../waktu.js';
import { muatKegiatan } from './kegiatan.js';

export type Keputusan = 'hadir_sendiri' | 'wakilkan' | 'tidak_hadir' | 'tunda';

export interface PermintaanKeputusan {
  kegiatanId: string;
  pimpinanId: string;
  keputusan: Keputusan;
  penggantiId?: string | undefined;
  alasan?: string | undefined;
  /** Setelah kedudukan diatur, pindahkan status ke Ditetapkan (aturan domain tetap berlaku). */
  tetapkan?: boolean | undefined;
  alasanBentrok?: string | undefined;
  oleh: string;
  aktorPeran?: string | undefined;
  reqId?: string | undefined;
  ip?: string | undefined;
  sekarang: Date;
}

export type HasilKeputusan =
  | { ok: true; peringatan: Bentrok[]; peristiwa: PeristiwaStatus | null }
  | {
      ok: false;
      kode: 'tidak_ditemukan' | 'terkunci' | 'ditolak' | 'berubah_bersamaan';
      alasan: string[];
    };

/** Dilempar di dalam transaksi untuk membatalkan seluruh perubahan. */
class Batal extends Error {
  constructor(readonly hasil: Extract<HasilKeputusan, { ok: false }>) {
    super('keputusan dibatalkan');
  }
}

const TERKUNCI = ['berlangsung', 'selesai', 'dibatalkan'];

export async function putuskanKehadiran(db: Db, p: PermintaanKeputusan): Promise<HasilKeputusan> {
  try {
    return await db.transaction(async (tx) => {
      const gagal = (
        kode: Extract<HasilKeputusan, { ok: false }>['kode'],
        ...alasan: string[]
      ): never => {
        throw new Batal({ ok: false, kode, alasan });
      };

      const semua = await muatKegiatan(tx);
      const k = semua.find((x) => x.id === p.kegiatanId);
      if (!k) return gagal('tidak_ditemukan', 'Kegiatan tidak ditemukan.');
      if (TERKUNCI.includes(k.status)) {
        return gagal('terkunci', `Kegiatan berstatus ${k.status} tidak dapat diubah.`);
      }
      const pimpinan = k.pihak.find((x) => x.id === p.pimpinanId);
      if (!pimpinan || pimpinan.golongan !== 'pimpinan') {
        return gagal('ditolak', 'Pimpinan tidak terdaftar sebagai pihak pada kegiatan ini.');
      }
      if (p.keputusan === 'tunda' && p.tetapkan) {
        return gagal('ditolak', 'Menunda tidak dapat digabung dengan menetapkan.');
      }

      // 1. Susun kedudukan baru (pimpinan dan pengganti).
      type Ubah = {
        pihakId: string;
        kedudukan: Kegiatan['pihak'][number]['kedudukan'];
        peran: string | null;
      };
      const ubah: Ubah[] = [];
      if (p.keputusan === 'hadir_sendiri') {
        ubah.push({ pihakId: p.pimpinanId, kedudukan: 'diterima', peran: 'utama' });
      } else if (p.keputusan === 'tidak_hadir') {
        ubah.push({ pihakId: p.pimpinanId, kedudukan: 'ditolak', peran: null });
      } else if (p.keputusan === 'wakilkan') {
        if (!p.penggantiId || p.penggantiId === p.pimpinanId) {
          return gagal('ditolak', 'Pilih pejabat pengganti yang berbeda dari pimpinan.');
        }
        const [ada] = await tx
          .select({ id: pejabat.id, aktif: pejabat.aktif })
          .from(pejabat)
          .where(eq(pejabat.id, p.penggantiId));
        if (!ada || !ada.aktif)
          return gagal('ditolak', 'Pejabat pengganti tidak dikenal atau tidak aktif.');
        const sudah = k.pihak.find((x) => x.id === p.penggantiId);
        ubah.push({ pihakId: p.pimpinanId, kedudukan: 'ditolak', peran: null });
        ubah.push({
          pihakId: p.penggantiId,
          // pengganti yang sudah menerima tidak diturunkan kembali menjadi menunggu konfirmasi
          kedudukan: sudah?.kedudukan === 'diterima' ? 'diterima' : 'ditugaskan',
          peran: 'mewakili',
        });
      }

      for (const u of ubah) {
        await tx
          .insert(kegiatanPihak)
          .values({
            kegiatanId: p.kegiatanId,
            pihakId: u.pihakId,
            kedudukan: u.kedudukan,
            peran: u.peran,
          })
          .onConflictDoUpdate({
            target: [kegiatanPihak.kegiatanId, kegiatanPihak.pihakId],
            set: { kedudukan: u.kedudukan, peran: u.peran },
          });
      }

      // 2. Status: menunda, atau menetapkan, memakai aturan domain atas keadaan setelah perubahan pihak.
      let tujuan: StatusAgenda | null = null;
      if (p.keputusan === 'tunda') tujuan = 'ditunda';
      else if (p.tetapkan) tujuan = 'ditetapkan';

      let peristiwa: PeristiwaStatus | null = null;
      let peringatan: Bentrok[] = [];
      if (tujuan) {
        const sesudahPihak = await muatKegiatan(tx);
        const k2 = sesudahPihak.find((x) => x.id === p.kegiatanId) as Kegiatan;
        const durasiBawaanMenit = await ambilPengaturan(tx, 'durasiBawaanMenit');
        const hasil = pindahStatus(k2, tujuan, {
          oleh: p.oleh,
          waktu: keIsoWit(p.sekarang),
          ...(p.alasan !== undefined ? { alasan: p.alasan } : {}),
          ...(p.alasanBentrok !== undefined ? { alasanBentrok: p.alasanBentrok } : {}),
          kegiatanLain: sesudahPihak,
          opsiBentrok: { durasiBawaanMenit },
        });
        if (!hasil.ok) return gagal('ditolak', ...hasil.alasan);
        const diubah = await tx
          .update(kegiatan)
          .set({ status: tujuan, diubah: p.sekarang })
          .where(and(eq(kegiatan.id, p.kegiatanId), eq(kegiatan.status, k.status)))
          .returning({ id: kegiatan.id });
        if (diubah.length === 0) {
          return gagal(
            'berubah_bersamaan',
            'Status kegiatan berubah oleh pengguna lain; muat ulang dan coba lagi.',
          );
        }
        peristiwa = hasil.peristiwa;
        peringatan = hasil.peringatan;
      } else {
        await tx.update(kegiatan).set({ diubah: p.sekarang }).where(eq(kegiatan.id, p.kegiatanId));
      }

      // 3. Satu catatan audit untuk seluruh keputusan.
      await catatAudit(tx, {
        aktor: p.oleh,
        ...(p.aktorPeran ? { aktorPeran: p.aktorPeran } : {}),
        aksi: 'kegiatan.keputusan_kehadiran',
        entitas: 'kegiatan',
        entitasId: p.kegiatanId,
        sebelum: {
          status: k.status,
          pihak: k.pihak.map((x) => ({ id: x.id, kedudukan: x.kedudukan, peran: x.peran ?? null })),
        },
        sesudah: {
          keputusan: p.keputusan,
          pimpinanId: p.pimpinanId,
          penggantiId: p.penggantiId ?? null,
          pihak: ubah,
          status: tujuan ?? k.status,
          peristiwa,
        },
        ...(p.alasan !== undefined ? { alasan: p.alasan } : {}),
        ...(p.reqId ? { reqId: p.reqId } : {}),
        ...(p.ip ? { ip: p.ip } : {}),
      });
      return { ok: true as const, peringatan, peristiwa };
    });
  } catch (e) {
    if (e instanceof Batal) return e.hasil;
    throw e;
  }
}
