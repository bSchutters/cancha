import { Client } from 'pg'
import { TEST_DATABASE_URI } from '../../playwright.config'

// Safety net: make sure the test database exists (scripts/e2e-pg.sh already
// creates it). We DO NOT drop it here — the webServer may already have connected
// and pushed the schema by the time this runs, and dropping would wipe it.
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
        `Run \`pnpm e2e:pg\` first. (${(err as Error).message})`,
    )
  }
  const exists = await admin.query('select 1 from pg_database where datname = $1', [dbName])
  if (exists.rowCount === 0) await admin.query(`create database ${dbName}`)
  await admin.end()
}
