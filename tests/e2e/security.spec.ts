import crypto from 'node:crypto'
import { test, expect } from '@playwright/test'
import { withDb, seedUser, seedGroupsKoTournament, waitForSchema } from './db'

/**
 * Regression tests for two real vulnerabilities found in the July 2026 audit.
 * Both attacks below succeeded before the fix, so these tests fail loudly if the
 * guards are ever removed.
 */

/** A manager belonging to its own, separate organization. */
async function seedAttacker() {
  const email = 'attacker@e2e.test'
  const password = 'E2eTest!2026'
  const uid = await seedUser(email, password, 'manager')
  await withDb(async (c) => {
    // Upsert: the org survives across runs (a tournament may reference it), so
    // delete-then-insert would leave us with no row and a null tenant id.
    const o = await c.query(
      `insert into organizations (name, slug) values ('Attacker Org','attacker-org')
       on conflict (slug) do update set name = excluded.name returning id`,
    )
    await c.query(`delete from users_tenants where _parent_id = $1`, [uid])
    await c.query(`insert into users_tenants (_order, _parent_id, id, tenant_id) values (1, $1, $2, $3)`, [
      uid,
      crypto.randomBytes(12).toString('hex'),
      o.rows[0].id,
    ])
  })
  return { email, password }
}

test.beforeAll(async () => {
  await waitForSchema()
})

test.describe('tenant isolation', () => {
  test('a manager cannot act on another organization’s tournament', async ({ page, request }) => {
    const victimSlug = await seedGroupsKoTournament('e2e-victim')
    const victim = await withDb(async (c) => {
      const r = await c.query(`select id from tournaments where slug = $1`, [victimSlug])
      return r.rows[0]
    })
    const attacker = await seedAttacker()

    await page.goto('/fr/login')
    await page.locator('input[type="email"]').fill(attacker.email)
    await page.locator('input[type="password"]').fill(attacker.password)
    await page.locator('button[type="submit"]').click()
    await expect(page).toHaveURL(/\/manage/, { timeout: 15_000 })
    const cookie = (await page.context().cookies()).map((c) => `${c.name}=${c.value}`).join('; ')

    // Every mutating route must refuse: the caller manages a different org.
    for (const path of ['draw', 'generate-schedule', 'generate-bracket', 'generate-swiss-round', 'reset']) {
      const res = await request.post(`/api/tournament/${victim.id}/${path}`, { headers: { cookie } })
      expect(res.status(), `${path} must not be reachable across tenants`).toBe(401)
    }

    // And nothing was written: no team was assigned to a pool.
    const grouped = await withDb(async (c) => {
      const r = await c.query(
        `select count(*)::int as n from tournament_teams where tournament_id = $1 and group_label is not null`,
        [victim.id],
      )
      return r.rows[0].n
    })
    expect(grouped, 'the victim tournament must be untouched').toBe(0)
  })

  test('a manager cannot enter a score on another organization’s match', async ({ page, request }) => {
    const slug = await seedGroupsKoTournament('e2e-victim-score')
    // Give the victim tournament one match to target.
    const matchId = await withDb(async (c) => {
      const t = await c.query(`select id, tenant_id from tournaments where slug = $1`, [slug])
      const teams = await c.query(`select id from tournament_teams where tournament_id = $1 limit 2`, [t.rows[0].id])
      const m = await c.query(
        `insert into tournament_matches (tournament_id, tenant_id, phase, group_label, round, court, scheduled_time, home_team_id, away_team_id, status)
         values ($1, $2, 'group', 'A', 1, 1, '10:00', $3, $4, 'scheduled') returning id`,
        [t.rows[0].id, t.rows[0].tenant_id, teams.rows[0].id, teams.rows[1].id],
      )
      return m.rows[0].id
    })
    const attacker = await seedAttacker()

    await page.goto('/fr/login')
    await page.locator('input[type="email"]').fill(attacker.email)
    await page.locator('input[type="password"]').fill(attacker.password)
    await page.locator('button[type="submit"]').click()
    await expect(page).toHaveURL(/\/manage/, { timeout: 15_000 })
    const cookie = (await page.context().cookies()).map((c) => `${c.name}=${c.value}`).join('; ')

    const res = await request.post(`/api/tournament/match/${matchId}/score`, {
      headers: { cookie, 'content-type': 'application/json' },
      data: { scoreHome: 5, scoreAway: 0 },
    })
    expect(res.status()).toBe(401)

    const score = await withDb(async (c) => {
      const r = await c.query(`select score_home from tournament_matches where id = $1`, [matchId])
      return r.rows[0].score_home
    })
    expect(score, 'the score must not have been written').toBeNull()
  })
})

test.describe('personal data', () => {
  test('team representatives’ email and phone are not public', async ({ request }) => {
    await seedGroupsKoTournament('e2e-pii')
    const res = await request.get('/api/tournament-teams?limit=5')
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.docs.length).toBeGreaterThan(0)
    for (const doc of body.docs) {
      // The team itself stays public (names are shown on the public page);
      // only the representative's contact details must be stripped.
      expect(doc.name).toBeTruthy()
      expect(doc.representative_email, 'representative email must not be public').toBeUndefined()
      expect(doc.representative_phone, 'representative phone must not be public').toBeUndefined()
    }
  })
})
