import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSessionUser, isManager } from '@/lib/tournament/session'
import { getPayloadClient } from '@/lib/payload'
import { resolveLayoutTenant } from '@/lib/tournament/tenant'
import type { Metadata } from 'next'
import { LogoutButton } from '@/components/tournament/manage/LogoutButton'
import { ThemeToggle } from '@/components/theme-toggle'

export const dynamic = 'force-dynamic'

// Private organizer console: keep it out of search indexes (defence in depth
// alongside the robots.txt Disallow and the login redirect).
export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function ManageLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser()
  if (!isManager(user)) redirect('/login')

  const org = await resolveLayoutTenant(await getPayloadClient())

  return (
    <div className="text-foreground">
      <header className="border-b border-border bg-card/50">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-4 py-3">
          <Link href="/manage" className="flex items-center gap-2 font-bold">
            {org?.logoUrl ? (
              <>
                <span className="relative h-7 w-7 shrink-0">
                  <Image
                    src={org.logoUrl}
                    alt={org.name}
                    fill
                    sizes="28px"
                    unoptimized
                    className="object-contain"
                  />
                </span>
                <span className="truncate">{org.name}</span>
              </>
            ) : (
              <span>
                Cup <span className="text-primary">Generator</span>
              </span>
            )}
          </Link>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Link href="/manage/apparence" className="hover:text-foreground">
              Apparence
            </Link>
            <span className="hidden sm:inline">{user?.email}</span>
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
      </header>
      {children}
    </div>
  )
}
