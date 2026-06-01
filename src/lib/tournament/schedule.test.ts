import { describe, it, expect } from 'vitest'
import { buildSchedule, buildScheduleMaps, circleMethodRounds, serializeGroupMatches } from './schedule'
import { rankAll } from './bracket'
import type { CourtConfig, DrawnGroup, Id, QualifiedTeam, TimeParams } from './types'

const groupsOf4 = (): DrawnGroup[] =>
  ['A', 'B', 'C', 'D'].map((label, gi) => ({
    label,
    teams: Array.from({ length: 4 }, (_, i) => {
      const id = gi * 10 + i + 1
      return { id, name: `${label}${i + 1}` }
    }),
  }))

const time: TimeParams = {
  startTime: '09:00',
  matchDurationMin: 15,
  gapBetweenMatchesMin: 5,
}

const multiCourtFixed: CourtConfig = { multiCourt: true, numCourts: 4, assignment: 'fixed' }

/** No team should play three consecutive rounds (the agreed spread constraint). */
function noThreeConsecutive(rounds: Id[][]): boolean {
  const lastSeen = new Map<Id, number[]>()
  rounds.forEach((teams, r) => {
    teams.forEach((t) => {
      const arr = lastSeen.get(t) ?? []
      arr.push(r)
      lastSeen.set(t, arr)
    })
  })
  for (const positions of lastSeen.values()) {
    for (let i = 0; i + 2 < positions.length; i++) {
      if (positions[i + 1] === positions[i] + 1 && positions[i + 2] === positions[i] + 2) return false
    }
  }
  return true
}

describe('circleMethodRounds / serialize', () => {
  it('produces a full round-robin for a group of 4 (6 matches)', () => {
    const matches = serializeGroupMatches([1, 2, 3, 4])
    expect(matches).toHaveLength(6)
    // every unordered pair appears exactly once
    const pairs = matches.map(([a, b]) => [a, b].sort((x, y) => Number(x) - Number(y)).join('-'))
    expect(new Set(pairs).size).toBe(6)
  })

  it('uses the fixed 4-team fixture order (1v2, 3v4, 1v4, 2v3, 1v3, 2v4)', () => {
    expect(serializeGroupMatches([1, 2, 3, 4])).toEqual([
      [1, 2],
      [3, 4],
      [1, 4],
      [2, 3],
      [1, 3],
      [2, 4],
    ])
  })

  it('handles odd group sizes with byes (group of 3 → 3 matches)', () => {
    const matches = serializeGroupMatches([1, 2, 3])
    expect(matches).toHaveLength(3)
  })

  it('each team plays n-1 matches', () => {
    const rounds = circleMethodRounds([1, 2, 3, 4])
    const counts = new Map<Id, number>()
    rounds.flat().forEach(([a, b]) => {
      counts.set(a, (counts.get(a) ?? 0) + 1)
      counts.set(b, (counts.get(b) ?? 0) + 1)
    })
    for (const c of counts.values()) expect(c).toBe(3)
  })
})

describe('buildSchedule - 4 groups of 4 on 4 courts', () => {
  const schedule = buildSchedule(groupsOf4(), multiCourtFixed, time, 1)

  it('creates 24 matches (6 per group)', () => {
    expect(schedule).toHaveLength(24)
  })

  it('runs 6 rounds with 4 simultaneous matches each', () => {
    const byRound = new Map<number, number>()
    schedule.forEach((m) => byRound.set(m.round, (byRound.get(m.round) ?? 0) + 1))
    expect([...byRound.keys()].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6])
    for (const count of byRound.values()) expect(count).toBe(4)
  })

  it('never double-books a court within a round', () => {
    const seen = new Set<string>()
    for (const m of schedule) {
      const key = `${m.round}-${m.court}`
      expect(seen.has(key)).toBe(false)
      seen.add(key)
    }
  })

  it('respects the no-three-consecutive constraint per group', () => {
    for (const label of ['A', 'B', 'C', 'D']) {
      const rounds: Id[][] = []
      schedule
        .filter((m) => m.groupLabel === label)
        .forEach((m) => {
          rounds[m.round - 1] = [m.homeTeamId, m.awayTeamId]
        })
      expect(noThreeConsecutive(rounds)).toBe(true)
    }
  })

  it('fixed assignment keeps each group on a single court', () => {
    const courtsByGroup = new Map<string, Set<number>>()
    schedule.forEach((m) => {
      const set = courtsByGroup.get(m.groupLabel) ?? new Set()
      set.add(m.court as number)
      courtsByGroup.set(m.groupLabel, set)
    })
    for (const set of courtsByGroup.values()) expect(set.size).toBe(1)
  })

  it('computes increasing round times from start', () => {
    const r1 = schedule.find((m) => m.round === 1)!
    const r2 = schedule.find((m) => m.round === 2)!
    expect(r1.scheduledTime).toBe('09:00')
    expect(r2.scheduledTime).toBe('09:20')
  })

  it('inserts the meal break', () => {
    const withBreak = buildSchedule(
      groupsOf4(),
      multiCourtFixed,
      { ...time, mealBreakStart: '09:30', mealBreakDurationMin: 30 },
      1,
    )
    // Round 3 would normally be 09:40; after a 30-min break inserted at >=09:30 it shifts.
    const r3 = withBreak.find((m) => m.round === 3)!
    expect(r3.scheduledTime).toBe('10:10')
  })
})

