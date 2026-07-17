import { describe, it, expect } from 'vitest'
import { pairSwissRound, type SwissMatchResult } from './swiss'
import type { TeamRef } from './types'

const SCORING = { win: 3, draw: 1, loss: 0 }
const teams = (n: number): TeamRef[] => Array.from({ length: n }, (_, i) => ({ id: i + 1, name: `T${i + 1}` }))
// Deterministic rng.
const rng = () => 0.5

describe('pairSwissRound', () => {
  it('round 1 pairs everyone with no byes (even field)', () => {
    const p = pairSwissRound(teams(8), [], SCORING, rng)
    expect(p).toHaveLength(4)
    expect(p.every((m) => m.away != null)).toBe(true)
    const involved = new Set(p.flatMap((m) => [m.home, m.away]))
    expect(involved.size).toBe(8) // everyone once
  })

  it('gives exactly one bye with an odd field', () => {
    const p = pairSwissRound(teams(7), [], SCORING, rng)
    const byes = p.filter((m) => m.away == null)
    expect(byes).toHaveLength(1)
    const involved = p.flatMap((m) => [m.home, m.away]).filter((x) => x != null)
    expect(new Set(involved).size).toBe(7)
  })

  it('never repeats a pairing when avoidable', () => {
    // Round 1: 1v2, 3v4. Feed results so 1 and 3 win (both on 3 pts) → they would
    // meet by score, but they haven't played, so that's fine; the key check is 1
    // is NOT paired with 2 again.
    const played: SwissMatchResult[] = [
      { homeTeamId: 1, awayTeamId: 2, scoreHome: 3, scoreAway: 0 },
      { homeTeamId: 3, awayTeamId: 4, scoreHome: 2, scoreAway: 1 },
    ]
    const p = pairSwissRound(teams(4), played, SCORING, rng)
    const met = new Set(p.map((m) => [String(m.home), String(m.away)].sort().join('|')))
    expect(met.has('1|2')).toBe(false)
    expect(met.has('3|4')).toBe(false)
  })

  it('does not give a team two byes while another has none', () => {
    // T7 already had a bye in round 1.
    const played: SwissMatchResult[] = [{ homeTeamId: 7, awayTeamId: null, scoreHome: null, scoreAway: null }]
    const p = pairSwissRound(teams(7), played, SCORING, rng)
    const bye = p.find((m) => m.away == null)
    expect(bye?.home).not.toBe(7)
  })
})
