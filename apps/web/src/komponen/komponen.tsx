import { Link } from 'react-router';
import { LABEL_STATUS_AGENDA } from '@siap/domain';
import type { Bentrok, Kegiatan, StatusKegiatan } from '../api/tipe';
import { Ikon, IKON_STATUS } from '../ikon';
import { TEKS_UI } from '../teks-ui';
import { formatRentang } from '../waktu';
import type { GalatApi } from '../api/klien';

/** Status selalu ikon + teks, tidak pernah warna saja (STANDAR_DESAIN bagian 3). */
export function LencanaStatus({ status }: { status: StatusKegiatan }) {
  return (
    <span className={`lencana status-${status}`}>
      <Ikon nama={IKON_STATUS[status]} ukuran="var(--icon-sm)" />
      <span>{LABEL_STATUS_AGENDA[status]}</span>
    </span>
  );
}

export function LencanaBentrok({
  kepastian,
  jumlah,
}: {
  kepastian?: Bentrok['kepastian'];
  jumlah?: number;
}) {
  const teks =
    kepastian === 'potensi'
      ? TEKS_UI.bentrok.potensi
      : kepastian === 'pasti'
        ? TEKS_UI.bentrok.pasti
        : jumlah && jumlah > 1
          ? `${TEKS_UI.bentrok.ringkas} (${jumlah})`
          : TEKS_UI.bentrok.ringkas;
  return (
    <span className="lencana status-bentrok">
      <Ikon nama="bentrok" ukuran="var(--icon-sm)" />
      <span>{teks}</span>
    </span>
  );
}

/** Pihak yang hadir (ditugaskan/diterima) diringkas untuk kartu. */
function ringkasPihak(k: Kegiatan): string {
  const hadir = k.pihak.filter((p) => p.kedudukan === 'diterima' || p.kedudukan === 'ditugaskan');
  const sumber = hadir.length > 0 ? hadir : k.pihak;
  return sumber.map((p) => p.nama).join(', ');
}

export function KartuKegiatan({
  kegiatan,
  bentrok = [],
}: {
  kegiatan: Kegiatan;
  bentrok?: Bentrok[];
}) {
  const pasti = bentrok.some((b) => b.kepastian === 'pasti');
  const pihak = ringkasPihak(kegiatan);
  return (
    <li className="kartu-item">
      <Link to={`/kegiatan/${kegiatan.id}`} className="kartu-kegiatan">
        <span className="kk-jam tabular">{formatRentang(kegiatan.mulai, kegiatan.selesai)}</span>
        <span className="kk-judul">{kegiatan.judul}</span>
        <span className="kk-baris">
          <Ikon nama="lokasi" ukuran="var(--icon-sm)" />
          <span>
            {kegiatan.lokasi
              ? [kegiatan.lokasi.nama, kegiatan.lokasi.pulau].filter(Boolean).join(', ')
              : TEKS_UI.kegiatan.tanpaLokasi}
          </span>
        </span>
        {pihak && (
          <span className="kk-baris">
            <Ikon nama="orang" ukuran="var(--icon-sm)" />
            <span>{pihak}</span>
          </span>
        )}
        <span className="kk-lencana">
          <LencanaStatus status={kegiatan.status} />
          {bentrok.length > 0 && (
            <LencanaBentrok kepastian={pasti ? 'pasti' : 'potensi'} jumlah={bentrok.length} />
          )}
        </span>
      </Link>
    </li>
  );
}

export function Memuat() {
  return (
    <p className="memuat" role="status">
      {TEKS_UI.memuat}
    </p>
  );
}

export function TampilanGalat({ galat, ulang }: { galat: GalatApi; ulang?: () => void }) {
  const pesan =
    galat.status === 0
      ? TEKS_UI.galat.jaringan
      : galat.status === 403
        ? TEKS_UI.galat.tidakBerhak
        : galat.status >= 500
          ? TEKS_UI.galat.server
          : galat.message;
  return (
    <div className="kartu galat" role="alert">
      <h2 className="judul-bagian">{TEKS_UI.galat.judul}</h2>
      <p>{pesan}</p>
      {ulang && (
        <button type="button" className="tombol" onClick={ulang}>
          {TEKS_UI.coba}
        </button>
      )}
    </div>
  );
}

/** Pengelompokan: kegiatan id → bentrok yang melibatkannya. */
export function petaBentrok(daftar: Bentrok[]): Map<string, Bentrok[]> {
  const peta = new Map<string, Bentrok[]>();
  for (const b of daftar) {
    for (const id of [b.kegiatanA, b.kegiatanB]) {
      const isi = peta.get(id) ?? [];
      isi.push(b);
      peta.set(id, isi);
    }
  }
  return peta;
}

export const urutMulai = (a: Kegiatan, b: Kegiatan) =>
  Date.parse(a.mulai) - Date.parse(b.mulai) || a.judul.localeCompare(b.judul, 'id');
