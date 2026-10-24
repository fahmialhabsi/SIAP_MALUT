import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router';
import { api, unggah } from '../api/klien';
import type { Kegiatan, Lampiran, Pejabat } from '../api/tipe';
import { Memuat, TampilanGalat } from '../komponen/komponen';
import { PesanGalat } from '../komponen/lembar';
import { PilihBerkas } from '../komponen/tindakan';
import { usePakaiData } from '../pakai-data';
import { useSesi } from '../sesi';
import { TEKS_UI } from '../teks-ui';
import { hariIniWit, jamIsian, keIsoWit, kunciTanggalWit } from '../waktu';

interface Isian {
  judul: string;
  jenis: string;
  tanggal: string;
  jamMulai: string;
  jamSelesai: string;
  lokasi: string;
  pulau: string;
  penyelenggara: string;
  picProtokolId: string;
  picNama: string;
  picKontak: string;
  tautanRapat: string;
  catatan: string;
  pihak: string[];
}

const KOSONG: Isian = {
  judul: '',
  jenis: '',
  tanggal: '',
  jamMulai: '09:00',
  jamSelesai: '',
  lokasi: '',
  pulau: '',
  penyelenggara: '',
  picProtokolId: '',
  picNama: '',
  picKontak: '',
  tautanRapat: '',
  catatan: '',
  pihak: [],
};

function dariKegiatan(k: Kegiatan): Isian {
  return {
    judul: k.judul,
    jenis: k.jenis ?? '',
    tanggal: kunciTanggalWit(k.mulai),
    jamMulai: jamIsian(k.mulai),
    jamSelesai: k.selesai ? jamIsian(k.selesai) : '',
    lokasi: k.lokasi?.nama ?? '',
    pulau: k.lokasi?.pulau ?? '',
    penyelenggara: k.penyelenggara ?? '',
    picProtokolId: k.picProtokolId ?? '',
    picNama: k.picPengundang?.nama ?? '',
    picKontak: k.picPengundang?.kontak ?? '',
    tautanRapat: k.tautanRapat ?? '',
    catatan: k.catatan ?? '',
    pihak: [],
  };
}

const atauNull = (s: string) => (s.trim() === '' ? null : s.trim());
const atauUndef = (s: string) => (s.trim() === '' ? undefined : s.trim());

function Medan({
  id,
  label,
  children,
  wajib,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
  wajib?: boolean;
}) {
  return (
    <div className="medan">
      <label htmlFor={id}>
        {label}
        {wajib ? ' *' : ''}
      </label>
      {children}
    </div>
  );
}

