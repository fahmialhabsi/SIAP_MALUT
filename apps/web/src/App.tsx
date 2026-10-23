import { ALUR_UTAMA, LABEL_STATUS_AGENDA } from '@siap/domain';
import { parseAppMode, type AppMode } from '@siap/shared';
import { TEKS_UI } from './teks-ui';

export interface AppProps {
  /** Mode aplikasi; bawaan dari VITE_APP_MODE (kosong = production). */
  mode?: AppMode;
}

export function App({ mode = parseAppMode(import.meta.env.VITE_APP_MODE) }: AppProps) {
  return (
    <>
      {mode === 'demo' && (
        <div className="spanduk-contoh" role="status">
          {TEKS_UI.spandukContoh}
        </div>
      )}
      <header className="kepala">
        <h1 className="judul">{TEKS_UI.namaAplikasi}</h1>
        <p className="subjudul">{TEKS_UI.subjudul}</p>
      </header>
      <main className="isi">
        <section className="kartu" aria-labelledby="judul-alur">
          <h2 id="judul-alur" className="judul-bagian">
            {TEKS_UI.judulAlur}
          </h2>
          <p className="teks-pendukung">{TEKS_UI.keteranganAlur}</p>
          <ol className="alur">
            {ALUR_UTAMA.map((status, indeks) => (
              <li key={status} className="langkah">
                <span className="nomor tabular" aria-hidden="true">
                  {indeks + 1}
                </span>
                <span>
                  <span className="sr-saja">{TEKS_UI.langkah} </span>
                  {LABEL_STATUS_AGENDA[status]}
                </span>
              </li>
            ))}
          </ol>
        </section>
        <p className="teks-pendukung">{TEKS_UI.tahap}</p>
      </main>
    </>
  );
}
