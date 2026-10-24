import { TEKS_UI } from '../teks-ui';

/** Spanduk DATA CONTOH pada mode demo (KB-033). */
export function Spanduk({ mode }: { mode?: string }) {
  if (mode !== 'demo') return null;
  return (
    <div className="spanduk-contoh" role="status">
      {TEKS_UI.spandukContoh}
    </div>
  );
}
