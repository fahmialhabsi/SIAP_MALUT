/**
 * Tipe API diturunkan dari `skema.d.ts`, yang DIHASILKAN dari docs/rekayasa/openapi.json
 * (`npm run api:tipe -w apps/web`; KB-049). Dilarang menulis tipe respons API dengan tangan.
 */
import type { operations } from './skema';

type Isi<Op extends keyof operations, Kode extends number> = operations[Op] extends {
  responses: Record<Kode, { content: { 'application/json': infer T } }>;
}
  ? T
  : never;

export type Profil = Isi<'get_saya', 200>;
export type Izin = Profil['izin'][number];
export type PeranPengguna = Profil['peran'];
export type Kegiatan = Isi<'get_kegiatan', 200>[number];
export type Pihak = Kegiatan['pihak'][number];
export type StatusKegiatan = Kegiatan['status'];
export type Bentrok = Isi<'get_bentrok', 200>[number];
export type Pejabat = Isi<'get_pejabat', 200>[number];
export type Persona = Isi<'get_demo_persona', 200>[number];
export type Lampiran = Isi<'get_kegiatan_id_lampiran', 200>[number];
export type EntriAudit = Isi<'get_audit', 200>[number];
export type GalatBadan = {
  galat: { kode: string; pesan: string; rincian?: { jalur: string; pesan: string }[] };
};
