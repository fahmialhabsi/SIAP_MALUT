import { loadApiConfig } from '@siap/shared';
import { buildApp } from './app.js';
import { pastikanTanpaDataContoh } from './penjaga.js';

async function main(): Promise<void> {
  const config = loadApiConfig(process.env);

  // Tahap 1.3: ganti 0 dengan hitungan data berpenanda is_contoh dari basis data.
  pastikanTanpaDataContoh(config.appMode, 0);

  const app = buildApp(config);
  await app.listen({ port: config.port, host: config.host });
}

main().catch((err: unknown) => {
  const pesan = err instanceof Error ? err.message : String(err);
  console.error(JSON.stringify({ level: 'fatal', msg: 'Gagal memulai API', error: pesan }));
  process.exit(1);
});
