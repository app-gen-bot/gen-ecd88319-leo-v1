import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: './client',
  envDir: '../',  // Load .env files from parent (where .env.local lives)
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
  // IMPORTANT: When root is './client', Vite resolves relative to that directory
  // So we need to ensure the server serves from the parent directory context
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5013',
        changeOrigin: true,
      },
      '/wsi': {
        target: 'ws://localhost:5013',
        ws: true,
      },
    },
  },
});
