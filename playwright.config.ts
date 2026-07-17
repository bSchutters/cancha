import { defineConfig, devices } from '@playwright/test'

// Hermetic E2E: the whole run targets a THROWAWAY local Postgres (never the
// shared Supabase). See tests/e2e/README.md for how it fits together:
//   1. global-setup drops + recreates the local `cancha_test` database,
//   2. webServer boots an isolated dev server on it (NODE_ENV=development, so
//      Payload `push` auto-creates the schema on first request),
//   3. specs seed their fixtures (admin user, etc.) then drive the UI.
//
// Requires a local Postgres on 127.0.0.1:55432 (run `scripts/e2e-pg.sh`) and no
// other `next dev` running (Next 16 allows a single dev server per project).

const PORT = 3100
const BASE_URL = `http://localhost:${PORT}`
export const TEST_DATABASE_URI =
  process.env.E2E_DATABASE_URI ?? 'postgresql://postgres@127.0.0.1:55432/cancha_test'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  globalSetup: './tests/e2e/global-setup.ts',
  use: { baseURL: BASE_URL, trace: 'on-first-retry', screenshot: 'only-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `next dev -p ${PORT}`,
    url: `${BASE_URL}/api/tournament/list`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      // Passed to the child process → Next keeps it over .env → we hit ONLY the
      // local test DB. PAYLOAD_SECRET is a throwaway; blob/resend stay unset.
      DATABASE_URI: TEST_DATABASE_URI,
      PAYLOAD_SECRET: 'e2e-test-secret-key-1234567890',
      NODE_ENV: 'development',
    },
  },
})
