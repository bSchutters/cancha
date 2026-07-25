import { expect, type Page } from '@playwright/test'
import { ADMIN } from './db'

/**
 * Public tournament URL with a cache-buster.
 *
 * The organizer dashboard links to the public page, so Next prefetches it while
 * the tournament is still in its pre-action state. Navigating there right after
 * a mutating action (draw, schedule, generate finals) can then replay that stale
 * payload instead of re-rendering. A unique query param sidesteps it, so the
 * test asserts on the real post-action page and never flakes.
 */
export function publicUrl(lang: string, slug: string): string {
  return `/${lang}/${slug}?_=${Date.now()}`
}

/** Log in as the seeded admin and wait for the manage area. */
export async function login(page: Page) {
  await page.goto('/fr/login')
  await page.locator('input[type="email"]').fill(ADMIN.email)
  await page.locator('input[type="password"]').fill(ADMIN.password)
  await page.locator('button[type="submit"]').click()
  await expect(page).toHaveURL(/\/manage/, { timeout: 15_000 })
}
