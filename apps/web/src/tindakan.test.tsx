import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';
import type { Bentrok, Kegiatan, Pejabat, Profil } from './api/tipe';
import { periksaBerkas, penggantiSibuk } from './komponen/tindakan';
import { TEKS_UI } from './teks-ui';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const profilKabag: Profil = {
  username: 'demo.kabag-protokol',
  nama: 'Kabag Protokol (CONTOH)',
  peran: 'kabag_protokol',
  pejabatId: null,
  izin: [
    'kegiatan.baca_semua',
    'kegiatan.buat',
    'kegiatan.ubah',
    'kegiatan.pindah_status',
    'pihak.kelola',
    'bentrok.baca',
    'pejabat.baca',
    'lampiran.baca',
    'lampiran.unggah',
  ],
  mode: 'demo',
  sebagaiPersona: false,
  akunAsli: null,
};
const profilPejabat: Profil = {
  username: 'demo.kadis-pangan',
  nama: 'Kepala Dinas Pangan (CONTOH)',
  peran: 'pejabat',
  pejabatId: 'kadis-pangan',
  izin: ['kegiatan.baca_terkait', 'pihak.konfirmasi_sendiri', 'lampiran.baca'],
  mode: 'demo',
  sebagaiPersona: false,
  akunAsli: null,
};
const profilAdmin: Profil = {
  ...profilKabag,
  username: 'admin.owner',
  nama: 'Administrator Owner (CONTOH)',
  peran: 'admin',
  izin: [...profilKabag.izin, 'pengaturan.baca', 'pengaturan.ubah', 'audit.baca'],
};

const direktori: Pejabat[] = [
  {
    id: 'gubernur',
    nama: 'Gubernur (CONTOH)',
    golongan: 'pimpinan',
    jabatan: null,
    instansi: null,
    urutanTataTempat: 1,
    isContoh: true,
  },
  {
    id: 'kadis-pangan',
    nama: 'Kepala Dinas Pangan (CONTOH)',
    golongan: 'pejabat',
    jabatan: null,
    instansi: null,
    urutanTataTempat: 2,
    isContoh: true,
  },
  {
    id: 'kadis-pendidikan',
    nama: 'Kepala Dinas Pendidikan (CONTOH)',
    golongan: 'pejabat',
    jabatan: null,
    instansi: null,
    urutanTataTempat: 3,
    isContoh: true,
  },
  {
    id: 'petugas-protokol-01',
    nama: 'Petugas Protokol 01 (CONTOH)',
    golongan: 'petugas',
    jabatan: null,
    instansi: null,
    urutanTataTempat: 4,
    isContoh: true,
  },
];

const kegiatan = (
  id: string,
  mulai: string,
  pihak: Kegiatan['pihak'],
  status: Kegiatan['status'] = 'menunggu_arahan',
): Kegiatan => ({
  id,
  judul: `Kegiatan ${id} CONTOH`,
  jenis: null,
  mulai,
  selesai: null,
  lokasi: { nama: 'Lokasi Contoh A', pulau: 'Ternate' },
  status,
  penyelenggara: null,
  picProtokolId: null,
  picPengundang: null,
  tautanRapat: null,
  catatan: null,
  isContoh: true,
  pihak,
  dibuat: mulai,
  diubah: mulai,
});
const gub = (kedudukan: Kegiatan['pihak'][number]['kedudukan']): Kegiatan['pihak'][number] => ({
  id: 'gubernur',
  nama: 'Gubernur (CONTOH)',
  golongan: 'pimpinan',
  kedudukan,
  peran: null,
});
const KA = kegiatan('KA', '2026-10-26T08:00:00+09:00', [gub('diundang')]);
const KB = kegiatan('KB', '2026-10-26T08:30:00+09:00', [
  {
    id: 'kadis-pangan',
    nama: 'Kepala Dinas Pangan (CONTOH)',
    golongan: 'pejabat',
    kedudukan: 'diterima',
    peran: null,
  },
]);
const bentrokPasti: Bentrok = {
  pihakId: 'gubernur',
  pihakNama: 'Gubernur (CONTOH)',
  golongan: 'pimpinan',
  jenis: 'langsung',
  kepastian: 'pasti',
  kegiatanA: 'KA',
  kegiatanB: 'KC',
  irisan: { mulai: '2026-10-26T08:00:00+09:00', selesai: '2026-10-26T10:00:00+09:00' },
};

