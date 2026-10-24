/**
 * Menghasilkan dokumen OpenAPI 3.1 dari registri rute (KB-043). Tidak ditulis tangan:
 * jalankan `npm run docs:api` setelah build; uji memeriksa bahwa berkas docs/rekayasa/openapi.json selaras.
 */
import { z } from 'zod';
import type { DefRute } from './rute.js';
import { NAMA_KUKI } from './keamanan/sesi.js';

type Skema = Record<string, unknown>;

function jsonSchema(skema: z.ZodType, io: 'input' | 'output'): Skema {
  const { $schema: _abaikan, ...sisa } = z.toJSONSchema(skema, {
    io,
    unrepresentable: 'any',
  }) as Skema & { $schema?: string };
  return sisa;
}

function parameter(skema: z.ZodType, lokasi: 'path' | 'query') {
  const js = jsonSchema(skema, 'input') as {
    properties?: Record<string, Skema>;
    required?: string[];
  };
  const wajib = new Set(js.required ?? []);
  return Object.entries(js.properties ?? {}).map(([nama, s]) => ({
    name: nama,
    in: lokasi,
    required: lokasi === 'path' ? true : wajib.has(nama),
    schema: s,
  }));
}

const keJalurOpenApi = (jalur: string) => jalur.replace(/:([A-Za-z0-9_]+)/g, '{$1}');
const idOperasi = (d: DefRute) =>
  `${d.metode}_${d.jalur
    .replace(/^\/api\//, '')
    .replace(/[/:]+/g, '_')
    .replace(/_+$/, '')}`;

export function buatOpenApi(daftar: readonly DefRute[]): Skema {
  const paths: Record<string, Record<string, Skema>> = {
    '/health': {
      get: {
        tags: ['Infrastruktur'],
        summary: 'Proses hidup',
        operationId: 'get_health',
        responses: { '200': { description: '{"status":"ok"}' } },
      },
    },
    '/ready': {
      get: {
        tags: ['Infrastruktur'],
        summary: 'Siap melayani (memeriksa basis data)',
        operationId: 'get_ready',
        responses: {
          '200': { description: 'Siap' },
          '503': { description: 'Basis data tidak dapat dijangkau' },
        },
      },
    },
  };

  const urut = [...daftar].sort(
    (a, b) => a.jalur.localeCompare(b.jalur) || a.metode.localeCompare(b.metode),
  );
  for (const d of urut) {
    const jalur = keJalurOpenApi(d.jalur);
    const parameters = [
      ...(d.params ? parameter(d.params, 'path') : []),
      ...(d.query ? parameter(d.query, 'query') : []),
    ];
    const responses: Record<string, Skema> = {};
    for (const [kode, r] of Object.entries(d.respons)) {
      responses[kode] = {
        description: r.deskripsi,
        ...(r.skema
          ? { content: { 'application/json': { schema: jsonSchema(r.skema, 'output') } } }
          : r.tipeIsi
            ? { content: { [r.tipeIsi]: { schema: { type: 'string', format: 'binary' } } } }
            : {}),
      };
    }
    const operasi: Skema = {
      tags: [d.tag],
      summary: d.ringkasan,
      operationId: idOperasi(d),
      ...(parameters.length > 0 ? { parameters } : {}),
      ...(d.multipart
        ? {
            requestBody: {
              required: true,
              content: {
                'multipart/form-data': {
                  schema: {
                    type: 'object',
                    required: ['berkas'],
                    properties: { berkas: { type: 'string', format: 'binary' } },
                  },
                },
              },
            },
          }
        : d.body
          ? {
              requestBody: {
                required: true,
                content: { 'application/json': { schema: jsonSchema(d.body, 'input') } },
              },
            }
          : {}),
      responses,
      ...(d.publik ? { security: [] } : { security: [{ kuki: [] }] }),
      ...(d.izin ? { 'x-izin': [...d.izin] } : {}),
    };
    (paths[jalur] ??= {})[d.metode] = operasi;
  }

  return {
    openapi: '3.1.0',
    info: {
      title: 'SIAP MALUT API',
      version: '0.1.0',
      description:
        'Sistem Informasi Administrasi Pimpinan Maluku Utara. DIHASILKAN OTOMATIS dari registri rute (jangan diedit tangan). ' +
        'Autentikasi lewat kuki sesi httpOnly (POST /api/sesi). `x-izin`: salah satu izin cukup (matriks peran x izin: lihat MATRIKS_HAK_AKSES.md). ' +
        'Semua data pada tahap pembangunan adalah data contoh.',
    },
    servers: [{ url: '/' }],
    tags: [
      'Infrastruktur',
      'Autentikasi',
      'Kegiatan',
      'Lampiran',
      'Direktori',
      'Administrasi',
      'Demo',
    ].map((name) => ({ name })),
    paths,
    components: {
      securitySchemes: { kuki: { type: 'apiKey', in: 'cookie', name: NAMA_KUKI } },
    },
  };
}
