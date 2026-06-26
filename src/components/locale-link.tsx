'use client'

import Link from 'next/link'
import type { ComponentProps } from 'react'
import { isLocale, type Locale } from '@/i18n/config'
import { useLocale } from '@/i18n/use-locale'

/** Prefix an internal path with the active locale, unless it already carries one. */
function localize(href: string, locale: Locale): string {
  if (!href.startsWith('/')) return href // anchors, external, mailto…
  const seg = href.split('/')[1] ?? ''
  if (isLocale(seg)) return href // already localized
  return href === '/' ? `/${locale}` : `/${locale}${href}`
}

/**
 * Drop-in replacement for next/link that prepends the current locale to internal
 * hrefs — so components don't have to thread the locale down to every link.
 */
export function LocaleLink({ href, ...props }: ComponentProps<typeof Link>) {
  const locale = useLocale()
  const target = typeof href === 'string' ? localize(href, locale) : href
  return <Link href={target} {...props} />
}
