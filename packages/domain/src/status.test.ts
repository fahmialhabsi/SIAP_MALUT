import { describe, expect, it } from 'vitest';
import { bacaDokumen, muatAturanAwal, muatKegiatanUji } from './data-uji.helper.js';
import type { Kegiatan, Pihak } from './model.js';
import {
  ALUR_UTAMA,
  LABEL_STATUS_AGENDA,
  STATUS_AGENDA,
  TRANSISI_STATUS,
  adalahStatusAgenda,
  bolehBerpindah,
  diagramStatusMermaid,
  periksaSyarat,
  pindahStatus,
  type StatusAgenda,
} from './status.js';

const opsiBentrok = { durasiBawaanMenit: muatAturanAwal().durasiBawaanMenit };

const wagub = (kedudukan: Pihak['kedudukan']): Pihak => ({
  id: 'wagub',
  nama: 'Wakil Gubernur (CONTOH)',
  golongan: 'pimpinan',
  kedudukan,
});
const kadis = (kedudukan: Pihak['kedudukan']): Pihak => ({
  id: 'kadis-pangan',
  nama: 'Kepala Dinas Pangan (CONTOH)',
  golongan: 'pejabat',
  kedudukan,
});

function baru(status: StatusAgenda, pihak: Pihak[] = []): Kegiatan {
  return {
    id: 'X1',
    judul: 'Kegiatan Uji CONTOH',
    mulai: '2026-11-02T09:00:00+09:00',
    status,
    pihak,
  };
}

const konteks = { oleh: 'admin.owner', waktu: '2026-10-23T14:00:00+09:00' };

describe('KB-004: definisi status', () => {
  it('KB-004: alur utama empat langkah berurutan', () => {
    expect(ALUR_UTAMA).toEqual(['baru', 'menunggu_arahan', 'ditetapkan', 'terkonfirmasi']);
  });

  it('KB-004: setiap status punya label Bahasa Indonesia', () => {
    for (const status of STATUS_AGENDA) {
      expect(LABEL_STATUS_AGENDA[status].length).toBeGreaterThan(0);
    }
    expect(LABEL_STATUS_AGENDA.menunggu_arahan).toBe('Menunggu Arahan');
  });

  it('KB-004: penjaga tipe menolak status tak dikenal', () => {
    expect(adalahStatusAgenda('ditetapkan')).toBe(true);
    expect(adalahStatusAgenda('rahasia')).toBe(false);
  });
});

describe('KB-004: tabel perpindahan status lengkap', () => {
  const sah: [StatusAgenda, StatusAgenda][] = [
    ['baru', 'menunggu_arahan'],
    ['baru', 'dibatalkan'],
    ['menunggu_arahan', 'ditetapkan'],
    ['menunggu_arahan', 'ditunda'],
    ['menunggu_arahan', 'dibatalkan'],
    ['ditetapkan', 'terkonfirmasi'],
    ['ditetapkan', 'menunggu_arahan'],
    ['ditetapkan', 'ditunda'],
    ['ditetapkan', 'dibatalkan'],
    ['terkonfirmasi', 'berlangsung'],
    ['terkonfirmasi', 'ditetapkan'],
    ['terkonfirmasi', 'ditunda'],
    ['terkonfirmasi', 'dibatalkan'],
    ['berlangsung', 'selesai'],
    ['ditunda', 'menunggu_arahan'],
    ['ditunda', 'dibatalkan'],
  ];

  it('KB-004: tepat 16 perpindahan sah', () => {
    expect(sah).toHaveLength(16);
    const jumlah = STATUS_AGENDA.reduce((n, s) => n + TRANSISI_STATUS[s].length, 0);
    expect(jumlah).toBe(16);
  });

  it('KB-004: semua perpindahan sah diizinkan', () => {
    for (const [dari, ke] of sah) expect(bolehBerpindah(dari, ke), `${dari}->${ke}`).toBe(true);
  });

  it('KB-004: semua pasangan lain ditolak (termasuk dari status akhir dan ke diri sendiri)', () => {
    for (const dari of STATUS_AGENDA) {
      for (const ke of STATUS_AGENDA) {
        const diharapkan = sah.some(([a, b]) => a === dari && b === ke);
        expect(bolehBerpindah(dari, ke), `${dari}->${ke}`).toBe(diharapkan);
      }
    }
    expect(TRANSISI_STATUS.selesai).toEqual([]);
    expect(TRANSISI_STATUS.dibatalkan).toEqual([]);
  });
});

