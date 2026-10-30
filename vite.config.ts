import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // hoặc plugin vue tùy dự án của bạn

export default defineConfig({
  plugins: [react()],
  preview: {
    allowedHosts: ['buwonbookxeapp.onrender.com', 'true'], // Cho phép tên miền của Render truy cập
    host: true,
    port: 10000
  }
})

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
