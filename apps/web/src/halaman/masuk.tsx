import { useState, type FormEvent } from 'react';
import { GalatApi } from '../api/klien';
import { Ikon } from '../ikon';
import { useSesi } from '../sesi';
import { TEKS_UI } from '../teks-ui';
import { Spanduk } from './spanduk';

export function Masuk({ mode }: { mode?: string }) {
  const { masuk } = useSesi();
  const [username, setUsername] = useState('');
  const [sandi, setSandi] = useState('');
  const [lihat, setLihat] = useState(false);
  const [sedang, setSedang] = useState(false);
  const [pesan, setPesan] = useState<string | null>(null);

  const kirim = async (e: FormEvent) => {
    e.preventDefault();
    setSedang(true);
    setPesan(null);
    try {
      await masuk(username.trim(), sandi);
    } catch (err) {
      if (err instanceof GalatApi) {
        setPesan(
          err.status === 423
            ? TEKS_UI.masuk.terkunci
            : err.status === 401
              ? TEKS_UI.masuk.salah
              : err.status === 0
                ? TEKS_UI.masuk.jaringan
                : TEKS_UI.masuk.umum,
        );
      } else {
        setPesan(TEKS_UI.masuk.umum);
      }
      setSedang(false);
    }
  };

  return (
    <div className="kerangka">
      <Spanduk mode={mode} />
      <main className="isi isi-masuk" id="isi-utama">
        <h1 className="judul-halaman">{TEKS_UI.namaAplikasi}</h1>
        <p className="teks-pendukung">{TEKS_UI.subjudul}</p>
        <form className="kartu form" onSubmit={(e) => void kirim(e)} noValidate>
          <h2 className="judul-bagian">{TEKS_UI.masuk.judul}</h2>
          <label className="medan">
            <span>{TEKS_UI.masuk.namaPengguna}</span>
            <input
              className="isian"
              name="username"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>
          <div className="medan">
            <label htmlFor="isian-sandi">{TEKS_UI.masuk.kataSandi}</label>
            <span className="isian-bungkus">
              <input
                id="isian-sandi"
                className="isian"
                name="sandi"
                type={lihat ? 'text' : 'password'}
                autoComplete="current-password"
                value={sandi}
                onChange={(e) => setSandi(e.target.value)}
                required
              />
              <button
                type="button"
                className="tombol-ikon"
                aria-label={lihat ? TEKS_UI.masuk.sembunyikan : TEKS_UI.masuk.tampilkan}
                aria-pressed={lihat}
                onClick={() => setLihat((v) => !v)}
              >
                <Ikon nama={lihat ? 'mataCoret' : 'mata'} />
              </button>
            </span>
          </div>
          {pesan && (
            <p className="pesan-galat" role="alert">
              {pesan}
            </p>
          )}
          <button type="submit" className="tombol" disabled={sedang || !username || !sandi}>
            {sedang ? TEKS_UI.masuk.sedang : TEKS_UI.masuk.tombol}
          </button>
          {mode === 'demo' && <p className="teks-pendukung">{TEKS_UI.masuk.petunjukDemo}</p>}
        </form>
      </main>
    </div>
  );
}