describe('KB-004: syarat perpindahan', () => {
  it('KB-004: perpindahan tidak sah ditolak dengan alasan', () => {
    const hasil = pindahStatus(baru('baru'), 'terkonfirmasi', konteks);
    expect(hasil.ok).toBe(false);
    if (!hasil.ok) expect(hasil.alasan[0]).toContain('tidak diperbolehkan');
  });

  it('KB-004: menunggu_arahan butuh judul dan waktu mulai valid', () => {
    expect(pindahStatus(baru('baru'), 'menunggu_arahan', konteks).ok).toBe(true);
    const tanpaJudul = { ...baru('baru'), judul: '  ' };
    expect(pindahStatus(tanpaJudul, 'menunggu_arahan', konteks).ok).toBe(false);
    const waktuRusak = { ...baru('baru'), mulai: 'kapan-kapan' };
    expect(pindahStatus(waktuRusak, 'menunggu_arahan', konteks).ok).toBe(false);
  });

  it('KB-004: ditetapkan butuh minimal satu pihak ditugaskan atau diterima', () => {
    expect(
      pindahStatus(baru('menunggu_arahan', [wagub('diundang')]), 'ditetapkan', konteks).ok,
    ).toBe(false);
    expect(pindahStatus(baru('menunggu_arahan'), 'ditetapkan', konteks).ok).toBe(false);
    expect(
      pindahStatus(baru('menunggu_arahan', [wagub('ditugaskan')]), 'ditetapkan', konteks).ok,
    ).toBe(true);
  });

  it('KB-004: terkonfirmasi butuh minimal satu pihak diterima', () => {
    const hasil = pindahStatus(baru('ditetapkan', [kadis('ditolak')]), 'terkonfirmasi', konteks);
    expect(hasil.ok).toBe(false);
  });

  it('KB-004: terkonfirmasi menunggu konfirmasi pejabat/petugas yang masih ditugaskan', () => {
    const k = baru('ditetapkan', [wagub('diterima'), kadis('ditugaskan')]);
    const hasil = pindahStatus(k, 'terkonfirmasi', konteks);
    expect(hasil.ok).toBe(false);
    if (!hasil.ok) expect(hasil.alasan.join(' ')).toContain('Kepala Dinas Pangan (CONTOH)');
    const sudah = baru('ditetapkan', [wagub('diterima'), kadis('diterima')]);
    expect(pindahStatus(sudah, 'terkonfirmasi', konteks).ok).toBe(true);
  });

  it('KB-004: pimpinan yang hadir sendiri (diterima) cukup untuk terkonfirmasi', () => {
    expect(pindahStatus(baru('ditetapkan', [wagub('diterima')]), 'terkonfirmasi', konteks).ok).toBe(
      true,
    );
  });

  it('KB-004: ditunda dan dibatalkan wajib beralasan', () => {
    const k = baru('menunggu_arahan');
    expect(pindahStatus(k, 'ditunda', konteks).ok).toBe(false);
    expect(pindahStatus(k, 'dibatalkan', { ...konteks, alasan: '   ' }).ok).toBe(false);
    expect(pindahStatus(k, 'ditunda', { ...konteks, alasan: 'Pimpinan berhalangan' }).ok).toBe(
      true,
    );
  });
});

describe('KB-016: catatan peristiwa dan kekekalan data', () => {
  it('KB-016: perpindahan sukses menghasilkan peristiwa lengkap', () => {
    const k = baru('menunggu_arahan', [wagub('ditugaskan')]);
    const hasil = pindahStatus(k, 'ditetapkan', konteks);
    expect(hasil.ok).toBe(true);
    if (hasil.ok) {
      expect(hasil.peristiwa).toMatchObject({
        kegiatanId: 'X1',
        dari: 'menunggu_arahan',
        ke: 'ditetapkan',
        oleh: 'admin.owner',
        waktu: '2026-10-23T14:00:00+09:00',
      });
      expect(hasil.kegiatan.status).toBe('ditetapkan');
    }
  });

  it('KB-016: kegiatan asli tidak berubah setelah perpindahan', () => {
    const k = baru('menunggu_arahan', [wagub('ditugaskan')]);
    const salinan = structuredClone(k);
    pindahStatus(k, 'ditetapkan', konteks);
    expect(k).toEqual(salinan);
  });

  it('KB-016: alasan dicatat pada peristiwa bila diberikan', () => {
    const hasil = pindahStatus(baru('menunggu_arahan'), 'dibatalkan', {
      ...konteks,
      alasan: 'Acara dibatalkan penyelenggara',
    });
    expect(hasil.ok && hasil.peristiwa.alasan).toBe('Acara dibatalkan penyelenggara');
  });
});

