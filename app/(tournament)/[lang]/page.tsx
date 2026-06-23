import Image from 'next/image'
import { LocaleLink } from '@/components/locale-link'
import { getPayloadClient } from '@/lib/payload'
import { listPublicTournaments } from '@/lib/tournament/public-view'
import { resolveTenant } from '@/lib/tournament/tenant'
import { getRequestBaseUrl } from '@/lib/tournament/seo'
import { formatEditionDate } from '@/lib/tournament/format'
import { Badge } from '@/components/ui/badge'
import { MarketingShell } from '@/components/marketing/shell'
import { HomeSections } from '@/components/marketing/home'
import { SiteJsonLd } from '@/components/marketing/structured-data'
import { makeT, type Translate } from '@/i18n'
import { isLocale, DEFAULT_LOCALE } from '@/i18n/config'

export const dynamic = 'force-dynamic'

const ACTIVE = new Set(['registration', 'registration_closed', 'draw_done', 'live'])

export default async function CupHomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const payload = await getPayloadClient()
  const org = await resolveTenant(payload)

  // Apex host (no organization): product landing page. Each organization's public
  // tournament list lives on its own subdomain / custom domain.
  if (!org) {
    const base = await getRequestBaseUrl()
    const t = makeT(isLocale(lang) ? lang : DEFAULT_LOCALE)
    return (
      <MarketingShell>
        <SiteJsonLd baseUrl={base} />
        <HomeSections t={t} />
      </MarketingShell>
    )
  }

  const t = makeT(isLocale(lang) ? lang : DEFAULT_LOCALE)
  const tournaments = await listPublicTournaments(payload, org.id)
  const active = tournaments.filter((x) => ACTIVE.has(x.status))
  const past = tournaments.filter((x) => !ACTIVE.has(x.status))

  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <header className="flex flex-col items-center text-center">
        {org.logoUrl && (
          <span className="relative mb-4 h-20 w-20">
            <Image src={org.logoUrl} alt={org.name} fill sizes="80px" unoptimized className="object-contain" />
          </span>
        )}
        <h1 className="text-5xl font-bold">{org.name}</h1>
        <p className="mt-3 text-muted-foreground">{t('product.orgHome.subtitle')}</p>
      </header>

      {tournaments.length === 0 && (
        <p className="mt-16 text-center text-muted-foreground">{t('product.orgHome.empty')}</p>
      )}

      {active.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-2xl font-bold">{t('product.orgHome.featured')}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {active.map((x) => (
              <TournamentCard key={String(x.id)} tournament={x} t={t} highlighted />
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-2xl font-bold">{t('product.orgHome.past')}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {past.map((x) => (
              <TournamentCard key={String(x.id)} tournament={x} t={t} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}

function TournamentCard({
  tournament,
  t,
  highlighted = false,
}: {
  tournament: { id: string | number; name: string; slug: string; status: string; editionDate: string | null }
  t: Translate
  highlighted?: boolean
}) {
  return (
    <LocaleLink
      href={`/${tournament.slug}`}
      className={`block rounded-xl border p-6 transition-colors ${
        highlighted
          ? 'border-primary/40 bg-primary/10 hover:bg-primary/20'
          : 'border-border bg-card hover:bg-muted'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-xl font-bold">{tournament.name}</h3>
        <Badge variant="secondary">{t(`product.status.${tournament.status}`)}</Badge>
      </div>
      {formatEditionDate(tournament.editionDate) && (
        <p className="mt-2 text-sm text-muted-foreground">{formatEditionDate(tournament.editionDate)}</p>
      )}
    </LocaleLink>
  )
}
