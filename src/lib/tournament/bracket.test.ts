import { describe, it, expect } from 'vitest'
import { generateKnockout, rankAll } from './bracket'
import { fairplayRanking } from './fairplay'
import type { MatchResult, QualifiedTeam, TeamRef } from './types'

// Single-elimination seeding: all teams as one group of seeds 1..N (the path
// used by generateSingleElim). A field of 6 → an 8-slot bracket with 2 byes.
describe('generateKnockout - single group (single elimination)', () => {
  const solo: QualifiedTeam[] = Array.from({ length: 6 }, (_, i) => ({
    teamId: `T${i + 1}`,
    teamName: `T${i + 1}`,
    group: 'A',
    rankInGroup: i + 1,
  }))
  const bracket = generateKnockout(solo, 1, solo.length)

  it('produces a knockout bracket with a single final', () => {
    expect(bracket.length).toBeGreaterThan(0)
    const finals = bracket.filter((m) => m.bracketLabel === 'Finale')
    expect(finals).toHaveLength(1)
    // 6 teams → 3 rounds (quarters with byes, semis, final).
    expect(Math.max(...bracket.map((m) => m.round))).toBe(3)
  })

  it('non-terminal matches point at a next match', () => {
    // The final and the petite finale (3rd place) are terminal — everything else
    // must feed forward.
    for (const m of bracket) {
      if (m.bracketLabel === 'Finale' || m.bracketLabel.includes('Petite')) continue
      expect(m.nextMatchKey).toBeTruthy()
    }
  })
})

// 4 groups (A-D), 2 qualifiers each → 8 teams.
const qualified: QualifiedTeam[] = []
for (const g of ['A', 'B', 'C', 'D']) {
  qualified.push({ teamId: `${g}1`, teamName: `${g}1`, group: g, rankInGroup: 1 })
  qualified.push({ teamId: `${g}2`, teamName: `${g}2`, group: g, rankInGroup: 2 })
}

describe('generateKnockout - 8 teams', () => {
  const bracket = generateKnockout(qualified, 4, 2)

  it('creates a full 8-team bracket (4 QF + 2 SF + final + 3rd-place)', () => {
    expect(bracket).toHaveLength(8) // 7 + petite finale (consolations are added by rankAll)
    const byRound = new Map<number, number>()
    bracket.forEach((b) => byRound.set(b.round, (byRound.get(b.round) ?? 0) + 1))
    expect(byRound.get(1)).toBe(4)
    expect(byRound.get(2)).toBe(2)
    expect(byRound.get(3)).toBe(2) // final + petite finale
  })

  it('adds a 3rd-place match fed by the two semifinal losers', () => {
    const petite = bracket.find((b) => (b.bracketLabel ?? '').toLowerCase().includes('petite'))
    expect(petite).toBeTruthy()
    const semis = bracket.filter((b) => b.round === 2 && !/Places/.test(b.bracketLabel ?? ''))
    expect(semis).toHaveLength(2)
    expect(semis.every((s) => s.loserNextMatchKey === petite!.key)).toBe(true)
  })

  it('applies the cross 1st-vs-2nd pairing across crossed groups (A↔C, B↔D)', () => {
    // Match-ups checked unordered (home/away orientation is cosmetic).
    const qf = bracket.filter((b) => b.round === 1)
    const pairs = qf.map((m) => [m.homeTeamId, m.awayTeamId].sort())
    expect(pairs).toContainEqual(['A1', 'C2'])
    expect(pairs).toContainEqual(['A2', 'C1'])
    expect(pairs).toContainEqual(['B1', 'D2'])
    expect(pairs).toContainEqual(['B2', 'D1'])
  })

  it('wires progression links (QF → SF → final)', () => {
    const final = bracket.find((b) => b.round === 3 && !(b.bracketLabel ?? '').toLowerCase().includes('petite'))!
    expect(final.nextMatchKey).toBeNull()
    const qf = bracket.filter((b) => b.round === 1)
    qf.forEach((m) => {
      expect(m.nextMatchKey).not.toBeNull()
      expect(['home', 'away']).toContain(m.nextSlot)
    })
    // The two semifinals both feed the final (exclude the 5-8 placement matches).
    const sf = bracket.filter((b) => b.round === 2 && !/Places/.test(b.bracketLabel ?? ''))
    sf.forEach((m) => expect(m.nextMatchKey).toBe(final.key))
  })

  it('returns empty for fewer than 2 teams', () => {
    expect(generateKnockout([qualified[0]], 4, 2)).toEqual([])
  })

})

