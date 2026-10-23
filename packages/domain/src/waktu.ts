/**
 * Waktu untuk logika agenda. Semua waktu berupa ISO 8601 dengan zona (WIT = +09:00).
 * Interval bersifat setengah terbuka [mulai, selesai): kegiatan yang selesai pukul 10.00
 * tidak bentrok dengan kegiatan yang mulai pukul 10.00.
 */
const POLA_ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})$/;

export class WaktuTidakValidError extends RangeError {
  constructor(nilai: string) {
    super(
      `Waktu tidak valid: "${nilai}". Gunakan ISO 8601 beserta zona, mis. 2026-10-24T20:00:00+09:00.`,
    );
    this.name = 'WaktuTidakValidError';
  }
}

/** Mengubah ISO 8601 beserta zona menjadi milidetik epoch UTC. */
export function keEpoch(iso: string): number {
  if (!POLA_ISO.test(iso)) throw new WaktuTidakValidError(iso);
  const nilai = Date.parse(iso);
  if (Number.isNaN(nilai)) throw new WaktuTidakValidError(iso);
  return nilai;
}

export interface Interval {
  /** Milidetik epoch, batas bawah termasuk. */
  mulai: number;
  /** Milidetik epoch, batas atas tidak termasuk. */
  selesai: number;
}

export const MENIT = 60_000;

/** Interval kegiatan; bila `selesai` kosong dipakai `durasiBawaanMenit`. */
export function intervalDari(
  mulai: string,
  selesai: string | undefined,
  durasiBawaanMenit: number,
): Interval {
  const a = keEpoch(mulai);
  const b = selesai === undefined ? a + durasiBawaanMenit * MENIT : keEpoch(selesai);
  if (b <= a) {
    throw new WaktuTidakValidError(
      `${mulai} .. ${selesai ?? '(bawaan)'}: selesai harus setelah mulai`,
    );
  }
  return { mulai: a, selesai: b };
}

/** Irisan dua interval; `null` bila tidak beririsan (bersinggungan bukan irisan). */
export function irisan(a: Interval, b: Interval): Interval | null {
  const mulai = Math.max(a.mulai, b.mulai);
  const selesai = Math.min(a.selesai, b.selesai);
  return mulai < selesai ? { mulai, selesai } : null;
}

/** Epoch menjadi ISO 8601 UTC (`Z`). */
export function keIsoUtc(epoch: number): string {
  return new Date(epoch).toISOString();
}
