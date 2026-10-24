import { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router';
import { api, GalatApi } from '../api/klien';
import type { Persona } from '../api/tipe';
import { Ikon, type NamaIkon } from '../ikon';
import { useSesi } from '../sesi';
import { TEKS_UI } from '../teks-ui';
import { Spanduk } from './spanduk';

/** Butir navigasi ditentukan oleh izin; maksimal lima (STANDAR_DESAIN bagian 5). */
function useButirNavigasi(): { ke: string; label: string; ikon: NamaIkon; akhir?: boolean }[] {
  const { punya } = useSesi();
  const butir: { ke: string; label: string; ikon: NamaIkon; akhir?: boolean }[] = [
    { ke: '/', label: TEKS_UI.navigasi.beranda, ikon: 'beranda', akhir: true },
  ];
  if (punya('kegiatan.baca_semua') || punya('kegiatan.baca_terkait')) {
    butir.push({ ke: '/agenda', label: TEKS_UI.navigasi.agenda, ikon: 'agenda' });
  }
  if (punya('bentrok.baca')) {
    butir.push({ ke: '/bentrok', label: TEKS_UI.navigasi.bentrok, ikon: 'bentrok' });
  }
  butir.push({ ke: '/akun', label: TEKS_UI.navigasi.akun, ikon: 'akun' });
  return butir;
}

/** Pita persona (mode demo): pemilih "Lihat sebagai..." dan tombol kembali. */
function PitaPersona() {
  const { profil, punya, segarkan } = useSesi();
  const [daftar, setDaftar] = useState<Persona[]>([]);
  const [galat, setGalat] = useState<string | null>(null);
  const bolehPindah =
    profil?.mode === 'demo' && (punya('demo.pindah_persona') || profil.sebagaiPersona);

  useEffect(() => {
    if (!bolehPindah) return;
    let batal = false;
    api
      .get<Persona[]>('/api/demo/persona')
      .then((d) => !batal && setDaftar(d))
      .catch(() => undefined);
    return () => {
      batal = true;
    };
  }, [bolehPindah]);

  if (!bolehPindah || !profil) return null;

  const pindah = async (username: string) => {
    setGalat(null);
    try {
      if (username === '') await api.hapus('/api/demo/persona');
      else await api.post('/api/demo/persona', { username });
      await segarkan();
    } catch (e) {
      setGalat(e instanceof GalatApi ? e.message : TEKS_UI.persona.gagal);
    }
  };

  return (
    <section className="pita-persona" aria-label={TEKS_UI.persona.bagian}>
      {profil.sebagaiPersona && (
        <p className="pita-teks" role="status">
          {TEKS_UI.persona.aktif} <strong>{profil.nama}</strong>
        </p>
      )}
      <div className="pita-aksi">
        <label className="label-inline">
          <span>{TEKS_UI.persona.label}</span>
          <select className="pilihan" value="" onChange={(e) => void pindah(e.target.value)}>
            <option value="">{TEKS_UI.persona.pilih}</option>
            {daftar.map((p) => (
              <option key={p.username} value={p.username}>
                {p.nama}
              </option>
            ))}
          </select>
        </label>
        {profil.sebagaiPersona && (
          <button type="button" className="tombol tombol-sekunder" onClick={() => void pindah('')}>
            {TEKS_UI.persona.kembali}
          </button>
        )}
      </div>
      {galat && <p role="alert">{galat}</p>}
    </section>
  );
}

export function Kerangka() {
  const { profil, versi } = useSesi();
  const butir = useButirNavigasi();
  return (
    <div className="kerangka">
      <a className="lewati" href="#isi-utama">
        {TEKS_UI.lewatiKeIsi}
      </a>
      <Spanduk mode={profil?.mode} />
      <header className="kepala-aplikasi">
        <span className="nama-aplikasi">{TEKS_UI.namaAplikasi}</span>
        {profil && (
          <span className="pengguna-singkat">
            {profil.nama} ({TEKS_UI.peran[profil.peran]})
          </span>
        )}
      </header>
      <PitaPersona />
      <main id="isi-utama" className="isi" tabIndex={-1}>
        <Outlet key={versi} />
      </main>
      <nav className="navigasi-bawah" aria-label={TEKS_UI.navigasi.label}>
        {butir.map((b) => (
          <NavLink key={b.ke} to={b.ke} end={b.akhir} className="nav-butir">
            <Ikon nama={b.ikon} />
            <span>{b.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
