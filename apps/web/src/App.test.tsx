import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';
import type { Bentrok, Kegiatan, Profil } from './api/tipe';
import { TEKS_UI } from './teks-ui';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const profilAdmin: Profil = {
  username: 'admin.owner',
  nama: 'Administrator Owner (CONTOH)',
  peran: 'admin',
  pejabatId: null,
  izin: [
    'kegiatan.baca_semua',
    'bentrok.baca',
    'lampiran.baca',
    'audit.baca',
    'demo.pindah_persona',
  ],
  mode: 'demo',
  sebagaiPersona: false,
  akunAsli: null,
};
const profilPejabat: Profil = {
  username: 'demo.kadis-pendidikan',
  nama: 'Kepala Dinas Pendidikan (CONTOH)',
  peran: 'pejabat',
  pejabatId: 'kadis-pendidikan',
  izin: ['kegiatan.baca_terkait', 'pihak.konfirmasi_sendiri', 'lampiran.baca'],
  mode: 'demo',
  sebagaiPersona: false,
  akunAsli: null,
};

const kegiatan = (
  id: string,
  judul: string,
  status: Kegiatan['status'],
  mulai: string,
): Kegiatan => ({
  id,
  judul,
  jenis: null,
  mulai,
  selesai: null,
  lokasi: { nama: 'Lokasi Contoh A', pulau: 'Halmahera' },
  status,
  penyelenggara: null,
  picProtokolId: null,
  picPengundang: null,
  tautanRapat: null,
  catatan: null,
  isContoh: true,
  pihak: [
    {
      id: 'kadis-pendidikan',
      nama: 'Kepala Dinas Pendidikan (CONTOH)',
      golongan: 'pejabat',
      kedudukan: 'ditugaskan',
      peran: null,
    },
  ],
  dibuat: mulai,
  diubah: mulai,
});

const K1 = kegiatan('K1', 'Upacara Contoh', 'terkonfirmasi', '2026-10-26T08:00:00+09:00');
const K2 = kegiatan('K2', 'Rapat Contoh', 'menunggu_arahan', '2026-10-26T08:30:00+09:00');
const bentrok: Bentrok = {
  pihakId: 'kadis-pendidikan',
  pihakNama: 'Kepala Dinas Pendidikan (CONTOH)',
  golongan: 'pejabat',
  jenis: 'langsung',
  kepastian: 'pasti',
  kegiatanA: 'K1',
  kegiatanB: 'K2',
  irisan: { mulai: '2026-10-26T08:30:00+09:00', selesai: '2026-10-26T10:00:00+09:00' },
};

/** fetch tiruan berbasis tabel jalur; jalur tak dikenal = 404. */
function pasangApi(rute: Record<string, unknown | (() => Response)>) {
  const panggilan: { metode: string; url: string; badan?: unknown }[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string, init?: RequestInit) => {
      const metode = init?.method ?? 'GET';
      panggilan.push({
        metode,
        url,
        badan: typeof init?.body === 'string' ? JSON.parse(init.body) : undefined,
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
      if (isi === null) return Promise.resolve(new Response(null, { status: 204 }));
      return Promise.resolve(new Response(JSON.stringify(isi), { status: 200 }));
    }),
  );
  return panggilan;
}

const tanpaSesi = () =>
  new Response(JSON.stringify({ galat: { kode: 'belum_masuk', pesan: 'Belum masuk' } }), {
    status: 401,
  });

const tampil = (url = '/', mode?: 'demo' | 'production') =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <App mode={mode} />
    </MemoryRouter>,
  );

beforeEach(() => {
  document.documentElement.removeAttribute('data-theme');
});

