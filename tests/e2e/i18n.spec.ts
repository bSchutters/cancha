import { test, expect } from '@playwright/test'
import {
  seedUser,
  seedSportLeague,
  seedDoubleElimTournament,
  seedGroupsKoTournament,
  finishAllGroupMatches,
  waitForSchema,
  ADMIN,
} from './db'

const LOCALES = ['fr', 'nl', 'en'] as const

/**
 * `makeT` resolves `dict[key] ?? fr[key] ?? key`, so a raw "product.something"
 * only reaches the screen when a key is missing from ALL dictionaries — usually
 * a typo in a component, or a key used before it was added. That is what this
 * scan catches, across every page and locale at once.
 *
 * It deliberately does NOT catch a key missing from nl/en only: that falls back
 * to the French text, which is invisible to any DOM assertion. The dictionary
 * parity unit test (src/i18n/dictionaries/parity.test.ts) is what guards that.
 */
async function expectNoRawKeys(page: import('@playwright/test').Page) {
  const body = await page.locator('body').innerText()
  const leaked = body.match(/product\.[a-zA-Z][\w.]*/g)
  expect(leaked ?? [], `untranslated keys rendered: ${JSON.stringify(leaked)}`).toEqual([])
}

test.beforeAll(async () => {
  await waitForSchema()
  await seedUser(ADMIN.email, ADMIN.password, 'admin')
})

test.describe('no untranslated keys leak to the screen', () => {
  test('public standings page in every locale', async ({ page }) => {
    const slug = await seedSportLeague('futsal', true)
    for (const lang of LOCALES) {
      await page.goto(`/${lang}/${slug}`)
      await expectNoRawKeys(page)
    }
  })

  test('public double-elimination bracket in every locale', async ({ page }) => {
    const slug = await seedDoubleElimTournament()
    // Generate the bracket through the API so this test stays about wording.
    await page.goto('/fr/login')
    await page.locator('input[type="email"]').fill(ADMIN.email)
    await page.locator('input[type="password"]').fill(ADMIN.password)
    await page.locator('button[type="submit"]').click()
    await expect(page).toHaveURL(/\/manage/, { timeout: 15_000 })
    await page.goto(`/fr/manage/${slug}`)
    await Promise.all([
      page.waitForResponse((r) => r.url().includes('/generate-bracket') && r.request().method() === 'POST'),
      page.getByRole('button', { name: 'Générer le tableau' }).click(),
    ])

    const bracketTab = { fr: 'Arbre', nl: 'Schema', en: 'Bracket' } as const
    for (const lang of LOCALES) {
      await page.goto(`/${lang}/${slug}`)
      await page.getByRole('button', { name: bracketTab[lang] }).click()
      await expectNoRawKeys(page)
    }
  })

  test('public pools + bracket page in every locale', async ({ page }) => {
    const slug = await seedGroupsKoTournament('e2e-i18n-pools')
    await finishAllGroupMatches(slug)
    for (const lang of LOCALES) {
      await page.goto(`/${lang}/${slug}`)
      await expectNoRawKeys(page)
    }
  })

  test('organizer dashboard in every locale', async ({ page }) => {
    const slug = await seedGroupsKoTournament('e2e-i18n-dash')
    await page.goto('/fr/login')
    await page.locator('input[type="email"]').fill(ADMIN.email)
    await page.locator('input[type="password"]').fill(ADMIN.password)
    await page.locator('button[type="submit"]').click()
    await expect(page).toHaveURL(/\/manage/, { timeout: 15_000 })

    for (const lang of LOCALES) {
      await page.goto(`/${lang}/manage/${slug}`)
      await expectNoRawKeys(page)
      await page.goto(`/${lang}/manage/${slug}/config`)
      await expectNoRawKeys(page)
    }
  })
})
