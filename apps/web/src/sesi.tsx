import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api, aturPenangan401, GalatApi } from './api/klien';
import type { Izin, Profil } from './api/tipe';

type Status = 'memuat' | 'masuk' | 'keluar';

interface NilaiSesi {
  status: Status;
  profil: Profil | null;
  /** Naik setiap persona/sesi berganti; dipakai agar data layar dimuat ulang. */
  versi: number;
  punya: (izin: Izin) => boolean;
  masuk: (username: string, sandi: string) => Promise<void>;
  keluar: () => Promise<void>;
  segarkan: () => Promise<void>;
}

const Konteks = createContext<NilaiSesi | null>(null);

export function useSesi(): NilaiSesi {
  const nilai = useContext(Konteks);
  if (!nilai) throw new Error('useSesi harus dipakai di dalam SesiProvider');
  return nilai;
}

export function SesiProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('memuat');
  const [profil, setProfil] = useState<Profil | null>(null);
  const [versi, setVersi] = useState(0);

  const segarkan = useCallback(async () => {
    try {
      const p = await api.get<Profil>('/api/saya');
      setProfil(p);
      setStatus('masuk');
    } catch (e) {
      if (e instanceof GalatApi && e.status === 401) {
        setProfil(null);
        setStatus('keluar');
      } else {
        // jaringan terputus saat memulai: tampilkan layar masuk yang menjelaskan kendala saat dicoba
        setStatus('keluar');
      }
    }
    setVersi((v) => v + 1);
  }, []);

  useEffect(() => {
    void segarkan();
  }, [segarkan]);

  useEffect(() => {
    aturPenangan401(() => {
      setProfil(null);
      setStatus('keluar');
    });
    return () => aturPenangan401(null);
  }, []);

  const masuk = useCallback(
    async (username: string, sandi: string) => {
      await api.post('/api/sesi', { username, sandi }, { tanpaPenangan401: true });
      await segarkan();
    },
    [segarkan],
  );

  const keluar = useCallback(async () => {
    try {
      await api.hapus('/api/sesi');
    } catch {
      // sesi sudah berakhir atau jaringan terputus: tetap kembali ke layar masuk
    }
    setProfil(null);
    setStatus('keluar');
    setVersi((v) => v + 1);
  }, []);

  const nilai = useMemo<NilaiSesi>(
    () => ({
      status,
      profil,
      versi,
      punya: (izin) => profil?.izin.includes(izin) ?? false,
      masuk,
      keluar,
      segarkan,
    }),
    [status, profil, versi, masuk, keluar, segarkan],
  );

  return <Konteks.Provider value={nilai}>{children}</Konteks.Provider>;
}
