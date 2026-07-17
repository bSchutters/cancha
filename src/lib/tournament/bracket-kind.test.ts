import { describe, it, expect } from 'vitest'
import { classifyBracket, isPlaceMatch, isPetiteMatch } from './bracket-kind'

describe('classifyBracket', () => {
  it('classifies the exact knockout labels', () => {
    expect(classifyBracket('Finale')).toEqual({ kind: 'final' })
    expect(classifyBracket('Demi-finale')).toEqual({ kind: 'semi' })
    expect(classifyBracket('Quart de finale')).toEqual({ kind: 'quarter' })
    expect(classifyBracket('8e de finale')).toEqual({ kind: 'r16' })
    expect(classifyBracket('16e de finale')).toEqual({ kind: 'r32' })
    expect(classifyBracket('Petite finale (3e place)')).toEqual({ kind: 'thirdPlace' })
    expect(classifyBracket('Barrage classement')).toEqual({ kind: 'playoff' })
    expect(classifyBracket('Classement')).toEqual({ kind: 'ranking' })
  })

  it('classifies the parametrized labels', () => {
    expect(classifyBracket('Tour (5 matchs)')).toEqual({ kind: 'roundMatches', count: 5 })
    expect(classifyBracket('Places 5-8')).toEqual({ kind: 'placement', lo: 5, hi: 8 })
    expect(classifyBracket('Place 9')).toEqual({ kind: 'placeSingle', n: 9 })
  })

  it('falls through to raw for unknown / null', () => {
    expect(classifyBracket('Wildcard')).toEqual({ kind: 'other', raw: 'Wildcard' })
    expect(classifyBracket(null)).toEqual({ kind: 'other', raw: '' })
  })

  it('predicates match the old regexes', () => {
    expect(isPlaceMatch('Places 5-8')).toBe(true)
    expect(isPlaceMatch('Places 9 – 12')).toBe(true) // spaces + en-dash
    expect(isPlaceMatch('Finale')).toBe(false)
    expect(isPetiteMatch('Petite finale (3e place)')).toBe(true)
    expect(isPetiteMatch('Finale')).toBe(false)
  })
})
