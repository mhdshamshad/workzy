import path from 'path';
import { fileURLToPath } from 'url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    target: 'esnext',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('mapbox-gl')) {
              return 'vendor-mapbox';
            }
            if (id.includes('@radix-ui') || id.includes('/radix-ui/')) {
              return 'vendor-radix';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('framer-motion')) {
              return 'vendor-motion';
            }
            if (id.includes('emoji-picker-react')) {
              return 'vendor-emoji';
            }
            if (id.includes('recharts')) {
              return 'vendor-charts';
            }
            if (
              id.includes('@tanstack/react-query') ||
              id.includes('@reduxjs/toolkit') ||
              id.includes('react-redux')
            ) {
              return 'vendor-state';
            }
            if (
              id.includes('react-dom') ||
              id.includes('react-router-dom') ||
              id.includes('/react/')
            ) {
              return 'vendor-react';
            }
          }
        },
      },
    },
  },
});