const esc = (t: string) => (isi: string) => isi.startsWith(t);

type Panggilan = { metode: string; url: string; badan?: unknown };
function pasangApi(rute: Record<string, unknown | (() => Response)>): Panggilan[] {
  const panggilan: Panggilan[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string, init?: RequestInit) => {
      const metode = init?.method ?? 'GET';
      panggilan.push({
        metode,
        url,
        badan: typeof init?.body === 'string' ? JSON.parse(init.body) : init?.body,
      });
      const isi = rute[`${metode} ${url.split('?')[0]}`];
      if (isi === undefined) {
        return Promise.resolve(
          new Response(JSON.stringify({ galat: { kode: 'tidak_ada', pesan: 'Tidak ada' } }), {
            status: 404,
          }),
        );
      }
      if (typeof isi === 'function') return Promise.resolve((isi as () => Response)());
      return Promise.resolve(new Response(JSON.stringify(isi), { status: 200 }));
    }),
  );
  return panggilan;
}

const tampil = (url: string) =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <App mode="demo" />
    </MemoryRouter>,
  );

const ruteRincian = (
  profil: Profil,
  k: Kegiatan,
  lain: Kegiatan[] = [],
  bentrok: Bentrok[] = [],
) => ({
  'GET /api/saya': profil,
  [`GET /api/kegiatan/${k.id}`]: k,
  'GET /api/kegiatan': [k, ...lain],
  'GET /api/bentrok': bentrok,
  'GET /api/pejabat': direktori,
  [`GET /api/kegiatan/${k.id}/lampiran`]: [],
  'GET /api/audit': [],
});

