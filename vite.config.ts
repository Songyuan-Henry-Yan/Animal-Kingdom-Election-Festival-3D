import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  // Listen on the LAN so classmates can open the teacher's dev server directly.
  server: { host: true },
});
