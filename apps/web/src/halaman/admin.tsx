import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { api } from '../api/klien';
import type { EntriAudit, Pengaturan } from '../api/tipe';
import { Memuat, TampilanGalat } from '../komponen/komponen';
import { PesanGalat } from '../komponen/lembar';
import { usePakaiData } from '../pakai-data';
import { useSesi } from '../sesi';
import { TEKS_UI } from '../teks-ui';
import { formatTanggalJam } from '../waktu';

export function Lainnya() {
  const { punya } = useSesi();
  return (
    <>
      <h1 className="judul-halaman">{TEKS_UI.lainnya.judul}</h1>
      <ul className="daftar-pihak">
        {punya('pengaturan.baca') && (
          <li>
            <Link className="tombol tombol-sekunder tombol-penuh" to="/pengaturan">
              {TEKS_UI.lainnya.pengaturan}
            </Link>
          </li>
        )}
        {punya('audit.baca') && (
          <li>
            <Link className="tombol tombol-sekunder tombol-penuh" to="/audit">
              {TEKS_UI.lainnya.audit}
            </Link>
          </li>
        )}
      </ul>
    </>
  );
}

export function HalamanPengaturan() {
  const { punya } = useSesi();
  const data = usePakaiData<Pengaturan[]>('/api/pengaturan');
  const [nilai, setNilai] = useState('');
  const [sedang, setSedang] = useState(false);
  const [galat, setGalat] = useState<unknown>(null);
  const [tersimpan, setTersimpan] = useState(false);
  const boleh = punya('pengaturan.ubah');

  useEffect(() => {
    const d = data.data?.find((p) => p.kunci === 'durasiBawaanMenit');
    if (d) setNilai(String(d.nilai));
  }, [data.data]);

  if (data.galat) return <TampilanGalat galat={data.galat} ulang={data.muatUlang} />;
  if (data.memuat && !data.data) return <Memuat />;

  const kirim = async (e: FormEvent) => {
    e.preventDefault();
    setSedang(true);
    setGalat(null);
    setTersimpan(false);
    try {
      await api.put('/api/pengaturan/durasiBawaanMenit', { nilai: Number(nilai) });
      setTersimpan(true);
      data.muatUlang();
    } catch (err) {
      setGalat(err);
    }
    setSedang(false);
  };

  return (
    <>
      <h1 className="judul-halaman">{TEKS_UI.pengaturan.judul}</h1>
      <form className="kartu form" onSubmit={(e) => void kirim(e)} noValidate>
        <div className="medan">
          <label htmlFor="durasi">{TEKS_UI.pengaturan.durasi}</label>
          <input
            id="durasi"
            className="isian"
            type="number"
            inputMode="numeric"
            min={1}
            max={1440}
            value={nilai}
            readOnly={!boleh}
            onChange={(e) => setNilai(e.target.value)}
          />
          <p className="teks-pendukung">{TEKS_UI.pengaturan.durasiKeterangan}</p>
        </div>
        {!boleh && <p className="teks-pendukung">{TEKS_UI.pengaturan.hanyaBaca}</p>}
        <PesanGalat galat={galat} />
        {tersimpan && <p role="status">{TEKS_UI.tindakan.berhasil}</p>}
        {boleh && (
          <button type="submit" className="tombol" disabled={sedang || nilai === ''}>
            {sedang ? TEKS_UI.tindakan.menyimpan : TEKS_UI.tindakan.simpan}
          </button>
        )}
      </form>
    </>
  );
}

export function HalamanAudit() {
  const [saring, setSaring] = useState('');
  const data = usePakaiData<EntriAudit[]>('/api/audit', {
    entitasId: saring.trim() || undefined,
    batas: '100',
  });
  return (
    <>
      <h1 className="judul-halaman">{TEKS_UI.audit.judul}</h1>
      <p className="teks-pendukung">{TEKS_UI.audit.keterangan}</p>
      <div className="medan">
        <label htmlFor="saring">{TEKS_UI.audit.saring}</label>
        <input
          id="saring"
          className="isian"
          value={saring}
          onChange={(e) => setSaring(e.target.value)}
        />
      </div>
      {data.galat ? (
        <TampilanGalat galat={data.galat} ulang={data.muatUlang} />
      ) : data.memuat && !data.data ? (
        <Memuat />
      ) : (data.data ?? []).length === 0 ? (
        <p className="teks-pendukung">{TEKS_UI.audit.kosong}</p>
      ) : (
        <ul className="daftar-pihak">
          {(data.data ?? []).map((e) => (
            <li key={e.id} className="kartu pihak">
              <span className="pihak-nama">{TEKS_UI.audit.aksi[e.aksi] ?? e.aksi}</span>
              <span className="teks-pendukung tabular">
                {formatTanggalJam(e.waktu)} {TEKS_UI.audit.oleh} {e.aktor}
              </span>
              {e.entitasId && <span className="teks-pendukung">{e.entitasId}</span>}
              {e.alasan && <span>{e.alasan}</span>}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
