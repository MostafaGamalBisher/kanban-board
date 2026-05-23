import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@assets': '/src/assets',
      '@utils': '/src/utils',
      '@hooks': '/src/hooks',
    },
  },
  plugins: [react(), tailwindcss()],
  base: '/kanban-board/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});
