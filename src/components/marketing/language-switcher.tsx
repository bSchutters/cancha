'use client'

import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LOCALES, isLocale, type Locale } from '@/i18n/config'
import { useLocale } from '@/i18n/use-locale'

/** Compact FR / NL / EN switcher that swaps the locale segment, keeping the path. */
export function LanguageSwitcher() {
  const pathname = usePathname()
  const current = useLocale()

  // Plain <a> = full navigation. Switching locale must re-SSR <html lang>,
  // metadata and all server-translated content; a client router.push would
  // instead remount the [lang] layout client-side (re-running next-themes'
  // inline <script>, which React 19 flags). Crawlable links also help SEO.
  const hrefFor = (loc: Locale) => {
    const parts = pathname.split('/')
    if (isLocale(parts[1])) parts[1] = loc
    else parts.splice(1, 0, loc)
    return parts.join('/') || `/${loc}`
  }

  return (
    <div className="flex items-center gap-1 text-xs" role="group" aria-label="Langue">
      {LOCALES.map((loc, i) => (
        <span key={loc} className="flex items-center gap-1">
          {i > 0 && <span className="text-border">·</span>}
          {loc === current ? (
            <span aria-current="true" className="font-semibold uppercase text-foreground">
              {loc}
            </span>
          ) : (
            <a
              href={hrefFor(loc)}
              hrefLang={loc}
              className={cn('uppercase text-muted-foreground transition-colors hover:text-foreground')}
            >
              {loc}
            </a>
          )}
        </span>
      ))}
    </div>
  )
}
