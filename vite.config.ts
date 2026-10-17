import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Inline the app stylesheet into index.html at build time. A separate CSS file blocks the
// first paint until it downloads; inlined, the boot screen paints as soon as the HTML arrives.
const inlineAppCss = (): Plugin => ({
  name: 'lumi-inline-app-css',
  apply: 'build',
  enforce: 'post',
  transformIndexHtml: {
    order: 'post',
    handler(html, ctx) {
      if (!ctx.bundle) return html
      const bundle = ctx.bundle
      return html.replace(/<link rel="stylesheet" crossorigin href="\/(assets\/[^"]+\.css)">/g, (tag, file: string) => {
        const asset = bundle[file]
        if (!asset || asset.type !== 'asset') return tag
        return `<style>${String(asset.source)}</style>`
      })
    },
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    inlineAppCss(),
  ],
  // Three.js lives in its own lazy chunk (3D mode only), so the main bundle stays small.
  build: { chunkSizeWarningLimit: 600 },
})
