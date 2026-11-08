import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'https://telemedicine-app-mr3o.onrender.com',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'https://telemedicine-app-mr3o.onrender.com',
        changeOrigin: true,
      },
    },
  },
})