describe('buildSchedule - more courts than groups (2 groups of 5 on 4 courts)', () => {
  const twoGroupsOf5 = (): DrawnGroup[] =>
    ['A', 'B'].map((label, gi) => ({
      label,
      teams: Array.from({ length: 5 }, (_, i) => ({ id: gi * 10 + i + 1, name: `${label}${i + 1}` })),
    }))
  const schedule = buildSchedule(twoGroupsOf5(), { multiCourt: true, numCourts: 4, assignment: 'fixed' }, time, 1)

  it('schedules all 20 matches (2 × C(5,2))', () => {
    expect(schedule).toHaveLength(20)
  })

  it('uses more than 2 courts in a round (no idle courts when rest allows)', () => {
    const perRound = new Map<number, number>()
    for (const m of schedule) perRound.set(m.round, (perRound.get(m.round) ?? 0) + 1)
    expect(Math.max(...perRound.values())).toBeGreaterThan(2)
    for (const n of perRound.values()) expect(n).toBeLessThanOrEqual(4) // never exceeds courts
  })

  it('never double-books a court within a round', () => {
    const seen = new Set<string>()
    for (const m of schedule) {
      const key = `${m.round}-${m.court}`
      expect(seen.has(key)).toBe(false)
      seen.add(key)
    }
  })

  it('never plays a team twice in the same round', () => {
    const perRound = new Map<number, Id[]>()
    for (const m of schedule) perRound.set(m.round, [...(perRound.get(m.round) ?? []), m.homeTeamId, m.awayTeamId])
    for (const teams of perRound.values()) expect(new Set(teams).size).toBe(teams.length)
  })

  it('respects the no-three-consecutive constraint per group', () => {
    for (const label of ['A', 'B']) {
      const rounds: Id[][] = []
      schedule
        .filter((m) => m.groupLabel === label)
        .forEach((m) => {
          rounds[m.round - 1] = [...(rounds[m.round - 1] ?? []), m.homeTeamId, m.awayTeamId]
        })
      expect(noThreeConsecutive(rounds)).toBe(true)
    }
  })
})

describe('buildSchedule - single court', () => {
  it('schedules one match per round with null court', () => {
    const single: CourtConfig = { multiCourt: false, numCourts: 1, assignment: 'fixed' }
    const schedule = buildSchedule([groupsOf4()[0]], single, time, 1)
    expect(schedule).toHaveLength(6)
    const byRound = new Map<number, number>()
    schedule.forEach((m) => byRound.set(m.round, (byRound.get(m.round) ?? 0) + 1))
    for (const count of byRound.values()) expect(count).toBe(1)
    schedule.forEach((m) => expect(m.court).toBeNull())
  })
})

describe('buildScheduleMaps - multi-chain finals (no back-to-back, final last)', () => {
  // Real 16-team bracket (4 groups of 4, top 2, full ranking) fed through the scheduler.
  const mk = (groups: string[], ranks: number[]): QualifiedTeam[] =>
    groups.flatMap((g) => ranks.map((r) => ({ teamId: `${g}${r}`, teamName: `${g}${r}`, group: g, rankInGroup: r })))
  const bracket = rankAll(mk(['A', 'B', 'C', 'D'], [1, 2]), mk(['A', 'B', 'C', 'D'], [3, 4]), 4, 2, 'full')
  const groupMatches = [1, 2, 3, 4, 5, 6].flatMap((r) =>
    [0, 1, 2, 3].map((c) => ({ id: `g${r}-${c}`, phase: 'group', round: r })),
  )
  const finals = bracket.map((b) => ({
    id: b.key,
    phase: b.phase,
    round: b.round,
    bracketLabel: b.bracketLabel,
    nextMatchId: b.nextMatchKey,
    loserNextMatchId: b.loserNextMatchKey,
  }))
  const config = {
    timeParams: { startTime: '09:00', matchDurationMin: 25, gapBetweenMatchesMin: 5 },
    finalsMatchDurationMin: null,
    multiCourt: true,
    numCourts: 4,
    finalsStartTime: '13:30',
  }
  const { scheduleOf } = buildScheduleMaps([...groupMatches, ...finals], config)
  const at = (key: string) => {
    const b = bracket.find((x) => x.key === key)!
    return scheduleOf({ id: key, phase: b.phase, round: b.round }).time
  }
  const labelTimes = (re: RegExp) => bracket.filter((b) => re.test(b.bracketLabel)).map((b) => at(b.key))

  it('reproduces the approved layout: quarts 13:30 → … → final 15:30', () => {
    expect(labelTimes(/^Quart/).every((t) => t === '13:30')).toBe(true) // slot 0
    expect(labelTimes(/^Demi/).every((t) => t === '14:30')).toBe(true) // slot 2
    expect(labelTimes(/^Finale$/).every((t) => t === '15:30')).toBe(true) // slot 4
  })

  it('plays the 5-8 consolation during the demi slot, never in the final slot', () => {
    expect(labelTimes(/Places 5-6|Places 7-8/).every((t) => t === '14:30')).toBe(true)
    const finalSlotMatches = bracket.filter((b) => at(b.key) === at(bracket.find((x) => x.bracketLabel === 'Finale')!.key))
    // Only final + petite share the last slot.
    expect(finalSlotMatches.every((b) => /Finale|petite/i.test(b.bracketLabel))).toBe(true)
  })

  it('never assigns more than C matches to a slot', () => {
    const bySlot = new Map<string, number>()
    for (const b of bracket) bySlot.set(at(b.key)!, (bySlot.get(at(b.key)!) ?? 0) + 1)
    for (const n of bySlot.values()) expect(n).toBeLessThanOrEqual(4)
  })

  it('keeps every bracket chain ≥ 2 slots apart (no back-to-back)', () => {
    // A match and the match it feeds are never in the same or adjacent slot.
    const slotIndex = (t: string | null) => ['13:30', '14:00', '14:30', '15:00', '15:30', '16:00'].indexOf(t ?? '')
    for (const b of bracket) {
      if (b.nextMatchKey) {
        const gap = slotIndex(at(b.nextMatchKey)) - slotIndex(at(b.key))
        expect(gap).toBeGreaterThanOrEqual(2)
      }
    }
  })
})

