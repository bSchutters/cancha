import { describe, it, expect } from 'vitest'
import { computeFinalRanking, type FinalMatchInput } from './final-ranking'

const M = (over: Partial<FinalMatchInput>): FinalMatchInput => ({
  phase: 'knockout',
  round: 1,
  bracketLabel: null,
  homeTeamId: null,
  awayTeamId: null,
  scoreHome: null,
  scoreAway: null,
  penaltyWinner: null,
  status: 'finished',
  ...over,
})

describe('computeFinalRanking - exact places are preserved across gaps', () => {
  it('keeps each "Places X-Y" team at its stored place (no re-compression)', () => {
    const r = computeFinalRanking([
      M({ bracketLabel: 'Finale', homeTeamId: 't1', awayTeamId: 't2', scoreHome: 2, scoreAway: 1 }),
      M({ phase: 'classification', bracketLabel: 'Places 5-6', homeTeamId: 't5', awayTeamId: 't6', scoreHome: 2, scoreAway: 1 }),
      M({ phase: 'classification', bracketLabel: 'Places 9-10', homeTeamId: 't9', awayTeamId: 't10', scoreHome: 2, scoreAway: 1 }),
    ])
    const pos = Object.fromEntries(r.map((e) => [e.teamId, e.position]))
    expect(pos).toEqual({ t1: 1, t2: 2, t5: 5, t6: 6, t9: 9, t10: 10 })
  })

  it('does not drop teams whose place match is unplayed', () => {
    const r = computeFinalRanking([
      M({ bracketLabel: 'Finale', homeTeamId: 't1', awayTeamId: 't2', scoreHome: 2, scoreAway: 1 }),
      M({ phase: 'classification', bracketLabel: 'Places 5-6', homeTeamId: 't5', awayTeamId: 't6', status: 'scheduled' }),
      M({ phase: 'classification', bracketLabel: 'Places 7-8', homeTeamId: 't7', awayTeamId: 't8', scoreHome: 2, scoreAway: 1 }),
    ])
    const ids = new Set(r.map((e) => e.teamId))
    for (const t of ['t1', 't2', 't5', 't6', 't7', 't8']) expect(ids.has(t)).toBe(true)
    // The decided 7-8 match keeps its exact places; the unplayed teams are not lost.
    const pos = Object.fromEntries(r.map((e) => [e.teamId, e.position]))
    expect(pos.t7).toBe(7)
    expect(pos.t8).toBe(8)
  })

  it('produces a contiguous 1-N ranking when every place is decided', () => {
    const matches: FinalMatchInput[] = [
      M({ bracketLabel: 'Finale', homeTeamId: 't1', awayTeamId: 't2', scoreHome: 2, scoreAway: 1 }),
      M({ bracketLabel: 'Petite finale (3e place)', round: 1, homeTeamId: 't3', awayTeamId: 't4', scoreHome: 2, scoreAway: 1 }),
    ]
    for (const [lo, hi, w, l] of [
      [5, 6, 't5', 't6'],
      [7, 8, 't7', 't8'],
    ] as const) {
      matches.push(M({ phase: 'classification', bracketLabel: `Places ${lo}-${hi}`, homeTeamId: w, awayTeamId: l, scoreHome: 3, scoreAway: 0 }))
    }
    const r = computeFinalRanking(matches)
    expect(r.map((e) => e.position)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
  })
})
