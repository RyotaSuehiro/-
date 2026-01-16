
import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    // Vercel上の環境変数 API_KEY を process.env.API_KEY としてコード内で使えるようにする
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  },
  build: {
    outDir: 'dist',
  },
  server: {
    port: 3000
  }
});
