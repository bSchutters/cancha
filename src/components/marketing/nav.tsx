'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { LocaleLink } from '@/components/locale-link'
import { useT } from '@/i18n/use-t'
import { display, focusRing } from './theme'
import { LanguageSwitcher } from './language-switcher'

export function MarketingNav() {
  const t = useT()
  const links = [
    { href: '/fonctionnalites', label: t('nav.features') },
    { href: '/demo', label: t('nav.demo') },
    { href: '/tarifs', label: t('nav.pricing') },
    { href: '/comparatif', label: t('nav.comparison') },
    { href: '/ressources', label: t('nav.resources') },
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
            <LocaleLink href="/#contact">{t('nav.requestDemo')}</LocaleLink>
          </Button>
        </div>
      </div>
    </header>
  )
}
