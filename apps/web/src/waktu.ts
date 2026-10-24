/**
 * Format tanggal dan jam dalam WIT (UTC+9) berbahasa Indonesia baku (KB-048).
 * Tanggal "kunci" berbentuk YYYY-MM-DD menurut WIT. Tidak bergantung pada zona waktu perangkat.
 */
const SELISIH_WIT_MS = 9 * 60 * 60 * 1000;
const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'] as const;
const HARI_SINGKAT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'] as const;
const BULAN = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
] as const;

const dua = (n: number) => String(n).padStart(2, '0');

/** Tanggal kunci (WIT) dari waktu ISO 8601 apa pun. */
export function kunciTanggalWit(iso: string): string {
  const d = new Date(Date.parse(iso) + SELISIH_WIT_MS);
  return `${d.getUTCFullYear()}-${dua(d.getUTCMonth() + 1)}-${dua(d.getUTCDate())}`;
}

export function hariIniWit(sekarang: Date = new Date()): string {
  return kunciTanggalWit(sekarang.toISOString());
}

function bagian(kunci: string): { t: number; b: number; h: number } {
  const [t, b, h] = kunci.split('-').map(Number);
  return { t: t ?? 1970, b: b ?? 1, h: h ?? 1 };
}

export function tambahHari(kunci: string, n: number): string {
  const { t, b, h } = bagian(kunci);
  const d = new Date(Date.UTC(t, b - 1, h + n));
  return `${d.getUTCFullYear()}-${dua(d.getUTCMonth() + 1)}-${dua(d.getUTCDate())}`;
}

export function indeksHari(kunci: string): number {
  const { t, b, h } = bagian(kunci);
  return new Date(Date.UTC(t, b - 1, h)).getUTCDay();
}

/** Senin pada minggu yang memuat tanggal. */
export function awalMinggu(kunci: string): string {
  const i = indeksHari(kunci);
  return tambahHari(kunci, i === 0 ? -6 : 1 - i);
}

/** `Sabtu, 24 Oktober 2026` */
export function formatTanggalPanjang(kunci: string): string {
  const { t, b, h } = bagian(kunci);
  return `${HARI[indeksHari(kunci)]}, ${h} ${BULAN[b - 1]} ${t}`;
}

/** `24 Okt` untuk jalur minggu. */
export function namaHariSingkat(kunci: string): string {
  return HARI_SINGKAT[indeksHari(kunci)] ?? '';
}

export function angkaTanggal(kunci: string): number {
  return bagian(kunci).h;
}

/** `20.00 WIT` */
export function formatJam(iso: string): string {
  const d = new Date(Date.parse(iso) + SELISIH_WIT_MS);
  return `${dua(d.getUTCHours())}.${dua(d.getUTCMinutes())} WIT`;
}

/** `20.00 WIT` atau `20.00 - 22.00 WIT` */
export function formatRentang(mulai: string, selesai: string | null): string {
  if (!selesai) return formatJam(mulai);
  const awal = formatJam(mulai).replace(' WIT', '');
  return `${awal} - ${formatJam(selesai)}`;
}

/** `Sabtu, 24 Oktober 2026, 20.00 WIT` */
export function formatTanggalJam(iso: string): string {
  return `${formatTanggalPanjang(kunciTanggalWit(iso))}, ${formatJam(iso)}`;
}

/** Selisih hari kalender (b - a) antara dua tanggal kunci. */
export function selisihHari(a: string, b: string): number {
  const pa = bagian(a);
  const pb = bagian(b);
  return Math.round((Date.UTC(pb.t, pb.b - 1, pb.h) - Date.UTC(pa.t, pa.b - 1, pa.h)) / 86_400_000);
}

/** `20:00` untuk isian jam (HH:MM, WIT). */
export function jamIsian(iso: string): string {
  const d = new Date(Date.parse(iso) + SELISIH_WIT_MS);
  return `${dua(d.getUTCHours())}:${dua(d.getUTCMinutes())}`;
}

/** ISO 8601 WIT dari tanggal kunci dan jam `HH:MM`. */
export function keIsoWit(kunci: string, jam: string): string {
  return `${kunci}T${jam}:00+09:00`;
}
