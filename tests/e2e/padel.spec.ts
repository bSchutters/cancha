import { test, expect } from '@playwright/test'
import { seedUser, seedPadelTournament, waitForSchema, resetE2eData, ADMIN } from './db'

// Wait for the app to have pushed the schema, clear leftover fixtures, then seed.
test.beforeAll(async () => {
  await waitForSchema()
  await resetE2eData()
  await seedUser(ADMIN.email, ADMIN.password, 'admin')
})

test.describe('backoffice auth', () => {
  test('a manager can log into the backoffice', async ({ page }) => {
    await page.goto('/fr/login')
    await page.locator('input[type="email"]').fill(ADMIN.email)
    await page.locator('input[type="password"]').fill(ADMIN.password)
    await page.locator('button[type="submit"]').click()
    await expect(page).toHaveURL(/\/(fr|nl|en)\/manage/, { timeout: 15_000 })
  })
})

test.describe('padel (set-based sport)', () => {
  test('public page ranks by sets and shows the per-set breakdown', async ({ page }) => {
    const slug = await seedPadelTournament()

    await page.goto(`/fr/${slug}`)

    // The default "Poules" tab shows the standings. A set-based sport labels the
    // score columns "Sets gagnés / perdus" (SG / SP) instead of "Buts".
    const standings = page.locator('table').first()
    await expect(standings.getByRole('columnheader', { name: 'SG' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'SG' }).first()).toHaveAttribute(
      'title',
      'Sets gagnés',
    )

    // The calendar's match card shows the per-set game scores 6-4 / 3-6 / 6-2.
    await page.getByRole('button', { name: 'Calendrier' }).click()
    await expect(page.getByText('6-4', { exact: true })).toBeVisible()
    await expect(page.getByText('3-6', { exact: true })).toBeVisible()
    await expect(page.getByText('6-2', { exact: true })).toBeVisible()
  })

  test('the score editor uses per-set entry for a padel match', async ({ page }) => {
    const slug = await seedPadelTournament()

    // Log in, then open the tournament's score-entry page.
    await page.goto('/fr/login')
    await page.locator('input[type="email"]').fill(ADMIN.email)
    await page.locator('input[type="password"]').fill(ADMIN.password)
    await page.locator('button[type="submit"]').click()
    await expect(page).toHaveURL(/\/manage/, { timeout: 15_000 })

    await page.goto(`/fr/manage/${slug}/scores`)

    // The set-based card shows the live "Sets" tally derived from the games.
    await expect(page.getByText('Sets', { exact: false }).first()).toBeVisible()
    await expect(page.getByText('2 - 1').first()).toBeVisible()
  })
})
