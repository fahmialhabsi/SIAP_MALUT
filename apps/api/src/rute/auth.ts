import { z } from 'zod';
import { catatAudit } from '../db/audit.js';
import { masuk } from '../keamanan/masuk.js';
import { NAMA_KUKI, hapusSesi } from '../keamanan/sesi.js';
import { GalatApi, balas, rute, type Deps } from '../rute.js';
import { GalatSkema, MasukInput, ProfilSkema } from '../skema-dto.js';
import { aktorAudit, buatProfil, konteksAudit } from './umum.js';

const witJam = new Intl.DateTimeFormat('id-ID', {
  timeZone: 'Asia/Jayapura',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

export function ruteAuth(_deps: Deps) {
  return [
    rute({
      metode: 'post',
      jalur: '/api/sesi',
      ringkasan: 'Masuk (membuat sesi)',
      tag: 'Autentikasi',
      publik: true,
      body: MasukInput,
      respons: {
        200: { deskripsi: 'Berhasil masuk; kuki sesi httpOnly dikirim', skema: ProfilSkema },
        400: { deskripsi: 'Data tidak valid', skema: GalatSkema },
        401: { deskripsi: 'Nama pengguna atau kata sandi salah', skema: GalatSkema },
        423: {
          deskripsi: 'Akun dikunci sementara setelah percobaan gagal berulang',
          skema: GalatSkema,
        },
      },
      penangan: async ({ req, reply, deps, body }) => {
        const hasil = await masuk(deps.db, {
          username: body.username,
          sandi: body.sandi,
          ip: req.ip,
          agen: req.headers['user-agent'],
          reqId: req.id,
          sekarang: deps.sekarang(),
        });
        if (!hasil.ok) {
          if (hasil.kode === 'terkunci' && hasil.terkunciSampai) {
            throw new GalatApi(
              423,
              'terkunci',
              `Akun dikunci sementara hingga pukul ${witJam.format(hasil.terkunciSampai)} WIT.`,
            );
          }
          throw new GalatApi(401, 'kredensial_salah', 'Nama pengguna atau kata sandi salah.');
        }
        reply.setCookie(NAMA_KUKI, hasil.token, {
          httpOnly: true,
          sameSite: 'strict',
          path: '/',
          secure: deps.config.appMode === 'production',
          expires: hasil.kedaluwarsa,
        });
        return balas(200, {
          username: hasil.akun.username,
          nama: hasil.akun.nama,
          peran: hasil.akun.peran,
          pejabatId: hasil.akun.pejabatId,
          izin: hasil.izin,
          mode: deps.config.appMode,
          sebagaiPersona: false,
          akunAsli: null,
        } as z.infer<typeof ProfilSkema>);
      },
    }),

    rute({
      metode: 'delete',
      jalur: '/api/sesi',
      ringkasan: 'Keluar (mengakhiri sesi)',
      tag: 'Autentikasi',
      hanyaMasuk: true,
      respons: {
        204: { deskripsi: 'Sesi diakhiri' },
        401: { deskripsi: 'Belum masuk', skema: GalatSkema },
      },
      penangan: async ({ req, reply, deps, pengguna }) => {
        if (!pengguna) return undefined;
        await hapusSesi(deps.db, pengguna.idHashSesi);
        await catatAudit(deps.db, {
          ...aktorAudit(pengguna),
          aksi: 'keluar',
          entitas: 'pengguna',
          entitasId: pengguna.asli.id,
          ...konteksAudit(req),
        });
        reply.clearCookie(NAMA_KUKI, { path: '/' });
        return undefined;
      },
    }),

    rute({
      metode: 'get',
      jalur: '/api/saya',
      ringkasan: 'Profil dan izin pengguna yang sedang masuk',
      tag: 'Autentikasi',
      hanyaMasuk: true,
      respons: {
        200: { deskripsi: 'Profil', skema: ProfilSkema },
        401: { deskripsi: 'Belum masuk', skema: GalatSkema },
      },
      penangan: ({ deps, pengguna }) => (pengguna ? buatProfil(pengguna, deps.config) : undefined),
    }),
  ];
}