describe('rankAll - exact ranking + configurable depth', () => {
  const mk = (groups: string[], ranks: number[]): QualifiedTeam[] =>
    groups.flatMap((g) => ranks.map((r) => ({ teamId: `${g}${r}`, teamName: `${g}${r}`, group: g, rankInGroup: r })))
  const q8 = mk(['A', 'B', 'C', 'D'], [1, 2])
  const nonQ8 = mk(['A', 'B', 'C', 'D'], [3, 4])

  it('adds 5-8 consolation fed by the quarter-final losers (8 qualified)', () => {
    const all = rankAll(q8, [], 4, 2)
    const p56 = all.find((b) => b.bracketLabel === 'Places 5-6')!
    const p78 = all.find((b) => b.bracketLabel === 'Places 7-8')!
    expect(p56).toBeTruthy()
    expect(p78).toBeTruthy()
    const qf = all.filter((b) => b.round === 1 && b.phase === 'knockout')
    expect(qf.every((m) => m.loserNextMatchKey === p56.key || m.loserNextMatchKey === p78.key)).toBe(true)
  })

  it('ranks all 16 teams exactly (places 1-16) for 4 groups of 4, top 2', () => {
    const all = rankAll(q8, nonQ8, 4, 2, 'full')
    // Final (1-2), petite (3-4), 5-6, 7-8, then placement 9-10 … 15-16.
    const placeLabels = all.map((b) => b.bracketLabel).filter((l) => /Places \d+-\d+/.test(l))
    for (const pair of ['5-6', '7-8', '9-10', '11-12', '13-14', '15-16']) {
      expect(placeLabels).toContain(`Places ${pair}`)
    }
    // Placement round 1 still crosses 3rd-vs-4th across crossed groups.
    const plR1 = all.filter((b) => b.phase === 'classification' && b.bracketLabel === 'Barrage classement')
    const pairs = plR1.map((m) => [m.homeTeamId, m.awayTeamId].sort())
    expect(pairs).toContainEqual(['A3', 'C4'])
    expect(pairs).toContainEqual(['A4', 'C3'])
  })

  it('wires the 9-12 deciders back to the barrage matches (feeder names, not "À déterminer")', () => {
    const all = rankAll(q8, nonQ8, 4, 2, 'full')
    const barrageKeys = new Set(
      all.filter((b) => b.bracketLabel === 'Barrage classement').map((b) => b.key),
    )
    // The 9-10 / 11-12 deciders are fed by barrage WINNERS; both source links must
    // point back to a barrage match so the public view shows "Vainqueur BRn"
    // instead of "À déterminer".
    for (const label of ['Places 9-10', 'Places 11-12']) {
      const decider = all.find((b) => b.bracketLabel === label)!
      expect(decider).toBeTruthy()
      expect(decider.homeSourceKey).not.toBeNull()
      expect(decider.awaySourceKey).not.toBeNull()
      expect(barrageKeys.has(decider.homeSourceKey!)).toBe(true)
      expect(barrageKeys.has(decider.awaySourceKey!)).toBe(true)
    }
  })

  it('qualifiers_only → no consolation, no placement', () => {
    const all = rankAll(q8, nonQ8, 4, 2, 'qualifiers_only')
    expect(all.every((b) => b.phase === 'knockout')).toBe(true)
    expect(all.some((b) => /Places 5-6/.test(b.bracketLabel))).toBe(false)
  })

  it('top_k → only the brackets needed to rank the top K', () => {
    const all = rankAll(q8, nonQ8, 4, 2, { topK: 8 })
    expect(all.some((b) => b.bracketLabel === 'Places 5-6')).toBe(true) // band 5-8 kept
    expect(all.some((b) => /Places 9-/.test(b.bracketLabel))).toBe(false) // 9-16 dropped
  })

  // Place-band integrity for byes: a place number must never be assigned twice,
  // and no "Places X-Y" label may exceed the real field size.
  const placeBands = (all: ReturnType<typeof rankAll>) => {
    const seen = new Set<number>()
    const dups: number[] = []
    let max = 0
    for (const b of all) {
      const m = /Places?\s*(\d+)\s*[-–]\s*(\d+)/i.exec(b.bracketLabel ?? '')
      if (!m) continue
      for (let p = +m[1]; p <= +m[2]; p++) {
        if (seen.has(p)) dups.push(p)
        seen.add(p)
        max = Math.max(max, p)
      }
    }
    return { dups, max }
  }

  it('non-power-of-2 field (6 groups, top 2) → no duplicate or phantom place bands', () => {
    const q12 = mk(['A', 'B', 'C', 'D', 'E', 'F'], [1, 2])
    const nq6 = mk(['A', 'B', 'C', 'D', 'E', 'F'], [3])
    const { dups, max } = placeBands(rankAll(q12, nq6, 6, 2, 'full'))
    expect(dups).toEqual([]) // no place assigned to two matches
    expect(max).toBeLessThanOrEqual(18) // never a place beyond the 18-team field
  })

  it('non-power-of-2 field never drops a non-qualified team (tier fallback)', () => {
    const q12 = mk(['A', 'B', 'C', 'D', 'E', 'F'], [1, 2])
    const nq6 = mk(['A', 'B', 'C', 'D', 'E', 'F'], [3])
    const all = rankAll(q12, nq6, 6, 2, 'full')
    const ids = new Set(all.flatMap((b) => [b.homeTeamId, b.awayTeamId]).filter(Boolean))
    for (const t of nq6) expect(ids.has(t.teamId)).toBe(true)
  })

  it('2 groups of 2 (degenerate) → Demi/Finale/Petite, not mislabeled Quart', () => {
    const q4 = mk(['A', 'B'], [1, 2])
    const labels = rankAll(q4, [], 2, 2, 'full').map((b) => b.bracketLabel)
    expect(labels).toContain('Finale')
    expect(labels.filter((l) => l === 'Demi-finale')).toHaveLength(2)
    expect(labels).toContain('Petite finale (3e place)')
    expect(labels.some((l) => /Quart/.test(l ?? ''))).toBe(false)
  })
})

