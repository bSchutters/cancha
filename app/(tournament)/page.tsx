import Image from 'next/image'
import Link from 'next/link'
import { getPayloadClient } from '@/lib/payload'
import { listPublicTournaments } from '@/lib/tournament/public-view'
import { resolveTenant } from '@/lib/tournament/tenant'
import { formatEditionDate } from '@/lib/tournament/format'
import { Badge } from '@/components/ui/badge'
import { MarketingShell } from '@/components/marketing/shell'
import { HomeSections } from '@/components/marketing/home'

export const dynamic = 'force-dynamic'

const STATUS_LABEL: Record<string, string> = {
  registration: 'Inscriptions ouvertes',
  registration_closed: 'Inscriptions fermées',
  draw_done: 'Poules constituées',
  live: 'En cours',
  finished: 'Terminé',
  archived: 'Archivé',
}

const ACTIVE = new Set(['registration', 'registration_closed', 'draw_done', 'live'])

export default async function CupHomePage() {
  const payload = await getPayloadClient()
  const org = await resolveTenant(payload)

  // Apex host (no organization): product landing page. Each organization's public
  // tournament list lives on its own subdomain / custom domain.
  if (!org) {
    return (
      <MarketingShell>
        <HomeSections />
      </MarketingShell>
    )
  }

  const tournaments = await listPublicTournaments(payload, org.id)
  const active = tournaments.filter((t) => ACTIVE.has(t.status))
  const past = tournaments.filter((t) => !ACTIVE.has(t.status))

  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <header className="flex flex-col items-center text-center">
        {org.logoUrl && (
          <span className="relative mb-4 h-20 w-20">
            <Image src={org.logoUrl} alt={org.name} fill sizes="80px" unoptimized className="object-contain" />
          </span>
        )}
        <h1 className="text-5xl font-bold">{org.name}</h1>
        <p className="mt-3 text-muted-foreground">
          Inscriptions, classements et résultats en direct.
        </p>
      </header>

      {tournaments.length === 0 && (
        <p className="mt-16 text-center text-muted-foreground">Aucun tournoi pour le moment. Revenez bientôt !</p>
      )}

      {active.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-2xl font-bold">À l’affiche</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {active.map((t) => (
              <TournamentCard key={String(t.id)} t={t} highlighted />
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-2xl font-bold">Éditions précédentes</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {past.map((t) => (
              <TournamentCard key={String(t.id)} t={t} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}

function TournamentCard({
  t,
  highlighted = false,
}: {
  t: { id: string | number; name: string; slug: string; status: string; editionDate: string | null }
  highlighted?: boolean
}) {
  return (
    <Link
      href={`/${t.slug}`}
      className={`block rounded-xl border p-6 transition-colors ${
        highlighted
          ? 'border-primary/40 bg-primary/10 hover:bg-primary/20'
          : 'border-border bg-card hover:bg-muted'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-xl font-bold">{t.name}</h3>
        <Badge variant="secondary">{STATUS_LABEL[t.status] ?? t.status}</Badge>
      </div>
      {formatEditionDate(t.editionDate) && (
        <p className="mt-2 text-sm text-muted-foreground">{formatEditionDate(t.editionDate)}</p>
      )}
    </Link>
  )
}
