import { loadApiConfig } from '@siap/shared';
import { buildApp } from './app.js';
import { bukaDatabase } from './db/klien.js';
import { jagaProduksi } from './db/penjaga-db.js';
import { isiDataContoh } from './db/seed.js';

async function main(): Promise<void> {
  const config = loadApiConfig(process.env);

  const koneksi = await bukaDatabase({ databaseUrl: config.databaseUrl, dirDb: config.dbDir });
  await koneksi.migrasi();

  // Mode demo: isi data contoh otomatis bila basis data masih kosong (idempoten).
  if (config.appMode === 'demo') {
    const seed = await isiDataContoh(koneksi.db, { sandiAdmin: config.adminPassword });
    if (seed.dibuat) {
      process.stdout.write(
        `[seed] Data contoh dibuat: ${JSON.stringify(seed.jumlah)}\n` +
          (seed.sandiAdminSementara
            ? `[seed] Kata sandi sementara admin.owner (tampil SEKALI, catat sekarang): ${seed.sandiAdminSementara}\n` +
              '[seed] Ganti lewat: npm run admin:sandi\n'
            : '[seed] Kata sandi admin.owner diambil dari SIAP_ADMIN_PASSWORD.\n'),
      );
    }
  }

  // Penjaga produksi (KB-034): production menolak start bila masih ada data contoh.
  await jagaProduksi(koneksi.db, config.appMode);

  const app = buildApp(config, { koneksi });
  await app.listen({ port: config.port, host: config.host });
}

main().catch((err: unknown) => {
  const pesan = err instanceof Error ? err.message : String(err);
  console.error(JSON.stringify({ level: 'fatal', msg: 'Gagal memulai API', error: pesan }));
  process.exit(1);
});
