import { useCallback, useEffect, useState } from 'react';
import { api, GalatApi } from './api/klien';
import { useSesi } from './sesi';

export interface HasilData<T> {
  data: T | null;
  galat: GalatApi | null;
  memuat: boolean;
  muatUlang: () => void;
}

/** Memuat data GET; dimuat ulang saat jalur/query atau sesi (persona) berganti. */
export function usePakaiData<T>(
  jalur: string | null,
  query?: Record<string, string | undefined>,
): HasilData<T> {
  const { versi } = useSesi();
  const [data, setData] = useState<T | null>(null);
  const [galat, setGalat] = useState<GalatApi | null>(null);
  const [memuat, setMemuat] = useState(jalur !== null);
  const [ulang, setUlang] = useState(0);
  const kunciQuery = JSON.stringify(query ?? {});

  useEffect(() => {
    if (jalur === null) {
      setMemuat(false);
      return;
    }
    let batal = false;
    setMemuat(true);
    api
      .get<T>(jalur, JSON.parse(kunciQuery) as Record<string, string | undefined>)
      .then((d) => {
        if (batal) return;
        setData(d);
        setGalat(null);
      })
      .catch((e: unknown) => {
        if (batal) return;
        setData(null);
        setGalat(e instanceof GalatApi ? e : new GalatApi(0, 'jaringan', 'Kendala jaringan.'));
      })
      .finally(() => {
        if (!batal) setMemuat(false);
      });
    return () => {
      batal = true;
    };
  }, [jalur, kunciQuery, versi, ulang]);

  const muatUlang = useCallback(() => setUlang((n) => n + 1), []);
  return { data, galat, memuat, muatUlang };
}
