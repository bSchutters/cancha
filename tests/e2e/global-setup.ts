import { Client } from 'pg'
import { TEST_DATABASE_URI } from '../../playwright.config'

// Reset the throwaway database to a clean state before every run. We connect to
// the default `postgres` database, drop + recreate `cancha_test`, and let the
// webServer's first request push the fresh Payload schema.
export default async function globalSetup() {
  const url = new URL(TEST_DATABASE_URI)
  const dbName = url.pathname.replace(/^\//, '')
  const admin = new Client({
    host: url.hostname,
    port: Number(url.port || 5432),
    user: url.username || 'postgres',
    password: url.password || undefined,
    database: 'postgres',
  })
  try {
    await admin.connect()
  } catch (err) {
    throw new Error(
      `E2E: cannot reach the local test Postgres at ${url.hostname}:${url.port}. ` +
        `Start it with \`scripts/e2e-pg.sh\` first. (${(err as Error).message})`,
    )
  }
  // Terminate stale connections so DROP DATABASE succeeds.
  await admin.query(`select pg_terminate_backend(pid) from pg_stat_activity where datname = $1`, [dbName])
  await admin.query(`drop database if exists ${dbName}`)
  await admin.query(`create database ${dbName}`)
  await admin.end()
  // eslint-disable-next-line no-console
  console.log(`[e2e] fresh database "${dbName}" ready`)
}
