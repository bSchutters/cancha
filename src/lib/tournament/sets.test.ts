import { describe, it, expect } from 'vitest'
import { setsWon } from './sets'

describe('setsWon', () => {
  it('counts sets won by each side', () => {
    // 6-4, 3-6, 6-2 → home wins 2 sets, away 1
    expect(setsWon([{ home: 6, away: 4 }, { home: 3, away: 6 }, { home: 6, away: 2 }])).toEqual({ home: 2, away: 1 })
  })

  it('ignores incomplete (equal) sets', () => {
    expect(setsWon([{ home: 6, away: 4 }, { home: 5, away: 5 }])).toEqual({ home: 1, away: 0 })
  })

  it('handles a clean sweep and an empty list', () => {
    expect(setsWon([{ home: 6, away: 1 }, { home: 6, away: 0 }])).toEqual({ home: 2, away: 0 })
    expect(setsWon([])).toEqual({ home: 0, away: 0 })
  })
})