describe('KB-047 dan KB-005: keputusan kehadiran dari ponsel', () => {
  it('KB-047: wakilkan mengirim satu permintaan atomik dengan pengganti dan memuat ulang', async () => {
    const panggilan = pasangApi({
      ...ruteRincian(profilKabag, KA, [KB]),
      'POST /api/kegiatan/KA/keputusan-kehadiran': {
        kegiatan: KA,
        peristiwa: null,
        peringatan: [],
      },
    });
    tampil('/kegiatan/KA');
    fireEvent.click(await screen.findByRole('button', { name: /Putuskan kehadiran: Gubernur/ }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    fireEvent.click(screen.getByLabelText(TEKS_UI.keputusan.wakilkan));
    const kirim = screen.getByRole('button', {
      name: TEKS_UI.keputusan.kirim,
    }) as HTMLButtonElement;
    expect(kirim.disabled).toBe(true);
    fireEvent.change(screen.getByLabelText(TEKS_UI.keputusan.pilihPengganti), {
      target: { value: 'kadis-pangan' },
    });
    // Kepala Dinas Pangan sudah diterima pada KB (08.30 WIT, beririsan) -> peringatan sibuk
    expect(
      await screen.findByText(TEKS_UI.keputusan.penggantiSibuk('Kepala Dinas Pangan (CONTOH)')),
    ).toBeTruthy();
    expect(kirim.disabled).toBe(false);
    fireEvent.click(kirim);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    const post = panggilan.find((p) => p.metode === 'POST');
    expect(post?.url).toBe('/api/kegiatan/KA/keputusan-kehadiran');
    expect(post?.badan).toEqual({
      pimpinanId: 'gubernur',
      keputusan: 'wakilkan',
      penggantiId: 'kadis-pangan',
    });
  });

  it('KB-047: tunda wajib beralasan sebelum dapat dikirim', async () => {
    const panggilan = pasangApi({
      ...ruteRincian(profilKabag, KA),
      'POST /api/kegiatan/KA/keputusan-kehadiran': {
        kegiatan: KA,
        peristiwa: null,
        peringatan: [],
      },
    });
    tampil('/kegiatan/KA');
    fireEvent.click(await screen.findByRole('button', { name: /Putuskan kehadiran: Gubernur/ }));
    await screen.findByRole('dialog');
    fireEvent.click(screen.getByLabelText(TEKS_UI.keputusan.tunda));
    const kirim = screen.getByRole('button', {
      name: TEKS_UI.keputusan.kirim,
    }) as HTMLButtonElement;
    expect(kirim.disabled).toBe(true);
    fireEvent.change(screen.getByLabelText(TEKS_UI.keputusan.alasanTunda), {
      target: { value: 'Menunggu kepastian tamu' },
    });
    expect(kirim.disabled).toBe(false);
    fireEvent.click(kirim);
    await waitFor(() => expect(panggilan.some((p) => p.metode === 'POST')).toBe(true));
    expect(panggilan.find((p) => p.metode === 'POST')?.badan).toEqual({
      pimpinanId: 'gubernur',
      keputusan: 'tunda',
      alasan: 'Menunggu kepastian tamu',
    });
  });

  it('KB-038 dan KB-047: menetapkan saat ada bentrok pasti mewajibkan alasan bentrok', async () => {
    pasangApi({
      ...ruteRincian(profilKabag, KA, [], [bentrokPasti]),
      'POST /api/kegiatan/KA/keputusan-kehadiran': {
        kegiatan: KA,
        peristiwa: null,
        peringatan: [],
      },
    });
    tampil('/kegiatan/KA');
    fireEvent.click(await screen.findByRole('button', { name: /Putuskan kehadiran: Gubernur/ }));
    await screen.findByRole('dialog');
    fireEvent.click(screen.getByLabelText(TEKS_UI.keputusan.tetapkan));
    const kirim = screen.getByRole('button', {
      name: TEKS_UI.keputusan.kirim,
    }) as HTMLButtonElement;
    expect(kirim.disabled).toBe(true);
    fireEvent.change(screen.getByLabelText(TEKS_UI.keputusan.alasanBentrok), {
      target: { value: 'Atas arahan pimpinan' },
    });
    expect(kirim.disabled).toBe(false);
  });

  it('KB-047: penolakan aturan (422) menampilkan rincian dan lembar tetap terbuka', async () => {
    pasangApi({
      ...ruteRincian(profilKabag, KA),
      'POST /api/kegiatan/KA/keputusan-kehadiran': () =>
        new Response(
          JSON.stringify({
            galat: {
              kode: 'ditolak_aturan',
              pesan: 'Keputusan ditolak; tidak ada perubahan yang tersimpan.',
              rincian: [{ jalur: 'keputusan', pesan: 'Tetapkan minimal satu pihak yang hadir.' }],
            },
          }),
          { status: 422 },
        ),
    });
    tampil('/kegiatan/KA');
    fireEvent.click(await screen.findByRole('button', { name: /Putuskan kehadiran: Gubernur/ }));
    await screen.findByRole('dialog');
    fireEvent.click(screen.getByRole('button', { name: TEKS_UI.keputusan.kirim }));
    expect(await screen.findByText('Tetapkan minimal satu pihak yang hadir.')).toBeTruthy();
    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  it('KB-021: pejabat tanpa izin tidak melihat panel keputusan, status, maupun tombol ubah', async () => {
    const pj = kegiatan('KP', '2026-10-26T08:00:00+09:00', [
      {
        id: 'kadis-pangan',
        nama: 'Kepala Dinas Pangan (CONTOH)',
        golongan: 'pejabat',
        kedudukan: 'diundang',
        peran: null,
      },
    ]);
    pasangApi({
      'GET /api/saya': profilPejabat,
      'GET /api/kegiatan/KP': pj,
      'GET /api/kegiatan/KP/lampiran': [],
    });
    tampil('/kegiatan/KP');
    await screen.findByRole('heading', { level: 1, name: pj.judul });
    expect(screen.queryByText(TEKS_UI.keputusan.judul)).toBeNull();
    expect(screen.queryByText(TEKS_UI.status.judul)).toBeNull();
    expect(screen.queryByText(TEKS_UI.form.ubah)).toBeNull();
  });
});

describe('KB-013: pejabat menerima atau menolak penugasan', () => {
  const tugas = kegiatan('KT', '2026-10-27T09:00:00+09:00', [
    {
      id: 'kadis-pangan',
      nama: 'Kepala Dinas Pangan (CONTOH)',
      golongan: 'pejabat',
      kedudukan: 'ditugaskan',
      peran: 'mewakili',
    },
  ]);

  it('KB-013: menerima penugasan mengirim PUT kedudukan diterima untuk dirinya sendiri', async () => {
    const panggilan = pasangApi({
      'GET /api/saya': profilPejabat,
      'GET /api/kegiatan/KT': tugas,
      'GET /api/kegiatan/KT/lampiran': [],
      'PUT /api/kegiatan/KT/pihak/kadis-pangan': tugas,
    });
    tampil('/kegiatan/KT');
    fireEvent.click(await screen.findByRole('button', { name: TEKS_UI.konfirmasi.terima }));
    await waitFor(() => expect(panggilan.some((p) => p.metode === 'PUT')).toBe(true));
    const put = panggilan.find((p) => p.metode === 'PUT');
    expect(put?.url).toBe('/api/kegiatan/KT/pihak/kadis-pangan');
    expect(put?.badan).toEqual({ kedudukan: 'diterima' });
  });

  it('KB-013: menolak penugasan mengirim kedudukan ditolak', async () => {
    const panggilan = pasangApi({
      'GET /api/saya': profilPejabat,
      'GET /api/kegiatan/KT': tugas,
      'GET /api/kegiatan/KT/lampiran': [],
      'PUT /api/kegiatan/KT/pihak/kadis-pangan': tugas,
    });
    tampil('/kegiatan/KT');
    fireEvent.click(await screen.findByRole('button', { name: TEKS_UI.konfirmasi.tolak }));
    await waitFor(() => expect(panggilan.some((p) => p.metode === 'PUT')).toBe(true));
    expect(panggilan.find((p) => p.metode === 'PUT')?.badan).toEqual({ kedudukan: 'ditolak' });
  });
});

describe('KB-004 dan KB-016: pindah status dari antarmuka', () => {
  it('KB-004: hanya perpindahan sah yang ditawarkan; membatalkan wajib beralasan', async () => {
    const panggilan = pasangApi({
      ...ruteRincian(profilKabag, KA),
      'POST /api/kegiatan/KA/pindah-status': {},
    });
    tampil('/kegiatan/KA');
    await screen.findByRole('heading', { name: TEKS_UI.status.judul });
    // dari Menunggu Arahan: Ditetapkan, Ditunda, Dibatalkan (bukan Terkonfirmasi)
    expect(screen.getByRole('button', { name: TEKS_UI.status.ke('Ditetapkan') })).toBeTruthy();
    expect(screen.queryByRole('button', { name: TEKS_UI.status.ke('Terkonfirmasi') })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: TEKS_UI.status.ke('Dibatalkan') }));
    const konfirmasi = (await screen.findByRole('button', {
      name: TEKS_UI.status.konfirmasi,
    })) as HTMLButtonElement;
    expect(konfirmasi.disabled).toBe(true);
    fireEvent.change(screen.getByLabelText(TEKS_UI.status.alasan), {
      target: { value: 'Acara dibatalkan penyelenggara' },
    });
    fireEvent.click(konfirmasi);
    await waitFor(() => expect(panggilan.some((p) => p.metode === 'POST')).toBe(true));
    expect(panggilan.find((p) => p.metode === 'POST')?.badan).toEqual({
      ke: 'dibatalkan',
      alasan: 'Acara dibatalkan penyelenggara',
    });
  });

  it('KB-004: status akhir menampilkan keterangan terkunci tanpa tombol', async () => {
    const selesai = kegiatan('KS', '2026-10-26T08:00:00+09:00', [gub('diterima')], 'selesai');
    pasangApi(ruteRincian(profilKabag, selesai));
    tampil('/kegiatan/KS');
    expect(await screen.findByText(TEKS_UI.status.terkunci)).toBeTruthy();
  });
});

describe('KB-001 dan KB-003: form undangan', () => {
  it('KB-001: membuat undangan mengirim waktu WIT dan pihak, lalu membuka rincian', async () => {
    const baru = kegiatan('KN', '2026-10-30T09:00:00+09:00', [gub('diundang')], 'baru');
    const panggilan = pasangApi({
      'GET /api/saya': profilKabag,
      'GET /api/pejabat': direktori,
      'POST /api/kegiatan': baru,
      'GET /api/kegiatan/KN': baru,
      'GET /api/kegiatan': [baru],
      'GET /api/bentrok': [],
      'GET /api/kegiatan/KN/lampiran': [],
    });
    tampil('/kegiatan/baru');
    fireEvent.change(await screen.findByLabelText(esc(TEKS_UI.form.judul)), {
      target: { value: 'Pembukaan Uji CONTOH' },
    });
    fireEvent.change(screen.getByLabelText(esc(TEKS_UI.form.tanggal)), {
      target: { value: '2026-10-30' },
    });
    fireEvent.change(screen.getByLabelText(esc(TEKS_UI.form.jamMulai)), {
      target: { value: '09:00' },
    });
    fireEvent.change(screen.getByLabelText(TEKS_UI.form.lokasi), {
      target: { value: 'Lokasi Contoh Z' },
    });
    fireEvent.change(screen.getByLabelText(TEKS_UI.form.picProtokol), {
      target: { value: 'petugas-protokol-01' },
    });
    fireEvent.change(screen.getByLabelText(TEKS_UI.form.picPengundangKontak), {
      target: { value: '0800-000-0001' },
    });
    fireEvent.click(await screen.findByLabelText('Gubernur (CONTOH)'));
    fireEvent.click(screen.getByRole('button', { name: TEKS_UI.tindakan.simpan }));
    expect(await screen.findByRole('heading', { level: 1, name: baru.judul })).toBeTruthy();
    expect(panggilan.find((p) => p.metode === 'POST')?.badan).toEqual({
      judul: 'Pembukaan Uji CONTOH',
      mulai: '2026-10-30T09:00:00+09:00',
      lokasi: { nama: 'Lokasi Contoh Z' },
      picProtokolId: 'petugas-protokol-01',
      picPengundang: { kontak: '0800-000-0001' },
      pihak: [{ pihakId: 'gubernur', kedudukan: 'diundang' }],
    });
  });

  it('KB-001: jam selesai sebelum jam mulai ditolak di perangkat tanpa memanggil API', async () => {
    const panggilan = pasangApi({ 'GET /api/saya': profilKabag, 'GET /api/pejabat': direktori });
    tampil('/kegiatan/baru');
    fireEvent.change(await screen.findByLabelText(esc(TEKS_UI.form.judul)), {
      target: { value: 'Uji CONTOH' },
    });
    fireEvent.change(screen.getByLabelText(esc(TEKS_UI.form.jamMulai)), {
      target: { value: '10:00' },
    });
    fireEvent.change(screen.getByLabelText(esc(TEKS_UI.form.jamSelesai)), {
      target: { value: '09:00' },
    });
    fireEvent.click(screen.getByRole('button', { name: TEKS_UI.tindakan.simpan }));
    expect((await screen.findByRole('alert')).textContent).toBe(TEKS_UI.form.selesaiSebelumMulai);
    expect(panggilan.some((p) => p.metode === 'POST')).toBe(false);
  });

  it('KB-001: mengubah kegiatan mengisi form dari data dan mengirim PATCH', async () => {
    const panggilan = pasangApi({
      'GET /api/saya': profilKabag,
      'GET /api/pejabat': direktori,
      'GET /api/kegiatan/KA': KA,
      'PATCH /api/kegiatan/KA': KA,
      'GET /api/kegiatan': [KA],
      'GET /api/bentrok': [],
      'GET /api/kegiatan/KA/lampiran': [],
      'GET /api/audit': [],
    });
    tampil('/kegiatan/KA/ubah');
    const judul = (await screen.findByDisplayValue(KA.judul)) as HTMLInputElement;
    expect((screen.getByLabelText(esc(TEKS_UI.form.jamMulai)) as HTMLInputElement).value).toBe(
      '08:00',
    );
    fireEvent.change(judul, { target: { value: 'Judul Baru CONTOH' } });
    fireEvent.click(screen.getByRole('button', { name: TEKS_UI.tindakan.simpan }));
    await waitFor(() => expect(panggilan.some((p) => p.metode === 'PATCH')).toBe(true));
    expect(panggilan.find((p) => p.metode === 'PATCH')?.badan).toMatchObject({
      judul: 'Judul Baru CONTOH',
      mulai: '2026-10-26T08:00:00+09:00',
      selesai: null,
    });
  });

  it('KB-021: rute form dialihkan bagi peran tanpa izin membuat kegiatan', async () => {
    pasangApi({ 'GET /api/saya': profilPejabat, 'GET /api/kegiatan': [] });
    tampil('/kegiatan/baru');
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: TEKS_UI.beranda.salam(profilPejabat.nama),
      }),
    ).toBeTruthy();
  });
});

