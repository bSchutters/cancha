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
    // Scope: pure (non-DOM) tests anywhere under src — the engines in src/lib
    // (tournament structure + sport rules) plus the i18n dictionary checks.
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
})
