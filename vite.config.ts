import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  const currentDir = typeof import.meta.dirname !== 'undefined' ? import.meta.dirname : path.resolve();

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': currentDir,
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(currentDir, 'index.html'),
          siswa: path.resolve(currentDir, 'siswa.html'),
          pegawai: path.resolve(currentDir, 'pegawai.html'),
          cetak: path.resolve(currentDir, 'cetak.html'),
        },
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      allowedHosts: true as const,
      cors: true,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
