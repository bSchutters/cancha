'use client'

import { makeT, type Translate } from './index'
import { useLocale } from './use-locale'

/** Client-side translator bound to the current locale. Falls back to FR, then the key. */
export function useT(): Translate {
  return makeT(useLocale())
}