describe('KB-038: bentrok adalah peringatan dengan alasan tercatat', () => {
  const lain = muatKegiatanUji();

  it('KB-038: bentrok potensi hanya memberi peringatan, tidak memblokir', () => {
    const k24 = lain.find((x) => x.id === 'K24-02');
    if (!k24) throw new Error('data uji tidak lengkap');
    // Wagub diundang di K24-02 dan ditugaskan di K24-03 = potensi. Tetapkan K24-02 untuk Gubernur.
    const dgPihak: Kegiatan = {
      ...k24,
      pihak: [
        {
          id: 'gubernur',
          nama: 'Gubernur (CONTOH)',
          golongan: 'pimpinan',
          kedudukan: 'ditugaskan',
        },
        wagub('diundang'),
      ],
    };
    const hasil = pindahStatus(dgPihak, 'ditetapkan', {
      ...konteks,
      kegiatanLain: lain,
      opsiBentrok,
    });
    expect(hasil.ok).toBe(true);
    if (hasil.ok) {
      expect(hasil.peringatan).toHaveLength(1);
      expect(hasil.peringatan[0]?.kepastian).toBe('potensi');
    }
  });

  it('KB-038: bentrok pasti tanpa alasan ditolak; dengan alasan diizinkan dan tercatat', () => {
    // K22-05 (terkonfirmasi, Wagub) dipasangkan dengan kegiatan baru yang bentrok pasti di jam yang sama.
    const bentur: Kegiatan = {
      id: 'X9',
      judul: 'Kegiatan Bentur CONTOH',
      mulai: '2026-10-22T11:00:00+09:00',
      status: 'menunggu_arahan',
      pihak: [wagub('ditugaskan')],
    };
    const tanpa = pindahStatus(bentur, 'ditetapkan', {
      ...konteks,
      kegiatanLain: lain,
      opsiBentrok,
    });
    expect(tanpa.ok).toBe(false);
    if (!tanpa.ok) expect(tanpa.alasan.join(' ')).toContain('bentrok pasti');

    const dengan = pindahStatus(bentur, 'ditetapkan', {
      ...konteks,
      kegiatanLain: lain,
      opsiBentrok,
      alasanBentrok: 'Arahan Gubernur: pangan murah dipersingkat',
    });
    expect(dengan.ok).toBe(true);
    if (dengan.ok) {
      expect(dengan.peringatan.length).toBeGreaterThan(0);
      expect(dengan.peristiwa.alasanBentrok).toBe('Arahan Gubernur: pangan murah dipersingkat');
      expect(dengan.peristiwa.bentrok.length).toBeGreaterThan(0);
    }
  });

  it('KB-038: periksaSyarat melaporkan peringatan bentrok tanpa mengubah apa pun', () => {
    const bentur: Kegiatan = {
      id: 'X9',
      judul: 'Kegiatan Bentur CONTOH',
      mulai: '2026-10-22T11:00:00+09:00',
      status: 'menunggu_arahan',
      pihak: [wagub('ditugaskan')],
    };
    const { peringatan, penolakan } = periksaSyarat(bentur, 'ditetapkan', {
      ...konteks,
      kegiatanLain: lain,
      opsiBentrok,
    });
    expect(peringatan.length).toBeGreaterThan(0);
    expect(penolakan.length).toBeGreaterThan(0);
    expect(bentur.status).toBe('menunggu_arahan');
  });
});

describe('RK-06: diagram status', () => {
  it('RK-06: ALUR_PROSES.md selaras dengan kode (jalankan npm run docs:status bila gagal)', () => {
    const dokumen = bacaDokumen('docs/rekayasa/ALUR_PROSES.md');
    expect(dokumen).toContain(diagramStatusMermaid());
    for (const dari of STATUS_AGENDA) {
      for (const ke of TRANSISI_STATUS[dari]) {
        expect(dokumen).toContain(LABEL_STATUS_AGENDA[ke]);
      }
    }
  });

  it('RK-06: diagram memuat setiap perpindahan sah tepat satu kali', () => {
    const diagram = diagramStatusMermaid();
    expect(diagram.startsWith('stateDiagram-v2')).toBe(true);
    for (const dari of STATUS_AGENDA) {
      for (const ke of TRANSISI_STATUS[dari]) {
        const baris = `  ${dari} --> ${ke}`;
        expect(diagram.split('\n').filter((b) => b === baris)).toHaveLength(1);
      }
    }
  });
});
