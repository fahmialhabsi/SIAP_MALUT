import { Link } from 'react-router';
import { LABEL_STATUS_AGENDA, STATUS_AGENDA } from '@siap/domain';
import type { Kegiatan } from '../api/tipe';
import { KartuKegiatan, Memuat, TampilanGalat, LencanaBentrok } from '../komponen/komponen';
import { BATAS_HARI_PERLU_DITETAPKAN, DASBOR_PER_PERAN, type BagianDasbor } from '../konfigurasi';
import { useSesi } from '../sesi';
import { TEKS_UI } from '../teks-ui';
import { hariIniWit, kunciTanggalWit, selisihHari } from '../waktu';
import { useDataAgenda, type DataAgenda } from './data-agenda';

function DaftarKartu({ daftar, data }: { daftar: Kegiatan[]; data: DataAgenda }) {
  if (daftar.length === 0) return <p className="teks-pendukung">{TEKS_UI.beranda.kosong}</p>;
  return (
    <ul className="daftar-kartu">
      {daftar.map((k) => (
        <KartuKegiatan key={k.id} kegiatan={k} bentrok={data.petaBentrok.get(k.id)} />
      ))}
    </ul>
  );
}

function Bagian({ judul, id, children }: { judul: string; id: string; children: React.ReactNode }) {
  return (
    <section className="bagian" aria-labelledby={id}>
      <h2 className="judul-bagian" id={id}>
        {judul}
      </h2>
      {children}
    </section>
  );
}

export function Beranda() {
  const { profil, punya } = useSesi();
  const data = useDataAgenda();
  if (!profil) return null;
  if (data.memuat && data.kegiatan.length === 0 && !data.galat) return <Memuat />;
  if (data.galat) return <TampilanGalat galat={data.galat} ulang={data.muatUlang} />;

  const hariIni = hariIniWit();
  const saya = (k: Kegiatan) => k.pihak.some((p) => p.id === profil.pejabatId);
  const bagian = DASBOR_PER_PERAN[profil.peran] ?? [];

  const render = (b: BagianDasbor) => {
    switch (b) {
      case 'ringkasanStatus': {
        const hitung = (s: string) => data.kegiatan.filter((k) => k.status === s).length;
        return (
          <Bagian key={b} judul={TEKS_UI.beranda.ringkasanStatus} id="b-ringkasan">
            <ul className="ringkasan">
              {STATUS_AGENDA.filter((s) => hitung(s) > 0).map((s) => (
                <li key={s} className="ringkasan-butir">
                  <span className="angka tabular">{hitung(s)}</span>
                  <span>{LABEL_STATUS_AGENDA[s]}</span>
                </li>
              ))}
            </ul>
          </Bagian>
        );
      }
      case 'perluDitetapkan': {
        const daftar = data.kegiatan.filter((k) => {
          const hari = selisihHari(hariIni, kunciTanggalWit(k.mulai));
          return k.status === 'menunggu_arahan' && hari >= 0 && hari <= BATAS_HARI_PERLU_DITETAPKAN;
        });
        return (
          <Bagian key={b} judul={TEKS_UI.beranda.perluDitetapkan} id="b-perlu">
            <DaftarKartu daftar={daftar} data={data} />
          </Bagian>
        );
      }
      case 'menungguArahan':
        return (
          <Bagian key={b} judul={TEKS_UI.beranda.menungguArahan} id="b-arahan">
            <DaftarKartu
              daftar={data.kegiatan.filter((k) => k.status === 'menunggu_arahan')}
              data={data}
            />
          </Bagian>
        );
      case 'bentrok':
        if (!punya('bentrok.baca')) return null;
        return (
          <Bagian key={b} judul={TEKS_UI.beranda.bentrokMendatang} id="b-bentrok">
            <p>
              {data.bentrok.length > 0 && <LencanaBentrok jumlah={data.bentrok.length} />}{' '}
              {TEKS_UI.beranda.totalBentrok(data.bentrok.length)}
            </p>
            <Link className="tombol tombol-sekunder" to="/bentrok">
              {TEKS_UI.beranda.lihatSemua}
            </Link>
          </Bagian>
        );
      case 'penugasanSaya':
        return (
          <Bagian key={b} judul={TEKS_UI.beranda.penugasanSaya} id="b-tugas">
            <DaftarKartu
              daftar={data.kegiatan.filter((k) =>
                k.pihak.some((p) => p.id === profil.pejabatId && p.kedudukan === 'ditugaskan'),
              )}
              data={data}
            />
          </Bagian>
        );
      case 'agendaHariIni':
        return (
          <Bagian key={b} judul={TEKS_UI.beranda.agendaHariIni} id="b-hariini">
            <DaftarKartu
              daftar={data.kegiatan.filter((k) => kunciTanggalWit(k.mulai) === hariIni)}
              data={data}
            />
            <Link className="tombol tombol-sekunder" to="/agenda">
              {TEKS_UI.beranda.lihatSemua}
            </Link>
          </Bagian>
        );
      case 'agendaSaya':
        return (
          <Bagian key={b} judul={TEKS_UI.beranda.agendaSaya} id="b-saya">
            <DaftarKartu daftar={data.kegiatan.filter(saya)} data={data} />
          </Bagian>
        );
    }
  };

  return (
    <>
      <h1 className="judul-halaman">{TEKS_UI.beranda.salam(profil.nama)}</h1>
      {bagian.length === 0 ? (
        <p className="teks-pendukung">{TEKS_UI.beranda.tanpaTampilan}</p>
      ) : (
        bagian.map(render)
      )}
    </>
  );
}
