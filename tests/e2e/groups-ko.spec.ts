import { test, expect } from '@playwright/test'
import { seedUser, seedGroupsKoTournament, finishAllGroupMatches, waitForSchema, ADMIN } from './db'
import { login, publicUrl } from './helpers'

test.beforeAll(async () => {
  await waitForSchema()
  await seedUser(ADMIN.email, ADMIN.password, 'admin')
})

/**
 * The default format end to end, through the real dashboard buttons:
 * draw the pools, generate the schedule, then generate the finals once the
 * group matches are played. This is the flagship organizer journey.
 */
test.describe('groups + knockout (default format)', () => {
  test('draw, schedule, then finals from the dashboard', async ({ page }) => {
    const slug = await seedGroupsKoTournament()
    await login(page)
    await page.goto(`/fr/manage/${slug}`)

    // 1. Draw the pools.
    const [drawResp] = await Promise.all([
      page.waitForResponse((r) => r.url().includes('/draw') && r.request().method() === 'POST'),
      page.getByRole('button', { name: 'Tirage des poules' }).click(),
    ])
    expect(drawResp.ok()).toBeTruthy()

    // 2. Generate the schedule.
    const [schedResp] = await Promise.all([
      page.waitForResponse((r) => r.url().includes('/generate-schedule') && r.request().method() === 'POST'),
      page.getByRole('button', { name: 'Générer le calendrier' }).click(),
    ])
    expect(schedResp.ok()).toBeTruthy()

    // 3. Play every group match, then generate the finals.
    await finishAllGroupMatches(slug)
    await page.reload()
    const [koResp] = await Promise.all([
      page.waitForResponse((r) => r.url().includes('/generate-knockout') && r.request().method() === 'POST'),
      page.getByRole('button', { name: 'Phase finale' }).click(),
    ])
    expect(koResp.ok()).toBeTruthy()

    // 4. The public page now shows both the pools and the bracket.
    await page.goto(publicUrl('fr', slug))
    await expect(page.getByRole('button', { name: 'Arbre' })).toBeVisible()
    await page.getByRole('button', { name: 'Poules' }).click()
    await expect(page.getByText('Poule A').first()).toBeVisible()
    await expect(page.getByText('Poule B').first()).toBeVisible()

    // The bracket has real semi-finals fed by the pools (4 qualified teams).
    await page.getByRole('button', { name: 'Arbre' }).click()
    await expect(page.getByRole('heading', { name: 'Demi-finale' }).or(page.getByText('Demi-finale').first())).toBeVisible()
  })
})
