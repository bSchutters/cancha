// Reconstructed, on-brand mockups that illustrate each feature on the
// /fonctionnalites page. These are static "example" visuals (not the live
// product), themed via CSS vars, intentionally compact. The rotating TV
// display lives in its own client file (tv-display.tsx).
import { ArrowRight, Check, Clock, Flag, Medal, Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { display } from './theme'

/** Reusable "En direct" pill with a pulsing dot. */
export function LivePill() {
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

function WindowDots() {
  return (
    <span className="flex gap-1.5">
      <span className="size-2.5 rounded-full bg-border" />
      <span className="size-2.5 rounded-full bg-border" />
      <span className="size-2.5 rounded-full bg-border" />
    </span>
  )
}

/** Small device-style frame so a mockup reads as "a real screen". */
export function Screen({ title, live, children }: { title: string; live?: boolean; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-[0_24px_60px_-32px_rgba(26,26,24,0.22)]">
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <span style={display} className="font-medium">
          {title}
        </span>
        {live ? <LivePill /> : <WindowDots />}
      </div>
      {children}
    </div>
  )
}

function Initials({ name, className }: { name: string; className?: string }) {
  const letters = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
  return (
    <span
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary',
        className,
      )}
    >
      {letters}
    </span>
  )
}

/** Shared pool-A standings, reused by several demos. */
export const LIVE_STANDINGS = [
  { rank: 1, name: 'Real Sporting', j: 3, pts: 9, q: true },
  { rank: 2, name: 'AS Tonnerre', j: 3, pts: 6, q: true },
  { rank: 3, name: 'Les Lynx', j: 3, pts: 3, q: false },
  { rank: 4, name: 'FC Comète', j: 3, pts: 0, q: false },
]

function shortName(n: string) {
  const [a, b] = n.split(' ')
  return b ? `${a} ${b[0]}.` : a
}

/* ------------------------------------------------------------------ */
/* Inscriptions en ligne                                               */
/* ------------------------------------------------------------------ */

const REGISTRATIONS = [
  { name: 'Real Sporting', confirmed: true, paid: true },
  { name: 'AS Tonnerre', confirmed: true, paid: true },
  { name: 'Les Lynx', confirmed: true, paid: false },
  { name: 'Olympic 7', confirmed: false, paid: false },
]

