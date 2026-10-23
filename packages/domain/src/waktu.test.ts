import { describe, expect, it } from 'vitest';
import { WaktuTidakValidError, intervalDari, irisan, keEpoch, keIsoUtc } from './waktu.js';

describe('KB-008: waktu dan interval', () => {
  it('KB-008: zona WIT (+09:00) diubah ke UTC dengan benar', () => {
    expect(keIsoUtc(keEpoch('2026-10-24T20:00:00+09:00'))).toBe('2026-10-24T11:00:00.000Z');
  });

  it('KB-008: dua penulisan zona untuk saat yang sama setara', () => {
    expect(keEpoch('2026-10-24T20:00:00+09:00')).toBe(keEpoch('2026-10-24T11:00:00Z'));
  });

  it('KB-008: waktu tanpa zona atau format salah ditolak', () => {
    expect(() => keEpoch('2026-10-24T20:00:00')).toThrow(WaktuTidakValidError);
    expect(() => keEpoch('24 Oktober 2026 20.00 WIT')).toThrow(WaktuTidakValidError);
    expect(() => keEpoch('')).toThrow(WaktuTidakValidError);
  });

  it('KB-039: jam selesai kosong memakai durasi bawaan dari parameter', () => {
    const iv = intervalDari('2026-10-22T08:00:00+09:00', undefined, 120);
    expect(iv.selesai - iv.mulai).toBe(120 * 60_000);
    const iv3 = intervalDari('2026-10-22T08:00:00+09:00', undefined, 180);
    expect(iv3.selesai - iv3.mulai).toBe(180 * 60_000);
  });

  it('KB-008: selesai tidak boleh sebelum atau sama dengan mulai', () => {
    expect(() =>
      intervalDari('2026-10-22T08:00:00+09:00', '2026-10-22T08:00:00+09:00', 120),
    ).toThrow(WaktuTidakValidError);
    expect(() =>
      intervalDari('2026-10-22T08:00:00+09:00', '2026-10-22T07:00:00+09:00', 120),
    ).toThrow(WaktuTidakValidError);
  });

  it('KB-008: bersinggungan bukan irisan; tumpang tindih sebagian adalah irisan', () => {
    const a = { mulai: 0, selesai: 10 };
    expect(irisan(a, { mulai: 10, selesai: 20 })).toBeNull();
    expect(irisan(a, { mulai: 5, selesai: 20 })).toEqual({ mulai: 5, selesai: 10 });
    expect(irisan(a, { mulai: 2, selesai: 4 })).toEqual({ mulai: 2, selesai: 4 });
    expect(irisan(a, { mulai: 20, selesai: 30 })).toBeNull();
  });
});
