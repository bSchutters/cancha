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
 * Seed a Swiss tournament (3 rounds) with 4 confirmed teams and no matches yet
 * (ready for "Générer la ronde suivante"). Idempotent. Returns the slug.
 */
export async function seedSwissTournament() {
  const slug = 'e2e-swiss'
  return withDb(async (c) => {
    await c.query(`delete from tournament_matches where tournament_id in (select id from tournaments where slug = $1)`, [slug])
    await c.query(`delete from tournament_teams where tournament_id in (select id from tournaments where slug = $1)`, [slug])
    await c.query(`delete from tournaments where slug = $1`, [slug])
    await c.query(`delete from organizations where slug = $1`, ['e2e-swiss-club'])

    const org = await c.query(`insert into organizations (name, slug) values ('E2E Swiss Club', 'e2e-swiss-club') returning id`)
    const orgId = org.rows[0].id
    const tour = await c.query(
      `insert into tournaments (name, slug, sport, format, swiss_rounds, status, num_groups, group_size, tenant_id)
       values ('E2E Swiss', $1, 'futsal', 'swiss', 3, 'registration_closed', 2, 2, $2) returning id`,
      [slug, orgId],
    )
    const tourId = tour.rows[0].id
    for (const name of ['Swiss A', 'Swiss B', 'Swiss C', 'Swiss D']) {
      await c.query(
        `insert into tournament_teams (tournament_id, tenant_id, name, representative_email, representative_phone, registration_status)
         values ($1, $2, $3, 'e2e@e2e.test', '+32000', 'confirmed')`,
        [tourId, orgId, name],
      )
    }
    return slug
  })
}

/**
 * Seed a single-elimination tournament with 4 confirmed teams and NO matches yet
 * (ready for the "Générer le tableau" action). Idempotent. Returns the slug.
 */
export async function seedSingleElimTournament() {
  const slug = 'e2e-cup'
  return withDb(async (c) => {
    await c.query(`delete from tournament_matches where tournament_id in (select id from tournaments where slug = $1)`, [slug])
    await c.query(`delete from tournament_teams where tournament_id in (select id from tournaments where slug = $1)`, [slug])
    await c.query(`delete from tournaments where slug = $1`, [slug])
    await c.query(`delete from organizations where slug = $1`, ['e2e-cup-club'])

    const org = await c.query(`insert into organizations (name, slug) values ('E2E Cup Club', 'e2e-cup-club') returning id`)
    const orgId = org.rows[0].id
    const tour = await c.query(
      `insert into tournaments (name, slug, sport, format, status, num_groups, group_size, qualifiers_per_group, tenant_id)
       values ('E2E Cup', $1, 'futsal', 'single_elim', 'registration_closed', 2, 2, 1, $2) returning id`,
      [slug, orgId],
    )
    const tourId = tour.rows[0].id
    for (const name of ['Team A', 'Team B', 'Team C', 'Team D']) {
      await c.query(
        // tenant_id must match the tournament's — match creation validates it.
        `insert into tournament_teams (tournament_id, tenant_id, name, representative_email, representative_phone, registration_status)
         values ($1, $2, $3, 'e2e@e2e.test', '+32000', 'confirmed')`,
        [tourId, orgId, name],
      )
    }
    return slug
  })
}

/**
 * Seed a double-elimination tournament with 4 confirmed teams (a power of two)
 * and NO matches yet — ready for the "Générer le tableau" action. Idempotent.
 * Returns the slug.
 */
export async function seedDoubleElimTournament() {
  const slug = 'e2e-double'
  return withDb(async (c) => {
    await c.query(`delete from tournament_matches where tournament_id in (select id from tournaments where slug = $1)`, [slug])
    await c.query(`delete from tournament_teams where tournament_id in (select id from tournaments where slug = $1)`, [slug])
    await c.query(`delete from tournaments where slug = $1`, [slug])
    await c.query(`delete from organizations where slug = $1`, ['e2e-double-club'])

    const org = await c.query(`insert into organizations (name, slug) values ('E2E Double Club', 'e2e-double-club') returning id`)
    const orgId = org.rows[0].id
    const tour = await c.query(
      `insert into tournaments (name, slug, sport, format, status, num_groups, group_size, qualifiers_per_group, tenant_id)
       values ('E2E Double', $1, 'futsal', 'double_elim', 'registration_closed', 2, 2, 1, $2) returning id`,
      [slug, orgId],
    )
    const tourId = tour.rows[0].id
    for (const name of ['Duo A', 'Duo B', 'Duo C', 'Duo D']) {
      await c.query(
        // tenant_id must match the tournament's — match creation validates it.
        `insert into tournament_teams (tournament_id, tenant_id, name, representative_email, representative_phone, registration_status)
         values ($1, $2, $3, 'e2e@e2e.test', '+32000', 'confirmed')`,
        [tourId, orgId, name],
      )
    }
    return slug
  })
}

/**
 * Seed a finished LEAGUE (championnat) — futsal, one round-robin group of three
 * teams, all matches played. A league has no finals, so its standings are the
 * result. Idempotent. Returns the public slug.
 */
export async function seedLeagueTournament() {
  const slug = 'e2e-league'
  return withDb(async (c) => {
    await c.query(`delete from tournament_matches where tournament_id in (select id from tournaments where slug = $1)`, [slug])
    await c.query(`delete from tournament_teams where tournament_id in (select id from tournaments where slug = $1)`, [slug])
    await c.query(`delete from tournaments where slug = $1`, [slug])
    await c.query(`delete from organizations where slug = $1`, ['e2e-league-club'])

    const org = await c.query(`insert into organizations (name, slug) values ('E2E League Club', 'e2e-league-club') returning id`)
    const orgId = org.rows[0].id
    const tour = await c.query(
      `insert into tournaments (name, slug, sport, format, status, num_groups, group_size, qualifiers_per_group, draw_revealed, tenant_id)
       values ('E2E League', $1, 'futsal', 'league', 'finished', 1, 3, 1, true, $2) returning id`,
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
    const a = await team('Alpha FC')
    const b = await team('Bravo FC')
    const cc = await team('Charlie FC')
    const match = async (home: number, away: number, sh: number, sa: number, round: number) =>
      c.query(
        `insert into tournament_matches (tournament_id, tenant_id, phase, group_label, round, court, scheduled_time, home_team_id, away_team_id, score_home, score_away, status)
         values ($1, $2, 'group', 'A', $3, 1, '10:00', $4, $5, $6, $7, 'finished')`,
        [tourId, orgId, round, home, away, sh, sa],
      )
    await match(a, b, 3, 1, 1)
    await match(a, cc, 2, 0, 2)
    await match(b, cc, 1, 1, 3)
    return slug
  })
}

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
