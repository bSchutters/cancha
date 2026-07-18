import { describe, it, expect } from 'vitest'
import { fr } from './fr'
import { nl } from './nl'
import { en } from './en'

/**
 * `makeT` resolves a key as `dict[key] ?? fr[key] ?? key`, so a key missing from
 * nl/en silently renders the FRENCH text instead of failing. That is invisible
 * on screen and no end-to-end test can reliably catch it (French words on a
 * Dutch page look like ordinary content). The only dependable guard is checking
 * the dictionaries against each other, here.
 */
const DICTS = { fr, nl, en } as const

describe('dictionary parity', () => {
  it('nl and en define exactly the same keys as fr', () => {
    const frKeys = Object.keys(fr).sort()
    for (const [name, dict] of Object.entries(DICTS)) {
      if (name === 'fr') continue
      const keys = Object.keys(dict).sort()
      const missing = frKeys.filter((k) => !(k in dict))
      const extra = keys.filter((k) => !(k in fr))
      expect(missing, `keys missing from ${name} (would silently fall back to French)`).toEqual([])
      expect(extra, `keys in ${name} with no French counterpart`).toEqual([])
    }
  })

  it('no translation is left empty', () => {
    for (const [name, dict] of Object.entries(DICTS)) {
      const blank = Object.entries(dict)
        .filter(([, v]) => typeof v !== 'string' || v.trim() === '')
        .map(([k]) => k)
      expect(blank, `empty values in ${name}`).toEqual([])
    }
  })

  it('keeps interpolation placeholders identical across locales', () => {
    // A translation that drops {n} / {code} renders a broken string, so every
    // locale must carry the same placeholders as the French source.
    const placeholders = (s: string) => (s.match(/\{[a-zA-Z]+\}/g) ?? []).sort()
    for (const [name, dict] of Object.entries(DICTS)) {
      if (name === 'fr') continue
      const mismatched: string[] = []
      for (const [key, frValue] of Object.entries(fr)) {
        const value = (dict as Record<string, string>)[key]
        if (typeof value !== 'string') continue
        const a = placeholders(frValue as string)
        const b = placeholders(value)
        if (a.join(',') !== b.join(',')) mismatched.push(`${key}: fr[${a}] vs ${name}[${b}]`)
      }
      expect(mismatched, `placeholder mismatch in ${name}`).toEqual([])
    }
  })
})
