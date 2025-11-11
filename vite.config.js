import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  base: '/pdf-viewer/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: './index.html'
    }
  }
});
