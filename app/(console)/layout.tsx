import '../globals.css'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
// Same house faces as the rest of the product (Cancha DA). The cream tokens come
// from globals.css :root; no next-themes here, so the console stays light.
import { productSerif as serif, productSans as sans } from '@/fonts'
import { cn } from '@/lib/utils'
import { getSessionUser, isSuperAdmin } from '@/lib/tournament/session'
import { DEFAULT_LOCALE } from '@/i18n/config'
import { ConsoleShell } from '@/components/console/console-shell'
import { Toaster } from '@/components/ui/sonner'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Console', robots: { index: false, follow: false } }

/**
 * Staff backoffice shell. Reserved for the platform super-admin (role 'admin') —
 * distinct from /manage (organizers) and the raw Payload /admin.
 */
export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser()
  // Login lives under the localized segment ([lang]/login); the console is
  // FR-only, so send unauthenticated staff to the French login.
  if (!isSuperAdmin(user)) redirect(`/${DEFAULT_LOCALE}/login`)

  return (
    <html lang="fr-BE" suppressHydrationWarning>
      <body
        className={cn(
          serif.variable,
          sans.variable,
          'tournament-scope font-nugros antialiased min-h-screen bg-background text-foreground',
        )}
      >
        <ConsoleShell email={user?.email}>{children}</ConsoleShell>
        <Toaster />
      </body>
    </html>
  )
}
