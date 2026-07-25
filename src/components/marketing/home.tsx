import { LocaleLink } from '@/components/locale-link'
import type { Translate } from '@/i18n'
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
import { MatchCard } from '@/components/tournament/MatchList'
import { DEMO_GROUP_MATCHES } from '@/lib/marketing/demo-data'
import { HeroScreen } from './hero-screen'
import { HeroBracket } from './hero-bracket'
import { display, focusRing } from './theme'
import { Reveal, Parallax, HeroIntro } from './motion'
import { CtaSection } from './cta-section'
import { Testimonials } from './testimonials'

const PROCESS = [
  { icon: ClipboardList, key: 'inscriptions' },
  { icon: Dices, key: 'tirage' },
  { icon: CalendarClock, key: 'calendrier' },
  { icon: Radio, key: 'endirect' },
]

// The five competition formats the engine supports. Ordered from the most common
// (what most one-day tournaments run) to the most specialised.
const FORMATS = ['groupsKo', 'league', 'singleElim', 'doubleElim', 'swiss'] as const

type Feature = {
  icon: LucideIcon
  key: string
  wide?: boolean
  tint?: boolean
  preview?: 'bracket' | 'matches'
}

const FEATURES: Feature[] = [
  { icon: Trophy, key: 'phaseFinale', wide: true, preview: 'bracket' },
  { icon: LayoutGrid, key: 'multiTerrains', wide: true, preview: 'matches' },
  { icon: Flag, key: 'arbitres' },
  { icon: Handshake, key: 'fairPlay', tint: true },
  { icon: Megaphone, key: 'sponsors' },
  { icon: Globe, key: 'pagePublique', tint: true },
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

const AUDIENCE = ['clubs', 'comites', 'ecoles', 'entreprises', 'associations']

/** Live pill with a pulsing dot. */
function LivePill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="relative flex size-2.5">
        <span className="absolute inline-flex size-full rounded-full bg-primary opacity-75 motion-safe:animate-ping" />
        <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
      </span>
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </span>
  )
}

