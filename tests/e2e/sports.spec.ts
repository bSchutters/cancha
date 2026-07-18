import { test, expect } from '@playwright/test'
import { seedRugbyTournament, waitForSchema } from './db'

test.beforeAll(async () => {
  await waitForSchema()
})

test.describe('sport profiles drive the standings', () => {
  test('a rugby league is scored 4-2-0, not futsal 3-1-0', async ({ page }) => {
    const slug = await seedRugbyTournament()
    await page.goto(`/fr/${slug}`)

    // Lions won both matches: 4 + 4 = 8 points. Futsal's 3-1-0 would give 6, so
    // this total only comes out if the rugby profile is really applied.
    const leader = page.getByRole('row').filter({ hasText: 'Lions RC' })
    await expect(leader).toContainText('8')

    // Both other teams drew with each other: 2 points each (futsal would give 1).
    for (const name of ['Ours RC', 'Aigles RC']) {
      await expect(page.getByRole('row').filter({ hasText: name })).toContainText('2')
    }

    // Rugby counts points, not goals: the for/against columns are PP / PC.
    await expect(page.getByRole('columnheader', { name: 'PP' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'PC' })).toBeVisible()

    // Draws are allowed in rugby, so the "N" (nuls) column is shown.
    await expect(page.getByRole('columnheader', { name: 'N', exact: true })).toBeVisible()
  })
})
