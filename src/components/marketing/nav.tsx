'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { LocaleLink } from '@/components/locale-link'
import { useLocale } from '@/i18n/use-locale'
import { getDictionary } from '@/i18n'
import { display, focusRing } from './theme'
import { LanguageSwitcher } from './language-switcher'

export function MarketingNav() {
  const dict = getDictionary(useLocale())
  const links = [
    { href: '/fonctionnalites', label: dict.nav.features },
    { href: '/demo', label: dict.nav.demo },
    { href: '/tarifs', label: dict.nav.pricing },
    { href: '/comparatif', label: dict.nav.comparison },
    { href: '/ressources', label: dict.nav.resources },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <LocaleLink href="/" style={display} className={cn('text-xl font-medium tracking-tight text-primary', focusRing)}>
          Cancha
        </LocaleLink>
        <nav className="hidden items-center gap-6 lg:flex">
          {links.map((l) => (
            <LocaleLink
              key={l.href}
              href={l.href}
              className={cn(
                'text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
                focusRing,
              )}
            >
              {l.label}
            </LocaleLink>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <Button asChild size="sm">
            <LocaleLink href="/#contact">{dict.nav.requestDemo}</LocaleLink>
          </Button>
        </div>
      </div>
    </header>
  )
}
