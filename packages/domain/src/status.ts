/**
 * Status agenda dan aturan perpindahannya (KB-004, KB-038, KB-016).
 * Logika murni: tidak mengubah masukan, tidak memakai basis data/jaringan/jam sistem.
 * Aturan tertulis di docs/rekayasa/ATURAN_BISNIS.md; diagram dihasilkan dari TRANSISI_STATUS
 * (docs/rekayasa/ALUR_PROSES.md).
 */
import { cariBentrok, type Bentrok, type OpsiBentrok } from './bentrok.js';
import type { Kegiatan } from './model.js';

export const STATUS_AGENDA = [
  'baru',
  'menunggu_arahan',
  'ditetapkan',
  'terkonfirmasi',
  'berlangsung',
  'selesai',
  'dibatalkan',
  'ditunda',
] as const;

export type StatusAgenda = (typeof STATUS_AGENDA)[number];

/** Label antarmuka (Bahasa Indonesia baku). Istilah dapat dikoreksi di sini (KB-036). */
export const LABEL_STATUS_AGENDA: Readonly<Record<StatusAgenda, string>> = {
  baru: 'Baru',
  menunggu_arahan: 'Menunggu Arahan',
  ditetapkan: 'Ditetapkan',
  terkonfirmasi: 'Terkonfirmasi',
  berlangsung: 'Berlangsung',
  selesai: 'Selesai',
  dibatalkan: 'Dibatalkan',
  ditunda: 'Ditunda',
};

/** Alur utama empat langkah dari Kabag Protokol (Rancangan 11.2). */
export const ALUR_UTAMA: readonly StatusAgenda[] = [
  'baru',
  'menunggu_arahan',
  'ditetapkan',
  'terkonfirmasi',
];

export function adalahStatusAgenda(nilai: string): nilai is StatusAgenda {
  return (STATUS_AGENDA as readonly string[]).includes(nilai);
}

/** Perpindahan status yang diperbolehkan. Status akhir (`selesai`, `dibatalkan`) tidak punya tujuan. */
export const TRANSISI_STATUS: Readonly<Record<StatusAgenda, readonly StatusAgenda[]>> = {
  baru: ['menunggu_arahan', 'dibatalkan'],
  menunggu_arahan: ['ditetapkan', 'ditunda', 'dibatalkan'],
  ditetapkan: ['terkonfirmasi', 'menunggu_arahan', 'ditunda', 'dibatalkan'],
  terkonfirmasi: ['berlangsung', 'ditetapkan', 'ditunda', 'dibatalkan'],
  berlangsung: ['selesai'],
  ditunda: ['menunggu_arahan', 'dibatalkan'],
  selesai: [],
  dibatalkan: [],
};

export function bolehBerpindah(dari: StatusAgenda, ke: StatusAgenda): boolean {
  return TRANSISI_STATUS[dari].includes(ke);
}

/** Konteks perpindahan status. `waktu` diberikan pemanggil (domain tidak membaca jam sistem). */
export interface KonteksPindah {
  /** Pelaku (id pengguna/jabatan). */
  oleh: string;
  /** Waktu perpindahan, ISO 8601 beserta zona. */
  waktu: string;
  /** Alasan; wajib untuk `ditunda` dan `dibatalkan`. */
  alasan?: string;
  /** Alasan menetapkan meski ada bentrok pasti (KB-038). */
  alasanBentrok?: string;
  /** Kegiatan lain untuk memeriksa bentrok. Kosong = tidak memeriksa bentrok. */
  kegiatanLain?: readonly Kegiatan[];
  opsiBentrok?: OpsiBentrok;
}

/** Catatan peristiwa (fondasi log audit, KB-016). */
export interface PeristiwaStatus {
  kegiatanId: string;
  dari: StatusAgenda;
  ke: StatusAgenda;
  oleh: string;
  waktu: string;
  alasan?: string;
  alasanBentrok?: string;
  /** Bentrok yang diketahui saat berpindah (untuk jejak). */
  bentrok: readonly Bentrok[];
}

export interface HasilSyarat {
  /** Alasan penolakan; kosong berarti perpindahan boleh dilakukan. */
  penolakan: string[];
  /** Peringatan (tidak memblokir): bentrok yang ditemukan. */
  peringatan: Bentrok[];
}

const adaIsi = (teks: string | undefined): teks is string =>
  typeof teks === 'string' && teks.trim().length > 0;

