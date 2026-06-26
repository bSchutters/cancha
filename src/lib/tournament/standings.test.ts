import { describe, it, expect } from 'vitest'
import { computeStandings } from './standings'
import type { MatchResult, TeamRef } from './types'
import type { SportProfile } from '../sport'

const teams: TeamRef[] = [1, 2, 3, 4].map((id) => ({ id, name: `T${id}` }))

const m = (
  h: number,
  a: number,
  sh: number,
  sa: number,
  fp: MatchResult['fairplayWinner'] = 'none',
): MatchResult => ({ homeTeamId: h, awayTeamId: a, scoreHome: sh, scoreAway: sa, fairplayWinner: fp })

describe('computeStandings', () => {
  it('orders by points then goal difference', () => {
    const results = [m(1, 2, 3, 0), m(1, 3, 1, 0), m(2, 3, 1, 0), m(1, 4, 2, 0), m(2, 4, 1, 0), m(3, 4, 1, 0)]
    const table = computeStandings(teams, results)
    expect(table[0].teamId).toBe(1)
    expect(table.map((s) => s.rank)).toEqual([1, 2, 3, 4])
    expect(table[0].points).toBe(9)
  })

  it('breaks a 2-way tie by head-to-head', () => {
    // T1 and T2 both finish on 6 pts / +2 GD; T1 beat T2 directly → T1 ranks first.
    const results = [
      m(1, 2, 1, 0),
      m(1, 3, 0, 1),
      m(1, 4, 2, 0),
      m(2, 3, 1, 0),
      m(2, 4, 2, 0),
      m(3, 4, 0, 0),
    ]
    const table = computeStandings(teams, results)
    const t1 = table.find((s) => s.teamId === 1)!
    const t2 = table.find((s) => s.teamId === 2)!
    expect(t1.points).toBe(t2.points)
    expect(t1.goalDifference).toBe(t2.goalDifference)
    expect(t1.rank).toBeLessThan(t2.rank)
  })

  it('falls through to fair-play on a fully tied 3-way (rock-paper-scissors)', () => {
    // T1,T2,T3 cycle and each beat T4; head-to-head fully equal → fair-play decides.
    const results = [
      m(1, 2, 1, 0, 'home'), // fp T1
      m(2, 3, 1, 0, 'home'), // fp T2
      m(3, 1, 1, 0, 'home'), // fp T3
      m(1, 4, 2, 0, 'none'),
      m(2, 4, 2, 0, 'home'), // extra fp T2 → T2 most fair-play
      m(3, 4, 2, 0, 'none'),
    ]
    const table = computeStandings(teams, results)
    expect(table[3].teamId).toBe(4)
    // T2 has 2 fair-play points vs 1 each → ranks first among the tied trio.
    expect(table[0].teamId).toBe(2)
  })

  it('uses the sport profile points scheme (not hardcoded 3-1-0)', () => {
    // Same fixtures as the first test, but a profile where a win is worth 2.
    const custom: SportProfile = { id: 'futsal', label: 'test', scoring: { win: 2, draw: 1, loss: 0 } }
    const results = [m(1, 2, 3, 0), m(1, 3, 1, 0), m(2, 3, 1, 0), m(1, 4, 2, 0), m(2, 4, 1, 0), m(3, 4, 1, 0)]
    const table = computeStandings(teams, results, custom)
    expect(table[0].teamId).toBe(1)
    expect(table[0].points).toBe(6) // 3 wins × 2 (would be 9 under the default profile)
  })

  it('ignores unplayed matches', () => {
    const results: MatchResult[] = [
      m(1, 2, 1, 0),
      { homeTeamId: 3, awayTeamId: 4, scoreHome: null, scoreAway: null, fairplayWinner: 'none' },
    ]
    const table = computeStandings(teams, results)
    expect(table.find((s) => s.teamId === 1)!.played).toBe(1)
    expect(table.find((s) => s.teamId === 3)!.played).toBe(0)
  })
})
