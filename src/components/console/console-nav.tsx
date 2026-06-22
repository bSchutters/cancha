'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/console', label: 'Tableau de bord' },
  { href: '/console/leads', label: 'Leads' },
  { href: '/console/clients', label: 'Clients' },
]

/** Console sidebar nav with route-derived active state. */
export function ConsoleNav() {
  const pathname = usePathname()
  return (
    <nav aria-label="Navigation console" className="mt-8 flex flex-col gap-1">
      {NAV.map((n) => {
        // Exact match for the dashboard root; prefix match for the others (so
        // /console/clients/new still highlights "Clients").
        const active =
          pathname === n.href || (n.href !== '/console' && pathname.startsWith(`${n.href}/`))
        return (
          <Link
            key={n.href}
            href={n.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'rounded-lg px-3 py-2 text-sm transition-colors',
              active
                ? 'bg-primary/10 font-medium text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            {n.label}
          </Link>
        )
      })}
    </nav>
  )
}
