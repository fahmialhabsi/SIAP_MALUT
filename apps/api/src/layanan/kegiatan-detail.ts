/**
 * Pemuatan kegiatan lengkap untuk API (DTO), dengan pembatasan data berdasarkan peran:
 * - `kegiatan.baca_semua` melihat seluruhnya; `kegiatan.baca_terkait` hanya kegiatan yang memuat pihak dirinya;
 * - tautan rapat (KB-019) hanya untuk peran berizin `tautan_rapat.lihat_semua` atau pihak yang ditugaskan/diterima.
 */
import { eq } from 'drizzle-orm';
import type { Db } from '../db/klien.js';
import { kegiatan, kegiatanPihak, pejabat } from '../db/schema.js';
import type { PenggunaAktif } from '../keamanan/sesi.js';
import type { KegiatanDto, PihakDto } from '../skema-dto.js';
import { keIsoWit } from '../waktu.js';

type Baca = Pick<Db, 'select'>;
type BarisKegiatan = typeof kegiatan.$inferSelect;

export function barisKeDto(k: BarisKegiatan, pihak: PihakDto[]): KegiatanDto {
  return {
    id: k.id,
    judul: k.judul,
    jenis: k.jenis,
    mulai: keIsoWit(k.mulai),
    selesai: k.selesai ? keIsoWit(k.selesai) : null,
    lokasi: k.lokasiNama ? { nama: k.lokasiNama, pulau: k.lokasiPulau } : null,
    status: k.status as KegiatanDto['status'],
    penyelenggara: k.penyelenggara,
    picProtokolId: k.picProtokolId,
    picPengundang:
      k.picPengundangNama || k.picPengundangKontak
        ? { nama: k.picPengundangNama, kontak: k.picPengundangKontak }
        : null,
    tautanRapat: k.tautanRapat,
    catatan: k.catatan,
    isContoh: k.isContoh,
    pihak,
    dibuat: keIsoWit(k.dibuat),
    diubah: keIsoWit(k.diubah),
  };
}

export async function muatPihak(db: Baca, kegiatanId?: string): Promise<Map<string, PihakDto[]>> {
  const dasar = db
    .select({
      kegiatanId: kegiatanPihak.kegiatanId,
      id: pejabat.id,
      nama: pejabat.nama,
      golongan: pejabat.golongan,
      kedudukan: kegiatanPihak.kedudukan,
      peran: kegiatanPihak.peran,
    })
    .from(kegiatanPihak)
    .innerJoin(pejabat, eq(kegiatanPihak.pihakId, pejabat.id));
  const baris = await (
    kegiatanId ? dasar.where(eq(kegiatanPihak.kegiatanId, kegiatanId)) : dasar
  ).orderBy(pejabat.urutanTataTempat, pejabat.id);
  const peta = new Map<string, PihakDto[]>();
  for (const b of baris) {
    const daftar = peta.get(b.kegiatanId) ?? [];
    daftar.push({
      id: b.id,
      nama: b.nama,
      golongan: b.golongan as PihakDto['golongan'],
      kedudukan: b.kedudukan as PihakDto['kedudukan'],
      peran: (b.peran as PihakDto['peran']) ?? null,
    });
    peta.set(b.kegiatanId, daftar);
  }
  return peta;
}

export function adalahPihakTerkait(p: PenggunaAktif, pihak: PihakDto[]): boolean {
  const id = p.efektif.pejabatId;
  return id !== null && pihak.some((x) => x.id === id);
}

export function bolehLihatTautan(p: PenggunaAktif, pihak: PihakDto[]): boolean {
  if (p.izin.has('tautan_rapat.lihat_semua')) return true;
  const id = p.efektif.pejabatId;
  return (
    id !== null &&
    pihak.some((x) => x.id === id && (x.kedudukan === 'ditugaskan' || x.kedudukan === 'diterima'))
  );
}

/** Menerapkan pembatasan peran pada satu DTO: menyembunyikan tautan rapat bila tidak berhak. */
export function terapkanBatas(p: PenggunaAktif, k: KegiatanDto): KegiatanDto {
  return bolehLihatTautan(p, k.pihak) ? k : { ...k, tautanRapat: null };
}

/** Bolehkah pengguna melihat kegiatan ini? */
export function bolehBaca(p: PenggunaAktif, k: KegiatanDto): boolean {
  if (p.izin.has('kegiatan.baca_semua')) return true;
  return p.izin.has('kegiatan.baca_terkait') && adalahPihakTerkait(p, k.pihak);
}

export async function daftarKegiatanUntuk(
  db: Baca,
  p: PenggunaAktif,
  saring: { tanggal?: string | undefined; status?: string | undefined } = {},
): Promise<KegiatanDto[]> {
  const baris = await db.select().from(kegiatan).orderBy(kegiatan.mulai, kegiatan.id);
  const pihak = await muatPihak(db);
  return baris
    .map((k) => barisKeDto(k, pihak.get(k.id) ?? []))
    .filter((k) => (saring.tanggal ? k.mulai.startsWith(saring.tanggal) : true))
    .filter((k) => (saring.status ? k.status === saring.status : true))
    .filter((k) => bolehBaca(p, k))
    .map((k) => terapkanBatas(p, k));
}

/** Satu kegiatan menurut ID tanpa pembatasan peran (untuk penulisan); `null` bila tidak ada. */
export async function ambilKegiatanMentah(db: Baca, id: string): Promise<KegiatanDto | null> {
  const [k] = await db.select().from(kegiatan).where(eq(kegiatan.id, id));
  if (!k) return null;
  const pihak = await muatPihak(db, id);
  return barisKeDto(k, pihak.get(id) ?? []);
}

export async function ambilKegiatanUntuk(
  db: Baca,
  p: PenggunaAktif,
  id: string,
): Promise<KegiatanDto | null> {
  const k = await ambilKegiatanMentah(db, id);
  if (!k || !bolehBaca(p, k)) return null;
  return terapkanBatas(p, k);
}