describe('KB-033 dan KB-007: masuk dan spanduk DATA CONTOH', () => {
  it('KB-033: layar Masuk memuat spanduk pada mode demo', async () => {
    pasangApi({ 'GET /api/saya': tanpaSesi });
    tampil('/', 'demo');
    expect(await screen.findByRole('heading', { name: TEKS_UI.masuk.judul })).toBeTruthy();
    expect(screen.getByText(TEKS_UI.spandukContoh)).toBeTruthy();
  });

  it('KB-033: tidak ada spanduk pada mode production', async () => {
    pasangApi({ 'GET /api/saya': tanpaSesi });
    tampil('/', 'production');
    await screen.findByRole('heading', { name: TEKS_UI.masuk.judul });
    expect(screen.queryByText(TEKS_UI.spandukContoh)).toBeNull();
  });

  it('KB-007: masuk berhasil membuka Beranda; sandi salah menampilkan pesan jelas', async () => {
    let masuk = false;
    pasangApi({
      'GET /api/saya': () => (masuk ? new Response(JSON.stringify(profilAdmin)) : tanpaSesi()),
      'POST /api/sesi': () => {
        masuk = true;
        return new Response(JSON.stringify(profilAdmin));
      },
      'GET /api/kegiatan': [],
      'GET /api/bentrok': [],
      'GET /api/demo/persona': [],
    });
    tampil('/', 'demo');
    fireEvent.change(await screen.findByLabelText(TEKS_UI.masuk.namaPengguna), {
      target: { value: 'admin.owner' },
    });
    fireEvent.change(screen.getByLabelText(TEKS_UI.masuk.kataSandi), {
      target: { value: 'sandi-uji' },
    });
    fireEvent.click(screen.getByRole('button', { name: TEKS_UI.masuk.tombol }));
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: TEKS_UI.beranda.salam(profilAdmin.nama),
      }),
    ).toBeTruthy();
  });

  it('KB-007: galat 401 saat masuk menampilkan pesan, bukan layar kosong', async () => {
    pasangApi({
      'GET /api/saya': tanpaSesi,
      'POST /api/sesi': () => tanpaSesi(),
    });
    tampil('/', 'demo');
    fireEvent.change(await screen.findByLabelText(TEKS_UI.masuk.namaPengguna), {
      target: { value: 'x' },
    });
    fireEvent.change(screen.getByLabelText(TEKS_UI.masuk.kataSandi), { target: { value: 'y' } });
    fireEvent.click(screen.getByRole('button', { name: TEKS_UI.masuk.tombol }));
    expect((await screen.findByRole('alert')).textContent).toBe(TEKS_UI.masuk.salah);
  });
});

describe('KB-021 dan KB-032: navigasi menurut izin dan persona demo', () => {
  it('KB-021: admin melihat Bentrok; pejabat tidak melihat Bentrok', async () => {
    pasangApi({
      'GET /api/saya': profilAdmin,
      'GET /api/kegiatan': [K1],
      'GET /api/bentrok': [],
      'GET /api/demo/persona': [],
    });
    tampil();
    const nav = await screen.findByRole('navigation', { name: TEKS_UI.navigasi.label });
    expect(nav.textContent).toContain(TEKS_UI.navigasi.bentrok);
    cleanup();

    pasangApi({ 'GET /api/saya': profilPejabat, 'GET /api/kegiatan': [K1] });
    tampil();
    const nav2 = await screen.findByRole('navigation', { name: TEKS_UI.navigasi.label });
    expect(nav2.textContent).not.toContain(TEKS_UI.navigasi.bentrok);
    expect(nav2.textContent).toContain(TEKS_UI.navigasi.agenda);
  });

  it('KB-021: rute Bentrok dialihkan ke Beranda bagi peran tanpa izin', async () => {
    pasangApi({ 'GET /api/saya': profilPejabat, 'GET /api/kegiatan': [K1] });
    tampil('/bentrok');
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: TEKS_UI.beranda.salam(profilPejabat.nama),
      }),
    ).toBeTruthy();
  });

  it('KB-032: pemilih persona hanya untuk admin pada mode demo; pita muncul saat persona aktif', async () => {
    const persona = { username: 'demo.gubernur', nama: 'Gubernur (CONTOH)', peran: 'pimpinan' };
    let aktif = false;
    const panggilan = pasangApi({
      'GET /api/saya': () =>
        new Response(
          JSON.stringify(
            aktif
              ? {
                  ...profilPejabat,
                  sebagaiPersona: true,
                  akunAsli: 'admin.owner',
                  izin: [...profilPejabat.izin, 'demo.pindah_persona'],
                }
              : profilAdmin,
          ),
        ),
      'GET /api/kegiatan': [],
      'GET /api/bentrok': [],
      'GET /api/demo/persona': [persona],
      'POST /api/demo/persona': () => {
        aktif = true;
        return new Response(JSON.stringify(persona));
      },
    });
    tampil();
    const pilih = await screen.findByLabelText(TEKS_UI.persona.label);
    await screen.findByRole('option', { name: persona.nama });
    fireEvent.change(pilih, { target: { value: 'demo.gubernur' } });
    expect(await screen.findByText(TEKS_UI.persona.kembali)).toBeTruthy();
    expect(screen.getByText(TEKS_UI.persona.aktif, { exact: false })).toBeTruthy();
    expect(panggilan.some((p) => p.metode === 'POST' && p.url === '/api/demo/persona')).toBe(true);
  });

  it('KB-032: tanpa mode demo tidak ada pemilih persona', async () => {
    pasangApi({
      'GET /api/saya': { ...profilAdmin, mode: 'production' },
      'GET /api/kegiatan': [],
      'GET /api/bentrok': [],
    });
    tampil();
    await screen.findByRole('navigation', { name: TEKS_UI.navigasi.label });
    expect(screen.queryByLabelText(TEKS_UI.persona.label)).toBeNull();
  });
});

