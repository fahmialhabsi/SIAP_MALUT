// Menjalankan API (Fastify) dan web (Vite) sekaligus: npm run dev
// Opsi: --lan  -> dapat dibuka dari ponsel di jaringan yang sama (npm run dev:lan)
// Mode bawaan pengembangan = demo (APP_MODE dapat diisi dari lingkungan).
// Paket workspace dibaca dari kode sumber (kondisi "development"), jadi tidak perlu build lebih dulu.
import concurrently from 'concurrently';

const lan = process.argv.includes('--lan');
const mode = process.env.APP_MODE ?? 'demo';
// Port khusus SIAP MALUT agar tidak bentrok dengan proyek lain (3000/5173 sering terpakai).
const portApi = process.env.SIAP_API_PORT ?? '3180';
const portWeb = process.env.SIAP_WEB_PORT ?? '5180';

process.stdout.write(
  [
    '',
    `SIAP MALUT (pengembangan) mode=${mode}${lan ? ' LAN' : ''}`,
    `  API : http://localhost:${portApi}   (/health, /ready)`,
    `  Web : http://localhost:${portWeb}`,
    lan ? `  Ponsel: buka http://<IP-komputer-ini>:${portWeb} (satu jaringan Wi-Fi)` : '',
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
        HOST: lan ? '0.0.0.0' : '127.0.0.1',
        LOG_LEVEL: process.env.LOG_LEVEL ?? 'info',
      },
    },
    {
      name: 'web',
      command: `npm run dev -w apps/web -- --port ${portWeb} --strictPort${lan ? ' --host' : ''}`,
      prefixColor: 'green',
      env: { VITE_APP_MODE: mode },
    },
  ],
  { prefix: 'name', killOthersOn: ['failure', 'success'], handleInput: false },
);

result.then(
  () => process.exit(0),
  () => process.exit(1),
);
