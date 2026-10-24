import { expect, test } from '@playwright/test';
import { masukSebagaiAdmin, periksaStandar, tangkap } from './bantu';

const PDF_KECIL = Buffer.from('%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n');

test.describe('KB-001, KB-002, KB-005, KB-013, KB-047: tindakan pada layar ponsel', () => {
  test('alur utama: undangan baru, lampiran, keputusan wakilkan, pejabat menerima, status terkonfirmasi', async ({
    page,
  }, info) => {
    const judul = `Peresmian Uji ${info.project.name} CONTOH`;
    // Tanggal berbeda per proyek: kegiatan proyek sebelumnya tetap ada dan akan menjadi bentrok pasti bagi pengganti yang sama.
    const tanggal = info.project.name.includes('gelap') ? '2026-11-05' : '2026-11-03';
    await masukSebagaiAdmin(page);

    // 1. Form undangan
    await page.goto(`/agenda?tanggal=${tanggal}`);
    await page.getByRole('link', { name: 'Tambah undangan' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Undangan baru' })).toBeVisible();
    await page.getByLabel('Judul kegiatan *').fill(judul);
    await page.getByLabel('Tanggal (WIT) *').fill(tanggal);
    await page.getByLabel('Jam mulai (WIT) *').fill('09:00');
    await page.getByLabel('Jam selesai (WIT, boleh kosong)').fill('11:00');
    await page.getByLabel('Lokasi', { exact: true }).fill('Lokasi Contoh Z');
    await page.getByLabel('Nama PIC pengundang').fill('PIC Contoh');
    await page.getByLabel('Kontak PIC pengundang').fill('0800-000-0001');
    await page.getByRole('checkbox', { name: 'Gubernur (CONTOH)', exact: true }).check();
    await periksaStandar(page, 'form-undangan');
    await tangkap(page, info, '10-form-undangan');
    await page.getByRole('button', { name: 'Simpan', exact: true }).click();
    await expect(page.getByRole('heading', { level: 1, name: judul })).toBeVisible();

    // 2. Lampiran (galeri)
    await page
      .getByLabel('Pilih berkas', { exact: true })
      .setInputFiles({ name: 'undangan.pdf', mimeType: 'application/pdf', buffer: PDF_KECIL });
    await page.getByRole('button', { name: 'Unggah' }).click();
    await expect(page.getByRole('link', { name: /undangan\.pdf/ })).toBeVisible();

    // 3. Keputusan kehadiran: wakilkan ke Kepala Dinas Pangan
    await page.getByRole('button', { name: /Putuskan kehadiran: Gubernur/ }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByLabel('Wakilkan').check();
    await page
      .getByLabel('Pejabat pengganti')
      .selectOption({ label: 'Kepala Dinas Pangan (CONTOH)' });
    await periksaStandar(page, 'lembar-keputusan');
    await tangkap(page, info, '11-lembar-keputusan');
    await page.getByRole('button', { name: 'Simpan keputusan' }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByText('Ditugaskan, menunggu konfirmasi')).toBeVisible();
    await periksaStandar(page, 'rincian-setelah-keputusan');
    await tangkap(page, info, '12-rincian-setelah-keputusan');
    const alamat = page.url();

    // 4. Pejabat pengganti menerima penugasan
    await page.getByLabel('Lihat sebagai').selectOption({ label: 'Kepala Dinas Pangan (CONTOH)' });
    await expect(
      page.getByRole('heading', { name: 'Penugasan menunggu konfirmasi saya' }),
    ).toBeVisible();
    await page.goto(alamat);
    await page.getByRole('button', { name: 'Terima penugasan' }).click();
    await expect(page.getByText('Anda telah menerima penugasan ini.')).toBeVisible();
    await tangkap(page, info, '13-pejabat-menerima');

    // 5. Kembali ke akun asli; pindah status sampai Terkonfirmasi
    await page.getByRole('button', { name: 'Kembali ke akun asli' }).click();
    await page.goto(alamat);
    await page.getByRole('button', { name: 'Pindahkan ke Menunggu Arahan' }).click();
    await page.getByRole('button', { name: 'Pindahkan status' }).click();
    await page.getByRole('button', { name: 'Pindahkan ke Ditetapkan' }).click();
    await page.getByRole('button', { name: 'Pindahkan status' }).click();
    await page.getByRole('button', { name: 'Pindahkan ke Terkonfirmasi' }).click();
    await page.getByRole('button', { name: 'Pindahkan status' }).click();
    await expect(page.locator('.lencana', { hasText: 'Terkonfirmasi' }).first()).toBeVisible();
    await periksaStandar(page, 'rincian-terkonfirmasi');
    await tangkap(page, info, '14-rincian-terkonfirmasi');

    // 6. Log audit memuat keputusan kehadiran
    await page.getByRole('link', { name: 'Lainnya' }).click();
    await page.getByRole('link', { name: 'Log audit' }).click();
    await expect(page.getByText('Keputusan kehadiran').first()).toBeVisible();
    await periksaStandar(page, 'audit');
    await tangkap(page, info, '15-audit');
  });

  test('keputusan tunda wajib beralasan; pengaturan dapat diubah admin', async ({ page }, info) => {
    await masukSebagaiAdmin(page);
    await page.goto('/agenda?tanggal=2026-10-24');
    await page.locator('.kartu-kegiatan', { hasText: 'Makan Malam' }).first().click();
    await page.getByRole('button', { name: /Putuskan kehadiran: Gubernur/ }).click();
    await page.getByLabel('Tunda', { exact: true }).check();
    const kirim = page.getByRole('button', { name: 'Simpan keputusan' });
    await expect(kirim).toBeDisabled();
    await page.getByLabel('Alasan menunda (wajib)').fill('Menunggu kepastian tamu');
    await expect(kirim).toBeEnabled();
    await page.getByRole('button', { name: 'Batal', exact: true }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);

    await page.getByRole('link', { name: 'Lainnya' }).click();
    await page.getByRole('link', { name: 'Pengaturan' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Pengaturan' })).toBeVisible();
    const durasi = page.getByLabel('Durasi bawaan kegiatan (menit)');
    await durasi.fill('120');
    await page.getByRole('button', { name: 'Simpan', exact: true }).click();
    await expect(page.getByText('Tersimpan.')).toBeVisible();
    await periksaStandar(page, 'pengaturan');
    await tangkap(page, info, '16-pengaturan');
  });
});
