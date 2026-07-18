import { test, expect } from '@playwright/test'
import { seedSportLeague, waitForSchema } from './db'

/**
 * Sport-by-sport coverage of the whole registry.
 *
 * Every sport plays the SAME 3-team league, so any difference in the rendered
 * standings comes from its profile alone. The expectations below are written by
 * hand (not derived from the profiles) on purpose: deriving them from the same
 * source the app uses would make the test tautological and it would happily
 * follow a wrong profile change.
 *
 * Result pattern:
 *   with draws    Alpha 2 wins · Bravo 1 draw 1 loss · Charlie 1 draw 1 loss
 *   without draws Alpha 2 wins · Bravo 1 win 1 loss  · Charlie 2 losses
 */
interface SportCase {
  id: string
  label: string
  draws: boolean
  /** Points for Alpha / Bravo / Charlie, in that order. */
  points: [string, string, string]
  /** Short headers of the for / against columns. */
  cols: [string, string]
}

const SPORTS: SportCase[] = [
  // Goals + draws
  { id: 'futsal', label: 'Futsal / Football', draws: true, points: ['6', '1', '1'], cols: ['BP', 'BC'] },
  { id: 'handball', label: 'Handball', draws: true, points: ['4', '1', '1'], cols: ['BP', 'BC'] },
  { id: 'hockey', label: 'Hockey', draws: true, points: ['6', '1', '1'], cols: ['BP', 'BC'] },
  { id: 'waterpolo', label: 'Water-polo', draws: true, points: ['6', '1', '1'], cols: ['BP', 'BC'] },
  // Points
  { id: 'rugby', label: 'Rugby', draws: true, points: ['8', '2', '2'], cols: ['PP', 'PC'] },
  // Basket: a loss is still worth 1 point, and there are no draws.
  { id: 'basket', label: 'Basket', draws: false, points: ['4', '3', '2'], cols: ['PP', 'PC'] },
  { id: 'petanque', label: 'Pétanque', draws: false, points: ['2', '1', '0'], cols: ['PP', 'PC'] },
  // Sets
  { id: 'padel', label: 'Padel', draws: false, points: ['2', '1', '0'], cols: ['SG', 'SP'] },
  { id: 'volleyball', label: 'Volley', draws: false, points: ['2', '1', '0'], cols: ['SG', 'SP'] },
  { id: 'beachvolley', label: 'Beach-volley', draws: false, points: ['2', '1', '0'], cols: ['SG', 'SP'] },
  { id: 'tennis', label: 'Tennis', draws: false, points: ['2', '1', '0'], cols: ['SG', 'SP'] },
  { id: 'pingpong', label: 'Ping-pong', draws: false, points: ['2', '1', '0'], cols: ['SG', 'SP'] },
  { id: 'badminton', label: 'Badminton', draws: false, points: ['2', '1', '0'], cols: ['SG', 'SP'] },
  { id: 'squash', label: 'Squash', draws: false, points: ['2', '1', '0'], cols: ['SG', 'SP'] },
  { id: 'darts', label: 'Fléchettes', draws: false, points: ['2', '1', '0'], cols: ['SG', 'SP'] },
  // Esport: best-of series behave like any sets sport, whatever the unit.
  { id: 'esport_team', label: 'Esport (équipe)', draws: false, points: ['2', '1', '0'], cols: ['SG', 'SP'] },
  { id: 'esport_solo', label: 'Esport (solo)', draws: false, points: ['2', '1', '0'], cols: ['SG', 'SP'] },
  // Football games are the exception: one game, goals, draws allowed.
  { id: 'esport_foot', label: 'Jeu de foot (FIFA, eFootball)', draws: true, points: ['6', '1', '1'], cols: ['BP', 'BC'] },
]

test.beforeAll(async () => {
  await waitForSchema()
})

test.describe('sport profiles drive the standings', () => {
  for (const s of SPORTS) {
    test(`${s.label} ranks with its own scoring and score columns`, async ({ page }) => {
      const slug = await seedSportLeague(s.id, s.draws)
      await page.goto(`/fr/${slug}`)

      // Points column is the last cell of each row.
      const pointsOf = async (team: string) =>
        page.getByRole('row').filter({ hasText: team }).getByRole('cell').last()
      await expect(await pointsOf('Alpha')).toHaveText(s.points[0])
      await expect(await pointsOf('Bravo')).toHaveText(s.points[1])
      await expect(await pointsOf('Charlie')).toHaveText(s.points[2])

      // The for/against columns are named after what the sport counts.
      await expect(page.getByRole('columnheader', { name: s.cols[0], exact: true })).toBeVisible()
      await expect(page.getByRole('columnheader', { name: s.cols[1], exact: true })).toBeVisible()

      // The "N" (draws) column exists only where a match can end level.
      await expect(page.getByRole('columnheader', { name: 'N', exact: true })).toHaveCount(s.draws ? 1 : 0)
    })
  }
})
