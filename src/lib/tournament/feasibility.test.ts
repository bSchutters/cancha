import { describe, it, expect } from 'vitest'
import { estimateFeasibility } from './feasibility'
import type { TimeParams } from './types'

const time: TimeParams = { startTime: '10:00', matchDurationMin: 25, gapBetweenMatchesMin: 5 }

describe('estimateFeasibility', () => {
  it('estimates the standard 16/4×4/top-2 full format (finals at 13:30)', () => {
    const est = estimateFeasibility({
      numGroups: 4,
      groupSize: 4,
      qualifiersPerGroup: 2,
      numCourts: 4,
      multiCourt: true,
      timeParams: time,
      finalsStartTime: '13:30',
      depth: 'full',
    })
    expect(est.teams).toBe(16)
    expect(est.groupMatches).toBe(24) // 4 groups × C(4,2)
    // Final at 15:30 → ends 15:55 (25-min match).
    expect(est.endTime).toBe('15:55')
  })

  it('warns of a long day: ranking everyone on 2 courts finishes later', () => {
    const two = estimateFeasibility({
      numGroups: 4,
      groupSize: 4,
      qualifiersPerGroup: 2,
      numCourts: 2,
      multiCourt: true,
      timeParams: time,
      depth: 'full',
    })
    const four = estimateFeasibility({
      numGroups: 4,
      groupSize: 4,
      qualifiersPerGroup: 2,
      numCourts: 4,
      multiCourt: true,
      timeParams: time,
      depth: 'full',
    })
    expect(two.totalMatches).toBe(four.totalMatches)
    // Fewer courts → a strictly later finish.
    expect(two.endTime! > four.endTime!).toBe(true)
  })

  it('qualifiers_only produces far fewer finals matches than full', () => {
    const base = { numGroups: 4, groupSize: 4, qualifiersPerGroup: 2, numCourts: 4, multiCourt: true, timeParams: time }
    const full = estimateFeasibility({ ...base, depth: 'full' })
    const qual = estimateFeasibility({ ...base, depth: 'qualifiers_only' })
    expect(qual.finalsMatches).toBeLessThan(full.finalsMatches)
  })
})
