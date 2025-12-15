import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
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
      },
      output: {
        manualChunks: {
          'vendor': ['@supabase/supabase-js'],
          'editor': ['/public/app.js'],
          'dashboard': ['/public/dashboard.js'],
          'ui': ['/public/auth-ui.js', '/public/pricing-modal.js']
        }
      }
    },
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },

  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11']
    })
  ],

  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },

  optimizeDeps: {
    include: ['@supabase/supabase-js', 'dompurify', 'i18next']
  }
});
