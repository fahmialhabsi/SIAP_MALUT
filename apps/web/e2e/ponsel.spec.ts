import { expect, test } from '@playwright/test';
import { masukSebagaiAdmin, periksaStandar, tangkap } from './bantu';

test.describe('KB-007 dan KB-050: aplikasi pada layar ponsel', () => {
  test('layar Masuk memenuhi standar ponsel dan menolak sandi salah dengan pesan jelas', async ({
    page,
  }, info) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Masuk' })).toBeVisible();
    await expect(page.getByText('DATA CONTOH: bukan data resmi')).toBeVisible();
    await periksaStandar(page, 'masuk');
    await tangkap(page, info, '01-masuk');
    await page.getByLabel('Nama pengguna').fill('admin.owner');
    await page.getByLabel('Kata sandi', { exact: true }).fill('salah-salah-salah');
    await page.getByRole('button', { name: 'Masuk' }).click();
    await expect(page.getByRole('alert')).toHaveText('Nama pengguna atau kata sandi salah.');
  });

  test('alur admin: Beranda, Agenda 26 Oktober dengan bentrok, rincian, halaman Bentrok, Akun', async ({
    page,
  }, info) => {
    await masukSebagaiAdmin(page);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Selamat bekerja');
    await periksaStandar(page, 'beranda-admin');
    await tangkap(page, info, '02-beranda-admin');

    await page.goto('/agenda?tanggal=2026-10-26');
    await expect(
      page.getByRole('heading', { level: 2, name: /Senin, 26 Oktober 2026/ }),
    ).toBeVisible();
    await expect(page.locator('.kartu-kegiatan').first()).toBeVisible();
    expect(await page.locator('.kartu-kegiatan').count()).toBeGreaterThanOrEqual(4);
    await expect(page.locator('.lencana.status-bentrok').first()).toBeVisible();
    await periksaStandar(page, 'agenda-26-okt');
    await tangkap(page, info, '03-agenda-26-okt');

    await page.locator('.kartu-kegiatan').first().click();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Pihak yang diundang' })).toBeVisible();
    await periksaStandar(page, 'rincian');
    await tangkap(page, info, '04-rincian');

    await page.getByRole('link', { name: 'Bentrok' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Bentrok jadwal' })).toBeVisible();
    await periksaStandar(page, 'bentrok');
    await tangkap(page, info, '05-bentrok');

    await page.getByRole('link', { name: 'Akun' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Akun' })).toBeVisible();
    await periksaStandar(page, 'akun');
    await tangkap(page, info, '06-akun');
  });

  test('KB-032: persona demo mengubah dasbor dan navigasi; kembali ke akun asli; keluar', async ({
    page,
  }, info) => {
    await masukSebagaiAdmin(page);
    const pilih = page.getByLabel('Lihat sebagai');
    await pilih.selectOption({ label: 'Kepala Dinas Pendidikan (CONTOH)' });
    await expect(page.getByText('Anda melihat sebagai')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Penugasan menunggu konfirmasi saya' }),
    ).toBeVisible();
    await expect(
      page.getByRole('navigation', { name: 'Menu utama' }).getByText('Bentrok'),
    ).toHaveCount(0);
    await periksaStandar(page, 'beranda-pejabat');
    await tangkap(page, info, '07-beranda-pejabat');

    await pilih.selectOption({ label: 'Gubernur (CONTOH)' });
    await expect(page.getByRole('heading', { name: 'Menunggu arahan pimpinan' })).toBeVisible();
    await tangkap(page, info, '08-beranda-pimpinan');

    await page.getByRole('button', { name: 'Kembali ke akun asli' }).click();
    await expect(page.getByText('Anda melihat sebagai')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Ringkasan status' })).toBeVisible();

    await page.getByRole('link', { name: 'Akun' }).click();
    await page.getByRole('button', { name: 'Keluar' }).click();
    await expect(page.getByRole('heading', { name: 'Masuk' })).toBeVisible();
    // sesi sudah dicabut di server: halaman terlindungi tetap meminta masuk
    await page.goto('/agenda');
    await expect(page.getByRole('heading', { name: 'Masuk' })).toBeVisible();
  });

  test('KB-020: tema gelap dan terang lolos kontras pada halaman Akun', async ({ page }) => {
    await masukSebagaiAdmin(page);
    await page.getByRole('link', { name: 'Akun' }).click();
    await page.getByLabel('Gelap').check();
    await periksaStandar(page, 'akun-gelap');
    await page.getByLabel('Terang').check();
    await periksaStandar(page, 'akun-terang');
  });

  test('/api dan /health tidak dijawab dengan halaman aplikasi (service worker)', async ({
    page,
    request,
  }) => {
    await masukSebagaiAdmin(page);
    const sehat = await request.get('/health');
    expect(sehat.headers()['content-type']).toContain('json');
    const api = await page.evaluate(async () =>
      (await fetch('/api/saya')).headers.get('content-type'),
    );
    expect(api).toContain('json');
  });
});
