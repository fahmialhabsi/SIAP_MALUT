import { useSearchParams } from 'react-router';
import { Ikon } from '../ikon';
import { KartuKegiatan, Memuat, TampilanGalat } from '../komponen/komponen';
import { TANGGAL_CONTOH } from '../konfigurasi';
import { TEKS_UI } from '../teks-ui';
import {
  angkaTanggal,
  awalMinggu,
  formatTanggalPanjang,
  hariIniWit,
  kunciTanggalWit,
  namaHariSingkat,
  tambahHari,
} from '../waktu';
import { useDataAgenda } from './data-agenda';

const FORMAT_KUNCI = /^\d{4}-\d{2}-\d{2}$/;

export function Agenda() {
  const [params, setParams] = useSearchParams();
  const hariIni = hariIniWit();
  const dipilih = FORMAT_KUNCI.test(params.get('tanggal') ?? '')
    ? (params.get('tanggal') as string)
    : hariIni;
  const data = useDataAgenda();
  const ke = (tanggal: string) => setParams({ tanggal }, { replace: true });

  const minggu = Array.from({ length: 7 }, (_, i) => tambahHari(awalMinggu(dipilih), i));
  const adaDi = (tanggal: string) =>
    data.kegiatan.filter((k) => kunciTanggalWit(k.mulai) === tanggal);
  const bentrokDi = (tanggal: string) =>
    adaDi(tanggal).some((k) => (data.petaBentrok.get(k.id) ?? []).length > 0);
  const hariItu = adaDi(dipilih);

  return (
    <>
      <h1 className="judul-halaman">{TEKS_UI.agenda.judul}</h1>

      <div className="navigasi-hari">
        <button
          type="button"
          className="tombol-ikon"
          aria-label={TEKS_UI.agenda.hariSebelumnya}
          onClick={() => ke(tambahHari(dipilih, -1))}
        >
          <Ikon nama="kiri" />
        </button>
        <label className="tanggal-pilih">
          <span className="sr-saja">{TEKS_UI.agenda.pilihTanggal}</span>
          <input
            className="isian"
            type="date"
            value={dipilih}
            onChange={(e) => FORMAT_KUNCI.test(e.target.value) && ke(e.target.value)}
          />
        </label>
        <button
          type="button"
          className="tombol-ikon"
          aria-label={TEKS_UI.agenda.hariBerikutnya}
          onClick={() => ke(tambahHari(dipilih, 1))}
        >
          <Ikon nama="kanan" />
        </button>
      </div>

      <div className="aksi-baris">
        <button type="button" className="tombol tombol-sekunder" onClick={() => ke(hariIni)}>
          {TEKS_UI.agenda.hariIni}
        </button>
        <button type="button" className="tombol tombol-sekunder" onClick={() => ke(TANGGAL_CONTOH)}>
          {TEKS_UI.agenda.keTanggalContoh}
        </button>
      </div>

      <ul className="jalur-minggu" aria-label={TEKS_UI.agenda.jalurMinggu}>
        {minggu.map((t) => (
          <li key={t}>
            <button
              type="button"
              className="hari"
              aria-pressed={t === dipilih}
              aria-label={formatTanggalPanjang(t)}
              onClick={() => ke(t)}
            >
              <span>{namaHariSingkat(t)}</span>
              <span className="angka-hari tabular">{angkaTanggal(t)}</span>
              <span className="penanda" aria-hidden="true">
                {adaDi(t).length > 0 && <span className="titik" />}
                {bentrokDi(t) && <span className="titik titik-bentrok" />}
              </span>
              {adaDi(t).length > 0 && <span className="sr-saja">{TEKS_UI.agenda.adaKegiatan}</span>}
              {bentrokDi(t) && <span className="sr-saja">{TEKS_UI.agenda.adaBentrok}</span>}
            </button>
          </li>
        ))}
      </ul>

      <h2 className="judul-bagian">
        {formatTanggalPanjang(dipilih)}
        {dipilih === hariIni && ` (${TEKS_UI.agenda.hariIni})`}
      </h2>
      {data.galat ? (
        <TampilanGalat galat={data.galat} ulang={data.muatUlang} />
      ) : data.memuat && data.kegiatan.length === 0 ? (
        <Memuat />
      ) : hariItu.length === 0 ? (
        <p className="teks-pendukung">{TEKS_UI.agenda.kosong}</p>
      ) : (
        <>
          <p className="teks-pendukung">{TEKS_UI.agenda.jumlah(hariItu.length)}</p>
          <ul className="daftar-kartu">
            {hariItu.map((k) => (
              <KartuKegiatan key={k.id} kegiatan={k} bentrok={data.petaBentrok.get(k.id)} />
            ))}
          </ul>
        </>
      )}
    </>
  );
}
