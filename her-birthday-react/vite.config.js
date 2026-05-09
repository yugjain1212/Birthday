import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/Birthday/',
  plugins: [react()],
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === 'EVAL') return;
        warn(warning);
      }
    }
  }
})
