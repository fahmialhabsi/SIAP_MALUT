import { z } from 'zod';
import type { ApiConfig } from '@siap/shared';
import type { EntriAudit } from '../db/audit.js';
import type { PenggunaAktif } from '../keamanan/sesi.js';
import type { Deps } from '../rute.js';
import { ProfilSkema } from '../skema-dto.js';

/** Nama aktor pada log audit; bila admin memakai persona demo, keduanya dicatat. */
export function aktorAudit(p: PenggunaAktif): Pick<EntriAudit, 'aktor' | 'aktorPeran'> {
  return {
    aktor: p.sebagaiPersona
      ? `${p.asli.username} (sebagai ${p.efektif.username})`
      : p.asli.username,
    aktorPeran: p.efektif.peran,
  };
}

export function konteksAudit(req: { id: string; ip: string }): Pick<EntriAudit, 'reqId' | 'ip'> {
  return { reqId: req.id, ip: req.ip };
}

export function buatProfil(p: PenggunaAktif, config: ApiConfig): z.infer<typeof ProfilSkema> {
  return {
    username: p.efektif.username,
    nama: p.efektif.nama,
    peran: p.efektif.peran as z.infer<typeof ProfilSkema>['peran'],
    pejabatId: p.efektif.pejabatId,
    izin: [...p.izin].sort(),
    mode: config.appMode,
    sebagaiPersona: p.sebagaiPersona,
    akunAsli: p.sebagaiPersona ? p.asli.username : null,
  };
}

export const sekarang = (deps: Deps): Date => deps.sekarang();

/** Menyamarkan nilai rahasia sebelum masuk log audit (mis. tautan rapat). */
export const SAMAR = '[disamarkan]';
