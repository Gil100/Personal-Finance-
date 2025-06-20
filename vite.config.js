import { defineConfig } from 'vite'

export default defineConfig({
  base: '/Personal-Finance-/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  },
  server: {
    port: 3000,
    open: true
  },
  css: {
    devSourcemap: true
  }
})