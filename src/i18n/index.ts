import { fr } from './dictionaries/fr'
import { nl } from './dictionaries/nl'
import { en } from './dictionaries/en'
import { DEFAULT_LOCALE, type Locale } from './config'

// Flat dictionary: keys are dot-paths, values are localized strings. FR is the
// source; nl/en are typed against it.
export type Dictionary = typeof fr
export type Translate = (key: string) => string

const DICTIONARIES: Record<Locale, Dictionary> = { fr, nl, en }

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale] ?? DICTIONARIES[DEFAULT_LOCALE]
}

/** Server-side translator for a locale. Falls back to FR (source), then the key. */
export function makeT(locale: Locale): Translate {
  const dict = getDictionary(locale)
  return (key) => dict[key] ?? fr[key] ?? key
}
