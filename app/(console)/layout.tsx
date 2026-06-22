import '../globals.css'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Newsreader, Geist } from 'next/font/google'
import { cn } from '@/lib/utils'
import { getSessionUser, isSuperAdmin } from '@/lib/tournament/session'
import { ConsoleShell } from '@/components/console/console-shell'

// Same house faces as the rest of the product (Cancha DA). The cream tokens come
// from globals.css :root; no next-themes here, so the console stays light.
const serif = Newsreader({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-product-heading',
  display: 'swap',
})
const sans = Geist({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-product-body',
  display: 'swap',
})

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Console', robots: { index: false, follow: false } }

/**
 * Staff backoffice shell. Reserved for the platform super-admin (role 'admin') —
 * distinct from /manage (organizers) and the raw Payload /admin.
 */
export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser()
  if (!isSuperAdmin(user)) redirect('/login')

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
      </body>
    </html>
  )
}
