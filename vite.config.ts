import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: ['Chrome 69']
    })
  ],
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, './src')
    }
  },
  // base: '/usr/share/qt-superbird-app/webapp/'
  base: './'
})
