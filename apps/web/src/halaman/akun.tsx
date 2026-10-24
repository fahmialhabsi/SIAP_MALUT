import { useState } from 'react';
import { Ikon } from '../ikon';
import { useSesi } from '../sesi';
import { bacaTema, simpanTema, type PilihanTema } from '../tema';
import { TEKS_UI } from '../teks-ui';

const PILIHAN: { nilai: PilihanTema; label: string }[] = [
  { nilai: 'sistem', label: TEKS_UI.akun.temaSistem },
  { nilai: 'terang', label: TEKS_UI.akun.temaTerang },
  { nilai: 'gelap', label: TEKS_UI.akun.temaGelap },
];

export function Akun() {
  const { profil, keluar } = useSesi();
  const [tema, setTema] = useState<PilihanTema>(bacaTema);
  if (!profil) return null;
  return (
    <>
      <h1 className="judul-halaman">{TEKS_UI.akun.judul}</h1>
      <dl className="kartu data-kegiatan">
        <div className="baris-data">
          <dt>{TEKS_UI.akun.nama}</dt>
          <dd>{profil.nama}</dd>
        </div>
        <div className="baris-data">
          <dt>{TEKS_UI.akun.pengguna}</dt>
          <dd>{profil.username}</dd>
        </div>
        <div className="baris-data">
          <dt>{TEKS_UI.akun.peran}</dt>
          <dd>{TEKS_UI.peran[profil.peran]}</dd>
        </div>
        <div className="baris-data">
          <dt>{TEKS_UI.akun.mode}</dt>
          <dd>{profil.mode === 'demo' ? TEKS_UI.akun.modeDemo : TEKS_UI.akun.modeProduksi}</dd>
        </div>
      </dl>

      <fieldset className="kartu kelompok-radio">
        <legend className="judul-bagian">{TEKS_UI.akun.tema}</legend>
        {PILIHAN.map((p) => (
          <label key={p.nilai} className="radio">
            <input
              type="radio"
              name="tema"
              value={p.nilai}
              checked={tema === p.nilai}
              onChange={() => {
                setTema(p.nilai);
                simpanTema(p.nilai);
              }}
            />
            <span>{p.label}</span>
          </label>
        ))}
      </fieldset>

      <button type="button" className="tombol tombol-bahaya" onClick={() => void keluar()}>
        <Ikon nama="keluar" ukuran="var(--icon-sm)" />
        <span>{TEKS_UI.akun.keluar}</span>
      </button>
    </>
  );
}
