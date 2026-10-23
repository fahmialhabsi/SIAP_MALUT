import { describe, expect, it } from 'vitest';
import { ALUR_UTAMA, LABEL_STATUS_AGENDA, STATUS_AGENDA, adalahStatusAgenda } from './index.js';

describe('KB-004: status agenda', () => {
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
