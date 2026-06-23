'use client'

import { getDictionary, type Translate } from './index'
import { useLocale } from './use-locale'

/** Client-side translator bound to the current locale. */
export function useT(): Translate {
  const dict = getDictionary(useLocale())
  return (key) => dict[key] ?? key
}
