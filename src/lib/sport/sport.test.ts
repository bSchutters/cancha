import { describe, it, expect } from 'vitest'
import { getSportProfile, DEFAULT_SPORT, ALL_SPORTS, futsal, basket, handball } from './index'

describe('sport profile registry', () => {
  it('resolves a known sport by id', () => {
    expect(getSportProfile('futsal')).toBe(futsal)
    expect(getSportProfile('basket')).toBe(basket)
    expect(getSportProfile('handball')).toBe(handball)
  })

  it('falls back to the default for unknown / empty ids', () => {
    expect(getSportProfile('tennis')).toBe(getSportProfile(DEFAULT_SPORT))
    expect(getSportProfile(null)).toBe(getSportProfile(DEFAULT_SPORT))
    expect(getSportProfile(undefined)).toBe(getSportProfile(DEFAULT_SPORT))
    expect(getSportProfile('')).toBe(getSportProfile(DEFAULT_SPORT))
  })

  it('futsal keeps the classic 3-1-0 scoring (unchanged behavior)', () => {
    expect(futsal.scoring).toEqual({ win: 3, draw: 1, loss: 0 })
    expect(futsal.drawsAllowed).toBe(true)
    expect(futsal.scoreLabel).toBe('goals')
  })

  it('basket uses 2-1-0, no draws, and points labels', () => {
    expect(basket.scoring).toEqual({ win: 2, draw: 0, loss: 1 })
    expect(basket.drawsAllowed).toBe(false)
    expect(basket.scoreLabel).toBe('points')
  })

  it('handball uses 2-1-0, draws allowed, goals labels', () => {
    expect(handball.scoring).toEqual({ win: 2, draw: 1, loss: 0 })
    expect(handball.drawsAllowed).toBe(true)
    expect(handball.scoreLabel).toBe('goals')
  })

  it('exposes every registered profile', () => {
    expect(ALL_SPORTS).toContain(futsal)
    expect(ALL_SPORTS).toContain(basket)
    expect(ALL_SPORTS).toContain(handball)
  })
})
