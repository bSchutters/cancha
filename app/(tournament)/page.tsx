import Link from 'next/link'
import { getPayloadClient } from '@/lib/payload'
import { listPublicTournaments } from '@/lib/tournament/public-view'
import { Badge } from '@/components/ui/badge'

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
  const tournaments = await listPublicTournaments(payload)

  const active = tournaments.filter((t) => ACTIVE.has(t.status))
  const past = tournaments.filter((t) => !ACTIVE.has(t.status))

  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <header className="text-center">
        <h1 className="text-5xl font-bold">UD Asturiana Cup</h1>
        <p className="mt-3 text-white/60">Les tournois de futsal organisés par UD Asturiana</p>
      </header>

      {tournaments.length === 0 && (
        <p className="mt-16 text-center text-white/60">Aucun tournoi pour le moment. Revenez bientôt !</p>
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
          ? 'border-spanish-accent-2/40 bg-spanish-accent-2/10 hover:bg-spanish-accent-2/20'
          : 'border-white/10 bg-white/5 hover:bg-white/10'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-xl font-bold">{t.name}</h3>
        <Badge variant="secondary">{STATUS_LABEL[t.status] ?? t.status}</Badge>
      </div>
      {t.editionDate && (
        <p className="mt-2 text-sm text-white/60">
          {new Date(t.editionDate).toLocaleDateString('fr-BE', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      )}
    </Link>
  )
}
