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
 * Seed a groups + knockout tournament (the DEFAULT format): 8 confirmed teams,
 * 2 pools of 4, 2 qualifiers each, no draw and no matches yet. Ready to drive
 * the full organizer flow: draw, schedule, then finals. Returns the slug.
 */
export async function seedGroupsKoTournament(slug = 'e2e-groups') {
  return withDb(async (c) => {
    await c.query(`delete from tournament_matches where tournament_id in (select id from tournaments where slug = $1)`, [slug])
    await c.query(`delete from tournament_teams where tournament_id in (select id from tournaments where slug = $1)`, [slug])
    await c.query(`delete from tournaments where slug = $1`, [slug])
    await c.query(`delete from organizations where slug = $1`, [`${slug}-club`])

    const org = await c.query(`insert into organizations (name, slug) values ($1, $2) returning id`, [
      `E2E Groups Club ${slug}`,
      `${slug}-club`,
    ])
    const orgId = org.rows[0].id
    const tour = await c.query(
      `insert into tournaments (name, slug, sport, format, status, num_groups, group_size, qualifiers_per_group, tenant_id)
       values ('E2E Groups', $1, 'futsal', 'groups_ko', 'registration_closed', 2, 4, 2, $2) returning id`,
      [slug, orgId],
    )
    const tourId = tour.rows[0].id
    for (let i = 1; i <= 8; i++) {
      await c.query(
        `insert into tournament_teams (tournament_id, tenant_id, name, representative_email, representative_phone, registration_status)
         values ($1, $2, $3, 'e2e@e2e.test', '+32000', 'confirmed')`,
        [tourId, orgId, `Équipe ${i}`],
      )
    }
    return slug
  })
}

/**
 * Mark every GROUP match of a tournament as played, with varied scores so the
 * standings produce a clear order (no ties on points). Used to unlock the
 * "phase finale" step without driving dozens of score inputs by hand — score
 * entry itself is covered by the padel spec.
 */
export async function finishAllGroupMatches(slug: string) {
  await withDb(async (c) => {
    const res = await c.query(
      `select m.id from tournament_matches m
       join tournaments t on t.id = m.tournament_id
       where t.slug = $1 and m.phase = 'group' order by m.id`,
      [slug],
    )
    for (let i = 0; i < res.rows.length; i++) {
      // Cycle a few distinct results so teams don't all end up level.
      const [h, a] = [
        [3, 0],
        [1, 0],
        [2, 1],
        [0, 2],
        [4, 1],
        [1, 3],
      ][i % 6]
      await c.query(`update tournament_matches set score_home = $2, score_away = $3, status = 'finished' where id = $1`, [
        res.rows[i].id,
        h,
        a,
      ])
    }
    return res.rows.length
  })
}

/**
 * Seed a finished 3-team league for ANY sport, with a fixed result pattern so
 * the expected standings are known up front:
 *
 *   withDraws  : Alpha beats Bravo, Alpha beats Charlie, Bravo draws Charlie
 *   without    : Alpha beats Bravo, Alpha beats Charlie, Bravo beats Charlie
 *
 * Only the sport changes between runs, so any difference in the rendered
 * standings is attributable to the sport profile. Idempotent per sport.
 */
