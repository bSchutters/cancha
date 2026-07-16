import crypto from 'node:crypto'
import { Client } from 'pg'
import { TEST_DATABASE_URI } from '../../playwright.config'

/** A short-lived connection to the throwaway test database. */
export async function withDb<T>(fn: (c: Client) => Promise<T>): Promise<T> {
  const c = new Client({ connectionString: TEST_DATABASE_URI })
  await c.connect()
  try {
    return await fn(c)
  } finally {
    await c.end()
  }
}

/**
 * Seed a user directly (Payload's REST blocks creating the first user without an
 * admin, so we go straight to SQL — safe, it's a local throwaway DB). Password
 * hashing matches Payload exactly: pbkdf2(pw, salt, 25000, 512, 'sha256').
 */
export async function seedUser(email: string, password: string, role: 'admin' | 'manager') {
  const salt = crypto.randomBytes(32).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 25000, 512, 'sha256').toString('hex')
  return withDb(async (c) => {
    const res = await c.query(
      `insert into users (email, role, hash, salt, login_attempts, updated_at, created_at)
       values ($1, $2, $3, $4, 0, now(), now())
       on conflict (email) do update set hash = $3, salt = $4, role = $2, login_attempts = 0, lock_until = null
       returning id`,
      [email, role, hash, salt],
    )
    return res.rows[0].id as number
  })
}

export const ADMIN = { email: 'admin@e2e.test', password: 'E2eTest!2026' as const }
