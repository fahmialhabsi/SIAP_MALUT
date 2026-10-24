import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, type TestInfo } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Nilai uji untuk basis data sementara lokal (sama dengan playwright.config.ts); bukan rahasia.
const SANDI_UJI = 'sandi-uji-e2e-lokal-123';
const FOLDER_BUKTI = fileURLToPath(
  new URL('../../../docs/audit/bukti-gate/tangkapan-1.4a/', import.meta.url),
);

export async function masukSebagaiAdmin(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByLabel('Nama pengguna').fill('admin.owner');
  await page.getByLabel('Kata sandi', { exact: true }).fill(SANDI_UJI);
  await page.getByRole('button', { name: 'Masuk' }).click();
  await expect(page.getByRole('navigation', { name: 'Menu utama' })).toBeVisible();
}

export async function tangkap(page: Page, info: TestInfo, nama: string): Promise<void> {
  mkdirSync(FOLDER_BUKTI, { recursive: true });
  await page.screenshot({
    path: `${FOLDER_BUKTI}${info.project.name}-${nama}.png`,
    fullPage: true,
  });
}

/** Pemeriksaan standar ponsel: tanpa gulir horizontal, teks isi >= 16 px, target sentuh >= 48 px, status ikon + teks, axe. */
export async function periksaStandar(page: Page, nama: string): Promise<void> {
  const ringkas = await page.evaluate(() => {
    const lebar = document.documentElement.scrollWidth - document.documentElement.clientWidth;
    const kecil: string[] = [];
    for (const el of document.querySelectorAll('main *')) {
      if (el.closest('.sr-saja') || el.closest('svg')) continue;
      const langsung = [...el.childNodes].some(
        (n) => n.nodeType === Node.TEXT_NODE && (n.textContent ?? '').trim().length > 0,
      );
      if (!langsung) continue;
      const ukuran = parseFloat(getComputedStyle(el).fontSize);
      if (ukuran < 15.99) {
        kecil.push(
          `${el.tagName}.${el.className}: ${ukuran}px "${(el.textContent ?? '').slice(0, 30)}"`,
        );
      }
    }
    const sempit: string[] = [];
    const kontrol = document.querySelectorAll(
      'main a, main button, main input:not([type=radio]), main select, nav a',
    );
    for (const el of kontrol) {
      if (el.closest('.sr-saja') || el.classList.contains('lewati')) continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      if (r.height < 47.5 || r.width < 47.5) {
        sempit.push(
          `${el.tagName}.${el.className}: ${Math.round(r.width)}x${Math.round(r.height)} "${(el.textContent ?? '').trim().slice(0, 30)}"`,
        );
      }
    }
    const lencanaTanpaIkon = [...document.querySelectorAll('.lencana')]
      .filter((l) => !l.querySelector('svg') || (l.textContent ?? '').trim() === '')
      .map((l) => l.className);
    return { lebar, kecil, sempit, lencanaTanpaIkon };
  });
  expect(ringkas.lebar, `${nama}: gulir horizontal`).toBeLessThanOrEqual(0);
  expect(ringkas.kecil, `${nama}: teks di bawah 16 px`).toEqual([]);
  expect(ringkas.sempit, `${nama}: target sentuh di bawah 48 px`).toEqual([]);
  expect(ringkas.lencanaTanpaIkon, `${nama}: status tanpa ikon+teks`).toEqual([]);

  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(
    axe.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`),
    `${nama}: pelanggaran aksesibilitas (axe)`,
  ).toEqual([]);
}
