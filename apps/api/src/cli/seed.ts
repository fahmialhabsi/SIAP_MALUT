/**
 * CLI basis data. Pemakaian (dari akar repo):
 *   npm run seed -w apps/api            migrasi + isi data contoh bila kosong
 *   npm run admin:sandi                 atur ulang kata sandi admin.owner (SIAP_ADMIN_PASSWORD atau acak)
 *   npm run akun:sandi -- <username>    atur kata sandi akun demo (SIAP_AKUN_PASSWORD atau acak), mis. demo.kabag-protokol
 * Konfigurasi dari variabel lingkungan yang sama dengan API (DATABASE_URL atau SIAP_DB_DIR).
 */
import { loadApiConfig } from '@siap/shared';
import { bukaDatabase } from '../db/klien.js';
import { aturSandiAdmin, aturSandiAkun, isiDataContoh } from '../db/seed.js';

async function main(): Promise<void> {
  const config = loadApiConfig(process.env);
  const atur = process.argv.includes('--atur-sandi-admin');
  const akun = process.argv.find((a) => a.startsWith('--atur-sandi-akun='))?.split('=')[1];
  const koneksi = await bukaDatabase({ databaseUrl: config.databaseUrl, dirDb: config.dbDir });
  try {
    await koneksi.migrasi();
    if (akun) {
      const hasil = await aturSandiAkun(koneksi.db, akun, process.env.SIAP_AKUN_PASSWORD);
      process.stdout.write(
        hasil.sandiSementara
          ? `[akun] Kata sandi sementara ${akun} (tampil SEKALI): ${hasil.sandiSementara}
`
          : `[akun] Kata sandi ${akun} diatur dari SIAP_AKUN_PASSWORD.
`,
      );
    } else if (atur) {
      const hasil = await aturSandiAdmin(koneksi.db, config.adminPassword);
      process.stdout.write(
        hasil.sandiSementara
          ? `[admin] Kata sandi sementara admin.owner (tampil SEKALI): ${hasil.sandiSementara}\n`
          : '[admin] Kata sandi admin.owner diatur dari SIAP_ADMIN_PASSWORD.\n',
      );
    } else {
      const seed = await isiDataContoh(koneksi.db, { sandiAdmin: config.adminPassword });
      process.stdout.write(
        seed.dibuat
          ? `[seed] Dibuat: ${JSON.stringify(seed.jumlah)}\n` +
              (seed.sandiAdminSementara
                ? `[seed] Kata sandi sementara admin.owner (tampil SEKALI): ${seed.sandiAdminSementara}\n`
                : '')
          : '[seed] Basis data sudah terisi; tidak ada perubahan.\n',
      );
    }
  } finally {
    await koneksi.tutup();
  }
}

main().catch((err: unknown) => {
  console.error(`[db] ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
