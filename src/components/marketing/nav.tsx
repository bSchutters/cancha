import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { display, focusRing } from './theme'

const LINKS = [
  { href: '/fonctionnalites', label: 'Fonctionnalités' },
  { href: '/demo', label: 'Aperçu' },
  { href: '/tarifs', label: 'Tarifs' },
  { href: '/comparatif', label: 'Comparatif' },
  { href: '/ressources', label: 'Ressources' },
]

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" style={display} className={cn('text-xl font-medium tracking-tight text-primary', focusRing)}>
          Cancha
        </Link>
        <nav className="hidden items-center gap-6 lg:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                'text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
                focusRing,
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <Button asChild size="sm">
            <Link href="/#contact">Demander une démo</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