describe('generateKnockout - generic seeding for any even groups / any Q', () => {
  const mk = (groups: string[], ranks: number[]): QualifiedTeam[] =>
    groups.flatMap((g) => ranks.map((r) => ({ teamId: `${g}${r}`, teamName: `${g}${r}`, group: g, rankInGroup: r })))
  const isPlace = (b: { bracketLabel: string }) => /Places/.test(b.bracketLabel)
  const r1Pairs = (bracket: ReturnType<typeof generateKnockout>) =>
    bracket.filter((b) => b.round === 1 && !isPlace(b)).map((m) => [m.homeTeamId, m.awayTeamId].sort())

  it('N=2, Q=3: byes to the two group winners, round 1 is cross A-vs-B', () => {
    const bracket = generateKnockout(mk(['A', 'B'], [1, 2, 3]), 2, 3)
    const pairs = r1Pairs(bracket)
    expect(pairs).toHaveLength(2) // 6 teams in an 8-slot bracket → 2 real round-1 matches
    // The two group winners get byes (absent from round 1).
    const inR1 = new Set(pairs.flat())
    expect(inR1.has('A1')).toBe(false)
    expect(inR1.has('B1')).toBe(false)
    // Every round-1 match crosses the two groups.
    expect(pairs.every(([a, b]) => String(a)[0] !== String(b)[0])).toBe(true)
  })

  it('N=6, Q=2: crosses A↔D, B↔E, C↔F with 6 round-1 matches', () => {
    const bracket = generateKnockout(mk(['A', 'B', 'C', 'D', 'E', 'F'], [1, 2]), 6, 2)
    const pairs = r1Pairs(bracket)
    expect(pairs).toHaveLength(6)
    const crossed: Record<string, string> = { A: 'D', B: 'E', C: 'F', D: 'A', E: 'B', F: 'C' }
    expect(pairs.every(([a, b]) => crossed[String(a)[0]] === String(b)[0])).toBe(true)
  })

  it('N=4, Q=4: round 1 pairs rank r vs rank (Q+1-r) across A↔C, B↔D', () => {
    const bracket = generateKnockout(mk(['A', 'B', 'C', 'D'], [1, 2, 3, 4]), 4, 4)
    const pairs = r1Pairs(bracket)
    expect(pairs).toHaveLength(8) // 16 teams, no byes
    // e.g. A1 vs C4, A2 vs C3 - rank r meets rank (5-r) of the crossed group.
    expect(pairs).toContainEqual(['A1', 'C4'].sort())
    expect(pairs).toContainEqual(['A2', 'C3'].sort())
    expect(pairs).toContainEqual(['B1', 'D4'].sort())
  })
})

