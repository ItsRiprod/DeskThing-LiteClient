import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [
    react()
  ],
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, './src')
    }
  },
  // base: '/usr/share/qt-superbird-app/webapp/'
  base: './'
})
