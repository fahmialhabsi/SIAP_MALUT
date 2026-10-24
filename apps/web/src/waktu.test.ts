import { describe, expect, it } from 'vitest';
import {
  awalMinggu,
  formatJam,
  formatRentang,
  formatTanggalJam,
  formatTanggalPanjang,
  hariIniWit,
  kunciTanggalWit,
  selisihHari,
  tambahHari,
} from './waktu';

describe('KB-048: format tanggal dan jam WIT', () => {
  it('KB-048: tanggal panjang berbahasa Indonesia baku', () => {
    expect(formatTanggalPanjang('2026-10-24')).toBe('Sabtu, 24 Oktober 2026');
    expect(formatTanggalPanjang('2026-11-02')).toBe('Senin, 2 November 2026');
  });

  it('KB-048: jam memakai titik dan akhiran WIT, tidak bergantung zona perangkat', () => {
    expect(formatJam('2026-10-24T20:00:00+09:00')).toBe('20.00 WIT');
    expect(formatJam('2026-10-24T11:05:00Z')).toBe('20.05 WIT');
    expect(formatRentang('2026-10-26T08:00:00+09:00', '2026-10-26T10:30:00+09:00')).toBe(
      '08.00 - 10.30 WIT',
    );
    expect(formatRentang('2026-10-26T08:00:00+09:00', null)).toBe('08.00 WIT');
    expect(formatTanggalJam('2026-10-24T20:00:00+09:00')).toBe('Sabtu, 24 Oktober 2026, 20.00 WIT');
  });

  it('KB-048: tanggal kunci menurut WIT melewati tengah malam UTC', () => {
    expect(kunciTanggalWit('2026-10-24T20:00:00Z')).toBe('2026-10-25');
    expect(hariIniWit(new Date('2026-10-24T16:00:00Z'))).toBe('2026-10-25');
  });

  it('KB-006: aritmetika hari dan awal minggu (Senin)', () => {
    expect(tambahHari('2026-10-31', 1)).toBe('2026-11-01');
    expect(awalMinggu('2026-10-24')).toBe('2026-10-19');
    expect(awalMinggu('2026-10-26')).toBe('2026-10-26');
    expect(awalMinggu('2026-10-25')).toBe('2026-10-19');
    expect(selisihHari('2026-10-24', '2026-10-27')).toBe(3);
  });
});
