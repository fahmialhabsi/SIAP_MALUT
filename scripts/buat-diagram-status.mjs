// Menghasilkan docs/rekayasa/ALUR_PROSES.md dari kode domain (RK-06): diagram dan tabel perpindahan status.
// Pemakaian: npm run build -w packages/domain && npm run docs:status
// Dokumen ini DIHASILKAN OTOMATIS; jangan diedit tangan. Uji domain memeriksa bahwa isinya selaras dengan kode.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const akar = fileURLToPath(new URL('..', import.meta.url));
const domain = await import(new URL('../packages/domain/dist/index.js', import.meta.url));
const { ALUR_UTAMA, LABEL_STATUS_AGENDA, STATUS_AGENDA, TRANSISI_STATUS, diagramStatusMermaid } =
  domain;

const baris = [
  '# Alur Proses dan Status Agenda (RK-06)',
  '',
  '> **Dihasilkan otomatis** dari `packages/domain` oleh `scripts/buat-diagram-status.mjs` (`npm run docs:status`). **Jangan diedit tangan.** Aturan syarat tiap perpindahan: `docs/rekayasa/ATURAN_BISNIS.md`.',
  '',
  `Alur utama (empat langkah, Rancangan 11.2): ${ALUR_UTAMA.map((s) => LABEL_STATUS_AGENDA[s]).join(' → ')}.`,
  '',
  '```mermaid',
  diagramStatusMermaid(),
  '```',
  '',
  '| Dari | Boleh ke |',
  '|---|---|',
  ...STATUS_AGENDA.map((dari) => {
    const ke = TRANSISI_STATUS[dari].map((s) => LABEL_STATUS_AGENDA[s]).join(', ');
    return `| ${LABEL_STATUS_AGENDA[dari]} (\`${dari}\`) | ${ke || '(status akhir)'} |`;
  }),
  '',
];

writeFileSync(join(akar, 'docs', 'rekayasa', 'ALUR_PROSES.md'), baris.join('\n'));
process.stdout.write('[docs] docs/rekayasa/ALUR_PROSES.md dibuat dari kode domain.\n');