/** Memeriksa apakah kegiatan boleh berpindah ke status `ke`. Tidak mengubah kegiatan. */
export function periksaSyarat(
  kegiatan: Kegiatan,
  ke: StatusAgenda,
  konteks: KonteksPindah,
): HasilSyarat {
  const penolakan: string[] = [];
  let peringatan: Bentrok[] = [];

  if (!bolehBerpindah(kegiatan.status, ke)) {
    penolakan.push(
      `Perpindahan dari "${LABEL_STATUS_AGENDA[kegiatan.status]}" ke "${LABEL_STATUS_AGENDA[ke]}" tidak diperbolehkan.`,
    );
    return { penolakan, peringatan };
  }

  const hadir = kegiatan.pihak.filter(
    (p) => p.kedudukan === 'ditugaskan' || p.kedudukan === 'diterima',
  );

  switch (ke) {
    case 'menunggu_arahan':
      if (!adaIsi(kegiatan.judul)) penolakan.push('Judul kegiatan wajib diisi.');
      if (Number.isNaN(Date.parse(kegiatan.mulai))) penolakan.push('Waktu mulai tidak valid.');
      break;
    case 'ditetapkan':
      if (hadir.length === 0) {
        penolakan.push('Tetapkan minimal satu pihak yang hadir (ditugaskan atau diterima).');
      }
      if (konteks.kegiatanLain && konteks.opsiBentrok) {
        const semua = [...konteks.kegiatanLain.filter((k) => k.id !== kegiatan.id), kegiatan];
        peringatan = cariBentrok(semua, konteks.opsiBentrok).filter(
          (b) => b.kegiatanA === kegiatan.id || b.kegiatanB === kegiatan.id,
        );
        const adaPasti = peringatan.some((b) => b.kepastian === 'pasti');
        if (adaPasti && !adaIsi(konteks.alasanBentrok)) {
          penolakan.push('Ada bentrok pasti; isi alasan menetapkan meski bentrok (KB-038).');
        }
      }
      break;
    case 'terkonfirmasi': {
      if (!kegiatan.pihak.some((p) => p.kedudukan === 'diterima')) {
        penolakan.push('Belum ada pihak yang menerima/mengonfirmasi kehadiran.');
      }
      const belum = kegiatan.pihak.filter(
        (p) => p.golongan !== 'pimpinan' && p.kedudukan === 'ditugaskan',
      );
      if (belum.length > 0) {
        penolakan.push(`Masih menunggu konfirmasi: ${belum.map((p) => p.nama).join(', ')}.`);
      }
      break;
    }
    case 'ditunda':
    case 'dibatalkan':
      if (!adaIsi(konteks.alasan)) penolakan.push('Alasan wajib diisi.');
      break;
    default:
      break;
  }

  return { penolakan, peringatan };
}

export type HasilPindah =
  | { ok: true; kegiatan: Kegiatan; peristiwa: PeristiwaStatus; peringatan: Bentrok[] }
  | { ok: false; alasan: string[] };

/** Memindahkan status; mengembalikan kegiatan baru dan catatan peristiwa. Masukan tidak diubah. */
export function pindahStatus(
  kegiatan: Kegiatan,
  ke: StatusAgenda,
  konteks: KonteksPindah,
): HasilPindah {
  const { penolakan, peringatan } = periksaSyarat(kegiatan, ke, konteks);
  if (penolakan.length > 0) return { ok: false, alasan: penolakan };

  const peristiwa: PeristiwaStatus = {
    kegiatanId: kegiatan.id,
    dari: kegiatan.status,
    ke,
    oleh: konteks.oleh,
    waktu: konteks.waktu,
    bentrok: peringatan,
    ...(konteks.alasan !== undefined ? { alasan: konteks.alasan } : {}),
    ...(konteks.alasanBentrok !== undefined ? { alasanBentrok: konteks.alasanBentrok } : {}),
  };
  return { ok: true, kegiatan: { ...kegiatan, status: ke }, peristiwa, peringatan };
}

/** Diagram Mermaid dari TRANSISI_STATUS; dipakai untuk menghasilkan docs/rekayasa/ALUR_PROSES.md. */
export function diagramStatusMermaid(): string {
  const baris = ['stateDiagram-v2', '  [*] --> baru'];
  for (const dari of STATUS_AGENDA) {
    for (const ke of TRANSISI_STATUS[dari]) baris.push(`  ${dari} --> ${ke}`);
  }
  baris.push('  selesai --> [*]', '  dibatalkan --> [*]');
  return baris.join('\n');
}
