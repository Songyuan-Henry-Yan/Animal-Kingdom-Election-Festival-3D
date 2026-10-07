import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  // Listen on the LAN so classmates can open the teacher's dev server directly.
  server: { host: true },
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        // Split the big libraries into their own files: browsers download them in
        // parallel and keep them cached when only the game code changes.
        manualChunks(id) {
          const p = id.replace(/\\/g, '/');
          if (p.includes('/node_modules/three/')) return 'three';
          if (p.includes('/node_modules/')) return 'vendor';
          return undefined;
        },
      },
    },
  },
});
