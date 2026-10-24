// Menjalankan API (Fastify) dan web (Vite) sekaligus: npm run dev
// Opsi: --lan  -> dapat dibuka dari ponsel di jaringan yang sama (npm run dev:lan)
// Mode bawaan pengembangan = demo (APP_MODE dapat diisi dari lingkungan).
// Paket workspace dibaca dari kode sumber (kondisi "development"), jadi tidak perlu build lebih dulu.
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import concurrently from 'concurrently';
import { alamatLan } from './alamat-lan.mjs';

const lan = process.argv.includes('--lan');
const mode = process.env.APP_MODE ?? 'demo';
// Port khusus SIAP MALUT agar tidak bentrok dengan proyek lain (3000/5173 sering terpakai).
// Basis data pengembangan: PGlite (PostgreSQL dalam proses) di data/dev/ (diabaikan Git). Hapus folder itu untuk mengulang dari nol.
const dirDb = process.env.SIAP_DB_DIR ?? join(process.cwd(), 'data', 'dev', 'pgdata');
mkdirSync(dirDb, { recursive: true });
const dirUnggah = process.env.SIAP_UNGGAHAN_DIR ?? join(process.cwd(), 'data', 'unggahan');
mkdirSync(dirUnggah, { recursive: true });
const portApi = process.env.SIAP_API_PORT ?? '3180';
const portWeb = process.env.SIAP_WEB_PORT ?? '5180';

function barisPonsel() {
  const daftar = alamatLan();
  if (daftar.length === 0)
    return ['  Ponsel: tidak ada alamat jaringan lokal terdeteksi (sambungkan ke Wi-Fi).'];
  return [
    '  Ponsel (satu Wi-Fi; JANGAN pakai "localhost" di ponsel):',
    ...daftar.map(
      (d) =>
        `    http://${d.alamat}:${portWeb}   (${d.antarmuka}${d.kemungkinanFisik ? '' : ', virtual'})`,
    ),
    '  Bila tidak terbuka: izinkan Node.js di Windows Firewall (jaringan Pribadi).',
  ];
}

process.stdout.write(
  [
    '',
    `SIAP MALUT (pengembangan) mode=${mode}${lan ? ' LAN' : ''}`,
    `  API : http://localhost:${portApi}   (/health, /ready)`,
    `  Data: ${dirDb}  (PGlite; hapus folder untuk mengulang dari nol)`,
    `  Web : http://localhost:${portWeb}`,
    ...(lan ? barisPonsel() : []),
    '  Hentikan dengan Ctrl+C',
    '',
  ]
    .filter((b, i, a) => b !== '' || i === 0 || i === a.length - 1)
    .join('\n') + '\n',
);

const { result } = concurrently(
  [
    {
      name: 'api',
      command: 'npm run dev -w apps/api',
      prefixColor: 'blue',
      env: {
        APP_MODE: mode,
        PORT: portApi,
        SIAP_DB_DIR: dirDb,
        SIAP_UNGGAHAN_DIR: dirUnggah,
        HOST: lan ? '0.0.0.0' : '127.0.0.1',
        LOG_LEVEL: process.env.LOG_LEVEL ?? 'info',
      },
    },
    {
      name: 'web',
      command: `npm run dev -w apps/web -- --port ${portWeb} --strictPort${lan ? ' --host' : ''}`,
      prefixColor: 'green',
      env: { VITE_APP_MODE: mode, SIAP_API_PORT: portApi },
    },
  ],
  { prefix: 'name', killOthersOn: ['failure', 'success'], handleInput: false },
);

result.then(
  () => process.exit(0),
  () => process.exit(1),
);