/** Apex product landing sections (rendered inside MarketingShell). */
export function HomeSections({ t }: { t: Translate }) {
  return (
    <>
      {/* Hero */}
      <section className="relative">
        <Parallax amount={40} className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-130">
          <div
            aria-hidden
            className="h-full w-full bg-[radial-gradient(55%_55%_at_50%_0%,rgba(53,82,125,0.07),transparent_70%)]"
          />
        </Parallax>
        <HeroIntro className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-24 pt-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:pt-24">
          <div>
            <span data-hero className="inline-block text-sm font-medium text-primary">
              {t('home.heroEyebrow')}
            </span>
            <h1
              data-hero
              style={display}
              className="mt-4 text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl"
            >
              {t('home.heroTitle')} <span className="font-medium italic text-primary">{t('home.heroTitleEm')}</span>
            </h1>
            <p data-hero className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              {t('home.heroSubcopy')}
            </p>
            <div data-hero className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Button asChild size="lg">
                <LocaleLink href="#contact">
                  {t('common.requestDemo')}
                  <ArrowRight />
                </LocaleLink>
              </Button>
              <LocaleLink
                href="/demo"
                className={cn(
                  'inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-primary',
                  focusRing,
                )}
              >
                {t('common.interactivePreview')}
                <ArrowRight className="size-4" />
              </LocaleLink>
            </div>
          </div>

          {/* Live screen: alternates between pool standings and the knockout tree */}
          <div data-hero>
            <HeroScreen standings={STANDINGS} />
          </div>
        </HeroIntro>
      </section>

      {/* Spotlight: the in-hall show */}
      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-medium text-primary">{t('home.spotlight.eyebrow')}</span>
          <h2 style={display} className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            {t('home.spotlight.title')}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{t('home.spotlight.subcopy')}</p>
        </Reveal>

        <Reveal
          delay={0.1}
          className="mx-auto mt-12 max-w-3xl overflow-hidden rounded-3xl border border-border bg-card shadow-[0_24px_60px_-32px_rgba(26,26,24,0.22)]"
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <span style={display} className="font-medium">
              {t('home.spotlight.screenLabel')}
            </span>
            <LivePill label={t('home.livePill')} />
          </div>
          <div className="grid gap-px bg-border sm:grid-cols-2">
            <div className="bg-card p-6">
              <h3 className="text-sm font-medium text-muted-foreground">{t('home.spotlight.nextMatches')}</h3>
              <div className="mt-4 space-y-3">
                {NEXT_MATCHES.map((m, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                      {m.home} <span className="text-muted-foreground">{t('home.spotlight.vs')}</span> {m.away}
                    </span>
                    <span className="tabular-nums text-muted-foreground">
                      {m.time} · {m.court}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-card p-6">
              <h3 className="text-sm font-medium text-muted-foreground">{t('home.spotlight.standingsPoolA')}</h3>
              <div className="mt-4 space-y-2">
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
                    <span className="font-semibold tabular-nums">
                      {s.pts} {t('home.spotlight.pts')}
                    </span>
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
              {t('home.process.title')}
            </h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">{t('home.process.subcopy')}</p>
          </Reveal>
          <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map((s, i) => (
              <Reveal key={s.key} delay={i * 0.08}>
                <div className="flex items-center gap-3">
                  <span style={display} className="text-3xl font-medium tabular-nums text-primary/60">
                    0{i + 1}
                  </span>
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <s.icon className="size-5" />
                  </span>
                </div>
                <h3 style={display} className="mt-5 text-xl font-medium">
                  {t(`home.process.${s.key}.title`)}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {t(`home.process.${s.key}.desc`)}
                </p>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <p className="mt-12 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {t('home.process.note')}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Feature bento */}
      <section id="features" className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <Reveal>
            <h2 style={display} className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              {t('home.features.title')}
            </h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">{t('home.features.subcopy')}</p>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, i) => (
              <Reveal
                key={f.key}
                delay={i * 0.06}
                className={cn(
                  'rounded-2xl border p-6 transition-colors',
                  f.wide && 'sm:col-span-2',
                  f.tint ? 'border-primary/15 bg-primary/[0.06]' : 'border-border bg-card hover:border-primary/30',
                )}
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <f.icon className="size-5" />
                </span>
                <h3 style={display} className="mt-5 text-lg font-medium">
                  {t(`home.features.${f.key}.title`)}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {t(`home.features.${f.key}.desc`)}
                </p>
                {f.preview === 'bracket' && (
                  <div className="mt-5 rounded-xl border border-border bg-background p-4">
                    <div className="mx-auto max-w-[320px]">
                      <HeroBracket />
                    </div>
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
              {t('home.comparison.title')}
            </h2>
            <p className="mt-3 text-muted-foreground">{t('home.comparison.subcopy')}</p>
          </Reveal>

          <Reveal className="mt-10 overflow-x-auto rounded-3xl border border-border bg-card">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="p-4 font-medium text-muted-foreground">{t('home.comparison.header.task')}</th>
                  <th className="p-4 font-medium text-muted-foreground">{t('home.comparison.header.excel')}</th>
                  <th className="p-4 font-medium text-primary">{t('home.comparison.header.cancha')}</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="border-b border-border last:border-b-0">
                    <td className="p-4 font-medium text-foreground">{t(`home.comparison.row${i}.criterion`)}</td>
                    <td className="p-4 text-muted-foreground">{t(`home.comparison.row${i}.excel`)}</td>
                    <td className="bg-primary/[0.04] p-4">
                      <span className="flex items-start gap-2">
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                        <span className="font-medium text-foreground">{t(`home.comparison.row${i}.cancha`)}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>

          <Reveal className="mt-6 text-center">
            <LocaleLink
              href="/comparatif"
              className={cn(
                'inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-foreground',
                focusRing,
              )}
            >
              {t('home.comparison.viewFull')}
              <ArrowRight className="size-4" />
            </LocaleLink>
          </Reveal>
        </div>
      </section>

      <Testimonials t={t} />

      {/* Competition formats */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-5xl px-4 py-24 sm:px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold text-primary">{t('home.formats.eyebrow')}</span>
            <h2 style={display} className="mt-2 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              {t('home.formats.title')}
            </h2>
            <p className="mt-3 text-muted-foreground">{t('home.formats.subcopy')}</p>
          </Reveal>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FORMATS.map((key) => (
              <Reveal key={key} className="rounded-2xl border border-border bg-card p-6">
                <h3 style={display} className="text-lg font-medium">
                  {t(`home.formats.${key}.title`)}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {t(`home.formats.${key}.desc`)}
                </p>
                <p className="mt-4 text-xs font-medium uppercase tracking-wide text-primary">
                  {t(`home.formats.${key}.when`)}
                </p>
              </Reveal>
            ))}
            <Reveal className="flex flex-col justify-center rounded-2xl border border-primary/15 bg-primary/[0.06] p-6">
              <p className="text-sm leading-relaxed text-muted-foreground">{t('home.formats.footnote')}</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Audience */}
      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <Reveal className="rounded-3xl border border-border bg-card p-10 text-center sm:p-14">
          <h2 style={display} className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {t('home.audienceBlock.title')}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">{t('home.audienceBlock.subcopy')}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {AUDIENCE.map((a) => (
              <span
                key={a}
                className="rounded-full border border-border bg-background px-4 py-1.5 text-sm text-muted-foreground"
              >
                {t(`home.audience.${a}`)}
              </span>
            ))}
          </div>
        </Reveal>
      </section>

      <CtaSection title={t('home.cta.title')} subtitle={t('home.cta.subtitle')} />
    </>
  )
}
