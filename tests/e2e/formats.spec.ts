import { test, expect } from '@playwright/test'
import { seedUser, seedLeagueTournament, seedSingleElimTournament, waitForSchema, ADMIN } from './db'

async function login(page: import('@playwright/test').Page) {
  await page.goto('/fr/login')
  await page.locator('input[type="email"]').fill(ADMIN.email)
  await page.locator('input[type="password"]').fill(ADMIN.password)
  await page.locator('button[type="submit"]').click()
  await expect(page).toHaveURL(/\/manage/, { timeout: 15_000 })
}

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

    // No finals: neither a "Résultats" (podium) tab nor an "Arbre" (bracket) tab.
    await expect(page.getByRole('button', { name: 'Résultats' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Arbre' })).toHaveCount(0)
  })
})

test.describe('single-elimination format', () => {
  test('generates a bracket from all teams via the dashboard', async ({ page }) => {
    const slug = await seedSingleElimTournament()
    await login(page)
    await page.goto(`/fr/manage/${slug}`)

    // The control zone offers a single "Générer le tableau" action (no draw/pools).
    const [resp] = await Promise.all([
      page.waitForResponse((r) => r.url().includes('/generate-bracket') && r.request().method() === 'POST'),
      page.getByRole('button', { name: 'Générer le tableau' }).click(),
    ])
    expect(resp.ok()).toBeTruthy()

    // The generated bracket shows up as an "Arbre" (bracket) tab on the public page.
    await page.goto(`/fr/${slug}`)
    await expect(page.getByRole('button', { name: 'Arbre' })).toBeVisible()
  })
})
