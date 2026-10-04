import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    host: '127.0.0.1',
    port: Number(process.env.PORT) || 5173,
    strictPort: true,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'three',
      '@react-three/fiber',
      '@react-three/drei',
      '@react-three/rapier',
      '@react-three/postprocessing',
      'postprocessing',
      'howler',
      'seedrandom',
    ],
  },
  build: {
    target: 'es2022',
    sourcemap: true,
  },
})
