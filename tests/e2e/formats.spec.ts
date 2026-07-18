import { test, expect } from '@playwright/test'
import {
  seedUser,
  seedLeagueTournament,
  seedSingleElimTournament,
  seedDoubleElimTournament,
  seedSwissTournament,
  waitForSchema,
  ADMIN,
} from './db'
import { publicUrl } from './helpers'

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
    await page.goto(publicUrl('fr', slug))

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
    await page.goto(publicUrl('fr', slug))
    await expect(page.getByRole('button', { name: 'Arbre' })).toBeVisible()
  })
})

test.describe('double-elimination format', () => {
  test('generates winners + losers brackets shown as sections on the public page', async ({ page }) => {
    const slug = await seedDoubleElimTournament()
    await login(page)
    await page.goto(`/fr/manage/${slug}`)

    // Same single "Générer le tableau" action as single elimination.
    const [resp] = await Promise.all([
      page.waitForResponse((r) => r.url().includes('/generate-bracket') && r.request().method() === 'POST'),
      page.getByRole('button', { name: 'Générer le tableau' }).click(),
    ])
    expect(resp.ok()).toBeTruthy()

    // The public bracket tab shows both halves of the draw.
    await page.goto(publicUrl('fr', slug))
    await page.getByRole('button', { name: 'Arbre' }).click()
    await expect(page.getByRole('heading', { level: 3, name: 'Tableau des gagnants' })).toBeVisible()
    await expect(page.getByRole('heading', { level: 3, name: 'Tableau des perdants' })).toBeVisible()
    await expect(page.getByRole('heading', { level: 3, name: 'Grande finale' })).toBeVisible()
  })
})

test.describe('swiss format', () => {
  test('generates a round via the dashboard and shows the standings', async ({ page }) => {
    const slug = await seedSwissTournament()
    await login(page)
    await page.goto(`/fr/manage/${slug}`)

    // One repeatable "Générer la ronde suivante" step (starts at round 0/3).
    const [resp] = await Promise.all([
      page.waitForResponse((r) => r.url().includes('/generate-swiss-round') && r.request().method() === 'POST'),
      page.getByRole('button', { name: /Générer la ronde suivante/ }).click(),
    ])
    expect(resp.ok()).toBeTruthy()

    // The public page now ranks the teams (one pool, seeded by score).
    await page.goto(publicUrl('fr', slug))
    await expect(page.getByText('Swiss A').first()).toBeVisible()
  })
})