describe('buildScheduleMaps - single-court & edge cases', () => {
  const mk = (groups: string[], ranks: number[]): QualifiedTeam[] =>
    groups.flatMap((g) => ranks.map((r) => ({ teamId: `${g}${r}`, teamName: `${g}${r}`, group: g, rankInGroup: r })))
  const toFinals = (bracket: ReturnType<typeof rankAll>) =>
    bracket.map((b) => ({
      id: b.key,
      phase: b.phase,
      round: b.round,
      bracketLabel: b.bracketLabel,
      nextMatchId: b.nextMatchKey,
      loserNextMatchId: b.loserNextMatchKey,
    }))
  const singleCourt = {
    timeParams: { startTime: '09:00', matchDurationMin: 25, gapBetweenMatchesMin: 5 },
    finalsMatchDurationMin: null,
    multiCourt: false,
    numCourts: 1,
    finalsStartTime: null,
  }

  it('never puts the final and petite in the same slot on a single court', () => {
    const bracket = rankAll(mk(['A', 'B', 'C', 'D'], [1, 2]), [], 4, 2, 'full')
    const { scheduleOf } = buildScheduleMaps(toFinals(bracket), singleCourt)
    const at = (b: { key: string; phase: string; round: number }) =>
      scheduleOf({ id: b.key, phase: b.phase, round: b.round }).time
    const final = bracket.find((b) => b.bracketLabel === 'Finale')!
    const petite = bracket.find((b) => /petite/i.test(b.bracketLabel))!
    expect(at(final)).not.toEqual(at(petite))
    // No time slot holds more than one match when there is a single court.
    const counts = new Map<string, number>()
    for (const b of bracket) counts.set(at(b)!, (counts.get(at(b)!) ?? 0) + 1)
    for (const n of counts.values()) expect(n).toBe(1)
  })

  it('keeps finals times monotonic (no midnight wrap) on a long single-court bracket', () => {
    const bracket = rankAll(mk(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], [1, 2]), [], 8, 2, 'full')
    const { scheduleOf } = buildScheduleMaps(toFinals(bracket), singleCourt)
    const final = bracket.find((b) => b.bracketLabel === 'Finale')!
    const finalTime = scheduleOf({ id: final.key, phase: final.phase, round: final.round }).time!
    const allTimes = bracket.map((b) => scheduleOf({ id: b.key, phase: b.phase, round: b.round }).time!)
    // The final is the latest match - its clock time must not roll below its feeders.
    const toMin = (t: string) => Number(t.split(':')[0]) * 60 + Number(t.split(':')[1])
    expect(Math.max(...allTimes.map(toMin))).toBe(toMin(finalTime))
  })

  it('does not crash on a cyclic feeder graph (corrupted/edited links)', () => {
    const cyclic = [
      { id: 'A', phase: 'classification', round: 1, bracketLabel: 'x', nextMatchId: 'B', loserNextMatchId: null },
      { id: 'B', phase: 'classification', round: 1, bracketLabel: 'x', nextMatchId: 'C', loserNextMatchId: null },
      { id: 'C', phase: 'classification', round: 1, bracketLabel: 'x', nextMatchId: 'A', loserNextMatchId: null },
    ]
    expect(() => buildScheduleMaps(cyclic, singleCourt)).not.toThrow()
  })
})