export function RegistrationDemo() {
  return (
    <Screen title="Équipes inscrites">
      <div className="px-5 py-5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Capacité</span>
          <span className="font-medium tabular-nums">14 / 16 équipes</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-primary" style={{ width: '87.5%' }} />
        </div>

        <div className="mt-5 space-y-2.5">
          {REGISTRATIONS.map((t) => (
            <div
              key={t.name}
              className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5"
            >
              <Initials name={t.name} />
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{t.name}</span>
              {t.paid && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  Payé
                </span>
              )}
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-xs font-medium',
                  t.confirmed
                    ? 'border border-primary/20 bg-primary/[0.06] text-primary'
                    : 'border border-border bg-secondary text-muted-foreground',
                )}
              >
                {t.confirmed ? 'Confirmée' : 'En attente'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Screen>
  )
}

/* ------------------------------------------------------------------ */
/* Tirage au sort (static)                                             */
/* ------------------------------------------------------------------ */

const DRAW_POOLS = [
  { label: 'A', teams: ['Real Sporting', 'AS Tonnerre', 'Les Lynx', 'FC Comète'] },
  { label: 'B', teams: ['Olympic 7', 'Dynamo Nord', 'Les Aigles', 'Étoile FC'] },
]

export function DrawDemo() {
  return (
    <Screen title="Tirage des poules">
      <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2">
        {DRAW_POOLS.map((pool) => (
          <div key={pool.label} className="bg-card p-5">
            <div className="mb-3 text-sm font-medium text-primary">Poule {pool.label}</div>
            <div className="space-y-2">
              {pool.teams.map((t, i) => (
                <div
                  key={t}
                  className="flex items-center gap-2.5 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  <span className="w-4 text-center text-xs font-semibold tabular-nums text-muted-foreground">
                    {i + 1}
                  </span>
                  <span className="truncate font-medium">{t}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Screen>
  )
}

/* ------------------------------------------------------------------ */
/* Calendrier multi-terrains                                           */
/* ------------------------------------------------------------------ */

const COURTS = ['Terrain 1', 'Terrain 2', 'Terrain 3']
const SCHEDULE: { time: string; matches: (readonly [string, string] | null)[] }[] = [
  { time: '14:00', matches: [['Real Sporting', 'Les Lynx'], ['AS Tonnerre', 'FC Comète'], ['Olympic 7', 'Dynamo Nord']] },
  { time: '14:30', matches: [['Real Sporting', 'FC Comète'], ['Les Lynx', 'AS Tonnerre'], null] },
  { time: '15:00', matches: [['Dynamo Nord', 'Olympic 7'], ['Real Sporting', 'AS Tonnerre'], ['Les Lynx', 'FC Comète']] },
]

export function ScheduleDemo() {
  return (
    <Screen title="Calendrier">
      <div className="overflow-x-auto">
        <div className="min-w-[420px]">
          <div className="grid grid-cols-[64px_repeat(3,1fr)] border-b border-border bg-secondary/40">
            <span className="px-3 py-2.5 text-xs font-medium text-muted-foreground">Heure</span>
            {COURTS.map((c) => (
              <span key={c} className="px-3 py-2.5 text-xs font-medium text-primary">
                {c}
              </span>
            ))}
          </div>
          {SCHEDULE.map((row) => (
            <div key={row.time} className="grid grid-cols-[64px_repeat(3,1fr)] border-b border-border last:border-b-0">
              <span className="flex items-center px-3 py-2.5 text-xs font-medium tabular-nums text-muted-foreground">
                {row.time}
              </span>
              {row.matches.map((m, i) => (
                <div key={i} className="border-l border-border p-1.5">
                  {m ? (
                    <div className="rounded-lg border border-border bg-card px-2.5 py-2 text-xs font-medium leading-tight">
                      {shortName(m[0])}
                      <span className="text-muted-foreground"> vs </span>
                      {shortName(m[1])}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-border/70 px-2.5 py-2 text-xs text-muted-foreground/60">
                      Libre
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </Screen>
  )
}

/* ------------------------------------------------------------------ */
/* Arbitres                                                            */
/* ------------------------------------------------------------------ */

const REFEREES = [
  { match: ['Real Sporting', 'Les Lynx'] as const, court: 'T1', ref: 'Marc Dubois' },
  { match: ['AS Tonnerre', 'FC Comète'] as const, court: 'T2', ref: 'Sophie Léon' },
  { match: ['Olympic 7', 'Dynamo Nord'] as const, court: 'T3', ref: 'Karim Bensaïd' },
]

export function RefereeDemo() {
  return (
    <Screen title="Affectation des arbitres">
      <div className="px-5 py-5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
            <Flag className="size-3.5" />
            Aléatoire
          </span>
          <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            Manuel
          </span>
        </div>
        <div className="mt-4 space-y-2.5">
          {REFEREES.map((r) => (
            <div
              key={r.court}
              className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5"
            >
              <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-semibold tabular-nums text-muted-foreground">
                {r.court}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium">
                {shortName(r.match[0])}
                <span className="text-muted-foreground"> vs </span>
                {shortName(r.match[1])}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/[0.06] py-0.5 pl-0.5 pr-2.5 text-xs font-medium text-primary">
                <Initials name={r.ref} className="size-5 text-[10px]" />
                {r.ref}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Screen>
  )
}

/* ------------------------------------------------------------------ */
/* Scores & classements en direct                                      */
/* ------------------------------------------------------------------ */

function Stepper({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-background p-1">
      <span className="flex size-6 items-center justify-center rounded-md text-muted-foreground">
        <Minus className="size-3.5" />
      </span>
      <span className="w-5 text-center text-sm font-semibold tabular-nums">{value}</span>
      <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Plus className="size-3.5" />
      </span>
    </span>
  )
}

export function LiveScoresDemo() {
  return (
    <Screen title="Scores & classement" live>
      <div className="grid gap-px bg-border sm:grid-cols-2">
        <div className="bg-card p-5">
          <h3 className="text-sm font-medium text-muted-foreground">Saisie du score · Terrain 1</h3>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="truncate text-sm font-medium">Real Sporting</span>
              <Stepper value={5} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="truncate text-sm font-medium">FC Comète</span>
              <Stepper value={1} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-primary/[0.06] px-3 py-2 text-xs font-medium text-primary">
            <Check className="size-4" />
            Classement mis à jour automatiquement
          </div>
        </div>
        <div className="bg-card p-5">
          <h3 className="text-sm font-medium text-muted-foreground">Classement · Poule A</h3>
          <div className="mt-4 space-y-1">
            {LIVE_STANDINGS.map((s) => (
              <div
                key={s.rank}
                className={cn(
                  'flex items-center justify-between rounded-lg px-2 py-1.5 text-sm',
                  s.q && 'bg-primary/[0.06]',
                )}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={cn(
                      'w-4 text-center font-semibold tabular-nums',
                      s.q ? 'text-primary' : 'text-muted-foreground',
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
          <p className="mt-3 text-xs text-muted-foreground">Les 2 premiers sont qualifiés.</p>
        </div>
      </div>
    </Screen>
  )
}

/* ------------------------------------------------------------------ */
/* Gestion des retards                                                 */
/* ------------------------------------------------------------------ */

const DELAY_SHIFTS = [
  { match: ['Les Lynx', 'AS Tonnerre'] as const, from: '15:00', to: '15:15' },
  { match: ['Real Sporting', 'FC Comète'] as const, from: '15:30', to: '15:45' },
  { match: ['Dynamo Nord', 'Olympic 7'] as const, from: '16:00', to: '16:15' },
]

export function DelayDemo() {
  return (
    <Screen title="Gestion des horaires">
      <div className="px-5 py-5">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/[0.06] px-4 py-3">
          <span className="flex items-center gap-2.5 text-sm">
            <Clock className="size-4 text-primary" />
            <span className="font-medium">Terrain 2 a pris du retard</span>
          </span>
          <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground tabular-nums">
            +15 min
          </span>
        </div>

        <div className="mt-4 space-y-2.5">
          {DELAY_SHIFTS.map((s) => (
            <div
              key={s.to}
              className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
            >
              <span className="min-w-0 flex-1 truncate font-medium">
                {shortName(s.match[0])}
                <span className="text-muted-foreground"> vs </span>
                {shortName(s.match[1])}
              </span>
              <span className="text-muted-foreground line-through tabular-nums">{s.from}</span>
              <ArrowRight className="size-4 shrink-0 text-primary" />
              <span className="font-semibold text-primary tabular-nums">{s.to}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-xs font-medium text-muted-foreground">
          <Check className="size-4 text-primary" />
          Horaires recalés sur tous les terrains
        </div>
      </div>
    </Screen>
  )
}

/* ------------------------------------------------------------------ */
/* Classement fair-play                                                */
/* ------------------------------------------------------------------ */

const FAIRPLAY = [
  { rank: 1, name: 'AS Tonnerre', yellow: 0, red: 0, score: 100 },
  { rank: 2, name: 'Real Sporting', yellow: 1, red: 0, score: 94 },
  { rank: 3, name: 'Les Lynx', yellow: 2, red: 0, score: 86 },
  { rank: 4, name: 'FC Comète', yellow: 1, red: 1, score: 72 },
]

function Cards({ yellow, red }: { yellow: number; red: number }) {
  if (yellow === 0 && red === 0) {
    return <span className="text-xs text-muted-foreground">Aucun carton</span>
  }
  return (
    <span className="flex items-center gap-1">
      {Array.from({ length: yellow }).map((_, i) => (
        <span key={`y${i}`} className="h-3.5 w-2.5 rounded-[2px] bg-amber-400" />
      ))}
      {Array.from({ length: red }).map((_, i) => (
        <span key={`r${i}`} className="h-3.5 w-2.5 rounded-[2px] bg-red-500" />
      ))}
    </span>
  )
}

export function FairplayDemo() {
  return (
    <Screen title="Classement fair-play">
      <div className="px-5 py-5">
        <div className="space-y-2">
          {FAIRPLAY.map((t) => (
            <div
              key={t.rank}
              className={cn(
                'flex items-center gap-3 rounded-xl border px-3 py-2.5',
                t.rank === 1 ? 'border-primary/20 bg-primary/[0.06]' : 'border-border bg-background',
              )}
            >
              <span className="flex w-5 justify-center">
                {t.rank === 1 ? (
                  <Medal className="size-4 text-primary" />
                ) : (
                  <span className="text-sm font-semibold tabular-nums text-muted-foreground">{t.rank}</span>
                )}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{t.name}</span>
              <Cards yellow={t.yellow} red={t.red} />
              <span className="w-14 text-right text-sm font-semibold tabular-nums">{t.score}/100</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Un classement parallèle aux résultats sportifs.</p>
      </div>
    </Screen>
  )
}

/* ------------------------------------------------------------------ */
/* Page publique                                                        */
/* ------------------------------------------------------------------ */

const PUBLIC_TABS = ['Équipes', 'Calendrier', 'Classement', 'Live']

export function PublicPageDemo() {
  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-[0_24px_60px_-32px_rgba(26,26,24,0.22)]">
      <div className="flex items-center gap-2 border-b border-border bg-secondary/40 px-4 py-3">
        <WindowDots />
        <span className="ml-2 flex-1 truncate rounded-md border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
          realsporting.cupgenerator.be/tournoi-de-noel
        </span>
      </div>
      <div className="p-6">
        <span className="text-xs font-medium text-primary">Tournoi de Noël · Real Sporting</span>
        <h3 style={display} className="mt-1 text-xl font-semibold tracking-tight">
          16 équipes · Futsal · 21 décembre
        </h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {PUBLIC_TABS.map((t, i) => (
            <span
              key={t}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium',
                i === 2 ? 'bg-primary text-primary-foreground' : 'border border-border bg-background text-muted-foreground',
              )}
            >
              {t}
            </span>
          ))}
        </div>
        <div className="mt-5 space-y-1 rounded-xl border border-border bg-background p-3">
          {LIVE_STANDINGS.slice(0, 3).map((s) => (
            <div key={s.rank} className="flex items-center justify-between px-1 py-1 text-sm">
              <span className="flex items-center gap-3">
                <span className="w-4 text-center font-semibold tabular-nums text-muted-foreground">{s.rank}</span>
                <span className="font-medium">{s.name}</span>
              </span>
              <span className="font-semibold tabular-nums">{s.pts} pts</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Sponsors & couleurs                                                  */
/* ------------------------------------------------------------------ */

const SWATCHES = ['#35527D', '#1A1A18', '#C2410C', '#0E7490', '#FAF9F5']

/** Distinct placeholder sponsor logos (geometric mark + wordmark). */
function SponsorLogo({ index, name }: { index: number; name: string }) {
  const marks = [
    // monogram disc
    <svg key="0" viewBox="0 0 24 24" className="size-6 shrink-0" aria-hidden>
      <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.12" />
      <circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>,
    // bold chevrons
    <svg key="1" viewBox="0 0 24 24" className="size-6 shrink-0" aria-hidden>
      <path d="M4 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.45" />
    </svg>,
    // leaf / wheat
    <svg key="2" viewBox="0 0 24 24" className="size-6 shrink-0" aria-hidden>
      <path d="M12 21V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 12c0-3 2-5 5-5 0 3-2 5-5 5zM12 12c0-3-2-5-5-5 0 3 2 5 5 5z" fill="currentColor" opacity="0.7" />
    </svg>,
    // swoosh
    <svg key="3" viewBox="0 0 24 24" className="size-6 shrink-0" aria-hidden>
      <path d="M3 16c5 2 13 1 18-9-3 9-9 13-15 12l-3-3z" fill="currentColor" opacity="0.75" />
    </svg>,
  ]
  const serif = index === 0 || index === 2
  return (
    <span className="flex items-center gap-2 text-foreground/75">
      {marks[index % marks.length]}
      <span
        style={serif ? display : undefined}
        className={cn(
          'truncate text-sm',
          serif ? 'font-medium italic' : 'font-semibold uppercase tracking-wide',
        )}
      >
        {name}
      </span>
    </span>
  )
}

const SPONSORS = ['Brasserie du Coin', 'Garage Martin', 'Boulangerie Léa', 'Sport 2000']

export function SponsorsDemo() {
  return (
    <Screen title="Identité du tournoi">
      <div className="p-5">
        {/* Branded banner using the tournament's own color */}
        <div className="overflow-hidden rounded-2xl border border-border">
          <div
            className="flex items-center gap-3 px-5 py-4"
            style={{ background: 'linear-gradient(135deg, #35527D, #2B4368)' }}
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-white/15 text-sm font-bold text-white">
              RS
            </span>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-white">Tournoi de Noël</div>
              <div className="truncate text-xs text-white/70">Real Sporting Club</div>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <div className="text-xs font-medium text-muted-foreground">Couleur du club</div>
          <div className="mt-2 flex gap-2">
            {SWATCHES.map((c, i) => (
              <span
                key={c}
                className={cn(
                  'size-7 rounded-full border',
                  i === 0 ? 'border-primary ring-2 ring-primary/30' : 'border-border',
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="mt-5">
          <div className="text-xs font-medium text-muted-foreground">Sponsors</div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {SPONSORS.map((s, i) => (
              <div
                key={s}
                className="flex items-center rounded-lg border border-border bg-background px-3 py-2.5"
              >
                <SponsorLogo index={i} name={s} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Screen>
  )
}
