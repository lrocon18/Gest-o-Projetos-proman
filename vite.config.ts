import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  // Base relativo: assets carregam corretamente no GitHub Pages (evita tela em branco)
  base: process.env.VITE_BASE_PATH ?? './',
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
})
