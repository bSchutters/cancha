import crypto from 'node:crypto'
import { test, expect } from '@playwright/test'
import { withDb, seedUser, waitForSchema, ADMIN } from './db'

/**
 * Creating a tournament from the custom /manage interface.
 *
 * This failed for every organizer with "Ce champ est requis" pointing at no
 * visible field: the multi-tenant plugin makes `tenant` required but only fills
 * it from the tenant-selector cookie of the Payload admin UI, which /manage
 * never sets. The form does not show a tenant field, so the error was
 * unactionable.
 */
test.beforeAll(async () => {
  await waitForSchema()
  await seedUser(ADMIN.email, ADMIN.password, 'admin')
})

/** A manager belonging to one organization, like a real customer. */
async function seedManager() {
  const email = 'orga@e2e.test'
  const password = 'E2eTest!2026'
  const uid = await seedUser(email, password, 'manager')
  const orgId = await withDb(async (c) => {
    const o = await c.query(
      `insert into organizations (name, slug) values ('Club Orga','e2e-orga-club')
       on conflict (slug) do update set name = excluded.name returning id`,
    )
    await c.query(`delete from users_tenants where _parent_id = $1`, [uid])
    await c.query(`insert into users_tenants (_order, _parent_id, id, tenant_id) values (1, $1, $2, $3)`, [
      uid,
      crypto.randomBytes(12).toString('hex'),
      o.rows[0].id,
    ])
    return o.rows[0].id as number
  })
  return { email, password, orgId }
}

test.describe('creating a tournament', () => {
  test('a manager can create one, and it lands in their organization', async ({ page }) => {
    const manager = await seedManager()
    const slug = `e2e-created-${Date.now()}`

    await page.goto('/fr/login')
    await page.locator('input[type="email"]').fill(manager.email)
    await page.locator('input[type="password"]').fill(manager.password)
    await page.locator('button[type="submit"]').click()
    await expect(page).toHaveURL(/\/manage/, { timeout: 15_000 })

    const res = await page.evaluate(async (s) => {
      const r = await fetch('/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: 'Tournoi E2E',
          slug: s,
          status: 'registration',
          sport: 'futsal',
          format: 'groups_ko',
          num_groups: 4,
          group_size: 4,
          qualifiers_per_group: 2,
        }),
      })
      return { status: r.status, body: await r.text() }
    }, slug)

    expect(res.status, `creation must succeed: ${res.body.slice(0, 300)}`).toBeLessThan(300)

    // It belongs to the creator's organization, not to nobody and not to another club.
    const tenantId = await withDb(async (c) => {
      const r = await c.query(`select tenant_id from tournaments where slug = $1`, [slug])
      return r.rows[0]?.tenant_id
    })
    expect(tenantId).toBe(manager.orgId)
  })
})
