import { test, expect } from '@playwright/test'
import { seedUser, seedLeagueTournament, waitForSchema, ADMIN } from './db'

test.beforeAll(async () => {
  await waitForSchema()
  await seedUser(ADMIN.email, ADMIN.password, 'admin')
})

test.describe('league format (championnat)', () => {
  test('public page shows the standings and no finals/bracket', async ({ page }) => {
    const slug = await seedLeagueTournament()
    await page.goto(`/fr/${slug}`)

    // The pools tab (standings) is the result — a seeded team is listed.
    await expect(page.getByText('Alpha FC').first()).toBeVisible()

    // No finals: neither a "Résultats" (podium) tab nor a "Tableau" (bracket) tab.
    await expect(page.getByRole('button', { name: 'Résultats' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Tableau' })).toHaveCount(0)
  })
})
