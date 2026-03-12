import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const siteBasePath = process.env.SITE_BASE_PATH ?? '/'
const normalizedBasePath = siteBasePath.endsWith('/') ? siteBasePath : `${siteBasePath}/`

// https://vite.dev/config/
export default defineConfig(() => ({
  base: normalizedBasePath,
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
