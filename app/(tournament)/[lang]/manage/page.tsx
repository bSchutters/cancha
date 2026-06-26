import Link from 'next/link'
import { LocaleLink } from '@/components/locale-link'
import { getPayloadClient } from '@/lib/payload'
import { getSessionUser, getUserTenantId } from '@/lib/tournament/session'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { makeT } from '@/i18n'
import { isLocale, DEFAULT_LOCALE } from '@/i18n/config'

export const dynamic = 'force-dynamic'

export default async function ManageHomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const t = makeT(isLocale(lang) ? lang : DEFAULT_LOCALE)
  const payload = await getPayloadClient()
  // A manager only lists their own organization's tournaments (super-admin: all).
  const tenantId = getUserTenantId(await getSessionUser())
  const res = await payload.find({
    collection: 'tournaments',
    where: tenantId != null ? { tenant: { equals: tenantId } } : undefined,
    sort: '-edition_date',
    limit: 200,
    depth: 0,
  })

  return (
    <main className="mx-auto max-w-screen-2xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('product.manage.tournaments')}</h1>
        <LocaleLink href="/manage/new">
          <Button className="bg-primary font-bold text-primary-foreground hover:bg-primary/90">
            {t('product.manage.newTournament')}
          </Button>
        </LocaleLink>
      </div>

      {res.docs.length === 0 ? (
        <p className="mt-10 text-muted-foreground">{t('product.manage.emptyList')}</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {res.docs.map((doc) => {
            const tour = doc as {
              id: number | string
              name: string
              slug: string
              status: string
              manage_locale?: string
            }
            // Open each tournament's backoffice in its own configured manage language.
            const manageLocale = isLocale(tour.manage_locale) ? tour.manage_locale : DEFAULT_LOCALE
            return (
              <Link
                key={String(tour.id)}
                href={`/${manageLocale}/manage/${tour.slug}`}
                className="block rounded-xl border border-border bg-card p-5 transition-colors hover:bg-muted"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-bold">{tour.name}</h2>
                  <Badge variant="secondary">{t(`product.manageStatus.${tour.status}`)}</Badge>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">/{tour.slug}</p>
              </Link>
            )
          })}
        </div>
      )}
    </main>
  )
}
