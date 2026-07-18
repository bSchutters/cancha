import { describe, it, expect } from 'vitest'
import {
  getSportProfile,
  scoreLabelKeys,
  DEFAULT_SPORT,
  ALL_SPORTS,
  futsal,
  basket,
  handball,
  padel,
  volleyball,
  tennis,
  pingpong,
  badminton,
  squash,
  beachvolley,
  hockey,
  rugby,
  waterpolo,
  petanque,
  darts,
  esportTeam,
  esportSolo,
  esportFoot,
} from './index'

describe('sport profile registry', () => {
  it('resolves a known sport by id', () => {
    expect(getSportProfile('futsal')).toBe(futsal)
    expect(getSportProfile('basket')).toBe(basket)
    expect(getSportProfile('handball')).toBe(handball)
    expect(getSportProfile('padel')).toBe(padel)
    expect(getSportProfile('volleyball')).toBe(volleyball)
    expect(getSportProfile('tennis')).toBe(tennis)
    expect(getSportProfile('pingpong')).toBe(pingpong)
  })

  it('falls back to the default for unknown / empty ids', () => {
    expect(getSportProfile('chess')).toBe(getSportProfile(DEFAULT_SPORT))
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

  it('padel is set-based (no draws, sets labels, 1 pt per win)', () => {
    expect(padel.scoring).toEqual({ win: 1, draw: 0, loss: 0 })
    expect(padel.drawsAllowed).toBe(false)
    expect(padel.scoreLabel).toBe('sets')
  })

  it('adds volley/tennis/ping-pong as set-based sports', () => {
    for (const p of [volleyball, tennis, pingpong]) {
      expect(p.scoreLabel).toBe('sets')
      expect(p.drawsAllowed).toBe(false)
    }
    expect(volleyball.unit).toBe('team')
    expect(tennis.unit).toBe('solo')
    expect(pingpong.unit).toBe('solo')
  })

  it('carries a competitor unit (padel is a pair, ball sports are teams)', () => {
    expect(padel.unit).toBe('pair')
    expect(futsal.unit).toBe('team')
    expect(basket.unit).toBe('team')
    expect(handball.unit).toBe('team')
  })

  it('exposes every registered profile', () => {
    for (const p of [
      futsal,
      basket,
      handball,
      padel,
      volleyball,
      tennis,
      pingpong,
      badminton,
      squash,
      beachvolley,
      hockey,
      rugby,
      waterpolo,
      petanque,
      darts,
      esportTeam,
      esportSolo,
      esportFoot,
    ]) {
      expect(ALL_SPORTS).toContain(p)
    }
  })

  it('models esport as best-of series, except football games which count goals', () => {
    // Team and solo esport are the same ruleset with a different competitor unit.
    for (const p of [esportTeam, esportSolo]) {
      expect(p.scoreLabel).toBe('sets')
      expect(p.drawsAllowed).toBe(false)
      expect(p.scoring).toEqual({ win: 1, draw: 0, loss: 0 })
    }
    expect(esportTeam.unit).toBe('team')
    expect(esportSolo.unit).toBe('solo')

    // FIFA-likes are a single game counted in goals, and can end level.
    expect(esportFoot.scoreLabel).toBe('goals')
    expect(esportFoot.drawsAllowed).toBe(true)
    expect(esportFoot.scoring).toEqual({ win: 3, draw: 1, loss: 0 })
    expect(esportFoot.unit).toBe('solo')
  })

  it('resolves each newly added sport by id', () => {
    expect(getSportProfile('badminton')).toBe(badminton)
    expect(getSportProfile('squash')).toBe(squash)
    expect(getSportProfile('beachvolley')).toBe(beachvolley)
    expect(getSportProfile('hockey')).toBe(hockey)
    expect(getSportProfile('rugby')).toBe(rugby)
    expect(getSportProfile('waterpolo')).toBe(waterpolo)
    expect(getSportProfile('petanque')).toBe(petanque)
    expect(getSportProfile('darts')).toBe(darts)
  })

  it('gives the racket / precision singles sports a sets score and a solo unit', () => {
    for (const p of [badminton, squash, darts]) {
      expect(p.scoreLabel).toBe('sets')
      expect(p.drawsAllowed).toBe(false)
      expect(p.unit).toBe('solo')
    }
    // Beach volley is the pair variant of volleyball.
    expect(beachvolley.unit).toBe('pair')
    expect(beachvolley.scoreLabel).toBe('sets')
  })

  it('gives the field team sports draws and their real group scoring', () => {
    expect(hockey.scoring).toEqual({ win: 3, draw: 1, loss: 0 })
    expect(waterpolo.scoring).toEqual({ win: 3, draw: 1, loss: 0 })
    expect(rugby.scoring).toEqual({ win: 4, draw: 2, loss: 0 })
    for (const p of [hockey, waterpolo, rugby]) {
      expect(p.drawsAllowed).toBe(true)
      expect(p.unit).toBe('team')
    }
  })

  it('pétanque has no draws (a game is played to 13) and counts points', () => {
    expect(petanque.drawsAllowed).toBe(false)
    expect(petanque.scoreLabel).toBe('points')
  })

  it('every profile id matches its registry key (no copy-paste slip)', () => {
    for (const p of ALL_SPORTS) {
      expect(getSportProfile(p.id)).toBe(p)
      expect(p.label.length).toBeGreaterThan(0)
    }
  })
})

describe('scoreLabelKeys', () => {
  it('maps each score label to the right i18n key suffixes', () => {
    expect(scoreLabelKeys('goals')).toEqual({ for: 'goalsFor', against: 'goalsAgainst', diff: 'goalDiff' })
    expect(scoreLabelKeys('points')).toEqual({ for: 'pointsFor', against: 'pointsAgainst', diff: 'pointsDiff' })
    expect(scoreLabelKeys('sets')).toEqual({ for: 'setsFor', against: 'setsAgainst', diff: 'setsDiff' })
  })
})
