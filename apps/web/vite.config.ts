import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vitest/config';

const dariSrc = (relatif: string) => fileURLToPath(new URL(relatif, import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'SIAP MALUT',
        short_name: 'SIAP MALUT',
        description: 'Sistem Informasi Administrasi Pimpinan Maluku Utara',
        lang: 'id',
        start_url: '/',
        display: 'standalone',
        // Manifest tidak dapat memakai var(); nilai di bawah = token --color-primary dan --color-bg (mode terang).
        theme_color: '#0b4a6f',
        background_color: '#f5f7fa',
        icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
      },
    }),
  ],
  resolve: {
    // Pengujian memakai kode sumber paket, bukan hasil build.
    alias:
      process.env.VITEST === 'true'
        ? {
            '@siap/shared': dariSrc('../../packages/shared/src/index.ts'),
            '@siap/domain': dariSrc('../../packages/domain/src/index.ts'),
          }
        : {},
  },
  test: {
    environment: 'jsdom',
    globals: false,
  },
});
