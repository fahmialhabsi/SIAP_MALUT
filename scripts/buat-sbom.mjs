// Membuat SBOM (CycloneDX) dan ringkasan lisensi dari berkas kunci (MU-09, AK-02).
// Pemakaian: node scripts/buat-sbom.mjs [label]   (label bawaan: terkini)
// Keluaran: docs/audit/sbom/sbom-<label>.cdx.json dan docs/audit/sbom/LISENSI.md (dihasilkan otomatis; jangan diedit tangan).
import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const akar = fileURLToPath(new URL('..', import.meta.url));
const label = process.argv[2] ?? 'terkini';
const folder = join(akar, 'docs', 'audit', 'sbom');
mkdirSync(folder, { recursive: true });

const mentah = execSync('npm sbom --sbom-format cyclonedx --omit dev', {
  cwd: akar,
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024,
});
const sbom = JSON.parse(mentah);
writeFileSync(join(folder, `sbom-${label}.cdx.json`), JSON.stringify(sbom, null, 2) + '\n');

// Paket kerja (workspace) proyek ini; tidak diperlakukan sebagai komponen pihak ketiga.
const NAMA_INTERNAL = new Set(['api', 'web', 'domain', 'shared']);
const komponen = sbom.components ?? [];
const perLisensi = new Map();
const internal = [];
for (const k of komponen) {
  const nama = `${k.name}@${k.version}`;
  const daftar = (k.licenses ?? []).map((l) => l.license?.id ?? l.license?.name ?? l.expression);
  if (daftar.length === 0) {
    if (NAMA_INTERNAL.has(k.name) || String(k.name).startsWith('@siap/')) internal.push(nama);
    else
      (
        perLisensi.get('TIDAK DIKETAHUI (periksa manual)') ??
        perLisensi
          .set('TIDAK DIKETAHUI (periksa manual)', [])
          .get('TIDAK DIKETAHUI (periksa manual)')
      ).push(nama);
    continue;
  }
  const kunci = daftar.join(' / ');
  if (!perLisensi.has(kunci)) perLisensi.set(kunci, []);
  perLisensi.get(kunci).push(nama);
}

const baris = [
  '# Ringkasan Lisensi Komponen (dihasilkan otomatis)',
  '',
  `Sumber: \`sbom-${label}.cdx.json\` (CycloneDX, hanya dependensi produksi). Dibuat oleh \`scripts/buat-sbom.mjs\`. **Jangan diedit tangan.**`,
  '',
  `Jumlah komponen pihak ketiga: ${komponen.length - internal.length}. Paket internal SIAP MALUT: ${internal.length}.`,
  '',
  '| Lisensi | Jumlah |',
  '|---|---|',
  ...[...perLisensi.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .map(([l, d]) => `| ${l} | ${d.length} |`),
  '',
];
const tak = perLisensi.get('TIDAK DIKETAHUI (periksa manual)');
if (tak) baris.push('## Perlu diperiksa manual', '', ...tak.map((n) => `- ${n}`), '');
writeFileSync(join(folder, 'LISENSI.md'), baris.join('\n'));
process.stdout.write(`[sbom] ${komponen.length} komponen, label "${label}".\n`);
