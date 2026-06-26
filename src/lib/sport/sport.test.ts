import { describe, it, expect } from 'vitest'
import { getSportProfile, DEFAULT_SPORT, ALL_SPORTS, futsal } from './index'

describe('sport profile registry', () => {
  it('resolves a known sport by id', () => {
    expect(getSportProfile('futsal')).toBe(futsal)
  })

  it('falls back to the default for unknown / empty ids', () => {
    expect(getSportProfile('handball')).toBe(getSportProfile(DEFAULT_SPORT))
    expect(getSportProfile(null)).toBe(getSportProfile(DEFAULT_SPORT))
    expect(getSportProfile(undefined)).toBe(getSportProfile(DEFAULT_SPORT))
    expect(getSportProfile('')).toBe(getSportProfile(DEFAULT_SPORT))
  })

  it('futsal keeps the classic 3-1-0 scoring (unchanged behavior)', () => {
    expect(futsal.scoring).toEqual({ win: 3, draw: 1, loss: 0 })
  })

  it('exposes every registered profile', () => {
    expect(ALL_SPORTS).toContain(futsal)
  })
})
