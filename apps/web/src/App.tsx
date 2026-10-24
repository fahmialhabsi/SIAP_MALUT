import { useEffect } from 'react';
import { Link, Navigate, Route, Routes } from 'react-router';
import { parseAppMode, type AppMode } from '@siap/shared';
import { Akun } from './halaman/akun';
import { Agenda } from './halaman/agenda';
import { Lainnya, HalamanAudit, HalamanPengaturan } from './halaman/admin';
import { Beranda } from './halaman/beranda';
import { FormKegiatan } from './halaman/form-kegiatan';
import { HalamanBentrok } from './halaman/bentrok';
import { Kerangka } from './halaman/kerangka';
import { Masuk } from './halaman/masuk';
import { Rincian } from './halaman/rincian';
import { Memuat } from './komponen/komponen';
import { SesiProvider, useSesi } from './sesi';
import { bacaTema, terapkanTema } from './tema';
import { TEKS_UI } from './teks-ui';

export interface AppProps {
  /** Mode saat belum masuk; bawaan dari VITE_APP_MODE (kosong = production). Setelah masuk, mode dari server. */
  mode?: AppMode;
}

function TidakAda() {
  return (
    <>
      <h1 className="judul-halaman">{TEKS_UI.galat.halamanTidakAda}</h1>
      <Link className="tombol" to="/">
        {TEKS_UI.galat.keBeranda}
      </Link>
    </>
  );
}

/** Rute yang butuh izin; tanpa izin dialihkan ke Beranda (API tetap menolak bila dipaksa). */
function Dijaga({
  izin,
  anak,
}: {
  izin: Parameters<ReturnType<typeof useSesi>['punya']>[0][];
  anak: React.ReactNode;
}) {
  const { punya } = useSesi();
  return izin.some(punya) ? <>{anak}</> : <Navigate to="/" replace />;
}

function Isi({ mode }: { mode: AppMode }) {
  const { status } = useSesi();
  if (status === 'memuat') {
    return (
      <main className="isi" id="isi-utama">
        <Memuat />
      </main>
    );
  }
  if (status === 'keluar') return <Masuk mode={mode} />;
  return (
    <Routes>
      <Route element={<Kerangka />}>
        <Route index element={<Beranda />} />
        <Route
          path="agenda"
          element={
            <Dijaga izin={['kegiatan.baca_semua', 'kegiatan.baca_terkait']} anak={<Agenda />} />
          }
        />
        <Route
          path="kegiatan/:id"
          element={
            <Dijaga izin={['kegiatan.baca_semua', 'kegiatan.baca_terkait']} anak={<Rincian />} />
          }
        />
        <Route
          path="bentrok"
          element={<Dijaga izin={['bentrok.baca']} anak={<HalamanBentrok />} />}
        />
        <Route
          path="kegiatan/baru"
          element={<Dijaga izin={['kegiatan.buat']} anak={<FormKegiatan />} />}
        />
        <Route
          path="kegiatan/:id/ubah"
          element={<Dijaga izin={['kegiatan.ubah']} anak={<FormKegiatan />} />}
        />
        <Route
          path="lainnya"
          element={<Dijaga izin={['pengaturan.baca', 'audit.baca']} anak={<Lainnya />} />}
        />
        <Route
          path="pengaturan"
          element={<Dijaga izin={['pengaturan.baca']} anak={<HalamanPengaturan />} />}
        />
        <Route path="audit" element={<Dijaga izin={['audit.baca']} anak={<HalamanAudit />} />} />
        <Route path="akun" element={<Akun />} />
        <Route path="*" element={<TidakAda />} />
      </Route>
    </Routes>
  );
}

export function App({ mode = parseAppMode(import.meta.env.VITE_APP_MODE) }: AppProps) {
  useEffect(() => {
    terapkanTema(bacaTema());
  }, []);
  return (
    <SesiProvider>
      <Isi mode={mode} />
    </SesiProvider>
  );
}