describe('KB-002: lampiran dari kamera atau galeri', () => {
  it('KB-002: jenis dan ukuran diperiksa di perangkat sebelum unggah', () => {
    const pdf = new File(['x'], 'undangan.pdf', { type: 'application/pdf' });
    const teks = new File(['x'], 'catatan.txt', { type: 'text/plain' });
    const besar = new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'besar.png', {
      type: 'image/png',
    });
    expect(periksaBerkas(pdf)).toBeNull();
    expect(periksaBerkas(teks)).toBe(TEKS_UI.lampiran.tipeTidak);
    expect(periksaBerkas(besar)).toBe(TEKS_UI.lampiran.terlaluBesar);
  });

  it('KB-002: berkas terpilih diunggah sebagai multipart kolom "berkas"', async () => {
    const panggilan = pasangApi({
      ...ruteRincian(profilKabag, KA),
      'POST /api/kegiatan/KA/lampiran': () =>
        new Response(JSON.stringify({ id: 'L1' }), { status: 201 }),
    });
    tampil('/kegiatan/KA');
    const input = (await screen.findByLabelText(TEKS_UI.lampiran.pilihBerkas, {
      selector: 'input',
    })) as HTMLInputElement;
    const berkas = new File(['%PDF-1.4'], 'undangan.pdf', { type: 'application/pdf' });
    fireEvent.change(input, { target: { files: [berkas] } });
    fireEvent.click(await screen.findByRole('button', { name: TEKS_UI.lampiran.unggah }));
    await waitFor(() =>
      expect(
        panggilan.some((p) => p.metode === 'POST' && p.url === '/api/kegiatan/KA/lampiran'),
      ).toBe(true),
    );
    const isi = panggilan.find((p) => p.metode === 'POST' && p.url === '/api/kegiatan/KA/lampiran')
      ?.badan as FormData;
    expect(isi).toBeInstanceOf(FormData);
    expect((isi.get('berkas') as File).name).toBe('undangan.pdf');
  });
});

