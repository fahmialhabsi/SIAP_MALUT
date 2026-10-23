/** Mengubah saat (UTC) menjadi ISO 8601 dengan zona WIT (+09:00), format yang dipakai logika domain. */
export function keIsoWit(saat: Date): string {
  const geser = new Date(saat.getTime() + 9 * 3_600_000);
  return geser.toISOString().replace(/\.\d{3}Z$/, '') + '+09:00';
}
