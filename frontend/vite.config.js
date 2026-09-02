import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // During local dev, the frontend runs on :5173 and the backend on
      // :3001 (see backend/server.js). This proxy lets the frontend call
      // relative "/api/..." paths either way, matching production where
      // both are served from the same Vercel deployment.
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
