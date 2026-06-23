'use client'

import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LOCALES, isLocale, type Locale } from '@/i18n/config'
import { useLocale } from '@/i18n/use-locale'

/** Compact FR / NL / EN switcher that swaps the locale segment, keeping the path. */
export function LanguageSwitcher() {
  const pathname = usePathname()
  const router = useRouter()
  const current = useLocale()

  const switchTo = (loc: Locale) => {
    if (loc === current) return
    const parts = pathname.split('/')
    if (isLocale(parts[1])) parts[1] = loc
    else parts.splice(1, 0, loc)
    router.push(parts.join('/') || `/${loc}`)
  }

  return (
    <div className="flex items-center gap-1 text-xs" role="group" aria-label="Langue">
      {LOCALES.map((loc, i) => (
        <span key={loc} className="flex items-center gap-1">
          {i > 0 && <span className="text-border">·</span>}
          <button
            type="button"
            onClick={() => switchTo(loc)}
            aria-current={loc === current ? 'true' : undefined}
            className={cn(
              'uppercase transition-colors',
              loc === current ? 'font-semibold text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {loc}
          </button>
        </span>
      ))}
    </div>
  )
}
