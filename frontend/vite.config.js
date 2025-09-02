import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src'
    },
  },
  base: "./",
  build: {
    outDir: path.resolve(__dirname, "../dist/frontend"), // ⬅️ compila fuera de /frontend
    emptyOutDir: true
  }
})
