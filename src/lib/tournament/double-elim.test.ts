import { describe, it, expect } from 'vitest'
import { generateDoubleElim, isPowerOfTwo, type SeededTeam } from './double-elim'
import type { BracketMatch } from './types'

const teams = (n: number): SeededTeam[] =>
  Array.from({ length: n }, (_, i) => ({ id: i + 1, name: `T${i + 1}` }))

const byKey = (ms: BracketMatch[]) => new Map(ms.map((m) => [m.key, m]))

describe('isPowerOfTwo', () => {
  it('accepts 2,4,8,16 and rejects the rest', () => {
    expect([2, 4, 8, 16].every(isPowerOfTwo)).toBe(true)
    expect([0, 1, 3, 5, 6, 12].some(isPowerOfTwo)).toBe(false)
  })
})

describe('generateDoubleElim', () => {
  it('rejects non power-of-two fields', () => {
    expect(() => generateDoubleElim(teams(6))).toThrow('DOUBLE_ELIM_POWER_OF_TWO')
    expect(() => generateDoubleElim(teams(3))).toThrow()
  })

  it('produces N-1 winners matches, N-2 losers matches and one grand final', () => {
    for (const n of [4, 8, 16]) {
      const ms = generateDoubleElim(teams(n))
      const wb = ms.filter((m) => m.bracketSide === 'winners')
      const lb = ms.filter((m) => m.bracketSide === 'losers')
      const gf = ms.filter((m) => m.bracketSide === 'grand_final')
      expect(wb).toHaveLength(n - 1)
      expect(lb).toHaveLength(n - 2)
      expect(gf).toHaveLength(1)
      // Total matches in a double-elim draw = 2N - 2.
      expect(ms).toHaveLength(2 * n - 2)
    }
  })

  it('seeds every team exactly once into the winners round 1', () => {
    const ms = generateDoubleElim(teams(8))
    const r1 = ms.filter((m) => m.bracketSide === 'winners' && m.round === 1)
    const seeded = r1.flatMap((m) => [m.homeTeamId, m.awayTeamId])
    expect(new Set(seeded).size).toBe(8)
    expect(seeded).toHaveLength(8)
  })

  it('routes every winners-bracket loser into a losers-bracket match', () => {
    const ms = generateDoubleElim(teams(8))
    const map = byKey(ms)
    for (const m of ms.filter((x) => x.bracketSide === 'winners')) {
      expect(m.loserNextMatchKey).toBeTruthy()
      const dest = map.get(m.loserNextMatchKey!)!
      expect(dest.bracketSide).toBe('losers')
      expect(m.loserNextSlot === 'home' || m.loserNextSlot === 'away').toBe(true)
    }
  })

  it('never feeds two teams into the same slot of the same match', () => {
    for (const n of [4, 8, 16]) {
      const ms = generateDoubleElim(teams(n))
      const slots = new Set<string>()
      const claim = (key: string, slot: string) => {
        const id = `${key}:${slot}`
        expect(slots.has(id)).toBe(false)
        slots.add(id)
      }
      for (const m of ms) {
        if (m.nextMatchKey) claim(m.nextMatchKey, `w-${m.nextSlot}`)
        if (m.loserNextMatchKey) claim(m.loserNextMatchKey, `w-${m.loserNextSlot}`)
      }
    }
  })

  it('every non-round-1 winners match and every losers match has both slots fed', () => {
    for (const n of [4, 8, 16]) {
      const ms = generateDoubleElim(teams(n))
      // Count incoming feeds per (matchKey, slot).
      const feeds = new Map<string, number>()
      const bump = (key: string, slot: string) => feeds.set(`${key}:${slot}`, (feeds.get(`${key}:${slot}`) ?? 0) + 1)
      for (const m of ms) {
        if (m.nextMatchKey) bump(m.nextMatchKey, m.nextSlot!)
        if (m.loserNextMatchKey) bump(m.loserNextMatchKey, m.loserNextSlot!)
      }
      for (const m of ms) {
        const needsFeed =
          m.bracketSide === 'losers' ||
          m.bracketSide === 'grand_final' ||
          (m.bracketSide === 'winners' && m.round > 1)
        if (!needsFeed) continue
        expect(feeds.get(`${m.key}:home`)).toBe(1)
        expect(feeds.get(`${m.key}:away`)).toBe(1)
      }
    }
  })

  it('sends the WB champion and the LB champion to the grand final', () => {
    const ms = generateDoubleElim(teams(8))
    const map = byKey(ms)
    const gf = ms.find((m) => m.bracketSide === 'grand_final')!
    const wbFinal = map.get(gf.homeSourceKey!)!
    const lbFinal = map.get(gf.awaySourceKey!)!
    expect(wbFinal.bracketSide).toBe('winners')
    expect(wbFinal.nextMatchKey).toBe('GF')
    expect(wbFinal.nextSlot).toBe('home')
    expect(lbFinal.bracketSide).toBe('losers')
    expect(lbFinal.nextMatchKey).toBe('GF')
    expect(lbFinal.nextSlot).toBe('away')
    // The WB champion is undefeated; its match must still route a loser to the LB.
    expect(wbFinal.loserNextMatchKey).toBeTruthy()
  })

  it('the WB final loser drops into the last losers round', () => {
    const ms = generateDoubleElim(teams(8))
    const map = byKey(ms)
    const gf = ms.find((m) => m.bracketSide === 'grand_final')!
    const wbFinal = map.get(gf.homeSourceKey!)!
    const lbFinal = map.get(gf.awaySourceKey!)!
    // Where the WB final loser lands must be the same match the LB champion wins.
    expect(wbFinal.loserNextMatchKey).toBe(lbFinal.key)
  })
})
