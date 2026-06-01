import Image from 'next/image'
import Link from 'next/link'
import { ClipboardList, Dices, CalendarClock, Trophy, Tv, Radio } from 'lucide-react'
import { getPayloadClient } from '@/lib/payload'
import { listPublicTournaments } from '@/lib/tournament/public-view'
import { resolveTenant } from '@/lib/tournament/tenant'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

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
  if (!org) return <Landing />

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
          Tournois de futsal - inscriptions, classements et résultats en direct.
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

const FEATURES = [
  {
    icon: ClipboardList,
    title: 'Inscriptions en ligne',
    desc: 'Les équipes s’inscrivent, paient et sont validées en quelques clics.',
  },
  {
    icon: Dices,
    title: 'Tirage au sort animé',
    desc: 'Un tirage des poules spectaculaire, projeté sur grand écran.',
  },
  {
    icon: CalendarClock,
    title: 'Calendrier automatique',
    desc: 'Génération des matchs multi-terrains, horaires et retards gérés.',
  },
  {
    icon: Trophy,
    title: 'Phase finale & classements',
    desc: 'Poules, arbre, barrages et classement final calculés en direct.',
  },
  {
    icon: Tv,
    title: 'Affichage TV',
    desc: 'Des écrans pour la salle : prochains matchs, programme, classements.',
  },
  {
    icon: Radio,
    title: 'Suivi en direct',
    desc: 'Une page publique par tournoi : scores et horaires en temps réel.',
  },
]

/** Product landing page shown on the apex host (no organization). */
function Landing() {
  return (
    <main>
      <section className="mx-auto max-w-5xl px-4 pb-16 pt-20 text-center sm:pt-28">
        <span className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          ⚽ Football &amp; Futsal
        </span>
        <h1 className="mt-6 text-5xl font-bold tracking-tight sm:text-6xl">
          Cup <span className="text-primary">Generator</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
          La plateforme tout-en-un pour organiser vos tournois de football et de futsal - de
          l’inscription des équipes au classement final, en passant par le tirage et l’affichage TV.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/login">Connexion organisateur</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="#features">Découvrir les fonctionnalités</Link>
          </Button>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-5xl px-4 pb-24">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl border border-border bg-card p-6">
              <span className="inline-flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <f.icon className="size-5" />
              </span>
              <h3 className="mt-4 font-bold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
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
      {t.editionDate && (
        <p className="mt-2 text-sm text-muted-foreground">
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
