/**
 * Layanan kegiatan: memuat dari basis data menjadi model domain dan memindahkan status dengan jejak audit.
 * Tanpa HTTP/autentikasi (Tahap 1.3b menambahkannya di atas fungsi ini).
 */
import { and, eq } from 'drizzle-orm';
import {
  cariBentrok,
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

type Baca = Pick<Db, 'select'>;

/** Memuat seluruh kegiatan (beserta pihak) sebagai model domain. Waktu dalam ISO 8601 WIT. */
export async function muatKegiatan(db: Baca): Promise<Kegiatan[]> {
  const baris = await db.select().from(kegiatan).orderBy(kegiatan.mulai, kegiatan.id);
  const pihak = await db
    .select({
      kegiatanId: kegiatanPihak.kegiatanId,
      id: pejabat.id,
      nama: pejabat.nama,
      golongan: pejabat.golongan,
      kedudukan: kegiatanPihak.kedudukan,
      peran: kegiatanPihak.peran,
    })
    .from(kegiatanPihak)
    .innerJoin(pejabat, eq(kegiatanPihak.pihakId, pejabat.id))
    .orderBy(pejabat.urutanTataTempat, pejabat.id);

  return baris.map((k) => ({
    id: k.id,
    judul: k.judul,
    ...(k.jenis ? { jenis: k.jenis } : {}),
    mulai: keIsoWit(k.mulai),
    ...(k.selesai ? { selesai: keIsoWit(k.selesai) } : {}),
    ...(k.lokasiNama
      ? { lokasi: { nama: k.lokasiNama, ...(k.lokasiPulau ? { pulau: k.lokasiPulau } : {}) } }
      : {}),
    status: k.status as StatusAgenda,
    pihak: pihak
      .filter((p) => p.kegiatanId === k.id)
      .map((p) => ({
        id: p.id,
        nama: p.nama,
        golongan: p.golongan as 'pimpinan' | 'pejabat' | 'petugas',
        kedudukan: p.kedudukan as 'diundang' | 'ditugaskan' | 'diterima' | 'ditolak',
        ...(p.peran ? { peran: p.peran as 'utama' | 'mewakili' | 'pendamping' } : {}),
      })),
  }));
}

/** Bentrok seluruh agenda (atau pada satu tanggal WIT `YYYY-MM-DD`). */
export async function bentrokAgenda(db: Baca, tanggal?: string): Promise<Bentrok[]> {
  const semua = await muatKegiatan(db);
  const durasiBawaanMenit = await ambilPengaturan(db, 'durasiBawaanMenit');
  const lingkup = tanggal ? semua.filter((k) => k.mulai.startsWith(tanggal)) : semua;
  return cariBentrok(lingkup, { durasiBawaanMenit });
}

export interface PermintaanPindah {
  kegiatanId: string;
  ke: StatusAgenda;
  oleh: string;
  aktorPeran?: string;
  alasan?: string;
  alasanBentrok?: string;
  reqId?: string;
  ip?: string;
  /** Penyuntik waktu (untuk uji). */
  sekarang?: Date;
}

export type HasilPindahTersimpan =
  | { ok: true; kegiatan: Kegiatan; peristiwa: PeristiwaStatus; peringatan: Bentrok[] }
  | { ok: false; kode: 'tidak_ditemukan' | 'ditolak' | 'berubah_bersamaan'; alasan: string[] };

/**
 * Memindahkan status kegiatan: memakai aturan domain (termasuk bentrok pasti butuh alasan, KB-038),
 * menyimpan status baru, dan mencatat peristiwa ke log audit dalam satu transaksi (KB-016).
 */
export async function pindahStatusKegiatan(
  db: Db,
  p: PermintaanPindah,
): Promise<HasilPindahTersimpan> {
  const sekarang = p.sekarang ?? new Date();
  return db.transaction(async (tx) => {
    const semua = await muatKegiatan(tx);
    const k = semua.find((x) => x.id === p.kegiatanId);
    if (!k) return { ok: false, kode: 'tidak_ditemukan', alasan: ['Kegiatan tidak ditemukan.'] };

    const durasiBawaanMenit = await ambilPengaturan(tx, 'durasiBawaanMenit');
    const hasil = pindahStatus(k, p.ke, {
      oleh: p.oleh,
      waktu: keIsoWit(sekarang),
      ...(p.alasan !== undefined ? { alasan: p.alasan } : {}),
      ...(p.alasanBentrok !== undefined ? { alasanBentrok: p.alasanBentrok } : {}),
      kegiatanLain: semua,
      opsiBentrok: { durasiBawaanMenit },
    });
    if (!hasil.ok) return { ok: false, kode: 'ditolak', alasan: hasil.alasan };

    // Kunci optimistis: hanya berubah bila status masih seperti yang dibaca.
    const diubah = await tx
      .update(kegiatan)
      .set({ status: p.ke, diubah: sekarang })
      .where(and(eq(kegiatan.id, p.kegiatanId), eq(kegiatan.status, k.status)))
      .returning({ id: kegiatan.id });
    if (diubah.length === 0) {
      return {
        ok: false,
        kode: 'berubah_bersamaan',
        alasan: ['Status kegiatan berubah oleh pengguna lain; muat ulang dan coba lagi.'],
      };
    }

    await catatAudit(tx, {
      aktor: p.oleh,
      ...(p.aktorPeran ? { aktorPeran: p.aktorPeran } : {}),
      aksi: 'kegiatan.pindah_status',
      entitas: 'kegiatan',
      entitasId: p.kegiatanId,
      sebelum: { status: k.status },
      sesudah: { status: p.ke, peristiwa: hasil.peristiwa },
      ...(p.alasan !== undefined ? { alasan: p.alasan } : {}),
      ...(p.reqId ? { reqId: p.reqId } : {}),
      ...(p.ip ? { ip: p.ip } : {}),
    });

    return {
      ok: true,
      kegiatan: hasil.kegiatan,
      peristiwa: hasil.peristiwa,
      peringatan: hasil.peringatan,
    };
  });
}
