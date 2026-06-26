import { defineConfig } from 'vitest/config'
import path from 'path'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(dirname, './src'),
    },
  },
  test: {
    // Scope: the pure engines under src/lib (tournament structure + sport rules).
    include: ['src/lib/**/*.test.ts'],
    environment: 'node',
  },
})
