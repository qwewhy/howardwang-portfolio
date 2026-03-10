import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { repoBasePath } from './src/shared/config/site'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? repoBasePath : '/',
  plugins: [react()],
  build: {
    target: 'es2022',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) {
            return 'three-vendor'
          }

          return undefined
        },
      },
    },
  },
}))
