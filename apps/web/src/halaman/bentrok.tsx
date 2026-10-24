import { Link } from 'react-router';
import type { Bentrok } from '../api/tipe';
import { LencanaBentrok, Memuat, TampilanGalat } from '../komponen/komponen';
import { TEKS_UI } from '../teks-ui';
import { formatJam, formatTanggalPanjang, kunciTanggalWit } from '../waktu';
import { useDataAgenda } from './data-agenda';

/** Satu bentrok: kepastian, jenis, irisan waktu, dan dua kegiatan yang terlibat (dapat diketuk). */
export function KeteranganBentrok({
  bentrok,
  judulDari,
  sorot,
}: {
  bentrok: Bentrok;
  judulDari: Map<string, string>;
  /** Kegiatan yang sedang dilihat (tidak ditautkan ulang). */
  sorot?: string;
}) {
  const kegiatan = [bentrok.kegiatanA, bentrok.kegiatanB];
  return (
    <li className="kartu bentrok-butir">
      <LencanaBentrok kepastian={bentrok.kepastian} />
      <p className="pihak-nama">{bentrok.pihakNama}</p>
      <p className="teks-pendukung">
        {bentrok.jenis === 'langsung' ? TEKS_UI.bentrok.langsung : TEKS_UI.bentrok.sumberDaya}
      </p>
      <p className="tabular">
        {TEKS_UI.bentrok.irisan}: {formatTanggalPanjang(kunciTanggalWit(bentrok.irisan.mulai))},{' '}
        {formatJam(bentrok.irisan.mulai)} - {formatJam(bentrok.irisan.selesai)}
      </p>
      <ul className="tautan-daftar">
        {kegiatan.map((id) => (
          <li key={id}>
            {id === sorot ? (
              <span>{judulDari.get(id) ?? TEKS_UI.bentrok.tidakDikenal}</span>
            ) : (
              <Link className="tautan" to={`/kegiatan/${id}`}>
                {judulDari.get(id) ?? TEKS_UI.bentrok.tidakDikenal}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </li>
  );
}

export function HalamanBentrok() {
  const data = useDataAgenda();
  if (data.galat) return <TampilanGalat galat={data.galat} ulang={data.muatUlang} />;
  if (data.memuat && data.bentrok.length === 0) return <Memuat />;

  const judulDari = new Map(data.kegiatan.map((k) => [k.id, k.judul]));
  const kegiatanDari = new Map(data.kegiatan.map((k) => [k.id, k]));
  const kunci = (b: Bentrok) => {
    const a = kegiatanDari.get(b.kegiatanA);
    return a ? kunciTanggalWit(a.mulai) : kunciTanggalWit(b.irisan.mulai);
  };
  const perTanggal = new Map<string, Bentrok[]>();
  for (const b of data.bentrok) {
    const t = kunci(b);
    perTanggal.set(t, [...(perTanggal.get(t) ?? []), b]);
  }
  const tanggalUrut = [...perTanggal.keys()].sort();

  return (
    <>
      <h1 className="judul-halaman">{TEKS_UI.bentrok.judul}</h1>
      <p className="teks-pendukung">{TEKS_UI.bentrok.saran}</p>
      {data.bentrok.length === 0 ? (
        <p>{TEKS_UI.bentrok.kosong}</p>
      ) : (
        tanggalUrut.map((t, i) => (
          <section key={t} className="bagian" aria-labelledby={`bt-${i}`}>
            <h2 className="judul-bagian" id={`bt-${i}`}>
              {formatTanggalPanjang(t)}{' '}
              <span className="teks-pendukung">
                ({TEKS_UI.bentrok.jumlah(perTanggal.get(t)?.length ?? 0)})
              </span>
            </h2>
            <ul className="daftar-kartu">
              {(perTanggal.get(t) ?? []).map((b, j) => (
                <KeteranganBentrok key={j} bentrok={b} judulDari={judulDari} />
              ))}
            </ul>
          </section>
        ))
      )}
    </>
  );
}
