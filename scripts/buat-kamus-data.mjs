// Menghasilkan kamus data dan inventaris data pribadi dari skema Drizzle (RK-02, KM-02, KB-043).
// Pemakaian: npm run build -w apps/api && npm run docs:data
// Dokumen DIHASILKAN OTOMATIS; jangan diedit tangan. Uji api memeriksa kesesuaiannya dengan skema.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getTableConfig } from 'drizzle-orm/pg-core';

const akar = fileURLToPath(new URL('..', import.meta.url));
const skema = await import(new URL('../apps/api/dist/db/schema.js', import.meta.url));
const { SEMUA_TABEL, SENSITIVITAS, KETERANGAN_TABEL } = skema;

const tabel = Object.values(SEMUA_TABEL).map((t) => getTableConfig(t));

const kamus = [
  '# Kamus Data (RK-02)',
  '',
  '> **Dihasilkan otomatis** dari `apps/api/src/db/schema.ts` oleh `scripts/buat-kamus-data.mjs` (`npm run docs:data`). **Jangan diedit tangan.** Migrasi basis data: `apps/api/drizzle/`.',
  '',
  'Sensitivitas: **biasa** = tidak memuat data pribadi; **pribadi** = data pribadi (UU 27/2022); **rahasia** = kredensial/akses; **audit** = jejak audit.',
  '',
  `Jumlah tabel: ${tabel.length}.`,
  '',
];
for (const t of tabel) {
  kamus.push(`## ${t.name}`, '', KETERANGAN_TABEL[t.name] ?? '(tanpa keterangan)', '');
  kamus.push(
    '| Kolom | Tipe | Wajib | Bawaan | Kunci | Sensitivitas |',
    '|---|---|---|---|---|---|',
  );
  const fk = new Map();
  for (const f of t.foreignKeys) {
    const r = f.reference();
    r.columns.forEach((c, i) =>
      fk.set(c.name, `FK → ${getTableConfig(r.foreignTable).name}.${r.foreignColumns[i]?.name}`),
    );
  }
  for (const c of t.columns) {
    const kunci = [c.primary ? 'PK' : '', c.isUnique ? 'unik' : '', fk.get(c.name) ?? '']
      .filter(Boolean)
      .join(', ');
    const bawaan = c.hasDefault ? 'ya' : '';
    kamus.push(
      `| \`${c.name}\` | ${c.getSQLType()} | ${c.notNull ? 'ya' : ''} | ${bawaan} | ${kunci} | ${SENSITIVITAS[`${t.name}.${c.name}`] ?? '(belum ditetapkan)'} |`,
    );
  }
  if (t.checks.length > 0)
    kamus.push('', `Batasan (CHECK): ${t.checks.map((c) => `\`${c.name}\``).join(', ')}.`);
  kamus.push('');
}
writeFileSync(join(akar, 'docs', 'rekayasa', 'KAMUS_DATA.md'), kamus.join('\n'));

const sensitif = [];
for (const t of tabel) {
  for (const c of t.columns) {
    const s = SENSITIVITAS[`${t.name}.${c.name}`];
    if (s === 'pribadi' || s === 'rahasia') sensitif.push({ tabel: t.name, kolom: c.name, s });
  }
}
const inv = [
  '# Inventaris Data Pribadi (KM-02)',
  '',
  '> Bagian tabel **dihasilkan otomatis** dari `SENSITIVITAS` pada skema oleh `scripts/buat-kamus-data.mjs` (`npm run docs:data`). Bagian keterangan di bawahnya ditulis tangan dan ditinjau tiap fitur data baru. Rujukan regulasi (UU 27/2022 dan turunannya) wajib diverifikasi di JDIH.',
  '',
  '## 1. Kolom yang memuat data pribadi atau rahasia',
  '',
  '| Tabel | Kolom | Jenis |',
  '|---|---|---|',
  ...sensitif.map((x) => `| ${x.tabel} | \`${x.kolom}\` | ${x.s} |`),
  '',
  `Total: ${sensitif.length} kolom.`,
  '',
  '## 2. Keterangan (ditulis tangan)',
  '',
  '| Hal | Ketentuan saat ini |',
  '|---|---|',
  '| Subjek data | Pimpinan, pejabat, petugas, pengguna aplikasi, kontak pengundang |',
  '| Tujuan | Penyusunan agenda, penugasan kehadiran, koordinasi protokol, kontrol akses dan jejak audit |',
  '| Dasar pemrosesan | Pelaksanaan tugas dan fungsi Biro Administrasi Pimpinan (Pergub Malut 36/2021); persetujuan bila ditentukan hukum (perlu ditinjau) |',
  '| Data nyata | **Belum ada.** Seluruh data berupa data contoh berlabel CONTOH (Tahap P menggantinya) |',
  '| Lokasi penyimpanan | PostgreSQL (kontainer) atau PGlite (pengembangan); lampiran di penyimpanan berkas (Tahap 1.3b) |',
  '| Akses | Berbasis peran (Tahap 1.3b); tautan rapat hanya untuk yang ditugaskan dan Protokol |',
  '| Perlindungan | Kata sandi di-hash scrypt; hanya hash token sesi disimpan; log audit append-only; tidak ada data pribadi di log aplikasi biasa (diverifikasi manual; uji otomatis menyusul) |',
  '| Retensi dan penghapusan | **Belum ditetapkan** (KM-04, Tahap 2); log audit tidak dapat dihapus |',
  '| Penilaian dampak (DPIA) | Belum (KM-03, Tahap 1.6) |',
  '',
];
writeFileSync(join(akar, 'docs', 'keamanan', 'INVENTARIS_DATA_PRIBADI.md'), inv.join('\n'));
process.stdout.write(
  `[docs] KAMUS_DATA.md (${tabel.length} tabel) dan INVENTARIS_DATA_PRIBADI.md (${sensitif.length} kolom) dibuat dari skema.\n`,
);
