import { describe, it, expect } from 'vitest'
import { localizeFeederName, localizeBracketLabel, localizeFinalNote } from './bracket-label'

// A tiny stand-in translator: echoes the key with the substituted code so the
// tests assert on which branch ran without depending on the real dictionaries.
const t = (key: string) => {
  if (key === 'product.feeder.winner') return 'V {code}'
  if (key === 'product.feeder.loser') return 'P {code}'
  return key
}

describe('localizeFeederName', () => {
  it('localizes real feeder placeholders (Vainqueur/Perdant + match code)', () => {
    expect(localizeFeederName('Vainqueur QF1', t)).toBe('V QF1')
    expect(localizeFeederName('Perdant DF2', t)).toBe('P DF2')
    expect(localizeFeederName('Vainqueur F', t)).toBe('V F')
    expect(localizeFeederName('Vainqueur PL9', t)).toBe('V PL9')
    expect(localizeFeederName('Vainqueur R1A', t)).toBe('V R1A')
  })

  it('leaves a real team that merely starts with "Vainqueur"/"Perdant" untouched', () => {
    // Real team names have a space, lowercase, or accents after the word — none
    // match the all-uppercase, single-token match-code grammar.
    expect(localizeFeederName('Vainqueur de la Coupe', t)).toBe('Vainqueur de la Coupe')
    expect(localizeFeederName('Perdants Magnifiques', t)).toBe('Perdants Magnifiques')
    expect(localizeFeederName('Vainqueur du Tournoi 2026', t)).toBe('Vainqueur du Tournoi 2026')
  })

  it('passes through null/empty and non-feeder names', () => {
    expect(localizeFeederName(null, t)).toBeNull()
    expect(localizeFeederName(undefined, t)).toBeNull()
    expect(localizeFeederName('', t)).toBe('') // falsy: returned as-is, callers guard with `name ? … : tbd`
    expect(localizeFeederName('FC Barcelona', t)).toBe('FC Barcelona')
  })
})

describe('localizeBracketLabel / localizeFinalNote', () => {
  it('maps known labels and falls through unknown ones', () => {
    expect(localizeBracketLabel('Finale', t)).toBe('product.bracket.final')
    expect(localizeBracketLabel('Quelque chose', t)).toBe('Quelque chose')
    expect(localizeBracketLabel(null, t)).toBe('')
    expect(localizeFinalNote('Champion', t)).toBe('product.ranking.champion')
    expect(localizeFinalNote('Inconnu', t)).toBe('Inconnu')
  })

  it('localizes the double-elimination labels (grand final + numbered losers rounds)', () => {
    expect(localizeBracketLabel('Grande finale', t)).toBe('product.bracket.grandFinal')
    expect(localizeBracketLabel('Repêchage 1', t)).toBe('product.bracket.repechage'.replace('{n}', '1'))
    // The round number is substituted, not the literal placeholder.
    const tn = (key: string) => (key === 'product.bracket.repechage' ? 'Losers round {n}' : key)
    expect(localizeBracketLabel('Repêchage 3', tn)).toBe('Losers round 3')
  })
})