describe('generateKnockout - 12 teams (3 qualifiers), byes to top seeds', () => {
  const q12: QualifiedTeam[] = []
  for (const g of ['A', 'B', 'C', 'D']) {
    for (const rank of [1, 2, 3]) {
      q12.push({ teamId: `${g}${rank}`, teamName: `${g}${rank}`, group: g, rankInGroup: rank })
    }
  }
  const bracket = generateKnockout(q12, 4, 3)

  it('round 1 has at most 4 real matches (fits the courts), not 6', () => {
    const byRound = new Map<number, number>()
    bracket.forEach((b) => byRound.set(b.round, (byRound.get(b.round) ?? 0) + 1))
    expect(byRound.get(1)).toBe(4)
    expect(byRound.get(2)).toBe(4) // quarters
    expect(byRound.get(3)).toBe(2) // semis
    expect(byRound.get(4)).toBe(2) // final + petite finale
  })

  it('never exceeds 4 matches in any round', () => {
    const byRound = new Map<number, number>()
    bracket.forEach((b) => byRound.set(b.round, (byRound.get(b.round) ?? 0) + 1))
    for (const count of byRound.values()) expect(count).toBeLessThanOrEqual(4)
  })
})

describe('fairplayRanking', () => {
  it('sums one point per match to the designated team', () => {
    const teams: TeamRef[] = [1, 2, 3].map((id) => ({ id, name: `T${id}` }))
    const results: MatchResult[] = [
      { homeTeamId: 1, awayTeamId: 2, scoreHome: 1, scoreAway: 0, fairplayWinner: 'home' },
      { homeTeamId: 1, awayTeamId: 3, scoreHome: 2, scoreAway: 2, fairplayWinner: 'away' },
      { homeTeamId: 2, awayTeamId: 3, scoreHome: 0, scoreAway: 0, fairplayWinner: 'none' },
    ]
    const ranking = fairplayRanking(teams, results)
    expect(ranking[0].fairplayPoints).toBe(1)
    expect(ranking.find((r) => r.teamId === 2)!.fairplayPoints).toBe(0)
    expect(ranking.find((r) => r.teamId === 3)!.fairplayPoints).toBe(1)
  })
})
