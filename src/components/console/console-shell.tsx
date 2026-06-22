import Link from 'next/link'
import { LogoutButton } from '@/components/tournament/manage/LogoutButton'

// Slice 1 ships Leads; Clients + dashboard land in the next slices.
const NAV: { href: string; label: string; soon?: boolean }[] = [
  { href: '/console/leads', label: 'Leads' },
  { href: '#', label: 'Clients', soon: true },
  { href: '#', label: 'Tableau de bord', soon: true },
]

/** Backoffice frame: brand + nav sidebar, content on the right. */
export function ConsoleShell({ email, children }: { email?: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card/50 px-5 py-6 lg:flex">
        <div>
          <span className="text-xl font-medium tracking-tight">Cancha</span>
          <span className="ml-2 rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
            Console
          </span>
        </div>
        <nav aria-label="Navigation console" className="mt-8 flex flex-col gap-1">
          {NAV.map((n) =>
            n.soon ? (
              <span
                key={n.label}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-muted-foreground/50"
              >
                {n.label}
                <span className="text-[10px] uppercase tracking-wide">bientôt</span>
              </span>
            ) : (
              <Link
                key={n.label}
                href={n.href}
                className="rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary"
              >
                {n.label}
              </Link>
            ),
          )}
        </nav>
        <div className="mt-auto flex flex-col gap-2 pt-6 text-xs text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-foreground">
            Voir le site ↗
          </Link>
          {email && <span className="truncate" title={email}>{email}</span>}
          <LogoutButton />
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-5 py-8 sm:px-8">{children}</main>
    </div>
  )
}
