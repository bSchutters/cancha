import Image from 'next/image'
import { redirect } from 'next/navigation'
import { getSessionUser, isManager } from '@/lib/tournament/session'
import { getPayloadClient } from '@/lib/payload'
import { resolveLayoutTenant } from '@/lib/tournament/tenant'
import type { Metadata } from 'next'
import { LocaleLink } from '@/components/locale-link'
import { LogoutButton } from '@/components/tournament/manage/LogoutButton'
import { ThemeToggle } from '@/components/theme-toggle'
import { makeT } from '@/i18n'
import { isLocale, DEFAULT_LOCALE } from '@/i18n/config'
import { isDemoUser } from '@/lib/demo/config'

export const dynamic = 'force-dynamic'

// Private organizer console: keep it out of search indexes (defence in depth
// alongside the robots.txt Disallow and the login redirect).
export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function ManageLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const t = makeT(isLocale(lang) ? lang : DEFAULT_LOCALE)
  const user = await getSessionUser()
  if (!isManager(user)) redirect(`/${lang}/login`)

  const org = await resolveLayoutTenant(await getPayloadClient())

  return (
    <div className="text-foreground">
      <header className="border-b border-border bg-card/50">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-4 py-3">
          <LocaleLink href="/manage" className="flex items-center gap-2 font-bold">
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
                Cancha
              </span>
            )}
          </LocaleLink>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {/* Demo visitors only: the console logo goes to /manage, so a curious
                visitor has no way back to the site. A real organizer working in
                their console does not need this in the way. */}
            {isDemoUser(user) && (
              <LocaleLink href="/" className="hidden hover:text-foreground sm:inline">
                {t('product.manage.backToSite')}
              </LocaleLink>
            )}
            <LocaleLink href="/manage/apparence" className="hover:text-foreground">
              {t('product.manage.appearance')}
            </LocaleLink>
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
