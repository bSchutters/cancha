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

/**
 * Wait until the app (via Payload `push`) has created the schema. The webServer
 * pushes lazily on its first request, which can land just after this hook
 * starts, so we poll for the `users` table before seeding.
 */
export async function waitForSchema(timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs
  for (;;) {
    const ready = await withDb(async (c) => {
      const r = await c.query(
        `select 1 from information_schema.tables where table_schema = 'public' and table_name = 'users'`,
      )
      return (r.rowCount ?? 0) > 0
    }).catch(() => false)
    if (ready) return
    if (Date.now() > deadline) throw new Error('E2E: schema was not pushed in time (no `users` table)')
    await new Promise((r) => setTimeout(r, 500))
  }
}

/** Remove any leftover e2e fixtures so each run starts clean (idempotent). */
export async function resetE2eData() {
  await withDb(async (c) => {
    await c.query(`delete from users where email like '%@e2e.test'`)
  })
}

export const ADMIN = { email: 'admin@e2e.test', password: 'E2eTest!2026' as const }

/**
 * Seed a live Padel tournament with one finished group match whose per-set
 * scores are 6-4 / 3-6 / 6-2 (so the match is won 2 sets to 1). Idempotent —
 * clears any previous `e2e-padel` data first. Returns the public slug.
 */
export async function seedPadelTournament() {
  const oid = () => crypto.randomBytes(12).toString('hex')
  const slug = 'e2e-padel'
  return withDb(async (c) => {
    // Clean previous run (matches cascade their set_scores rows).
    await c.query(
      `delete from tournament_matches where tournament_id in (select id from tournaments where slug = $1)`,
      [slug],
    )
    await c.query(`delete from tournament_teams where tournament_id in (select id from tournaments where slug = $1)`, [slug])
    await c.query(`delete from tournaments where slug = $1`, [slug])
    await c.query(`delete from organizations where slug = $1`, ['e2e-club'])

    const org = await c.query(`insert into organizations (name, slug) values ('E2E Club', 'e2e-club') returning id`)
    const orgId = org.rows[0].id

    const tour = await c.query(
      `insert into tournaments (name, slug, sport, status, num_groups, group_size, qualifiers_per_group, draw_revealed, tenant_id)
       values ('E2E Padel', $1, 'padel', 'live', 2, 2, 1, true, $2) returning id`,
      [slug, orgId],
    )
    const tourId = tour.rows[0].id

    const team = async (name: string) =>
      (
        await c.query(
          `insert into tournament_teams (tournament_id, name, representative_email, representative_phone, group_label, registration_status)
           values ($1, $2, 'e2e@e2e.test', '+32000', 'A', 'confirmed') returning id`,
          [tourId, name],
        )
      ).rows[0].id
    const home = await team('Dupont / Martin')
    const away = await team('Nadal / Federer')

    const match = await c.query(
      `insert into tournament_matches (tournament_id, tenant_id, phase, group_label, round, court, scheduled_time, home_team_id, away_team_id, score_home, score_away, status)
       values ($1, $2, 'group', 'A', 1, 1, '10:00', $3, $4, 2, 1, 'finished') returning id`,
      [tourId, orgId, home, away],
    )
    const matchId = match.rows[0].id
    const sets = [
      [6, 4],
      [3, 6],
      [6, 2],
    ]
    for (let i = 0; i < sets.length; i++) {
      await c.query(
        `insert into tournament_matches_set_scores (_order, _parent_id, id, home, away) values ($1, $2, $3, $4, $5)`,
        [i + 1, matchId, oid(), sets[i][0], sets[i][1]],
      )
    }
    return slug
  })
}
