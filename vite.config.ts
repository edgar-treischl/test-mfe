import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  // IMPORTANT for GitHub Pages deployment
  base: '/test-mfe/',

  plugins: [
    react(),
    federation({
      name: 'test-mfe',
      filename: 'remoteEntry.js',
      exposes: {
        './HRApp': './src/App.tsx',
      },

      // POC fix for TS issue
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
      } as any,
    }),
  ],

  server: {
    host: true,
    port: 5176,
    cors: true,
  },

  preview: {
    host: true,
    port: 5176,
  },

  build: {
    target: 'esnext',
    cssCodeSplit: false,
    minify: false,
  },
});