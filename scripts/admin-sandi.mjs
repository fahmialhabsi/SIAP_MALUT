// Mengatur kata sandi pada basis data pengembangan.
//   npm run admin:sandi                       -> admin.owner (SIAP_ADMIN_PASSWORD atau acak)
//   npm run akun:sandi -- demo.kabag-protokol -> akun demo (SIAP_AKUN_PASSWORD atau acak)
// Memakai folder PGlite yang sama dengan `npm run dev` (data/dev/pgdata) kecuali SIAP_DB_DIR atau DATABASE_URL diisi.
// Hentikan `npm run dev` dulu (PGlite hanya dapat dibuka satu proses).
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const env = { ...process.env };
if (!env.DATABASE_URL && !env.SIAP_DB_DIR)
  env.SIAP_DB_DIR = join(process.cwd(), 'data', 'dev', 'pgdata');
if (!env.DATABASE_URL && !existsSync(env.SIAP_DB_DIR ?? '')) {
  process.stderr.write(
    `[admin] Folder basis data ${env.SIAP_DB_DIR} belum ada. Jalankan "npm run dev" sekali (membuat data contoh), hentikan, lalu ulangi.\n`,
  );
  process.exit(1);
}
const username = process.argv[2];
const bendera = username ? `--atur-sandi-akun=${username}` : '--atur-sandi-admin';
const hasil = spawnSync('npm', ['run', 'seed', '-w', 'apps/api', '--', bendera], {
  stdio: 'inherit',
  shell: true,
  env,
});
process.exit(hasil.status ?? 1);
