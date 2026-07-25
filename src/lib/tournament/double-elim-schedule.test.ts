import { describe, it, expect } from 'vitest'
import { generateDoubleElim } from './double-elim'
import { scheduleFinals } from './schedule'
import type { Id } from './types'

/**
 * A match must never be scheduled before the match that decides one of its
 * teams. The grand final is round 1 of its own side while the losers bracket
 * climbs higher, so picking "the final" by round number used to place the grand
 * final two slots BEFORE the losers final that feeds it.
 */
describe('double-elimination scheduling order', () => {
  const build = (n: number, courts: number) => {
    const bracket = generateDoubleElim(Array.from({ length: n }, (_, i) => ({ id: (i + 1) as Id, name: `T${i + 1}` })))
    const slots = scheduleFinals(
      bracket.map((m) => ({
        id: m.key,
        phase: m.phase,
        round: m.round,
        bracketLabel: m.bracketLabel,
        nextMatchId: m.nextMatchKey,
        loserNextMatchId: m.loserNextMatchKey,
      })),
      courts,
    )
    return { bracket, slots }
  }

  for (const n of [4, 8, 16]) {
    it(`${n} teams: every match is scheduled after both of its feeders`, () => {
      const { bracket, slots } = build(n, 4)
      for (const m of bracket) {
        const mine = slots.get(m.key)
        expect(mine, `${m.key} must be scheduled`).toBeDefined()
        // Winner feed and loser feed both have to happen strictly earlier.
        for (const feeder of bracket) {
          const feedsMe = feeder.nextMatchKey === m.key || feeder.loserNextMatchKey === m.key
          if (!feedsMe) continue
          expect(slots.get(feeder.key)!, `${feeder.key} must play before ${m.key}`).toBeLessThan(mine!)
        }
      }
    })
  }

  it('the grand final is the very last match played', () => {
    const { bracket, slots } = build(8, 4)
    const gf = bracket.find((m) => m.bracketSide === 'grand_final')!
    const gfSlot = slots.get(gf.key)!
    for (const m of bracket) {
      if (m.key === gf.key) continue
      expect(slots.get(m.key)!, `${m.key} must not play after the grand final`).toBeLessThan(gfSlot)
    }
  })
})
