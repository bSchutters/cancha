import { test, expect } from '@playwright/test'
import { seedUser, ADMIN } from './db'

// By the time tests run, Playwright has polled the webServer's health URL, which
// triggered Payload's schema push — so the tables exist and we can seed.
test.beforeAll(async () => {
  await seedUser(ADMIN.email, ADMIN.password, 'admin')
})

test.describe('backoffice auth', () => {
  test('a manager can log into the backoffice', async ({ page }) => {
    await page.goto('/fr/login')
    await page.locator('input[type="email"]').fill(ADMIN.email)
    await page.locator('input[type="password"]').fill(ADMIN.password)
    await page.locator('button[type="submit"]').click()
    // Lands in the localized manage area.
    await expect(page).toHaveURL(/\/(fr|nl|en)\/manage/, { timeout: 15_000 })
  })
})

// Scaffold for the full padel flow. Fill in the selectors against the running
// app (create tournament → choose Padel → seed teams in dev mode → enter a
// set-by-set score → assert the standings show "Sets" and the public card shows
// the per-set breakdown). Kept skipped until the selectors are pinned so the
// suite stays green.
test.describe('padel end-to-end', () => {
  test.skip('records a set-by-set score and ranks by sets', async () => {
    // 1. log in (see above)
    // 2. /fr/manage/new → name it, choose Sport = Padel, save
    // 3. enable dev mode + seed teams, run draw + schedule
    // 4. /fr/manage/<slug>/scores → a match shows the per-set editor;
    //    enter 6-4 / 3-6 / 6-2 → expect "Sets : 2-1", save
    // 5. public /fr/<slug> → results card shows "2 - 1" with "6-4 3-6 6-2"
    //    and the standings header reads "Sets gagnés/perdus"
  })
})
