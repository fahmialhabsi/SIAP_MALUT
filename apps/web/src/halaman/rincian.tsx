import { useNavigate, useParams } from 'react-router';
import type { Bentrok, EntriAudit, Kegiatan, Lampiran } from '../api/tipe';
import { Ikon } from '../ikon';
import { LencanaBentrok, LencanaStatus, Memuat, TampilanGalat } from '../komponen/komponen';
import { usePakaiData } from '../pakai-data';
import { useSesi } from '../sesi';
import { TEKS_UI } from '../teks-ui';
import {
  formatJam,
  formatRentang,
  formatTanggalJam,
  formatTanggalPanjang,
  kunciTanggalWit,
} from '../waktu';
import { KeteranganBentrok } from './bentrok';

function Baris({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="baris-data">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function ukuranBerkas(byte: number): string {
  if (byte < 1024) return `${byte} B`;
  if (byte < 1024 * 1024) return `${(byte / 1024).toFixed(1).replace('.', ',')} KB`;
  return `${(byte / 1024 / 1024).toFixed(1).replace('.', ',')} MB`;
}

export function Rincian() {
  const { id = '' } = useParams();
  const navigasi = useNavigate();
  const { punya } = useSesi();
  const k = usePakaiData<Kegiatan>(`/api/kegiatan/${id}`);
  const bentrok = usePakaiData<Bentrok[]>(punya('bentrok.baca') ? '/api/bentrok' : null);
  const semua = usePakaiData<Kegiatan[]>(punya('bentrok.baca') ? '/api/kegiatan' : null);
  const lampiran = usePakaiData<Lampiran[]>(
    punya('lampiran.baca') ? `/api/kegiatan/${id}/lampiran` : null,
  );
  const riwayat = usePakaiData<EntriAudit[]>(punya('audit.baca') ? '/api/audit' : null, {
    entitasId: id,
    batas: '20',
  });

  const kembali = (
    <button type="button" className="tombol tombol-sekunder" onClick={() => void navigasi(-1)}>
      <Ikon nama="kiri" ukuran="var(--icon-sm)" />
      <span>{TEKS_UI.kembali}</span>
    </button>
  );

  if (k.memuat && !k.data) return <Memuat />;
  if (k.galat) {
    return (
      <>
        {kembali}
        {k.galat.status === 404 ? (
          <p className="teks-pendukung" role="alert">
            {TEKS_UI.kegiatan.tidakDitemukan}
          </p>
        ) : (
          <TampilanGalat galat={k.galat} ulang={k.muatUlang} />
        )}
      </>
    );
  }
  const keg = k.data;
  if (!keg) return null;

  const milikku = (bentrok.data ?? []).filter(
    (b) => b.kegiatanA === keg.id || b.kegiatanB === keg.id,
  );
  const judulDari = new Map((semua.data ?? []).map((x) => [x.id, x.judul]));

  return (
    <>
      {kembali}
      <h1 className="judul-halaman">{keg.judul}</h1>
      <p className="kk-lencana">
        <LencanaStatus status={keg.status} />
        {milikku.length > 0 && (
          <LencanaBentrok
            kepastian={milikku.some((b) => b.kepastian === 'pasti') ? 'pasti' : 'potensi'}
            jumlah={milikku.length}
          />
        )}
        {keg.isContoh && <span className="penanda-contoh">{TEKS_UI.kegiatan.contoh}</span>}
      </p>

      <dl className="kartu data-kegiatan">
        <Baris label={TEKS_UI.kegiatan.waktu}>
          {formatTanggalPanjang(kunciTanggalWit(keg.mulai))}
          <br />
          <span className="tabular">{formatRentang(keg.mulai, keg.selesai)}</span>
        </Baris>
        <Baris label={TEKS_UI.kegiatan.lokasi}>
          {keg.lokasi
            ? [keg.lokasi.nama, keg.lokasi.pulau].filter(Boolean).join(', ')
            : TEKS_UI.kegiatan.tanpaLokasi}
        </Baris>
        {keg.jenis && <Baris label={TEKS_UI.kegiatan.jenis}>{keg.jenis}</Baris>}
        {keg.penyelenggara && (
          <Baris label={TEKS_UI.kegiatan.penyelenggara}>{keg.penyelenggara}</Baris>
        )}
        {keg.picProtokolId && (
          <Baris label={TEKS_UI.kegiatan.picProtokol}>{keg.picProtokolId}</Baris>
        )}
        {keg.picPengundang && (
          <Baris label={TEKS_UI.kegiatan.picPengundang}>
            {[keg.picPengundang.nama, keg.picPengundang.kontak].filter(Boolean).join(', ')}
          </Baris>
        )}
        {keg.tautanRapat && (
          <Baris label={TEKS_UI.kegiatan.tautanRapat}>
            <a className="tautan" href={keg.tautanRapat} target="_blank" rel="noreferrer noopener">
              <Ikon nama="tautan" ukuran="var(--icon-sm)" /> {TEKS_UI.kegiatan.bukaTautan}
            </a>
          </Baris>
        )}
        {keg.catatan && <Baris label={TEKS_UI.kegiatan.catatan}>{keg.catatan}</Baris>}
      </dl>

      <section className="bagian" aria-labelledby="r-pihak">
        <h2 className="judul-bagian" id="r-pihak">
          {TEKS_UI.kegiatan.pihak}
        </h2>
        {keg.pihak.length === 0 ? (
          <p className="teks-pendukung">{TEKS_UI.kegiatan.tanpaPihak}</p>
        ) : (
          <ul className="daftar-pihak">
            {keg.pihak.map((p) => (
              <li key={p.id} className="kartu pihak">
                <span className="pihak-nama">{p.nama}</span>
                <span className="teks-pendukung">
                  {(TEKS_UI.kedudukan as Record<string, string>)[p.kedudukan] ?? p.kedudukan}
                  {p.peran ? ` (${p.peran})` : ''}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {punya('bentrok.baca') && (
        <section className="bagian" aria-labelledby="r-bentrok">
          <h2 className="judul-bagian" id="r-bentrok">
            {TEKS_UI.kegiatan.peringatanBentrok}
          </h2>
          {milikku.length === 0 ? (
            <p className="teks-pendukung">{TEKS_UI.kegiatan.tanpaBentrok}</p>
          ) : (
            <ul className="daftar-kartu">
              {milikku.map((b, i) => (
                <KeteranganBentrok key={i} bentrok={b} judulDari={judulDari} sorot={keg.id} />
              ))}
            </ul>
          )}
        </section>
      )}

      {punya('lampiran.baca') && (
        <section className="bagian" aria-labelledby="r-lampiran">
          <h2 className="judul-bagian" id="r-lampiran">
            {TEKS_UI.kegiatan.lampiran}
          </h2>
          {(lampiran.data ?? []).length === 0 ? (
            <p className="teks-pendukung">{TEKS_UI.kegiatan.tanpaLampiran}</p>
          ) : (
            <ul className="daftar-pihak">
              {(lampiran.data ?? []).map((l) => (
                <li key={l.id} className="kartu pihak">
                  <a className="tautan" href={`/api/lampiran/${l.id}`}>
                    <Ikon nama="lampiran" ukuran="var(--icon-sm)" /> {l.namaBerkas}
                  </a>
                  <span className="teks-pendukung tabular">{ukuranBerkas(l.ukuran)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {punya('audit.baca') && (
        <section className="bagian" aria-labelledby="r-riwayat">
          <h2 className="judul-bagian" id="r-riwayat">
            {TEKS_UI.kegiatan.riwayat}
          </h2>
          {(riwayat.data ?? []).length === 0 ? (
            <p className="teks-pendukung">{TEKS_UI.kegiatan.tanpaRiwayat}</p>
          ) : (
            <ul className="daftar-pihak">
              {(riwayat.data ?? []).map((e) => (
                <li key={e.id} className="kartu pihak">
                  <span className="pihak-nama">{e.aksi}</span>
                  <span className="teks-pendukung tabular">
                    {formatTanggalJam(e.waktu)} oleh {e.aktor}
                    {e.alasan ? `: ${e.alasan}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
      <p className="sr-saja">{formatJam(keg.diubah)}</p>
    </>
  );
}
