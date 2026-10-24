import { useEffect, useId, useRef, type ReactNode } from 'react';
import { GalatApi } from '../api/klien';
import { TEKS_UI } from '../teks-ui';

/** Lembar bawah (dialog modal) untuk tindakan cepat di ponsel. Esc atau latar menutup; fokus kembali ke pemicu. */
export function LembarBawah({
  judul,
  onTutup,
  children,
}: {
  judul: string;
  onTutup: () => void;
  children: ReactNode;
}) {
  const idJudul = useId();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sebelumnya = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const tombolEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onTutup();
    };
    document.addEventListener('keydown', tombolEsc);
    return () => {
      document.removeEventListener('keydown', tombolEsc);
      sebelumnya?.focus?.();
    };
  }, [onTutup]);

  return (
    <div className="lembar-latar">
      <button
        type="button"
        className="lembar-tutup-latar"
        aria-label={TEKS_UI.tindakan.tutupLembar}
        onClick={onTutup}
      />
      <div
        ref={ref}
        className="lembar"
        role="dialog"
        aria-modal="true"
        aria-labelledby={idJudul}
        tabIndex={-1}
      >
        <h2 id={idJudul} className="judul-bagian">
          {judul}
        </h2>
        {children}
      </div>
    </div>
  );
}

/** Pesan galat API: pesan utama ditambah rincian aturan (422) bila ada. */
export function PesanGalat({ galat }: { galat: unknown }) {
  if (!galat) return null;
  if (!(galat instanceof GalatApi))
    return (
      <p className="pesan-galat" role="alert">
        {TEKS_UI.tindakan.gagal}
      </p>
    );
  return (
    <div className="pesan-galat" role="alert">
      <p>{galat.status === 0 ? TEKS_UI.galat.jaringan : galat.message}</p>
      {galat.rincian.length > 0 && (
        <ul>
          {galat.rincian.map((r, i) => (
            <li key={i}>{r.pesan}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
