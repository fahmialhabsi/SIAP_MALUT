import { eq, ne } from 'drizzle-orm';
import { z } from 'zod';
import { catatAudit, daftarAudit } from '../db/audit.js';
import { ambilPengaturan, simpanPengaturan } from '../db/pengaturan.js';
import { pengguna as tabelPengguna, peranIzin } from '../db/schema.js';
import { IZIN, adalahIzin } from '../keamanan/izin.js';
import { aturPersona } from '../keamanan/sesi.js';
import { GalatApi, rute, type Deps } from '../rute.js';
import {
  AuditQuery,
  AuditSkema,
  GalatSkema,
  HakAksesSkema,
  KunciParams,
  PengaturanInput,
  PengaturanSkema,
  PersonaInput,
  PersonaSkema,
  ProfilSkema,
} from '../skema-dto.js';
import { keIsoWit } from '../waktu.js';
import { aktorAudit, buatProfil, konteksAudit } from './umum.js';

const bukanDemo = () =>
  new GalatApi(404, 'tidak_ditemukan', 'Fitur ini hanya tersedia pada mode demo.');

export function ruteAdmin(_deps: Deps) {
  return [
    rute({
      metode: 'get',
      jalur: '/api/pengaturan',
      ringkasan: 'Daftar pengaturan',
      tag: 'Administrasi',
      izin: ['pengaturan.baca'],
      respons: {
        200: { deskripsi: 'Pengaturan', skema: z.array(PengaturanSkema) },
        401: { deskripsi: 'Belum masuk', skema: GalatSkema },
        403: { deskripsi: 'Tidak berizin', skema: GalatSkema },
      },
      penangan: async ({ deps }) => [
        { kunci: 'durasiBawaanMenit', nilai: await ambilPengaturan(deps.db, 'durasiBawaanMenit') },
      ],
    }),

    rute({
      metode: 'put',
      jalur: '/api/pengaturan/:kunci',
      ringkasan: 'Mengubah pengaturan (mis. durasi bawaan kegiatan tanpa jam selesai)',
      tag: 'Administrasi',
      izin: ['pengaturan.ubah'],
      params: KunciParams,
      body: PengaturanInput,
      respons: {
        200: { deskripsi: 'Pengaturan setelah diubah', skema: PengaturanSkema },
        400: { deskripsi: 'Nilai tidak valid', skema: GalatSkema },
        401: { deskripsi: 'Belum masuk', skema: GalatSkema },
        403: { deskripsi: 'Tidak berizin', skema: GalatSkema },
      },
      penangan: async ({ req, deps, pengguna, params, body }) => {
        if (!pengguna) return undefined;
        const lama = await ambilPengaturan(deps.db, params.kunci);
        await deps.db.transaction(async (tx) => {
          await simpanPengaturan(tx, params.kunci, body.nilai);
          await catatAudit(tx, {
            ...aktorAudit(pengguna),
            aksi: 'pengaturan.ubah',
            entitas: 'pengaturan',
            entitasId: params.kunci,
            sebelum: { nilai: lama },
            sesudah: { nilai: body.nilai },
            ...konteksAudit(req),
          });
        });
        return { kunci: params.kunci, nilai: body.nilai };
      },
    }),

    rute({
      metode: 'get',
      jalur: '/api/audit',
      ringkasan: 'Log audit (baca saja, terbaru lebih dulu)',
      tag: 'Administrasi',
      izin: ['audit.baca'],
      query: AuditQuery,
      respons: {
        200: { deskripsi: 'Catatan audit', skema: z.array(AuditSkema) },
        400: { deskripsi: 'Parameter tidak valid', skema: GalatSkema },
        401: { deskripsi: 'Belum masuk', skema: GalatSkema },
        403: { deskripsi: 'Tidak berizin', skema: GalatSkema },
      },
      penangan: async ({ deps, query }) => {
        const baris = await daftarAudit(deps.db, query.batas, query.entitasId);
        return baris.map((b) => ({ ...b, waktu: keIsoWit(b.waktu) }));
      },
    }),

    rute({
      metode: 'get',
      jalur: '/api/hak-akses',
      ringkasan: 'Matriks hak akses (peran dan izinnya)',
      tag: 'Administrasi',
      izin: ['hakakses.baca'],
      respons: {
        200: { deskripsi: 'Matriks hak akses saat ini', skema: HakAksesSkema },
        401: { deskripsi: 'Belum masuk', skema: GalatSkema },
        403: { deskripsi: 'Tidak berizin', skema: GalatSkema },
      },
      penangan: async ({ deps }) => {
        const baris = await deps.db.select().from(peranIzin);
        const peran: Record<string, string[]> = {};
        for (const b of baris) (peran[b.peran] ??= []).push(b.izin);
        for (const k of Object.keys(peran)) peran[k] = (peran[k] ?? []).filter(adalahIzin).sort();
        return { izin: [...IZIN], peran };
      },
    }),

    rute({
      metode: 'get',
      jalur: '/api/demo/persona',
      ringkasan: 'Daftar persona yang dapat dipakai admin (hanya mode demo)',
      tag: 'Demo',
      izin: ['demo.pindah_persona'],
      izinAkunAsli: true,
      respons: {
        200: { deskripsi: 'Persona', skema: z.array(PersonaSkema) },
        401: { deskripsi: 'Belum masuk', skema: GalatSkema },
        403: { deskripsi: 'Tidak berizin', skema: GalatSkema },
        404: { deskripsi: 'Bukan mode demo', skema: GalatSkema },
      },
      penangan: async ({ deps, pengguna }) => {
        if (deps.config.appMode !== 'demo') throw bukanDemo();
        const baris = await deps.db
          .select({
            username: tabelPengguna.username,
            nama: tabelPengguna.nama,
            peran: tabelPengguna.peran,
          })
          .from(tabelPengguna)
          .where(pengguna ? ne(tabelPengguna.id, pengguna.asli.id) : undefined)
          .orderBy(tabelPengguna.username);
        return baris;
      },
    }),

    rute({
      metode: 'post',
      jalur: '/api/demo/persona',
      ringkasan: 'Berpindah tampilan ke persona (hanya mode demo; tercatat di log audit)',
      tag: 'Demo',
      izin: ['demo.pindah_persona'],
      izinAkunAsli: true,
      body: PersonaInput,
      respons: {
        200: { deskripsi: 'Profil persona yang kini dipakai', skema: ProfilSkema },
        400: { deskripsi: 'Persona tidak dikenal', skema: GalatSkema },
        401: { deskripsi: 'Belum masuk', skema: GalatSkema },
        403: { deskripsi: 'Tidak berizin', skema: GalatSkema },
        404: { deskripsi: 'Bukan mode demo', skema: GalatSkema },
      },
      penangan: async ({ req, deps, pengguna, body }) => {
        if (deps.config.appMode !== 'demo') throw bukanDemo();
        if (!pengguna) return undefined;
        const [persona] = await deps.db
          .select()
          .from(tabelPengguna)
          .where(eq(tabelPengguna.username, body.username));
        if (!persona || !persona.aktif || persona.id === pengguna.asli.id) {
          throw new GalatApi(400, 'tidak_valid', 'Persona tidak dikenal.');
        }
        await deps.db.transaction(async (tx) => {
          await aturPersona(tx, pengguna.idHashSesi, persona.id);
          await catatAudit(tx, {
            aktor: pengguna.asli.username,
            aktorPeran: pengguna.asli.peran,
            aksi: 'demo.pindah_persona',
            entitas: 'sesi',
            sebelum: { persona: pengguna.sebagaiPersona ? pengguna.efektif.username : null },
            sesudah: { persona: persona.username },
            ...konteksAudit(req),
          });
        });
        return buatProfil(
          {
            ...pengguna,
            efektif: {
              id: persona.id,
              username: persona.username,
              nama: persona.nama,
              peran: persona.peran,
              pejabatId: persona.pejabatId,
            },
            sebagaiPersona: true,
            izin: new Set(
              (
                await deps.db
                  .select({ izin: peranIzin.izin })
                  .from(peranIzin)
                  .where(eq(peranIzin.peran, persona.peran))
              )
                .map((b) => b.izin)
                .filter(adalahIzin),
            ),
          },
          deps.config,
        );
      },
    }),

    rute({
      metode: 'delete',
      jalur: '/api/demo/persona',
      ringkasan: 'Kembali ke akun admin asli (hanya mode demo)',
      tag: 'Demo',
      izin: ['demo.pindah_persona'],
      izinAkunAsli: true,
      respons: {
        204: { deskripsi: 'Kembali ke akun asli' },
        401: { deskripsi: 'Belum masuk', skema: GalatSkema },
        403: { deskripsi: 'Tidak berizin', skema: GalatSkema },
        404: { deskripsi: 'Bukan mode demo', skema: GalatSkema },
      },
      penangan: async ({ req, deps, pengguna }) => {
        if (deps.config.appMode !== 'demo') throw bukanDemo();
        if (!pengguna) return undefined;
        await deps.db.transaction(async (tx) => {
          await aturPersona(tx, pengguna.idHashSesi, null);
          await catatAudit(tx, {
            aktor: pengguna.asli.username,
            aktorPeran: pengguna.asli.peran,
            aksi: 'demo.kembali',
            entitas: 'sesi',
            sebelum: { persona: pengguna.sebagaiPersona ? pengguna.efektif.username : null },
            ...konteksAudit(req),
          });
        });
        return undefined;
      },
    }),
  ];
}
