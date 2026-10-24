import type { DefRute, Deps } from '../rute.js';
import { ruteAdmin } from './admin.js';
import { ruteAuth } from './auth.js';
import { ruteKegiatan } from './kegiatan.js';
import { ruteLampiran } from './lampiran.js';

/** Seluruh rute aplikasi (sumber untuk pemasangan, uji hak akses, dan OpenAPI). */
export function daftarRute(deps: Deps): DefRute[] {
  return [...ruteAuth(deps), ...ruteKegiatan(deps), ...ruteLampiran(deps), ...ruteAdmin(deps)];
}
