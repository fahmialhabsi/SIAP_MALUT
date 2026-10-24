import { useMemo } from 'react';
import { petaBentrok, urutMulai } from '../komponen/komponen';
import type { Bentrok, Kegiatan } from '../api/tipe';
import { usePakaiData } from '../pakai-data';
import { useSesi } from '../sesi';
import type { GalatApi } from '../api/klien';

export interface DataAgenda {
  kegiatan: Kegiatan[];
  bentrok: Bentrok[];
  petaBentrok: Map<string, Bentrok[]>;
  memuat: boolean;
  galat: GalatApi | null;
  muatUlang: () => void;
}

/** Seluruh kegiatan yang boleh dilihat pengguna, terurut menurut waktu, beserta bentrok (bila berizin). */
export function useDataAgenda(): DataAgenda {
  const { punya } = useSesi();
  const k = usePakaiData<Kegiatan[]>('/api/kegiatan');
  const b = usePakaiData<Bentrok[]>(punya('bentrok.baca') ? '/api/bentrok' : null);
  const kegiatan = useMemo(() => [...(k.data ?? [])].sort(urutMulai), [k.data]);
  const bentrok = useMemo(() => b.data ?? [], [b.data]);
  const peta = useMemo(() => petaBentrok(bentrok), [bentrok]);
  return {
    kegiatan,
    bentrok,
    petaBentrok: peta,
    memuat: k.memuat || b.memuat,
    galat: k.galat ?? b.galat,
    muatUlang: () => {
      k.muatUlang();
      b.muatUlang();
    },
  };
}
