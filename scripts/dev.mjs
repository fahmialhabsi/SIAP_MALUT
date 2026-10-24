// Menjalankan API (Fastify) dan web (Vite) sekaligus: npm run dev
// Opsi: --lan  -> dapat dibuka dari ponsel di jaringan yang sama (npm run dev:lan)
//       --tunnel -> membangun web lalu membukanya lewat terowongan Cloudflare (alamat https publik sementara) untuk
//                   peninjau yang tidak berada di jaringan yang sama (npm run dev:tunnel; butuh cloudflared terpasang)
// Mode bawaan pengembangan = demo (APP_MODE dapat diisi dari lingkungan).
// Paket workspace dibaca dari kode sumber (kondisi "development"), jadi tidak perlu build lebih dulu.
import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import concurrently from 'concurrently';
import { alamatLan } from './alamat-lan.mjs';

const lan = process.argv.includes('--lan');
const tunnel = process.argv.includes('--tunnel');
const mode = process.env.APP_MODE ?? 'demo';
// Port khusus SIAP MALUT agar tidak bentrok dengan proyek lain (3000/5173 sering terpakai).
// Basis data pengembangan: PGlite (PostgreSQL dalam proses) di data/dev/ (diabaikan Git). Hapus folder itu untuk mengulang dari nol.
const dirDb = process.env.SIAP_DB_DIR ?? join(process.cwd(), 'data', 'dev', 'pgdata');
mkdirSync(dirDb, { recursive: true });
const dirUnggah = process.env.SIAP_UNGGAHAN_DIR ?? join(process.cwd(), 'data', 'unggahan');
mkdirSync(dirUnggah, { recursive: true });
const portApi = process.env.SIAP_API_PORT ?? '3180';
const portWeb = process.env.SIAP_WEB_PORT ?? '5180';

if (tunnel) {
  const cek = spawnSync('cloudflared', ['--version'], { shell: true, stdio: 'ignore' });
  if (cek.status !== 0) {
    process.stderr.write(
      [
        '[tunel] cloudflared belum terpasang. Pasang sekali (PowerShell), tutup dan buka lagi terminal, lalu ulangi:',
        '          winget install --id Cloudflare.cloudflared',
        '',
      ].join('\n'),
    );
    process.exit(1);
  }
  // Terowongan melayani hasil build (beberapa berkas) agar cepat di jaringan seluler; mode dipakukan saat build.
  process.stdout.write('[tunel] Membangun web (sekali, sekitar 1 menit)...\n');
  const bangun = spawnSync(
    'npm',
    ['run', 'build', '-w', 'packages/shared', '-w', 'packages/domain', '-w', 'apps/web'],
    { shell: true, stdio: 'inherit', env: { ...process.env, VITE_APP_MODE: mode } },
  );
  if (bangun.status !== 0) process.exit(bangun.status ?? 1);
}

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
    `SIAP MALUT (pengembangan) mode=${mode}${lan ? ' LAN' : ''}${tunnel ? ' TEROWONGAN' : ''}`,
    `  API : http://localhost:${portApi}   (/health, /ready)`,
    `  Data: ${dirDb}  (PGlite; hapus folder untuk mengulang dari nol)`,
    `  Web : http://localhost:${portWeb}`,
    ...(lan ? barisPonsel() : []),
    ...(tunnel
      ? [
          '  Terowongan: cari baris [tunel] berisi https://....trycloudflare.com dan kirim ke peninjau.',
          '  Alamat berubah setiap dijalankan. Laptop harus menyala dan terminal ini tetap terbuka. Hanya data CONTOH.',
        ]
      : []),
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
      command: tunnel
        ? `npm run preview -w apps/web -- --port ${portWeb} --strictPort --host 127.0.0.1`
        : `npm run dev -w apps/web -- --port ${portWeb} --strictPort${lan ? ' --host' : ''}`,
      prefixColor: 'green',
      env: { VITE_APP_MODE: mode, SIAP_API_PORT: portApi },
    },
    ...(tunnel
      ? [
          {
            name: 'tunel',
            command: `cloudflared tunnel --url http://127.0.0.1:${portWeb}`,
            prefixColor: 'magenta',
          },
        ]
      : []),
  ],
  { prefix: 'name', killOthersOn: ['failure', 'success'], handleInput: false },
);

result.then(
  () => process.exit(0),
  () => process.exit(1),
);
