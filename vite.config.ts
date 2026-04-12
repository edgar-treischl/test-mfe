import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'hr',
      filename: 'remoteEntry.js',
      exposes: {
        './HRApp': './src/App.tsx',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
  server: {
    host: true,
    port: 5176,
    cors: true,
  },
  build: {
    target: 'esnext',
    cssCodeSplit: false,
  },
});
