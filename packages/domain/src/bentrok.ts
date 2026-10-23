/**
 * Deteksi bentrok jadwal (KB-008, KB-010, KB-038, KB-039).
 * Bentrok adalah PERINGATAN, bukan pemblokiran: pimpinan tetap boleh menetapkan dengan alasan tercatat.
 * Bentrok perjalanan antarlokasi/pulau (KB-009) menyusul di Tahap 2.
 */
import type { GolonganPihak, Kegiatan, KedudukanPihak } from './model.js';
import type { StatusAgenda } from './status.js';
import { intervalDari, irisan, keIsoUtc } from './waktu.js';

export interface OpsiBentrok {
  /** Durasi bila jam selesai kosong. Berasal dari konfigurasi (KB-039), bukan angka di kode. */
  durasiBawaanMenit: number;
}

/** `langsung` = pihak berupa pimpinan; `sumber_daya` = pejabat/petugas. */
export type JenisBentrok = 'langsung' | 'sumber_daya';

/** `pasti` = kedua kegiatan sudah ditugaskan/diterima; `potensi` = salah satunya baru diundang. */
export type KepastianBentrok = 'pasti' | 'potensi';

export interface Bentrok {
  pihakId: string;
  pihakNama: string;
  golongan: GolonganPihak;
  jenis: JenisBentrok;
  kepastian: KepastianBentrok;
  kegiatanA: string;
  kegiatanB: string;
  /** Rentang irisan, ISO 8601 UTC. */
  irisan: { mulai: string; selesai: string };
}

/** Status yang tidak dihitung dalam bentrok. */
const STATUS_DIABAIKAN: readonly StatusAgenda[] = ['dibatalkan', 'ditunda', 'selesai'];

const PASTI: readonly KedudukanPihak[] = ['ditugaskan', 'diterima'];

/** Mencari seluruh bentrok antar kegiatan aktif. Hasil terurut dan deterministik. */
export function cariBentrok(kegiatan: readonly Kegiatan[], opsi: OpsiBentrok): Bentrok[] {
  if (!(opsi.durasiBawaanMenit > 0)) {
    throw new RangeError('durasiBawaanMenit harus lebih besar dari 0.');
  }
  const aktif = kegiatan.filter((k) => !STATUS_DIABAIKAN.includes(k.status));
  const berinterval = aktif.map((k) => ({
    k,
    iv: intervalDari(k.mulai, k.selesai, opsi.durasiBawaanMenit),
  }));

  const hasil: Bentrok[] = [];
  for (let i = 0; i < berinterval.length; i++) {
    for (let j = i + 1; j < berinterval.length; j++) {
      const a = berinterval[i];
      const b = berinterval[j];
      if (!a || !b || a.k.id === b.k.id) continue;
      const irisanWaktu = irisan(a.iv, b.iv);
      if (!irisanWaktu) continue;

      for (const pa of a.k.pihak) {
        if (pa.kedudukan === 'ditolak') continue;
        const pb = b.k.pihak.find((p) => p.id === pa.id && p.kedudukan !== 'ditolak');
        if (!pb) continue;
        hasil.push({
          pihakId: pa.id,
          pihakNama: pa.nama,
          golongan: pa.golongan,
          jenis: pa.golongan === 'pimpinan' ? 'langsung' : 'sumber_daya',
          kepastian:
            PASTI.includes(pa.kedudukan) && PASTI.includes(pb.kedudukan) ? 'pasti' : 'potensi',
          kegiatanA: a.k.id,
          kegiatanB: b.k.id,
          irisan: { mulai: keIsoUtc(irisanWaktu.mulai), selesai: keIsoUtc(irisanWaktu.selesai) },
        });
      }
    }
  }

  return hasil.sort(
    (x, y) =>
      x.irisan.mulai.localeCompare(y.irisan.mulai) ||
      x.pihakId.localeCompare(y.pihakId) ||
      x.kegiatanA.localeCompare(y.kegiatanA) ||
      x.kegiatanB.localeCompare(y.kegiatanB),
  );
}

/** Bentrok yang melibatkan kegiatan tertentu. */
export function bentrokUntukKegiatan(
  kegiatan: readonly Kegiatan[],
  id: string,
  opsi: OpsiBentrok,
): Bentrok[] {
  return cariBentrok(kegiatan, opsi).filter((b) => b.kegiatanA === id || b.kegiatanB === id);
}
