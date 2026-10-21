import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import wasm from 'vite-plugin-wasm';

// https://vite.dev/config/
export default defineConfig({
  plugins: [wasm(), tanstackRouter({ target: 'react', autoCodeSplitting: true }), react(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    sourcemap: true,
  },
  optimizeDeps: {
    exclude: ['parquet-wasm'],
  },
  server: {
    proxy: {
      '/titiler': {
        target: 'http://localhost:8989',
        changeOrigin: true,
      },
    },
  },
});
