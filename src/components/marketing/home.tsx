import Link from 'next/link'
import {
  ArrowRight,
  CalendarClock,
  Check,
  ClipboardList,
  Dices,
  Flag,
  Globe,
  Handshake,
  LayoutGrid,
  type LucideIcon,
  Megaphone,
  Radio,
  Trophy,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Bracket } from '@/components/tournament/Bracket'
import { MatchCard } from '@/components/tournament/MatchList'
import { DEMO_KNOCKOUT, DEMO_GROUP_MATCHES } from '@/lib/marketing/demo-data'
import { COMPARISON } from '@/lib/marketing/content'
import { display, focusRing } from './theme'
import { Reveal, Parallax } from './motion'
import { CtaSection } from './cta-section'
import { Testimonials } from './testimonials'

const PROCESS = [
  { icon: ClipboardList, title: 'Inscriptions', desc: 'Les équipes s’inscrivent en ligne, vous validez en un clic.' },
  { icon: Dices, title: 'Tirage au sort', desc: 'Les poules se constituent automatiquement, avec un tirage animé.' },
  { icon: CalendarClock, title: 'Calendrier', desc: 'Matchs, horaires et terrains générés sans le moindre fichier Excel.' },
  { icon: Radio, title: 'En direct', desc: 'Scores, classements et phase finale calculés en temps réel.' },
]

type Feature = {
  icon: LucideIcon
  title: string
  desc: string
  wide?: boolean
  tint?: boolean
  preview?: 'bracket' | 'matches'
}

const FEATURES: Feature[] = [
  {
    icon: Trophy,
    title: 'Phase finale & classements',
    desc: 'Poules, arbre, barrages et classement final calculés en direct.',
    wide: true,
    preview: 'bracket',
  },
  {
    icon: LayoutGrid,
    title: 'Multi-terrains',
    desc: 'Le calendrier se répartit sur plusieurs terrains, retards gérés.',
    wide: true,
    preview: 'matches',
  },
  { icon: Flag, title: 'Arbitres', desc: 'Affectation manuelle ou aléatoire à la génération.' },
  { icon: Handshake, title: 'Classement fair-play', desc: 'Le fair-play est suivi et classé, en plus des résultats.', tint: true },
  { icon: Megaphone, title: 'Sponsors & couleurs', desc: 'Vos sponsors et votre identité sur chaque page.' },
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

const BRACKET = [
  { round: 'Demi-finales', pairs: [['Real Sporting', 'Stade Central'], ['Olympic 7', 'AS Tonnerre']] },
  { round: 'Finale', pairs: [['Real Sporting', 'Olympic 7']] },
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
              Organisez vos tournois{' '}
              <span className="font-medium italic text-primary">sans y passer vos soirées.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Inscriptions, tirage au sort, calendrier multi-terrains et classements en direct : tout
              est géré pour vous. Fini Excel et les groupes WhatsApp.
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
                Voir un aperçu interactif
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
          <span className="text-sm font-medium text-primary">L’atout sur place</span>
          <h2 style={display} className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Un show pour vos équipes, un écran pour votre événement
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Le tirage des poules se dévoile en grand, et l’affichage TV garde tout le monde informé :
            prochains matchs, scores et classements, en continu.
          </p>
        </Reveal>

        {/* Two superimposed screens: the group view in front, the knockout view behind. */}
        <Reveal delay={0.1} className="relative mx-auto mt-14 max-w-3xl">
          {/* Front screen: group view (matches + standings) */}
          <div className="relative z-10 rounded-2xl border border-border bg-card p-5 shadow-[0_24px_60px_-30px_rgba(26,26,24,0.35)] lg:mt-24 lg:w-[64%] lg:-rotate-2">
            <div className="mb-4 flex items-center justify-between">
              <span style={display} className="text-sm font-medium">
                Affichage sur écran
              </span>
              <LivePill />
            </div>
            <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Prochains matchs</h3>
            <div className="mt-2 space-y-2">
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
            <h3 className="mt-5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Classement · Poule A
            </h3>
            <div className="mt-2 space-y-1.5">
              {STANDINGS.map((s) => (
                <div key={s.rank} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-3">
                    <span
                      className={cn(
                        'w-4 text-center font-semibold tabular-nums',
                        s.rank <= 2 ? 'text-primary' : 'text-muted-foreground',
                      )}
                    >
                      {s.rank}
                    </span>
                    <span className="font-medium">{s.name}</span>
                  </span>
                  <span className="font-semibold tabular-nums">{s.pts} pts</span>
                </div>
              ))}
            </div>
          </div>

          {/* Back screen: knockout bracket, peeking out top-right */}
          <div className="mt-4 rounded-2xl border border-border bg-card p-5 shadow-[0_18px_50px_-30px_rgba(26,26,24,0.25)] lg:absolute lg:right-0 lg:top-0 lg:mt-0 lg:w-[56%] lg:rotate-3">
            <div className="mb-3 flex items-center justify-between">
              <span style={display} className="text-sm font-medium">
                Phase finale
              </span>
              <span className="text-xs text-muted-foreground">Vue tableau</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {BRACKET.map((col) => (
                <div key={col.round}>
                  <div className="mb-2 text-muted-foreground">{col.round}</div>
                  <div className="space-y-2">
                    {col.pairs.map((pair, i) => (
                      <div key={i} className="overflow-hidden rounded-md border border-border">
                        {pair.map((t, j) => (
                          <div
                            key={j}
                            className={cn(
                              'truncate px-2 py-1',
                              j === 0 ? 'border-b border-border font-medium text-primary' : 'text-muted-foreground',
                            )}
                          >
                            {t}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
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
              Quatre étapes, zéro fichier Excel. La plateforme s’occupe du reste.
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
                {f.preview === 'bracket' && (
                  <div className="mt-5 overflow-x-auto rounded-xl border border-border bg-background p-3">
                    <Bracket matches={DEMO_KNOCKOUT} size="sm" />
                  </div>
                )}
                {f.preview === 'matches' && (
                  <div className="mt-5 grid gap-2 sm:grid-cols-2">
                    {DEMO_GROUP_MATCHES.slice(0, 2).map((m) => (
                      <MatchCard key={String(m.id)} match={m} />
                    ))}
                  </div>
                )}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison teaser */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-5xl px-4 py-24 sm:px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 style={display} className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Pourquoi pas juste Excel ?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Excel et le papier font illusion jusqu’au jour J. Là où ça compte, la différence est nette.
            </p>
          </Reveal>

          <Reveal className="mt-10 overflow-x-auto rounded-3xl border border-border bg-card">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="p-4 font-medium text-muted-foreground">Tâche</th>
                  <th className="p-4 font-medium text-muted-foreground">Excel / papier</th>
                  <th className="p-4 font-medium text-primary">Cup Generator</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.slice(0, 5).map((row) => (
                  <tr key={row.criterion} className="border-b border-border last:border-b-0">
                    <td className="p-4 font-medium text-foreground">{row.criterion}</td>
                    <td className="p-4 text-muted-foreground">{row.excel}</td>
                    <td className="bg-primary/[0.04] p-4">
                      <span className="flex items-start gap-2">
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                        <span className="font-medium text-foreground">{row.cupgenerator}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>

          <Reveal className="mt-6 text-center">
            <Link
              href="/comparatif"
              className={cn(
                'inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-foreground',
                focusRing,
              )}
            >
              Voir le comparatif complet
              <ArrowRight className="size-4" />
            </Link>
          </Reveal>
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