describe('KB-006, KB-008, KB-020, KB-048: agenda, bentrok, status', () => {
  const rute = {
    'GET /api/saya': profilAdmin,
    'GET /api/kegiatan': [K1, K2],
    'GET /api/bentrok': [bentrok],
    'GET /api/demo/persona': [],
    'GET /api/kegiatan/K1': K1,
    'GET /api/kegiatan/K2': K2,
    'GET /api/kegiatan/K1/lampiran': [],
    'GET /api/audit': [],
  };

  it('KB-006 dan KB-048: agenda 26 Oktober 2026 memuat kartu berurutan dengan jam WIT dan tanggal baku', async () => {
    pasangApi(rute);
    tampil('/agenda?tanggal=2026-10-26');
    expect(
      await screen.findByRole('heading', { level: 2, name: /Senin, 26 Oktober 2026/ }),
    ).toBeTruthy();
    const kartu = await screen.findAllByRole('link', { name: /Contoh/ });
    expect(kartu).toHaveLength(2);
    expect(kartu[0]?.textContent).toContain('08.00 WIT');
    expect(kartu[0]?.textContent).toContain('Upacara Contoh');
    expect(kartu[1]?.textContent).toContain('08.30 WIT');
  });

  it('KB-020: status dan bentrok selalu berupa teks (bersama ikon), bukan warna saja', async () => {
    pasangApi(rute);
    tampil('/agenda?tanggal=2026-10-26');
    await screen.findAllByRole('link', { name: /Contoh/ });
    expect(screen.getAllByText('Terkonfirmasi').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Menunggu Arahan').length).toBeGreaterThan(0);
    expect(screen.getAllByText(new RegExp(TEKS_UI.bentrok.pasti)).length).toBeGreaterThan(0);
    for (const lencana of document.querySelectorAll('.lencana')) {
      expect(lencana.querySelector('svg[aria-hidden="true"]')).toBeTruthy();
      expect((lencana.textContent ?? '').trim().length).toBeGreaterThan(0);
    }
  });

  it('KB-008: halaman Bentrok mengelompokkan menurut tanggal dan menautkan kedua kegiatan', async () => {
    pasangApi(rute);
    tampil('/bentrok');
    expect(
      await screen.findByRole('heading', { level: 2, name: /Senin, 26 Oktober 2026/ }),
    ).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Upacara Contoh' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Rapat Contoh' })).toBeTruthy();
    expect(screen.getByText(TEKS_UI.bentrok.pasti)).toBeTruthy();
  });

  it('KB-001: rincian kegiatan menampilkan pihak, peringatan bentrok, dan riwayat kosong', async () => {
    pasangApi(rute);
    tampil('/kegiatan/K1');
    expect(await screen.findByRole('heading', { level: 1, name: 'Upacara Contoh' })).toBeTruthy();
    expect(screen.getByText(TEKS_UI.kedudukan.ditugaskan)).toBeTruthy();
    expect(await screen.findByText(TEKS_UI.bentrok.langsung)).toBeTruthy();
    expect(screen.getByText(TEKS_UI.kegiatan.tanpaLampiran)).toBeTruthy();
  });

  it('KB-001: kegiatan yang tidak ada menampilkan pesan, bukan layar kosong', async () => {
    pasangApi(rute);
    tampil('/kegiatan/TIDAK-ADA');
    expect((await screen.findByRole('alert')).textContent).toBe(TEKS_UI.kegiatan.tidakDitemukan);
  });

  it('KB-007: kendala jaringan menampilkan pesan dan tombol coba lagi', async () => {
    pasangApi({
      ...rute,
      'GET /api/kegiatan': () => {
        throw new TypeError('gagal');
      },
    });
    tampil('/agenda?tanggal=2026-10-26');
    expect(await screen.findByRole('button', { name: TEKS_UI.coba })).toBeTruthy();
    expect(screen.getByText(TEKS_UI.galat.jaringan)).toBeTruthy();
  });
});

