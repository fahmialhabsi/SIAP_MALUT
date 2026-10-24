import type { GalatBadan } from './tipe';

/** Galat dari API atau jaringan. `status` 0 = tidak dapat terhubung. */
export class GalatApi extends Error {
  constructor(
    readonly status: number,
    readonly kode: string,
    pesan: string,
    readonly rincian: { jalur: string; pesan: string }[] = [],
  ) {
    super(pesan);
    this.name = 'GalatApi';
  }
}

type Pendengar = () => void;
let saatTidakMasuk: Pendengar | null = null;

/** Didaftarkan penyedia sesi: dipanggil bila API menjawab 401 pada sesi yang tadinya aktif. */
export function aturPenangan401(fungsi: Pendengar | null): void {
  saatTidakMasuk = fungsi;
}

export interface OpsiPanggil {
  badan?: unknown;
  query?: Record<string, string | undefined>;
  /** Jangan memicu penangan 401 (mis. saat memeriksa sesi awal atau masuk). */
  tanpaPenangan401?: boolean;
}

function bentukUrl(jalur: string, query?: OpsiPanggil['query']): string {
  if (!query) return jalur;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) if (v !== undefined && v !== '') params.set(k, v);
  const teks = params.toString();
  return teks ? `${jalur}?${teks}` : jalur;
}

export async function panggil<T>(
  metode: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  jalur: string,
  opsi: OpsiPanggil = {},
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(bentukUrl(jalur, opsi.query), {
      method: metode,
      credentials: 'same-origin',
      headers: opsi.badan === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: opsi.badan === undefined ? undefined : JSON.stringify(opsi.badan),
    });
  } catch {
    throw new GalatApi(0, 'jaringan', 'Tidak dapat terhubung ke server.');
  }
  if (res.ok) {
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  }
  let badan: Partial<GalatBadan> = {};
  try {
    badan = (await res.json()) as Partial<GalatBadan>;
  } catch {
    // badan bukan JSON; pakai pesan bawaan
  }
  if (res.status === 401 && !opsi.tanpaPenangan401) saatTidakMasuk?.();
  throw new GalatApi(
    res.status,
    badan.galat?.kode ?? 'galat',
    badan.galat?.pesan ?? `Permintaan gagal (${res.status}).`,
    badan.galat?.rincian,
  );
}

export const api = {
  get: <T>(jalur: string, query?: OpsiPanggil['query']) => panggil<T>('GET', jalur, { query }),
  post: <T>(jalur: string, badan?: unknown, opsi?: Omit<OpsiPanggil, 'badan'>) =>
    panggil<T>('POST', jalur, { ...opsi, badan }),
  hapus: <T>(jalur: string) => panggil<T>('DELETE', jalur),
};
