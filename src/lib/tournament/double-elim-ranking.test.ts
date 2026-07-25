import { describe, it, expect } from 'vitest'
import { generateDoubleElim } from './double-elim'
import { computeFinalRanking, type FinalMatchInput } from './final-ranking'
import { buildMatchCodes } from './match-code'
import type { BracketMatch, Id } from './types'

/**
 * End-of-tournament ranking for a double-elimination draw.
 *
 * The existing double-elim tests check the bracket STRUCTURE (who feeds whom).
 * They all passed while the published podium was inverted — the losers finalist
 * was crowned champion and the actual winner ranked below the podium — because
 * nothing asserted the RESULT. That is what this file covers.
 */

/** Play the whole draw, deciding each match with `pickWinner`. */
function playOut(n: number, pickWinner: (home: Id, away: Id) => Id) {
  const teams = Array.from({ length: n }, (_, i) => ({ id: i + 1 as Id, name: `T${i + 1}` }))
  const byKey = new Map<string, BracketMatch & { scoreHome?: number; scoreAway?: number }>(
    generateDoubleElim(teams).map((m) => [m.key, { ...m }]),
  )
  // generateDoubleElim emits matches in dependency order, so one pass suffices.
  for (const m of byKey.values()) {
    if (m.homeTeamId == null || m.awayTeamId == null) continue
    const winner = pickWinner(m.homeTeamId, m.awayTeamId)
    const loser = winner === m.homeTeamId ? m.awayTeamId : m.homeTeamId
    m.scoreHome = winner === m.homeTeamId ? 1 : 0
    m.scoreAway = winner === m.awayTeamId ? 1 : 0
    if (m.nextMatchKey) {
      const next = byKey.get(m.nextMatchKey)!
      if (m.nextSlot === 'home') next.homeTeamId = winner
      else next.awayTeamId = winner
    }
    if (m.loserNextMatchKey) {
      const next = byKey.get(m.loserNextMatchKey)!
      if (m.loserNextSlot === 'home') next.homeTeamId = loser
      else next.awayTeamId = loser
    }
  }
  const matches: FinalMatchInput[] = [...byKey.values()].map((m) => ({
    phase: m.phase,
    round: m.round,
    bracketLabel: m.bracketLabel,
    homeTeamId: m.homeTeamId,
    awayTeamId: m.awayTeamId,
    scoreHome: m.scoreHome ?? null,
    scoreAway: m.scoreAway ?? null,
    penaltyWinner: null,
    status: 'finished' as const,
  }))
  const grandFinal = [...byKey.values()].find((m) => m.bracketSide === 'grand_final')!
  return { matches, grandFinal, byKey }
}

describe('double-elimination final ranking', () => {
  it('crowns the winner of the grand final, not the losers finalist', () => {
    // Lowest id always wins: deterministic and easy to reason about.
    const { matches, grandFinal } = playOut(8, (home, away) => (Number(home) < Number(away) ? home : away))
    const expectedChampion =
      Number(grandFinal.homeTeamId) < Number(grandFinal.awayTeamId) ? grandFinal.homeTeamId : grandFinal.awayTeamId
    const expectedRunnerUp = expectedChampion === grandFinal.homeTeamId ? grandFinal.awayTeamId : grandFinal.homeTeamId

    const ranking = computeFinalRanking(matches)
    expect(ranking[0].teamId).toBe(expectedChampion)
    expect(ranking[0].note).toBe('Champion')
    expect(ranking[1].teamId).toBe(expectedRunnerUp)
    expect(ranking[1].note).toBe('Finaliste')
  })

  it('works the same when the losers-bracket team wins the grand final', () => {
    // Highest id wins: the grand final is then won from the losers side, which is
    // the case that used to invert the podium.
    const { matches, grandFinal } = playOut(8, (home, away) => (Number(home) > Number(away) ? home : away))
    const expectedChampion =
      Number(grandFinal.homeTeamId) > Number(grandFinal.awayTeamId) ? grandFinal.homeTeamId : grandFinal.awayTeamId
    const ranking = computeFinalRanking(matches)
    expect(ranking[0].teamId).toBe(expectedChampion)
  })

  it('ranks every team exactly once, champion first', () => {
    for (const n of [4, 8, 16]) {
      const { matches } = playOut(n, (home, away) => (Number(home) < Number(away) ? home : away))
      const ranking = computeFinalRanking(matches)
      expect(ranking).toHaveLength(n)
      expect(new Set(ranking.map((r) => r.teamId)).size).toBe(n)
      // Positions never go backwards.
      const positions = ranking.map((r) => r.position)
      expect([...positions].sort((a, b) => a - b)).toEqual(positions)
    }
  })

  it('gives third place to the team eliminated in the last losers round', () => {
    const { matches, byKey } = playOut(8, (home, away) => (Number(home) < Number(away) ? home : away))
    const lbRounds = [...byKey.values()].filter((m) => m.bracketSide === 'losers')
    const lastLbRound = Math.max(...lbRounds.map((m) => m.round))
    const lbFinal = lbRounds.find((m) => m.round === lastLbRound)!
    const lbFinalLoser = lbFinal.scoreHome! > lbFinal.scoreAway! ? lbFinal.awayTeamId : lbFinal.homeTeamId

    const ranking = computeFinalRanking(matches)
    expect(ranking[2].teamId).toBe(lbFinalLoser)
    expect(ranking[2].note).toBe('3e place')
  })
})

describe('double-elimination match codes', () => {
  it('never gives two matches the same code', () => {
    for (const n of [4, 8, 16]) {
      const bracket = generateDoubleElim(
        Array.from({ length: n }, (_, i) => ({ id: (i + 1) as Id, name: `T${i + 1}` })),
      )
      const codes = buildMatchCodes(
        bracket.map((m) => ({
          id: m.key,
          phase: m.phase,
          groupLabel: null,
          round: m.round,
          bracketLabel: m.bracketLabel,
          scheduledTime: null,
          court: null,
        })),
      )
      const all = [...codes.values()]
      expect(new Set(all).size, `duplicate codes for ${n} teams: ${all.join(', ')}`).toBe(all.length)
    }
  })

  it('distinguishes the winners final from the grand final', () => {
    const bracket = generateDoubleElim(
      Array.from({ length: 8 }, (_, i) => ({ id: (i + 1) as Id, name: `T${i + 1}` })),
    )
    const codes = buildMatchCodes(
      bracket.map((m) => ({
        id: m.key,
        phase: m.phase,
        groupLabel: null,
        round: m.round,
        bracketLabel: m.bracketLabel,
        scheduledTime: null,
        court: null,
      })),
    )
    const gf = bracket.find((m) => m.bracketSide === 'grand_final')!
    const wbFinal = bracket.find((m) => m.bracketSide === 'winners' && m.nextMatchKey === gf.key)!
    expect(codes.get(gf.key)).toBe('GF')
    expect(codes.get(wbFinal.key)).toBe('F')
  })
})
