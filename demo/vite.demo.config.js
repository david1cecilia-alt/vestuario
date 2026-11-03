// Build de demostración: un único HTML con todo dentro y datos de ejemplo (sin Supabase ni PWA)
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { fileURLToPath } from 'node:url';

const demoData = fileURLToPath(new URL('./demo-data.js', import.meta.url));

export default defineConfig({
  root: fileURLToPath(new URL('..', import.meta.url)),
  base: './',
  build: { outDir: 'demo/dist', emptyOutDir: true, assetsInlineLimit: 100_000_000, cssCodeSplit: false, target: 'es2020' },
  resolve: { alias: [{ find: /^\.\/data\.js$/, replacement: demoData }] },
  plugins: [viteSingleFile({ removeViteModuleLoader: true })],
});
