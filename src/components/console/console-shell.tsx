import Link from 'next/link'
import { LogoutButton } from '@/components/tournament/manage/LogoutButton'
import { ConsoleNav } from './console-nav'

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
        <ConsoleNav />
        <div className="mt-auto flex flex-col gap-2 pt-6 text-xs text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-foreground">
            Voir le site ↗
          </Link>
          {email && (
            <span className="truncate" title={email}>
              {email}
            </span>
          )}
          <LogoutButton />
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-5 py-8 sm:px-8">{children}</main>
    </div>
  )
}
