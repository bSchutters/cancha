import Link from 'next/link'
import {
  ArrowRight,
  CalendarClock,
  ClipboardList,
  Dices,
  Flag,
  Globe,
  Handshake,
  LayoutGrid,
  Megaphone,
  Radio,
  Trophy,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { display, focusRing } from './theme'
import { Reveal, Parallax } from './motion'
import { CtaSection } from './cta-section'
import { Testimonials } from './testimonials'

const PROCESS = [
  { icon: ClipboardList, title: 'Inscriptions', desc: 'Les équipes s’inscrivent en ligne, vous validez en un clic.' },
  { icon: Dices, title: 'Tirage au sort', desc: 'Les poules se constituent automatiquement, avec un tirage animé.' },
  { icon: CalendarClock, title: 'Calendrier', desc: 'Matchs, horaires et terrains générés sans le moindre tableur.' },
  { icon: Radio, title: 'En direct', desc: 'Scores, classements et phase finale calculés en temps réel.' },
]

const FEATURES = [
  {
    icon: Trophy,
    title: 'Phase finale & classements',
    desc: 'Poules, arbre, barrages et classement final calculés en direct.',
    wide: true,
    tint: true,
  },
  {
    icon: LayoutGrid,
    title: 'Multi-terrains',
    desc: 'Le calendrier se répartit sur plusieurs terrains, retards gérés.',
    wide: true,
    tint: false,
  },
  { icon: Flag, title: 'Arbitres', desc: 'Affectation manuelle ou aléatoire à la génération.', tint: false },
  { icon: Handshake, title: 'Classement fair-play', desc: 'Le fair-play est suivi et classé, en plus des résultats.', tint: true },
  { icon: Megaphone, title: 'Sponsors & couleurs', desc: 'Vos sponsors et votre identité sur chaque page.', tint: false },
  { icon: Globe, title: 'Page publique', desc: 'Une page par tournoi : équipes, calendrier et résultats en ligne.', tint: true },
]

const STANDINGS = [
  { rank: 1, name: 'Real Sporting', pts: 9, q: true },
  { rank: 2, name: 'AS Tonnerre', pts: 6, q: true },
  { rank: 3, name: 'Les Lynx', pts: 3, q: false },
  { rank: 4, name: 'FC Comète', pts: 0, q: false },
]

const NEXT_MATCHES = [
  { home: 'Real Sporting', away: 'Les Lynx', time: '14:30', court: 'T1' },
  { home: 'AS Tonnerre', away: 'FC Comète', time: '14:30', court: 'T2' },
  { home: 'Real Sporting', away: 'AS Tonnerre', time: '15:00', court: 'T1' },
]

const KO_ROUNDS = [
  { label: 'Quarts', teams: ['Real Sporting', 'Olympic 7', 'AS Tonnerre', 'Les Lynx'] },
  { label: 'Demi', teams: ['Real Sporting', 'AS Tonnerre'] },
  { label: 'Finale', teams: ['Real Sporting'] },
]

const AUDIENCE = ['Clubs', 'Comités des fêtes', 'Écoles de jeunes', 'Entreprises', 'Associations']

/** Live "En direct" pill with a pulsing dot. */
function LivePill() {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="relative flex size-2.5">
        <span className="absolute inline-flex size-full rounded-full bg-primary opacity-75 motion-safe:animate-ping" />
        <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
      </span>
      <span className="text-sm font-medium text-muted-foreground">En direct</span>
    </span>
  )
}

