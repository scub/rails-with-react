import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import RubyPlugin from 'vite-plugin-ruby'

export default defineConfig({
  plugins: [
    react(),
    RubyPlugin(),
  ],
  resolve: {
    alias: {
      components: path.resolve(import.meta.dirname, 'app/javascript/components'),
      stores: path.resolve(import.meta.dirname, 'app/javascript/stores'),
      hooks: path.resolve(import.meta.dirname, 'app/javascript/hooks'),
      utils: path.resolve(import.meta.dirname, 'app/javascript/utils'),
      styles: path.resolve(import.meta.dirname, 'app/javascript/styles'),
    },
  },
  server: {
    host: true,
    cors: {
      origin: 'http://localhost:12347'
    }
  },
  test: {
    environment: 'jsdom',
    setupFiles: [path.resolve(import.meta.dirname, 'app/javascript/test/setup.js')],
    coverage: {
      provider: 'v8',
      reporter: ['json', 'json-summary', 'text'],
      reportsDirectory: '../../coverage',
      reportOnFailure: true,
    }
  },
})
