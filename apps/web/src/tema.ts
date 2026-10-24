export type PilihanTema = 'sistem' | 'terang' | 'gelap';
const KUNCI = 'siap.tema';

/** Penyimpanan perangkat bisa diblokir (mode privat): semua akses dibungkus, tampilan tetap benar tanpanya. */
export function bacaTema(): PilihanTema {
  try {
    const nilai = localStorage.getItem(KUNCI);
    return nilai === 'terang' || nilai === 'gelap' ? nilai : 'sistem';
  } catch {
    return 'sistem';
  }
}

export function terapkanTema(pilihan: PilihanTema): void {
  const akar = document.documentElement;
  if (pilihan === 'sistem') akar.removeAttribute('data-theme');
  else akar.setAttribute('data-theme', pilihan === 'terang' ? 'light' : 'dark');
}

export function simpanTema(pilihan: PilihanTema): void {
  terapkanTema(pilihan);
  try {
    if (pilihan === 'sistem') localStorage.removeItem(KUNCI);
    else localStorage.setItem(KUNCI, pilihan);
  } catch {
    // tidak dapat menyimpan: pilihan berlaku untuk sesi ini saja
  }
}