/** Form undangan (KB-001, KB-002, KB-003): buat baru atau ubah; lampiran dari kamera atau galeri. */
export function FormKegiatan() {
  const { id } = useParams();
  const ubah = id !== undefined;
  const navigasi = useNavigate();
  const { punya } = useSesi();
  const lama = usePakaiData<Kegiatan>(ubah ? `/api/kegiatan/${id}` : null);
  const direktori = usePakaiData<Pejabat[]>(punya('pejabat.baca') ? '/api/pejabat' : null);
  const [v, setV] = useState<Isian>({ ...KOSONG, tanggal: hariIniWit() });
  const [berkas, setBerkas] = useState<File | null>(null);
  const [sedang, setSedang] = useState(false);
  const [galat, setGalat] = useState<unknown>(null);
  const [salahWaktu, setSalahWaktu] = useState(false);

  useEffect(() => {
    if (lama.data) setV(dariKegiatan(lama.data));
  }, [lama.data]);

  const isi = (kunci: keyof Isian) => ({
    value: v[kunci] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setV((x) => ({ ...x, [kunci]: e.target.value })),
  });

  if (ubah && lama.memuat && !lama.data) return <Memuat />;
  if (ubah && lama.galat) return <TampilanGalat galat={lama.galat} ulang={lama.muatUlang} />;

  const petugas = (direktori.data ?? []).filter((p) => p.golongan === 'petugas');
  const diundang = (direktori.data ?? []).filter((p) => p.golongan !== 'petugas');
  const siap = v.judul.trim() !== '' && v.tanggal !== '' && v.jamMulai !== '';

  const kirim = async (e: FormEvent) => {
    e.preventDefault();
    setGalat(null);
    if (v.jamSelesai && v.jamSelesai <= v.jamMulai) {
      setSalahWaktu(true);
      return;
    }
    setSalahWaktu(false);
    setSedang(true);
    const mulai = keIsoWit(v.tanggal, v.jamMulai);
    const selesai = v.jamSelesai ? keIsoWit(v.tanggal, v.jamSelesai) : null;
    try {
      let tujuan = id;
      if (ubah) {
        await api.patch<Kegiatan>(`/api/kegiatan/${id}`, {
          judul: v.judul.trim(),
          jenis: atauNull(v.jenis),
          mulai,
          selesai,
          lokasi: v.lokasi.trim()
            ? { nama: v.lokasi.trim(), ...(atauUndef(v.pulau) ? { pulau: v.pulau.trim() } : {}) }
            : null,
          penyelenggara: atauNull(v.penyelenggara),
          picProtokolId: atauNull(v.picProtokolId),
          picPengundang:
            v.picNama.trim() || v.picKontak.trim()
              ? {
                  ...(atauUndef(v.picNama) ? { nama: v.picNama.trim() } : {}),
                  ...(atauUndef(v.picKontak) ? { kontak: v.picKontak.trim() } : {}),
                }
              : null,
          tautanRapat: atauNull(v.tautanRapat),
          catatan: atauNull(v.catatan),
        });
      } else {
        const baru = await api.post<Kegiatan>('/api/kegiatan', {
          judul: v.judul.trim(),
          ...(atauUndef(v.jenis) ? { jenis: v.jenis.trim() } : {}),
          mulai,
          ...(selesai ? { selesai } : {}),
          ...(atauUndef(v.lokasi)
            ? {
                lokasi: {
                  nama: v.lokasi.trim(),
                  ...(atauUndef(v.pulau) ? { pulau: v.pulau.trim() } : {}),
                },
              }
            : {}),
          ...(atauUndef(v.penyelenggara) ? { penyelenggara: v.penyelenggara.trim() } : {}),
          ...(atauUndef(v.picProtokolId) ? { picProtokolId: v.picProtokolId } : {}),
          ...(atauUndef(v.picNama) || atauUndef(v.picKontak)
            ? {
                picPengundang: {
                  ...(atauUndef(v.picNama) ? { nama: v.picNama.trim() } : {}),
                  ...(atauUndef(v.picKontak) ? { kontak: v.picKontak.trim() } : {}),
                },
              }
            : {}),
          ...(atauUndef(v.tautanRapat) ? { tautanRapat: v.tautanRapat.trim() } : {}),
          ...(atauUndef(v.catatan) ? { catatan: v.catatan.trim() } : {}),
          ...(v.pihak.length > 0
            ? { pihak: v.pihak.map((pihakId) => ({ pihakId, kedudukan: 'diundang' })) }
            : {}),
        });
        tujuan = baru.id;
        if (berkas) {
          try {
            await unggah<Lampiran>(`/api/kegiatan/${baru.id}/lampiran`, berkas);
          } catch (err) {
            // Undangan sudah tersimpan; lampiran dapat ditambahkan lagi dari rincian.
            setGalat(err);
            setSedang(false);
            void navigasi(`/kegiatan/${baru.id}`, { replace: true });
            return;
          }
        }
      }
      void navigasi(`/kegiatan/${tujuan}`, { replace: true });
    } catch (err) {
      setGalat(err);
      setSedang(false);
    }
  };

  return (
    <>
      <h1 className="judul-halaman">{ubah ? TEKS_UI.form.judulUbah : TEKS_UI.form.judulBaru}</h1>
      <form className="kartu form" onSubmit={(e) => void kirim(e)} noValidate>
        <Medan id="f-judul" label={TEKS_UI.form.judul} wajib>
          <input id="f-judul" className="isian" required {...isi('judul')} />
        </Medan>
        <Medan id="f-jenis" label={TEKS_UI.form.jenis}>
          <input id="f-jenis" className="isian" {...isi('jenis')} />
        </Medan>
        <Medan id="f-tanggal" label={TEKS_UI.form.tanggal} wajib>
          <input id="f-tanggal" className="isian" type="date" required {...isi('tanggal')} />
        </Medan>
        <Medan id="f-mulai" label={TEKS_UI.form.jamMulai} wajib>
          <input id="f-mulai" className="isian" type="time" required {...isi('jamMulai')} />
        </Medan>
        <Medan id="f-selesai" label={TEKS_UI.form.jamSelesai}>
          <input id="f-selesai" className="isian" type="time" {...isi('jamSelesai')} />
          {salahWaktu && (
            <p className="pesan-galat" role="alert">
              {TEKS_UI.form.selesaiSebelumMulai}
            </p>
          )}
        </Medan>
        <Medan id="f-lokasi" label={TEKS_UI.form.lokasi}>
          <input id="f-lokasi" className="isian" {...isi('lokasi')} />
        </Medan>
        <Medan id="f-pulau" label={TEKS_UI.form.pulau}>
          <input id="f-pulau" className="isian" {...isi('pulau')} />
        </Medan>
        <Medan id="f-penyelenggara" label={TEKS_UI.form.penyelenggara}>
          <input id="f-penyelenggara" className="isian" {...isi('penyelenggara')} />
        </Medan>
        {petugas.length > 0 && (
          <Medan id="f-pic" label={TEKS_UI.form.picProtokol}>
            <select id="f-pic" className="pilihan" {...isi('picProtokolId')}>
              <option value="">{TEKS_UI.form.tanpaPic}</option>
              {petugas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama}
                </option>
              ))}
            </select>
          </Medan>
        )}
        <Medan id="f-pic-nama" label={TEKS_UI.form.picPengundangNama}>
          <input id="f-pic-nama" className="isian" {...isi('picNama')} />
        </Medan>
        <Medan id="f-pic-kontak" label={TEKS_UI.form.picPengundangKontak}>
          <input id="f-pic-kontak" className="isian" inputMode="tel" {...isi('picKontak')} />
        </Medan>
        <Medan id="f-tautan" label={TEKS_UI.form.tautanRapat}>
          <input
            id="f-tautan"
            className="isian"
            type="url"
            inputMode="url"
            {...isi('tautanRapat')}
          />
        </Medan>
        <Medan id="f-catatan" label={TEKS_UI.form.catatan}>
          <textarea id="f-catatan" className="isian" rows={3} {...isi('catatan')} />
        </Medan>

        {!ubah && diundang.length > 0 && (
          <fieldset className="kelompok-radio">
            <legend className="judul-kecil">{TEKS_UI.form.pihakDiundang}</legend>
            {diundang.map((p) => (
              <label key={p.id} className="radio">
                <input
                  type="checkbox"
                  checked={v.pihak.includes(p.id)}
                  onChange={(e) =>
                    setV((x) => ({
                      ...x,
                      pihak: e.target.checked
                        ? [...x.pihak, p.id]
                        : x.pihak.filter((i) => i !== p.id),
                    }))
                  }
                />
                <span>{p.nama}</span>
              </label>
            ))}
          </fieldset>
        )}
        {ubah && <p className="teks-pendukung">{TEKS_UI.form.pihakCatatan}</p>}

        {!ubah && punya('lampiran.unggah') && (
          <div className="medan">
            <p className="judul-kecil">{TEKS_UI.form.lampiranAwal}</p>
            <PilihBerkas berkas={berkas} onPilih={setBerkas} />
          </div>
        )}

        <PesanGalat galat={galat} />
        <div className="aksi-baris">
          <button type="submit" className="tombol" disabled={sedang || !siap}>
            {sedang ? TEKS_UI.tindakan.menyimpan : TEKS_UI.tindakan.simpan}
          </button>
          <button
            type="button"
            className="tombol tombol-sekunder"
            onClick={() => void navigasi(-1)}
          >
            {TEKS_UI.tindakan.batal}
          </button>
        </div>
      </form>
    </>
  );
}