/** Apex product landing sections (rendered inside MarketingShell). */
export function HomeSections() {
  return (
    <>
      {/* Hero */}
      <section className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-130 bg-[radial-gradient(55%_55%_at_50%_0%,rgba(53,82,125,0.07),transparent_70%)]"
        />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-24 pt-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:pt-24">
          <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:duration-700">
            <span className="text-sm font-medium text-primary">
              Pour les organisateurs de tournois, tous sports
            </span>
            <h1
              style={display}
              className="mt-4 text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl"
            >
              Vos tournois,{' '}
              <span className="font-medium italic text-primary">du tirage au trophée.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Fini les tableurs et les groupes WhatsApp. Créez votre tournoi, la plateforme gère
              tirage, calendrier et classements en direct.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Button asChild size="lg">
                <Link href="#contact">
                  Demander une démo
                  <ArrowRight />
                </Link>
              </Button>
              <Link
                href="/demo"
                className={cn(
                  'inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-primary',
                  focusRing,
                )}
              >
                Voir la démo en direct
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>

          {/* Live group mini-preview (illustrative data) */}
          <Parallax
            amount={28}
            className="rounded-2xl border border-border bg-card p-5 shadow-[0_12px_40px_-20px_rgba(26,26,24,0.18)] motion-safe:animate-in motion-safe:fade-in motion-safe:duration-1000"
          >
            <div className="flex items-center justify-between">
              <LivePill />
              <span className="text-xs text-muted-foreground">Poule A · Terrain 1</span>
            </div>
            <div className="mt-4 space-y-1">
              {STANDINGS.map((t) => (
                <div
                  key={t.name}
                  className={cn(
                    'flex items-center justify-between rounded-lg px-3 py-2 text-sm',
                    t.q && 'bg-primary/10',
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        'w-4 text-center font-semibold tabular-nums',
                        t.q ? 'text-primary' : 'text-muted-foreground',
                      )}
                    >
                      {t.rank}
                    </span>
                    <span className="font-medium">{t.name}</span>
                  </div>
                  <span className="font-semibold tabular-nums">{t.pts} pts</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs">
              <span className="text-muted-foreground">Prochain match</span>
              <span className="font-medium">Real Sporting vs Les Lynx · 14:30</span>
            </div>
          </Parallax>
        </div>
      </section>

      {/* Spotlight: the in-hall show */}
      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-medium text-primary">L’atout en salle</span>
          <h2 style={display} className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Un show pour vos équipes, un écran pour votre salle
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Le tirage des poules se dévoile en grand, et l’affichage TV garde la salle informée :
            prochains matchs, scores et phase finale, en continu.
          </p>
        </Reveal>

        <Reveal
          delay={0.1}
          className="mt-12 overflow-hidden rounded-3xl border border-border bg-card shadow-[0_24px_60px_-32px_rgba(26,26,24,0.22)]"
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <span style={display} className="font-medium">
              Affichage salle
            </span>
            <LivePill />
          </div>
          <div className="grid gap-px bg-border sm:grid-cols-2">
            <div className="bg-card p-6">
              <h3 className="text-sm font-medium text-muted-foreground">Prochains matchs</h3>
              <div className="mt-4 space-y-3">
                {NEXT_MATCHES.map((m, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                      {m.home} <span className="text-muted-foreground">vs</span> {m.away}
                    </span>
                    <span className="tabular-nums text-muted-foreground">
                      {m.time} · {m.court}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-card p-6">
              <h3 className="text-sm font-medium text-muted-foreground">Phase finale</h3>
              <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                {KO_ROUNDS.map((col) => (
                  <div key={col.label}>
                    <div className="mb-2 text-muted-foreground">{col.label}</div>
                    <div className="space-y-1.5">
                      {col.teams.map((team, i) => (
                        <div
                          key={i}
                          className={cn(
                            'truncate rounded-md border px-2 py-1',
                            col.label === 'Finale'
                              ? 'border-primary/30 bg-primary/10 font-medium text-primary'
                              : 'border-border',
                          )}
                        >
                          {team}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Process */}
      <section className="border-y border-border bg-secondary/50">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <Reveal>
            <h2 style={display} className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              De l’inscription au coup de sifflet final
            </h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Quatre étapes, zéro tableur. La plateforme s’occupe du reste.
            </p>
          </Reveal>
          <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.08}>
                <div className="flex items-center gap-3">
                  <span style={display} className="text-3xl font-medium tabular-nums text-primary/60">
                    0{i + 1}
                  </span>
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <s.icon className="size-5" />
                  </span>
                </div>
                <h3 style={display} className="mt-5 text-xl font-medium">
                  {s.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <p className="mt-12 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Pas besoin d’être à l’aise avec l’informatique : si vous savez remplir un formulaire,
              vous savez créer votre tournoi. On vous accompagne pour le premier.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Feature bento */}
      <section id="features" className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <Reveal>
            <h2 style={display} className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Tout ce qu’il faut pour gérer le jour J
            </h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              De la première inscription au dernier coup de sifflet.
            </p>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, i) => (
              <Reveal
                key={f.title}
                delay={i * 0.06}
                className={cn(
                  'rounded-2xl border p-6 transition-colors',
                  f.wide && 'sm:col-span-2',
                  f.tint
                    ? 'border-primary/15 bg-primary/[0.06]'
                    : 'border-border bg-card hover:border-primary/30',
                )}
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <f.icon className="size-5" />
                </span>
                <h3 style={display} className="mt-5 text-lg font-medium">
                  {f.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Testimonials />

      {/* Audience */}
      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <Reveal className="rounded-3xl border border-border bg-card p-10 text-center sm:p-14">
          <h2 style={display} className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Quel que soit votre sport, quel que soit votre format
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Football, futsal, padel, volley, basket, ping-pong, pétanque… tout format à poules et
            phase finale.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {AUDIENCE.map((a) => (
              <span
                key={a}
                className="rounded-full border border-border bg-background px-4 py-1.5 text-sm text-muted-foreground"
              >
                {a}
              </span>
            ))}
          </div>
        </Reveal>
      </section>

      <CtaSection />
    </>
  )
}
