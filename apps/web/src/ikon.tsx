import type { StatusKegiatan } from './api/tipe';

/** Ikon SVG sendiri (tanpa pustaka, tanpa emoji). Dekoratif: selalu dipasangkan dengan teks (STANDAR_DESAIN bagian 3). */
const JALUR = {
  beranda: 'M3 11 12 3l9 8M5 10v10h14V10',
  agenda: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
  bentrok: 'M12 3 2 21h20zM12 10v5M12 18v.01',
  lainnya: 'M5 12h.01M12 12h.01M19 12h.01',
  tambah: 'M12 5v14M5 12h14',
  akun: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 4-6 8-6s8 2 8 6',
  jam: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  lokasi: 'M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11zM12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  orang:
    'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20c0-3 3-5 6-5s6 2 6 5M17 11a3 3 0 0 0 0-6M21 20c0-2-1-4-3-5',
  kiri: 'M15 5l-7 7 7 7',
  kanan: 'M9 5l7 7-7 7',
  keluar: 'M10 4H4v16h6M15 8l5 4-5 4M20 12H9',
  mata: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  mataCoret:
    'M3 3l18 18M10 6a9 9 0 0 1 12 6 12 12 0 0 1-3 4M6 8a12 12 0 0 0-4 4s4 7 10 7a9 9 0 0 0 4-1',
  lampiran: 'M20 11l-8 8a5 5 0 0 1-7-7l9-9a3 3 0 0 1 4 4l-9 9a1 1 0 0 1-2-2l8-8',
  tautan: 'M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1',
  unduh: 'M12 4v11M7 11l5 5 5-5M5 20h14',
  // status agenda
  baru: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 8v8M8 12h8',
  menunggu: 'M6 3h12M6 21h12M7 3c0 5 5 6 5 9s-5 4-5 9M17 3c0 5-5 6-5 9s5 4 5 9',
  ditetapkan: 'M5 21V4M5 4h13l-3 4 3 4H5',
  terkonfirmasi: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8 12l3 3 5-6',
  berlangsung: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM10 8l6 4-6 4z',
  selesai: 'M4 12l5 5L20 6',
  dibatalkan: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9 9l6 6M15 9l-6 6',
  ditunda: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM10 9v6M14 9v6',
} as const;

export type NamaIkon = keyof typeof JALUR;

export function Ikon({ nama, ukuran = 'var(--icon-md)' }: { nama: NamaIkon; ukuran?: string }) {
  return (
    <svg
      className="ikon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      style={{ width: ukuran, height: ukuran }}
    >
      <path d={JALUR[nama]} />
    </svg>
  );
}

export const IKON_STATUS: Record<StatusKegiatan, NamaIkon> = {
  baru: 'baru',
  menunggu_arahan: 'menunggu',
  ditetapkan: 'ditetapkan',
  terkonfirmasi: 'terkonfirmasi',
  berlangsung: 'berlangsung',
  selesai: 'selesai',
  dibatalkan: 'dibatalkan',
  ditunda: 'ditunda',
};