describe('KB-036 dan KB-016: pengaturan dan log audit', () => {
  it('KB-036: admin mengubah durasi bawaan lewat PUT', async () => {
    const panggilan = pasangApi({
      'GET /api/saya': profilAdmin,
      'GET /api/pengaturan': [{ kunci: 'durasiBawaanMenit', nilai: 120 }],
      'PUT /api/pengaturan/durasiBawaanMenit': { kunci: 'durasiBawaanMenit', nilai: 90 },
      'GET /api/kegiatan': [],
      'GET /api/bentrok': [],
    });
    tampil('/pengaturan');
    const isian = (await screen.findByDisplayValue('120')) as HTMLInputElement;
    fireEvent.change(isian, { target: { value: '90' } });
    fireEvent.click(screen.getByRole('button', { name: TEKS_UI.tindakan.simpan }));
    expect(await screen.findByText(TEKS_UI.tindakan.berhasil)).toBeTruthy();
    expect(panggilan.find((p) => p.metode === 'PUT')?.badan).toEqual({ nilai: 90 });
  });

  it('KB-036: pembaca saja (kepala biro) melihat pengaturan tanpa tombol simpan', async () => {
    pasangApi({
      'GET /api/saya': {
        ...profilAdmin,
        peran: 'kepala_biro',
        izin: ['pengaturan.baca', 'audit.baca'],
      },
      'GET /api/pengaturan': [{ kunci: 'durasiBawaanMenit', nilai: 120 }],
    });
    tampil('/pengaturan');
    await screen.findByDisplayValue('120');
    expect(screen.queryByRole('button', { name: TEKS_UI.tindakan.simpan })).toBeNull();
    expect(screen.getByText(TEKS_UI.pengaturan.hanyaBaca)).toBeTruthy();
  });

  it('KB-016: log audit menampilkan aksi berlabel Indonesia, pelaku, dan alasan', async () => {
    pasangApi({
      'GET /api/saya': profilAdmin,
      'GET /api/audit': [
        {
          id: 1,
          waktu: '2026-10-24T20:00:00+09:00',
          aktor: 'demo.gubernur',
          aktorPeran: 'pimpinan',
          aksi: 'kegiatan.keputusan_kehadiran',
          entitas: 'kegiatan',
          entitasId: 'KA',
          sebelum: null,
          sesudah: null,
          alasan: 'Menunggu kepastian tamu',
          reqId: null,
          ip: null,
        },
      ],
      'GET /api/kegiatan': [],
      'GET /api/bentrok': [],
    });
    tampil('/audit');
    expect(await screen.findByText('Keputusan kehadiran')).toBeTruthy();
    expect(screen.getByText(/demo\.gubernur/)).toBeTruthy();
    expect(screen.getByText('Menunggu kepastian tamu')).toBeTruthy();
  });

  it('KB-021: navigasi memuat Lainnya hanya bagi peran yang berhak', async () => {
    pasangApi({
      'GET /api/saya': profilAdmin,
      'GET /api/kegiatan': [],
      'GET /api/bentrok': [],
      'GET /api/demo/persona': [],
    });
    tampil('/');
    const nav = await screen.findByRole('navigation', { name: TEKS_UI.navigasi.label });
    expect(nav.textContent).toContain(TEKS_UI.navigasi.lainnya);
    cleanup();
    pasangApi({ 'GET /api/saya': profilPejabat, 'GET /api/kegiatan': [] });
    tampil('/');
    const nav2 = await screen.findByRole('navigation', { name: TEKS_UI.navigasi.label });
    expect(nav2.textContent).not.toContain(TEKS_UI.navigasi.lainnya);
  });
});

describe('KB-047: peringatan pengganti sibuk', () => {
  it('KB-047: pengganti dengan kegiatan beririsan dianggap sibuk; tanpa irisan atau dibatalkan tidak', () => {
    expect(penggantiSibuk('kadis-pangan', KA, [KA, KB])).toBe(true);
    const jauh = kegiatan('KJ', '2026-10-26T15:00:00+09:00', KB.pihak);
    expect(penggantiSibuk('kadis-pangan', KA, [KA, jauh])).toBe(false);
    const batal = kegiatan('KX', '2026-10-26T08:30:00+09:00', KB.pihak, 'dibatalkan');
    expect(penggantiSibuk('kadis-pangan', KA, [KA, batal])).toBe(false);
  });
});
