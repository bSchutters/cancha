import { fr } from './dictionaries/fr'
import { nl } from './dictionaries/nl'
import { en } from './dictionaries/en'
import { DEFAULT_LOCALE, type Locale } from './config'

// FR is the source of truth; the other dictionaries are typed against its shape.
export type Dictionary = typeof fr

const DICTIONARIES: Record<Locale, Dictionary> = { fr, nl, en }

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale] ?? DICTIONARIES[DEFAULT_LOCALE]
}
