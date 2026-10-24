import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vitest/config';

// changeOrigin:false agar header Host tetap asal peramban (pemeriksaan Origin = Host di API; kuki SameSite=Strict).
const apiTarget = {
  target: `http://127.0.0.1:${process.env.SIAP_API_PORT ?? '3180'}`,
  changeOrigin: false,
};
const dariSrc = (relatif: string) => fileURLToPath(new URL(relatif, import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      // Navigasi ke /api, /health, /ready (unduhan lampiran, pemeriksaan kesehatan) tidak boleh dijawab index.html.
      workbox: { navigateFallbackDenylist: [/^\/api\//, /^\/health/, /^\/ready/] },
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
  // Panggilan /api diteruskan ke API (satu asal bagi peramban: kuki sesi SameSite=Strict berfungsi tanpa CORS).
  // `.trycloudflare.com`: terowongan sementara untuk peninjau jarak jauh (npm run dev:tunnel).
  server: {
    allowedHosts: ['.trycloudflare.com'],
    proxy: { '/api': apiTarget, '/health': apiTarget, '/ready': apiTarget },
  },
  preview: {
    allowedHosts: ['.trycloudflare.com'],
    proxy: { '/api': apiTarget, '/health': apiTarget, '/ready': apiTarget },
  },
  test: {
    environment: 'jsdom',
    globals: false,
    exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
  },
});
