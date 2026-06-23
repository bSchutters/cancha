'use client'

import { usePathname } from 'next/navigation'
import { DEFAULT_LOCALE, isLocale, type Locale } from './config'

/** Current locale, read from the first path segment (/fr, /nl, /en). */
export function useLocale(): Locale {
  const pathname = usePathname()
  const seg = pathname.split('/')[1]
  return isLocale(seg) ? seg : DEFAULT_LOCALE
}
