import { useRef, useState, type FormEvent } from 'react';
import { LABEL_STATUS_AGENDA, TRANSISI_STATUS, intervalDari, irisan } from '@siap/domain';
import { api, unggah } from '../api/klien';
import type {
  Bentrok,
  HasilKeputusan,
  Kegiatan,
  KeputusanKehadiran,
  Lampiran,
  Pejabat,
} from '../api/tipe';
import { Ikon } from '../ikon';
import { useSesi } from '../sesi';
import { TEKS_UI } from '../teks-ui';
import { LembarBawah, PesanGalat } from './lembar';

const DURASI_BAWAAN_MENIT = 120;
const STATUS_TERKUNCI = ['berlangsung', 'selesai', 'dibatalkan'];

/** Apakah pejabat sudah punya kegiatan lain yang beririsan jamnya (peringatan saat memilih pengganti)? */
export function penggantiSibuk(
  pejabatId: string,
  kegiatan: Kegiatan,
  semua: Kegiatan[],
  durasi = DURASI_BAWAAN_MENIT,
): boolean {
  const ini = intervalDari(kegiatan.mulai, kegiatan.selesai ?? undefined, durasi);
  return semua.some((k) => {
    if (k.id === kegiatan.id || ['dibatalkan', 'selesai', 'ditunda'].includes(k.status))
      return false;
    const hadir = k.pihak.some(
      (p) => p.id === pejabatId && (p.kedudukan === 'diterima' || p.kedudukan === 'ditugaskan'),
    );
    if (!hadir) return false;
    return irisan(ini, intervalDari(k.mulai, k.selesai ?? undefined, durasi)) !== null;
  });
}

interface PropsAksi {
  kegiatan: Kegiatan;
  bentrok: Bentrok[];
  /** Dipanggil setelah berhasil: muat ulang data. */
  saatSelesai: () => void;
}

