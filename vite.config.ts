import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // Three.js lives in its own lazy chunk (3D mode only), so the main bundle stays small.
  build: { chunkSizeWarningLimit: 600 },
})

