import { describe, it, expect } from 'vitest'
import { drawGroups, groupLabel } from './draw'
import { makeRng } from './rng'
import type { TeamRef } from './types'

const makeTeams = (n: number): TeamRef[] =>
  Array.from({ length: n }, (_, i) => ({ id: i + 1, name: `Team ${i + 1}` }))

describe('drawGroups', () => {
  it('distributes 16 teams into 4 balanced groups', () => {
    const groups = drawGroups(makeTeams(16), 4, makeRng(42))
    expect(groups).toHaveLength(4)
    expect(groups.map((g) => g.label)).toEqual(['A', 'B', 'C', 'D'])
    groups.forEach((g) => expect(g.teams).toHaveLength(4))
    const all = groups.flatMap((g) => g.teams.map((t) => t.id))
    expect(new Set(all).size).toBe(16)
  })

  it('keeps group sizes within 1 when not divisible', () => {
    const groups = drawGroups(makeTeams(14), 4, makeRng(7))
    const sizes = groups.map((g) => g.teams.length).sort()
    expect(sizes).toEqual([3, 3, 4, 4])
    expect(sizes[3] - sizes[0]).toBeLessThanOrEqual(1)
  })

  it('is deterministic for a given seed', () => {
    const a = drawGroups(makeTeams(12), 3, makeRng(99))
    const b = drawGroups(makeTeams(12), 3, makeRng(99))
    expect(a).toEqual(b)
  })

  it('throws when there are fewer teams than groups', () => {
    expect(() => drawGroups(makeTeams(3), 4, makeRng(1))).toThrow()
  })

  it('labels beyond Z', () => {
    expect(groupLabel(0)).toBe('A')
    expect(groupLabel(25)).toBe('Z')
    expect(groupLabel(26)).toBe('AA')
  })
})
