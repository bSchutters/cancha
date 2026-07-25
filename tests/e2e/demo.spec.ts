import { test, expect, request as playwrightRequest } from '@playwright/test'
import { waitForSchema, seedGroupsKoTournament } from './db'
import { publicUrl } from './helpers'

/**
 * The live demo, end to end: the reset endpoint rebuilds it, the showcase is a
 * genuinely finished tournament, and the published credentials really open the
 * organizer console on the playground.
 *
 * The demo is rebuilt ONCE for the whole file. /api/demo/reset is rate-limited
 * to a few calls per window (rebuilding runs the entire engine), so calling it
 * per test would make the last ones fail with a 429 — the limiter doing exactly
 * its job.
 */
let demo: { showcaseSlug: string; playgroundSlug: string; email: string; password: string }

test.beforeAll(async ({ baseURL }) => {
  await waitForSchema()
  const ctx = await playwrightRequest.newContext({ baseURL })
  const res = await ctx.post('/api/demo/reset')
  expect(res.ok(), `demo reset failed: ${await res.text()}`).toBeTruthy()
  demo = (await res.json()).data
  await ctx.dispose()
})

async function loginAsDemo(page: import('@playwright/test').Page) {
  await page.goto('/fr/login')
  await page.locator('input[type="email"]').fill(demo.email)
  await page.locator('input[type="password"]').fill(demo.password)
  await page.locator('button[type="submit"]').click()
  await expect(page).toHaveURL(/\/manage/, { timeout: 15_000 })
}

test.describe('live demo', () => {
  test('the showcase is a finished tournament, the playground is untouched', async ({ page }) => {
    await page.goto(publicUrl('fr', demo.showcaseSlug))
    await expect(page.getByRole('button', { name: 'Résultats' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Arbre' })).toBeVisible()
    await page.getByRole('button', { name: 'Poules' }).click()
    await expect(page.getByText('Real Sporting').first()).toBeVisible()

    // The playground is waiting for a visitor: teams confirmed, nothing generated.
    await page.goto(publicUrl('fr', demo.playgroundSlug))
    await expect(page.getByText('Les Corsaires').first()).toBeVisible()
    await expect(page.getByRole('button', { name: 'Arbre' })).toHaveCount(0)
  })

  test('every showcase match is played, final included', async ({ page }) => {
    // The first seed fetched the matches once, so the final still had no teams
    // and was skipped: the podium announced a champion while the bracket showed
    // an empty final. A visitor would have seen the product contradict itself.
    await page.goto(publicUrl('fr', demo.showcaseSlug))
    await page.getByRole('button', { name: 'Arbre' }).click()
    await expect(page.getByRole('heading', { name: 'Finale', exact: true })).toBeVisible()

    // "–" is what an unplayed slot renders: no match may still show it.
    const bracket = page.locator('main')
    await expect(bracket).not.toContainText('–')

    // And the podium exists, so a champion was actually decided.
    await page.getByRole('button', { name: 'Résultats' }).click()
    await expect(page.getByText('Podium')).toBeVisible()
  })

  test('the published credentials can drive the playground', async ({ page }) => {
    await loginAsDemo(page)
    await page.goto(`/fr/manage/${demo.playgroundSlug}`)
    const [drawResp] = await Promise.all([
      page.waitForResponse((r) => r.url().includes('/draw') && r.request().method() === 'POST'),
      page.getByRole('button', { name: 'Tirage des poules' }).click(),
    ])
    expect(drawResp.ok(), 'the demo account must be able to run the draw').toBeTruthy()
  })

  test('the demo account cannot reach another organization', async ({ page, request }) => {
    // Publishing working credentials is only safe because of the tenant guard.
    await loginAsDemo(page)
    const cookie = (await page.context().cookies()).map((c) => `${c.name}=${c.value}`).join('; ')
    const otherSlug = await seedGroupsKoTournament('e2e-not-demo')
    const res = await request.post(`/api/tournament/${otherSlug}/draw`, { headers: { cookie } })
    expect(res.status(), 'the demo account must not touch another club').toBe(401)
  })
})
