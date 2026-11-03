import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/vestuario/',
  build: { target: 'es2020', chunkSizeWarningLimit: 900 },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/apple-touch-icon.png'],
      manifest: {
        name: 'Vestuario',
        short_name: 'Vestuario',
        description: 'Feedback rápido de los entrenamientos de balonmano y baloncesto',
        lang: 'es',
        start_url: '/vestuario/',
        scope: '/vestuario/',
        display: 'standalone',
        orientation: 'any',
        background_color: '#16202B',
        theme_color: '#16202B',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        navigateFallbackDenylist: [/^\/vestuario\/auth/],
      },
    }),
  ],
});
