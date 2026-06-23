'use client'

import { LocaleLink } from '@/components/locale-link'
import { cn } from '@/lib/utils'
import { useT } from '@/i18n/use-t'

const TABS = [
  { key: 'dashboard', path: '' },
  { key: 'teams', path: '/teams' },
  { key: 'scores', path: '/scores' },
  { key: 'results', path: '/results' },
  { key: 'referees', path: '/referees' },
  { key: 'sponsors', path: '/sponsors' },
  { key: 'config', path: '/config' },
]

export function TournamentNav({ slug, active }: { slug: string; active: string }) {
  const t = useT()
  return (
    <nav className="mb-8 flex flex-wrap gap-1 border-b border-border">
      {TABS.map((tab) => (
        <LocaleLink
          key={tab.key}
          href={`/manage/${slug}${tab.path}`}
          className={cn(
            'border-b-2 px-3 py-2 text-sm transition-colors',
            active === tab.key
              ? 'border-primary font-semibold text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground',
          )}
        >
          {t(`product.nav.${tab.key}`)}
        </LocaleLink>
      ))}
    </nav>
  )
}
