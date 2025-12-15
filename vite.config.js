import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'public',
  publicDir: '../public',

  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'public/builder.html'),
        dashboard: resolve(__dirname, 'public/dashboard.html'),
        landing: resolve(__dirname, 'public/landing.html'),
        login: resolve(__dirname, 'public/login.html'),
        start: resolve(__dirname, 'public/start.html'),
        'prompt-generator': resolve(__dirname, 'public/prompt-generator.html')
      }
    },
    sourcemap: false,
    minify: false
  },

  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
});
