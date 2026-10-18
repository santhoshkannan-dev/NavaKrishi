import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      'decimal.js-light': resolve(__dirname, 'node_modules/decimal.js-light/decimal.mjs'),
      'eventemitter3': resolve(__dirname, 'node_modules/eventemitter3/index.mjs'),
      'react-is': resolve(__dirname, 'src/shims/react-is/index.js'),
      'es-toolkit/compat/get': resolve(__dirname, 'src/shims/es-toolkit/compat/get.js'),
      'es-toolkit/compat/isPlainObject': resolve(__dirname, 'src/shims/es-toolkit/compat/isPlainObject.js'),
      'es-toolkit/compat/last': resolve(__dirname, 'src/shims/es-toolkit/compat/last.js'),
      'es-toolkit/compat/maxBy': resolve(__dirname, 'src/shims/es-toolkit/compat/maxBy.js'),
      'es-toolkit/compat/minBy': resolve(__dirname, 'src/shims/es-toolkit/compat/minBy.js'),
      'es-toolkit/compat/omit': resolve(__dirname, 'src/shims/es-toolkit/compat/omit.js'),
      'es-toolkit/compat/range': resolve(__dirname, 'src/shims/es-toolkit/compat/range.js'),
      'es-toolkit/compat/sortBy': resolve(__dirname, 'src/shims/es-toolkit/compat/sortBy.js'),
      'es-toolkit/compat/sumBy': resolve(__dirname, 'src/shims/es-toolkit/compat/sumBy.js'),
      'es-toolkit/compat/throttle': resolve(__dirname, 'src/shims/es-toolkit/compat/throttle.js'),
      'es-toolkit/compat/uniqBy': resolve(__dirname, 'src/shims/es-toolkit/compat/uniqBy.js'),
      'use-sync-external-store/with-selector': resolve(__dirname, 'src/shims/use-sync-external-store/shim/with-selector.js'),
      'use-sync-external-store/shim/with-selector.js': resolve(__dirname, 'src/shims/use-sync-external-store/shim/with-selector.js'),
      'use-sync-external-store/shim/with-selector': resolve(__dirname, 'src/shims/use-sync-external-store/shim/with-selector.js'),
      'use-sync-external-store/with-selector.js': resolve(__dirname, 'src/shims/use-sync-external-store/shim/with-selector.js'),
    },
  },
  optimizeDeps: {
    exclude: ['recharts', 'react-redux', 'use-sync-external-store'],
  },
  server: {
    proxy: {
      // Proxy API requests to Django backend
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      // Proxy websocket connections to backend (enable ws upgrade)
      '/ws': {
        target: 'http://127.0.0.1:8000',
        ws: true,
        changeOrigin: true,
      },
    },
  },
})