'use client'

import { fr } from './dictionaries/fr'
import { getDictionary, type Translate } from './index'
import { useLocale } from './use-locale'

/** Client-side translator bound to the current locale. Falls back to FR, then the key. */
export function useT(): Translate {
  const dict = getDictionary(useLocale())
  return (key) => dict[key] ?? fr[key] ?? key
}
