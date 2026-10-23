import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from './App';
import { TEKS_UI } from './teks-ui';

afterEach(cleanup);

describe('KB-033: spanduk DATA CONTOH', () => {
  it('KB-033: spanduk tampil pada mode demo', () => {
    render(<App mode="demo" />);
    expect(screen.getByRole('status').textContent).toBe(TEKS_UI.spandukContoh);
  });

  it('KB-033: spanduk tidak tampil pada mode production', () => {
    render(<App mode="production" />);
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.queryByText(TEKS_UI.spandukContoh)).toBeNull();
  });
});

describe('KB-004 dan KB-036: halaman awal', () => {
  it('KB-004: menampilkan empat langkah alur status berurutan', () => {
    render(<App mode="production" />);
    const langkah = screen.getAllByRole('listitem').map((el) => el.textContent ?? '');
    expect(langkah).toHaveLength(4);
    expect(langkah[0]).toContain('Baru');
    expect(langkah[1]).toContain('Menunggu Arahan');
    expect(langkah[2]).toContain('Ditetapkan');
    expect(langkah[3]).toContain('Terkonfirmasi');
  });

  it('KB-036: judul dan subjudul berasal dari berkas teks UI', () => {
    render(<App mode="production" />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(TEKS_UI.namaAplikasi);
    expect(screen.getByText(TEKS_UI.subjudul)).toBeTruthy();
  });
});