/** Keputusan kehadiran pimpinan (KB-005, KB-047): satu lembar, satu permintaan atomik. */
export function PanelKeputusan({
  kegiatan,
  bentrok,
  semuaKegiatan,
  pejabat,
  saatSelesai,
}: PropsAksi & { semuaKegiatan: Kegiatan[]; pejabat: Pejabat[] }) {
  const { punya } = useSesi();
  const [buka, setBuka] = useState<string | null>(null);
  const pimpinan = kegiatan.pihak.filter((p) => p.golongan === 'pimpinan');
  if (!punya('pihak.kelola') || STATUS_TERKUNCI.includes(kegiatan.status)) return null;

  const sasaran = pimpinan.find((p) => p.id === buka);
  return (
    <section className="bagian" aria-labelledby="r-keputusan">
      <h2 className="judul-bagian" id="r-keputusan">
        {TEKS_UI.keputusan.judul}
      </h2>
      {pimpinan.length === 0 ? (
        <p className="teks-pendukung">{TEKS_UI.keputusan.tidakAda}</p>
      ) : (
        <ul className="daftar-pihak">
          {pimpinan.map((p) => (
            <li key={p.id}>
              <button type="button" className="tombol tombol-penuh" onClick={() => setBuka(p.id)}>
                <Ikon nama="ditetapkan" ukuran="var(--icon-sm)" />
                <span>{`${TEKS_UI.keputusan.tombol}: ${p.nama}`}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {sasaran && (
        <FormKeputusan
          kegiatan={kegiatan}
          pimpinanId={sasaran.id}
          pimpinanNama={sasaran.nama}
          adaBentrokPasti={bentrok.some((b) => b.kepastian === 'pasti')}
          semuaKegiatan={semuaKegiatan}
          pejabat={pejabat.filter((x) => x.id !== sasaran.id && x.golongan !== 'petugas')}
          onTutup={() => setBuka(null)}
          saatSelesai={() => {
            setBuka(null);
            saatSelesai();
          }}
        />
      )}
    </section>
  );
}

function FormKeputusan({
  kegiatan,
  pimpinanId,
  pimpinanNama,
  adaBentrokPasti,
  semuaKegiatan,
  pejabat,
  onTutup,
  saatSelesai,
}: {
  kegiatan: Kegiatan;
  pimpinanId: string;
  pimpinanNama: string;
  adaBentrokPasti: boolean;
  semuaKegiatan: Kegiatan[];
  pejabat: Pejabat[];
  onTutup: () => void;
  saatSelesai: () => void;
}) {
  const [pilihan, setPilihan] = useState<KeputusanKehadiran>('hadir_sendiri');
  const [pengganti, setPengganti] = useState('');
  const [alasan, setAlasan] = useState('');
  const [tetapkan, setTetapkan] = useState(false);
  const [alasanBentrok, setAlasanBentrok] = useState('');
  const [sedang, setSedang] = useState(false);
  const [galat, setGalat] = useState<unknown>(null);

  const PILIHAN: { nilai: KeputusanKehadiran; label: string }[] = [
    { nilai: 'hadir_sendiri', label: TEKS_UI.keputusan.hadirSendiri },
    { nilai: 'wakilkan', label: TEKS_UI.keputusan.wakilkan },
    { nilai: 'tidak_hadir', label: TEKS_UI.keputusan.tidakHadir },
    { nilai: 'tunda', label: TEKS_UI.keputusan.tunda },
  ];
  const sibuk = pengganti ? penggantiSibuk(pengganti, kegiatan, semuaKegiatan) : false;
  const namaPengganti = pejabat.find((x) => x.id === pengganti)?.nama ?? '';
  const perluAlasanBentrok = tetapkan && adaBentrokPasti && pilihan !== 'tunda';
  const siap =
    (pilihan !== 'wakilkan' || pengganti !== '') &&
    (pilihan !== 'tunda' || alasan.trim() !== '') &&
    (!perluAlasanBentrok || alasanBentrok.trim() !== '');

  const kirim = async (e: FormEvent) => {
    e.preventDefault();
    setSedang(true);
    setGalat(null);
    try {
      await api.post<HasilKeputusan>(`/api/kegiatan/${kegiatan.id}/keputusan-kehadiran`, {
        pimpinanId,
        keputusan: pilihan,
        ...(pilihan === 'wakilkan' ? { penggantiId: pengganti } : {}),
        ...(alasan.trim() ? { alasan: alasan.trim() } : {}),
        ...(tetapkan && pilihan !== 'tunda' ? { tetapkan: true } : {}),
        ...(perluAlasanBentrok ? { alasanBentrok: alasanBentrok.trim() } : {}),
      });
      saatSelesai();
    } catch (err) {
      setGalat(err);
      setSedang(false);
    }
  };

  return (
    <LembarBawah judul={TEKS_UI.keputusan.untuk(pimpinanNama)} onTutup={onTutup}>
      <form className="form" onSubmit={(e) => void kirim(e)} noValidate>
        <fieldset className="kelompok-radio">
          <legend className="sr-saja">{TEKS_UI.keputusan.judul}</legend>
          {PILIHAN.map((p) => (
            <label key={p.nilai} className="radio">
              <input
                type="radio"
                name="keputusan"
                value={p.nilai}
                checked={pilihan === p.nilai}
                onChange={() => setPilihan(p.nilai)}
              />
              <span>{p.label}</span>
            </label>
          ))}
        </fieldset>

        {pilihan === 'wakilkan' && (
          <div className="medan">
            <label htmlFor="pengganti">{TEKS_UI.keputusan.pilihPengganti}</label>
            <select
              id="pengganti"
              className="pilihan"
              value={pengganti}
              onChange={(e) => setPengganti(e.target.value)}
            >
              <option value="">{TEKS_UI.tindakan.pilih}</option>
              {pejabat.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.nama}
                </option>
              ))}
            </select>
            {sibuk && (
              <p className="pesan-peringatan" role="status">
                {TEKS_UI.keputusan.penggantiSibuk(namaPengganti)}
              </p>
            )}
          </div>
        )}

        {(pilihan === 'tunda' || pilihan === 'tidak_hadir') && (
          <div className="medan">
            <label htmlFor="alasan">
              {pilihan === 'tunda' ? TEKS_UI.keputusan.alasanTunda : TEKS_UI.keputusan.alasan}
            </label>
            <textarea
              id="alasan"
              className="isian"
              rows={3}
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
            />
          </div>
        )}

        {pilihan !== 'tunda' && (
          <label className="radio">
            <input
              type="checkbox"
              checked={tetapkan}
              onChange={(e) => setTetapkan(e.target.checked)}
            />
            <span>{TEKS_UI.keputusan.tetapkan}</span>
          </label>
        )}

        {perluAlasanBentrok && (
          <div className="medan">
            <p className="pesan-peringatan">{TEKS_UI.keputusan.ada}</p>
            <label htmlFor="alasan-bentrok">{TEKS_UI.keputusan.alasanBentrok}</label>
            <textarea
              id="alasan-bentrok"
              className="isian"
              rows={3}
              value={alasanBentrok}
              onChange={(e) => setAlasanBentrok(e.target.value)}
            />
          </div>
        )}

        <PesanGalat galat={galat} />
        <div className="aksi-baris">
          <button type="submit" className="tombol" disabled={sedang || !siap}>
            {sedang ? TEKS_UI.tindakan.menyimpan : TEKS_UI.keputusan.kirim}
          </button>
          <button type="button" className="tombol tombol-sekunder" onClick={onTutup}>
            {TEKS_UI.tindakan.batal}
          </button>
        </div>
      </form>
    </LembarBawah>
  );
}

/** Perpindahan status yang sah (aturan dari paket domain); alasan wajib untuk menunda/membatalkan. */
export function PanelStatus({ kegiatan, bentrok, saatSelesai }: PropsAksi) {
  const { punya } = useSesi();
  const [tujuan, setTujuan] = useState<(typeof kegiatan)['status'] | null>(null);
  if (!punya('kegiatan.pindah_status')) return null;
  const pilihan = TRANSISI_STATUS[kegiatan.status];
  return (
    <section className="bagian" aria-labelledby="r-status">
      <h2 className="judul-bagian" id="r-status">
        {TEKS_UI.status.judul}
      </h2>
      {pilihan.length === 0 ? (
        <p className="teks-pendukung">{TEKS_UI.status.terkunci}</p>
      ) : (
        <ul className="daftar-pihak">
          {pilihan.map((s) => (
            <li key={s}>
              <button
                type="button"
                className="tombol tombol-sekunder tombol-penuh"
                onClick={() => setTujuan(s)}
              >
                {TEKS_UI.status.ke(LABEL_STATUS_AGENDA[s])}
              </button>
            </li>
          ))}
        </ul>
      )}
      {tujuan && (
        <FormStatus
          kegiatan={kegiatan}
          tujuan={tujuan}
          adaBentrokPasti={bentrok.some((b) => b.kepastian === 'pasti')}
          onTutup={() => setTujuan(null)}
          saatSelesai={() => {
            setTujuan(null);
            saatSelesai();
          }}
        />
      )}
    </section>
  );
}

function FormStatus({
  kegiatan,
  tujuan,
  adaBentrokPasti,
  onTutup,
  saatSelesai,
}: {
  kegiatan: Kegiatan;
  tujuan: Kegiatan['status'];
  adaBentrokPasti: boolean;
  onTutup: () => void;
  saatSelesai: () => void;
}) {
  const [alasan, setAlasan] = useState('');
  const [alasanBentrok, setAlasanBentrok] = useState('');
  const [sedang, setSedang] = useState(false);
  const [galat, setGalat] = useState<unknown>(null);
  const perluAlasan = tujuan === 'ditunda' || tujuan === 'dibatalkan';
  const perluBentrok = tujuan === 'ditetapkan' && adaBentrokPasti;
  const siap =
    (!perluAlasan || alasan.trim() !== '') && (!perluBentrok || alasanBentrok.trim() !== '');

  const kirim = async (e: FormEvent) => {
    e.preventDefault();
    setSedang(true);
    setGalat(null);
    try {
      await api.post(`/api/kegiatan/${kegiatan.id}/pindah-status`, {
        ke: tujuan,
        ...(alasan.trim() ? { alasan: alasan.trim() } : {}),
        ...(perluBentrok ? { alasanBentrok: alasanBentrok.trim() } : {}),
      });
      saatSelesai();
    } catch (err) {
      setGalat(err);
      setSedang(false);
    }
  };

  return (
    <LembarBawah judul={TEKS_UI.status.ke(LABEL_STATUS_AGENDA[tujuan])} onTutup={onTutup}>
      <form className="form" onSubmit={(e) => void kirim(e)} noValidate>
        {perluAlasan && (
          <div className="medan">
            <label htmlFor="alasan-status">{TEKS_UI.status.alasan}</label>
            <textarea
              id="alasan-status"
              className="isian"
              rows={3}
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
            />
          </div>
        )}
        {perluBentrok && (
          <div className="medan">
            <p className="pesan-peringatan">{TEKS_UI.keputusan.ada}</p>
            <label htmlFor="alasan-bentrok-status">{TEKS_UI.status.alasanBentrok}</label>
            <textarea
              id="alasan-bentrok-status"
              className="isian"
              rows={3}
              value={alasanBentrok}
              onChange={(e) => setAlasanBentrok(e.target.value)}
            />
          </div>
        )}
        <PesanGalat galat={galat} />
        <div className="aksi-baris">
          <button type="submit" className="tombol" disabled={sedang || !siap}>
            {sedang ? TEKS_UI.tindakan.menyimpan : TEKS_UI.status.konfirmasi}
          </button>
          <button type="button" className="tombol tombol-sekunder" onClick={onTutup}>
            {TEKS_UI.tindakan.batal}
          </button>
        </div>
      </form>
    </LembarBawah>
  );
}

/** Pejabat yang ditugaskan menerima atau menolak penugasan dirinya (KB-013). */
export function PanelKonfirmasiSaya({
  kegiatan,
  saatSelesai,
}: {
  kegiatan: Kegiatan;
  saatSelesai: () => void;
}) {
  const { profil, punya } = useSesi();
  const [sedang, setSedang] = useState(false);
  const [galat, setGalat] = useState<unknown>(null);
  const saya = kegiatan.pihak.find((p) => p.id === profil?.pejabatId);
  if (!saya || !punya('pihak.konfirmasi_sendiri')) return null;
  if (!['ditugaskan', 'diterima', 'ditolak'].includes(saya.kedudukan)) return null;
  if (STATUS_TERKUNCI.includes(kegiatan.status)) return null;

  const putuskan = async (kedudukan: 'diterima' | 'ditolak') => {
    setSedang(true);
    setGalat(null);
    try {
      await api.put(`/api/kegiatan/${kegiatan.id}/pihak/${saya.id}`, { kedudukan });
      saatSelesai();
    } catch (err) {
      setGalat(err);
    }
    setSedang(false);
  };

  return (
    <section className="bagian kartu" aria-labelledby="r-konfirmasi">
      <h2 className="judul-bagian" id="r-konfirmasi">
        {TEKS_UI.konfirmasi.judul}
      </h2>
      {saya.kedudukan === 'ditugaskan' ? (
        <>
          <p>{TEKS_UI.konfirmasi.keterangan}</p>
          <div className="aksi-baris">
            <button
              type="button"
              className="tombol"
              disabled={sedang}
              onClick={() => void putuskan('diterima')}
            >
              <Ikon nama="terkonfirmasi" ukuran="var(--icon-sm)" />
              <span>{TEKS_UI.konfirmasi.terima}</span>
            </button>
            <button
              type="button"
              className="tombol tombol-bahaya"
              disabled={sedang}
              onClick={() => void putuskan('ditolak')}
            >
              <Ikon nama="dibatalkan" ukuran="var(--icon-sm)" />
              <span>{TEKS_UI.konfirmasi.tolak}</span>
            </button>
          </div>
        </>
      ) : (
        <p>
          {saya.kedudukan === 'diterima'
            ? TEKS_UI.konfirmasi.sudahTerima
            : TEKS_UI.konfirmasi.sudahTolak}
        </p>
      )}
      <PesanGalat galat={galat} />
    </section>
  );
}

const TIPE_BOLEH = ['application/pdf', 'image/jpeg', 'image/png'];
const MAKS_BYTE = 10 * 1024 * 1024;

/** Pilihan berkas dari kamera atau galeri; mengembalikan pesan galat bila jenis/ukuran tidak sesuai. */
export function periksaBerkas(f: File): string | null {
  if (!TIPE_BOLEH.includes(f.type)) return TEKS_UI.lampiran.tipeTidak;
  if (f.size > MAKS_BYTE) return TEKS_UI.lampiran.terlaluBesar;
  return null;
}

export function PilihBerkas({
  berkas,
  onPilih,
}: {
  berkas: File | null;
  onPilih: (f: File | null) => void;
}) {
  const kamera = useRef<HTMLInputElement>(null);
  const galeri = useRef<HTMLInputElement>(null);
  const [pesan, setPesan] = useState<string | null>(null);
  const saatPilih = (f: File | undefined) => {
    if (!f) return;
    const masalah = periksaBerkas(f);
    setPesan(masalah);
    onPilih(masalah ? null : f);
  };
  return (
    <div className="medan">
      <div className="aksi-baris">
        <button
          type="button"
          className="tombol tombol-sekunder"
          onClick={() => kamera.current?.click()}
        >
          <Ikon nama="lampiran" ukuran="var(--icon-sm)" />
          <span>{TEKS_UI.lampiran.ambilFoto}</span>
        </button>
        <button
          type="button"
          className="tombol tombol-sekunder"
          onClick={() => galeri.current?.click()}
        >
          <Ikon nama="unduh" ukuran="var(--icon-sm)" />
          <span>{TEKS_UI.lampiran.pilihBerkas}</span>
        </button>
      </div>
      <input
        ref={kamera}
        className="sr-saja"
        type="file"
        accept="image/*"
        capture="environment"
        tabIndex={-1}
        aria-label={TEKS_UI.lampiran.ambilFoto}
        onChange={(e) => saatPilih(e.target.files?.[0])}
      />
      <input
        ref={galeri}
        className="sr-saja"
        type="file"
        accept="application/pdf,image/jpeg,image/png"
        tabIndex={-1}
        aria-label={TEKS_UI.lampiran.pilihBerkas}
        onChange={(e) => saatPilih(e.target.files?.[0])}
      />
      <p className="teks-pendukung">{TEKS_UI.lampiran.petunjuk}</p>
      {berkas && (
        <p>
          {TEKS_UI.lampiran.terpilih}: <strong>{berkas.name}</strong>
        </p>
      )}
      {pesan && (
        <p className="pesan-galat" role="alert">
          {pesan}
        </p>
      )}
    </div>
  );
}

/** Unggah lampiran pada kegiatan yang sudah ada (rincian kegiatan). */
export function PanelLampiran({
  kegiatanId,
  saatSelesai,
}: {
  kegiatanId: string;
  saatSelesai: () => void;
}) {
  const { punya } = useSesi();
  const [berkas, setBerkas] = useState<File | null>(null);
  const [sedang, setSedang] = useState(false);
  const [galat, setGalat] = useState<unknown>(null);
  if (!punya('lampiran.unggah')) return null;
  const kirim = async () => {
    if (!berkas) return;
    setSedang(true);
    setGalat(null);
    try {
      await unggah<Lampiran>(`/api/kegiatan/${kegiatanId}/lampiran`, berkas);
      setBerkas(null);
      saatSelesai();
    } catch (err) {
      setGalat(err);
    }
    setSedang(false);
  };
  return (
    <div className="kartu">
      <h3 className="judul-kecil">{TEKS_UI.lampiran.tambah}</h3>
      <PilihBerkas berkas={berkas} onPilih={setBerkas} />
      <PesanGalat galat={galat} />
      <button
        type="button"
        className="tombol"
        disabled={!berkas || sedang}
        onClick={() => void kirim()}
      >
        {sedang ? TEKS_UI.lampiran.mengunggah : TEKS_UI.lampiran.unggah}
      </button>
    </div>
  );
}