describe('KB-037: dasbor per peran', () => {
  it('KB-037: pejabat melihat penugasan yang menunggu konfirmasinya', async () => {
    pasangApi({ 'GET /api/saya': profilPejabat, 'GET /api/kegiatan': [K1] });
    tampil();
    expect(
      await screen.findByRole('heading', { name: TEKS_UI.beranda.penugasanSaya }),
    ).toBeTruthy();
    expect((await screen.findAllByRole('link', { name: /Upacara Contoh/ })).length).toBeGreaterThan(
      0,
    );
  });

  it('KB-037: admin melihat ringkasan status dan jumlah bentrok', async () => {
    pasangApi({
      'GET /api/saya': profilAdmin,
      'GET /api/kegiatan': [K1, K2],
      'GET /api/bentrok': [bentrok],
      'GET /api/demo/persona': [],
    });
    tampil();
    expect(
      await screen.findByRole('heading', { name: TEKS_UI.beranda.ringkasanStatus }),
    ).toBeTruthy();
    await waitFor(() => expect(screen.getByText(TEKS_UI.beranda.totalBentrok(1))).toBeTruthy());
  });
});

describe('KB-036: akun, keluar, tema', () => {
  it('KB-036: keluar memutus sesi dan kembali ke layar Masuk', async () => {
    let masuk = true;
    const panggilan = pasangApi({
      'GET /api/saya': () => (masuk ? new Response(JSON.stringify(profilPejabat)) : tanpaSesi()),
      'GET /api/kegiatan': [],
      'DELETE /api/sesi': () => {
        masuk = false;
        return new Response(null, { status: 204 });
      },
    });
    tampil('/akun');
    fireEvent.click(await screen.findByRole('button', { name: TEKS_UI.akun.keluar }));
    expect(await screen.findByRole('heading', { name: TEKS_UI.masuk.judul })).toBeTruthy();
    expect(panggilan.some((p) => p.metode === 'DELETE' && p.url === '/api/sesi')).toBe(true);
  });

  it('KB-020: pilihan tema gelap menerapkan atribut tema', async () => {
    pasangApi({ 'GET /api/saya': profilPejabat, 'GET /api/kegiatan': [] });
    tampil('/akun');
    fireEvent.click(await screen.findByLabelText(TEKS_UI.akun.temaGelap));
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    fireEvent.click(screen.getByLabelText(TEKS_UI.akun.temaSistem));
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
  });
});