export async function seedSportLeague(sport: string, withDraws: boolean) {
  const slug = `e2e-sport-${sport}`
  return withDb(async (c) => {
    await c.query(`delete from tournament_matches where tournament_id in (select id from tournaments where slug = $1)`, [slug])
    await c.query(`delete from tournament_teams where tournament_id in (select id from tournaments where slug = $1)`, [slug])
    await c.query(`delete from tournaments where slug = $1`, [slug])
    await c.query(`delete from organizations where slug = $1`, [`${slug}-club`])

    const org = await c.query(`insert into organizations (name, slug) values ($1, $2) returning id`, [
      `E2E ${sport}`,
      `${slug}-club`,
    ])
    const orgId = org.rows[0].id
    const tour = await c.query(
      `insert into tournaments (name, slug, sport, format, status, num_groups, group_size, qualifiers_per_group, draw_revealed, tenant_id)
       values ($1, $2, $3, 'league', 'finished', 1, 3, 1, true, $4) returning id`,
      [`E2E ${sport}`, slug, sport, orgId],
    )
    const tourId = tour.rows[0].id
    const team = async (name: string) =>
      (
        await c.query(
          `insert into tournament_teams (tournament_id, tenant_id, name, representative_email, representative_phone, group_label, registration_status)
           values ($1, $2, $3, 'e2e@e2e.test', '+32000', 'A', 'confirmed') returning id`,
          [tourId, orgId, name],
        )
      ).rows[0].id
    const a = await team('Alpha')
    const b = await team('Bravo')
    const cc = await team('Charlie')
    const match = async (home: number, away: number, sh: number, sa: number, round: number) =>
      c.query(
        `insert into tournament_matches (tournament_id, tenant_id, phase, group_label, round, court, scheduled_time, home_team_id, away_team_id, score_home, score_away, status)
         values ($1, $2, 'group', 'A', $3, 1, '10:00', $4, $5, $6, $7, 'finished')`,
        [tourId, orgId, round, home, away, sh, sa],
      )
    await match(a, b, 3, 1, 1)
    await match(a, cc, 2, 0, 2)
    if (withDraws) await match(b, cc, 1, 1, 3)
    else await match(b, cc, 2, 1, 3)
    return slug
  })
}

/**
 * Seed a finished RUGBY league — three teams, all matches played. Rugby scores
 * 4 points for a win and 2 for a draw (not futsal's 3-1-0), so the leader ends
 * on 8 points: a total no other registered sport would produce. Proves the sport
 * profile really drives the standings. Idempotent. Returns the slug.
 */
export async function seedRugbyTournament() {
  const slug = 'e2e-rugby'
  return withDb(async (c) => {
    await c.query(`delete from tournament_matches where tournament_id in (select id from tournaments where slug = $1)`, [slug])
    await c.query(`delete from tournament_teams where tournament_id in (select id from tournaments where slug = $1)`, [slug])
    await c.query(`delete from tournaments where slug = $1`, [slug])
    await c.query(`delete from organizations where slug = $1`, ['e2e-rugby-club'])

    const org = await c.query(`insert into organizations (name, slug) values ('E2E Rugby Club', 'e2e-rugby-club') returning id`)
    const orgId = org.rows[0].id
    const tour = await c.query(
      `insert into tournaments (name, slug, sport, format, status, num_groups, group_size, qualifiers_per_group, draw_revealed, tenant_id)
       values ('E2E Rugby', $1, 'rugby', 'league', 'finished', 1, 3, 1, true, $2) returning id`,
      [slug, orgId],
    )
    const tourId = tour.rows[0].id
    const team = async (name: string) =>
      (
        await c.query(
          `insert into tournament_teams (tournament_id, tenant_id, name, representative_email, representative_phone, group_label, registration_status)
           values ($1, $2, $3, 'e2e@e2e.test', '+32000', 'A', 'confirmed') returning id`,
          [tourId, orgId, name],
        )
      ).rows[0].id
    const a = await team('Lions RC')
    const b = await team('Ours RC')
    const cc = await team('Aigles RC')
    const match = async (home: number, away: number, sh: number, sa: number, round: number) =>
      c.query(
        `insert into tournament_matches (tournament_id, tenant_id, phase, group_label, round, court, scheduled_time, home_team_id, away_team_id, score_home, score_away, status)
         values ($1, $2, 'group', 'A', $3, 1, '10:00', $4, $5, $6, $7, 'finished')`,
        [tourId, orgId, round, home, away, sh, sa],
      )
    // Lions win twice (4 + 4 = 8 pts). Ours and Aigles draw (2 pts each).
    await match(a, b, 20, 10, 1)
    await match(a, cc, 15, 5, 2)
    await match(b, cc, 12, 12, 3)
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
