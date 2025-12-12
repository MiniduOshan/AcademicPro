import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  server: {
    proxy: {
      // Proxy API during local dev to avoid CORS
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})