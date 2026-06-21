import type { CSSProperties } from 'react'
import type { Metadata } from 'next'
import {
  Star,
  ChevronLeft,
  MapPin,
  CalendarDays,
  Users,
  Trophy,
  Inbox,
  Clock,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { DesignNav } from '../design-nav'
import {
  BASE_COLORS,
  RADIUS_PRESETS,
  ACCENT_PRESETS,
  accentForeground,
  type BaseColorKey,
  type RadiusKey,
  type Palette,
} from '@/lib/tournament/theme'

// Isolated design demo / component gallery: compares the current default theme
// ("Avant") with the UI/UX Pro Max recommended design system ("Après") across
// many screens & primitives. Palettes/fonts are scoped to each panel via inline
// CSS custom properties; the "Après" mocks are structural redesigns, not recolors.
// Nothing here touches globals.css or per-tenant theming. Kept out of indexes.
export const metadata: Metadata = {
  title: 'Design preview',
  robots: { index: false, follow: false },
}

// --- Palettes ---------------------------------------------------------------

const BEFORE: CSSProperties = {
  '--background': 'oklch(0.985 0 0)',
  '--foreground': 'oklch(0.145 0 0)',
  '--card': 'oklch(1 0 0)',
  '--card-foreground': 'oklch(0.145 0 0)',
  '--primary': 'oklch(0.205 0 0)',
  '--primary-foreground': 'oklch(0.985 0 0)',
  '--secondary': 'oklch(0.97 0 0)',
  '--secondary-foreground': 'oklch(0.205 0 0)',
  '--muted': 'oklch(0.97 0 0)',
  '--muted-foreground': 'oklch(0.556 0 0)',
  '--accent': 'oklch(0.97 0 0)',
  '--accent-foreground': 'oklch(0.205 0 0)',
  '--border': 'oklch(0.922 0 0)',
  '--ring': 'oklch(0.708 0 0)',
  '--radius': '0.625rem',
} as CSSProperties

const AFTER: CSSProperties = {
  '--background': '#F1F5F9',
  '--foreground': '#020617',
  '--card': '#FFFFFF',
  '--card-foreground': '#0F172A',
  '--primary': '#0369A1',
  '--primary-foreground': '#FFFFFF',
  '--secondary': '#E8ECF1',
  '--secondary-foreground': '#0F172A',
  '--muted': '#EEF2F7',
  '--muted-foreground': '#64748B',
  '--accent': '#E0F2FE',
  '--accent-foreground': '#0369A1',
  '--border': '#E2E8F0',
  '--ring': '#0369A1',
  '--destructive': '#DC2626',
  '--radius': '1rem',
  '--ink': '#0B1220',
  '--font-heading': "'Barlow Condensed', sans-serif",
  '--font-body': "'Barlow', sans-serif",
} as CSSProperties

const head: CSSProperties = { fontFamily: 'var(--font-heading, inherit)' }

// --- Mock data --------------------------------------------------------------

type Result = 'W' | 'D' | 'L'
const STANDINGS: { rank: number; name: string; played: number; gd: number; pts: number; q: boolean; form: Result[] }[] = [
  { rank: 1, name: 'Real Futsal', played: 3, gd: 7, pts: 9, q: true, form: ['W', 'W', 'W'] },
  { rank: 2, name: 'AS Tonnerre', played: 3, gd: 2, pts: 6, q: true, form: ['W', 'L', 'W'] },
  { rank: 3, name: 'Les Lynx', played: 3, gd: -1, pts: 3, q: false, form: ['L', 'W', 'L'] },
  { rank: 4, name: 'FC Comète', played: 3, gd: -8, pts: 0, q: false, form: ['L', 'L', 'L'] },
]
const MATCHES = [
  { a: 'Real Futsal', b: 'Les Lynx', sa: 4, sb: 2, live: true, time: "73'" },
  { a: 'AS Tonnerre', b: 'FC Comète', sa: 3, sb: 1, live: false, time: 'Terminé' },
]
const TABS = ['Poules', 'Arbre', 'Calendrier', 'Équipes'] as const
const PODIUM = [
  { rank: 2, name: 'AS Tonnerre', h: 'h-20' },
  { rank: 1, name: 'Real Futsal', h: 'h-28' },
  { rank: 3, name: 'Les Lynx', h: 'h-14' },
]
const MEDAL = ['', '🥇', '🥈', '🥉']

// --- Shared bits ------------------------------------------------------------

function FormDots({ form }: { form: Result[] }) {
  const color: Record<Result, string> = { W: 'bg-emerald-500', D: 'bg-slate-400', L: 'bg-rose-500' }
  return (
    <span className="flex gap-1">
      {form.map((r, i) => (
        <span key={i} className={cn('h-1.5 w-3 rounded-full', color[r])} title={r} />
      ))}
    </span>
  )
}
function Crest({ name }: { name: string }) {
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('')
  return (
    <span
      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent text-xs font-bold text-accent-foreground"
      style={head}
    >
      {initials}
    </span>
  )
}

// ============================================================================
// 1. TOURNAMENT VIEW
// ============================================================================
function TournamentBefore() {
  return (
    <div className="min-h-full bg-background text-foreground">
      <div className="border-b border-border bg-background/95 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
              CF
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold sm:text-2xl">Coupe de Futsal 2026</h1>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1 text-primary">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                  </span>
                  Direct
                </span>
                <Badge variant="secondary">En cours</Badge>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            className="h-auto shrink-0 rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary"
          >
            <Star className="h-4 w-4" />
            <span className="hidden sm:inline">Suivre mon équipe</span>
          </Button>
        </div>
        <nav className="mt-3 flex gap-1 overflow-x-auto">
          {TABS.map((t, i) => (
            <span
              key={t}
              className={cn(
                'h-auto cursor-pointer whitespace-nowrap rounded-md px-3 py-1.5 text-sm',
                i === 0 ? 'bg-primary font-semibold text-primary-foreground' : 'font-normal text-muted-foreground',
              )}
            >
              {t}
            </span>
          ))}
        </nav>
      </div>
      <div className="space-y-6 p-4">
        <section>
          <h2 className="mb-3 text-lg font-bold">Poule A</h2>
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="px-3 py-2 text-left font-medium">#</th>
                  <th className="px-3 py-2 text-left font-medium">Équipe</th>
                  <th className="px-3 py-2 text-center font-medium">J</th>
                  <th className="px-3 py-2 text-center font-medium">Pts</th>
                </tr>
              </thead>
              <tbody>
                {STANDINGS.map((row) => (
                  <tr key={row.rank} className="border-b border-border last:border-0">
                    <td className="px-3 py-2.5 text-muted-foreground">{row.rank}</td>
                    <td className="px-3 py-2.5">{row.name}</td>
                    <td className="px-3 py-2.5 text-center text-muted-foreground">{row.played}</td>
                    <td className="px-3 py-2.5 text-center font-semibold">{row.pts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-bold">Derniers matchs</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {MATCHES.map((m, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="min-w-0 flex-1 truncate">{m.a}</span>
                  <span className="shrink-0 font-bold tabular-nums">
                    {m.sa} – {m.sb}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-right">{m.b}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

function TournamentAfter() {
  return (
    <div className="min-h-full bg-background text-foreground" style={{ fontFamily: 'var(--font-body)' }}>
      <div className="bg-[var(--ink)] px-5 pb-6 pt-4 text-white">
        <div className="flex items-center justify-between text-xs text-white/60">
          <span className="inline-flex items-center gap-1 transition-colors hover:text-white">
            <ChevronLeft className="h-3.5 w-3.5" /> Tous les tournois
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-white/10 text-[10px] font-bold">CF</span>
            Cup Generator
          </span>
        </div>
        <div className="mt-4 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--primary)] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
              </span>
              En direct
            </span>
            <h1 className="mt-2 text-4xl font-bold uppercase leading-[0.95] tracking-tight sm:text-5xl" style={head}>
              Coupe de Futsal
              <br />
              <span className="text-white/55">Édition 2026</span>
            </h1>
          </div>
          <Button className="hidden h-auto shrink-0 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 sm:inline-flex">
            <Star className="h-4 w-4" /> Suivre mon équipe
          </Button>
        </div>
        <div className="mt-5 grid grid-cols-3 divide-x divide-white/10 rounded-2xl bg-white/[0.06] text-center">
          {[
            { icon: Users, big: '16', small: 'équipes' },
            { icon: CalendarDays, big: '4', small: 'poules' },
            { icon: MapPin, big: '21:00', small: 'finale' },
          ].map(({ icon: Icon, big, small }) => (
            <div key={small} className="px-2 py-3">
              <Icon className="mx-auto mb-1 h-4 w-4 text-white/40" />
              <div className="text-2xl font-bold leading-none tabular-nums" style={head}>
                {big}
              </div>
              <div className="mt-1 text-[11px] uppercase tracking-wide text-white/50">{small}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="px-5 pt-5">
        <nav className="flex gap-1 rounded-xl bg-muted p-1">
          {TABS.map((t, i) => (
            <span
              key={t}
              className={cn(
                'flex-1 cursor-pointer rounded-lg px-3 py-2 text-center text-sm transition',
                i === 0 ? 'bg-card font-bold text-primary shadow-sm' : 'font-medium text-muted-foreground hover:text-foreground',
              )}
              style={i === 0 ? head : undefined}
            >
              {t}
            </span>
          ))}
        </nav>
      </div>
      <div className="space-y-10 px-5 pb-8 pt-7">
        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-2xl font-bold uppercase tracking-tight" style={head}>
              Poule A
            </h2>
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">2 qualifiés</span>
          </div>
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            {STANDINGS.map((row) => (
              <div
                key={row.rank}
                className={cn(
                  'flex items-center gap-3 border-b border-border px-4 py-3 transition-colors last:border-0',
                  row.q ? 'bg-accent/50' : 'hover:bg-muted',
                )}
              >
                <span
                  className={cn(
                    'grid h-7 w-7 shrink-0 place-items-center rounded-lg text-sm font-bold tabular-nums',
                    row.q ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                  )}
                  style={head}
                >
                  {row.rank}
                </span>
                <Crest name={row.name} />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-card-foreground">{row.name}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <FormDots form={row.form} />
                    <span className="text-[11px] text-muted-foreground tabular-nums">
                      {row.played} J · {row.gd > 0 ? `+${row.gd}` : row.gd}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold leading-none tabular-nums text-card-foreground" style={head}>
                    {row.pts}
                  </div>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">pts</div>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h2 className="mb-3 text-2xl font-bold uppercase tracking-tight" style={head}>
            Derniers matchs
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {MATCHES.map((m, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="mb-3 flex items-center justify-between">
                  {m.live ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-primary">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" /> Live
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{m.time}</span>
                  )}
                  {m.live && <span className="text-[11px] font-bold tabular-nums text-primary">{m.time}</span>}
                </div>
                <div className="space-y-2">
                  {[
                    [m.a, m.sa, m.sa > m.sb] as const,
                    [m.b, m.sb, m.sb > m.sa] as const,
                  ].map(([team, score, win]) => (
                    <div key={team} className="flex items-center gap-2.5">
                      <Crest name={team} />
                      <span className={cn('min-w-0 flex-1 truncate', win ? 'font-bold text-card-foreground' : 'font-medium text-muted-foreground')}>
                        {team}
                      </span>
                      <span
                        className={cn(
                          'grid h-8 w-8 place-items-center rounded-lg text-lg font-bold tabular-nums',
                          win ? 'bg-primary text-primary-foreground' : 'bg-muted text-card-foreground',
                        )}
                        style={head}
                      >
                        {score}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

// ============================================================================
// 2. REGISTRATION FORM
// ============================================================================
function RegBefore() {
  return (
    <div className="min-h-full bg-background p-4 text-foreground">
      <h2 className="mb-3 text-lg font-bold">Inscription</h2>
      <div className="space-y-3">
        <div>
          <label className="text-sm">Nom de l&apos;équipe</label>
          <input
            defaultValue="Les Aigles"
            className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm">Email du capitaine</label>
          <input
            defaultValue="capitaine@email.com"
            className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
          />
        </div>
        <p className="text-sm text-muted-foreground">Frais d&apos;inscription : 40€</p>
        <Button className="w-full rounded-md bg-primary text-primary-foreground">S&apos;inscrire</Button>
      </div>
    </div>
  )
}
function RegAfter() {
  return (
    <div className="min-h-full bg-background p-5 text-foreground" style={{ fontFamily: 'var(--font-body)' }}>
      <h2 className="mb-4 text-2xl font-bold uppercase tracking-tight" style={head}>
        Inscription
      </h2>
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Nom de l&apos;équipe</label>
            <input
              defaultValue="Les Aigles"
              className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Email du capitaine</label>
            <input
              defaultValue="capitaine@email.com"
              className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">On t&apos;enverra le calendrier des matchs ici.</p>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-accent px-4 py-3">
            <span className="text-sm font-medium text-accent-foreground">Frais d&apos;inscription</span>
            <span className="text-xl font-bold tabular-nums text-accent-foreground" style={head}>
              40€
            </span>
          </div>
          <Button className="h-auto w-full rounded-xl bg-primary py-3 text-base font-bold uppercase tracking-wide text-primary-foreground shadow-lg transition hover:-translate-y-0.5">
            S&apos;inscrire
          </Button>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// 3. KNOCKOUT BRACKET
// ============================================================================
const SEMIS = [
  { a: 'Real Futsal', b: 'Les Lynx', sa: 3, sb: 1 },
  { a: 'AS Tonnerre', b: 'FC Comète', sa: 2, sb: 1 },
]
function BracketBefore() {
  return (
    <div className="min-h-full bg-background p-4 text-foreground">
      <h2 className="mb-3 text-lg font-bold">Arbre</h2>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="mb-2 text-xs text-muted-foreground">Demi-finales</p>
          <div className="space-y-2">
            {SEMIS.map((m, i) => (
              <div key={i} className="rounded-md border border-border bg-card p-2">
                <div className="flex justify-between">
                  <span>{m.a}</span>
                  <span>{m.sa}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>{m.b}</span>
                  <span>{m.sb}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs text-muted-foreground">Finale</p>
          <div className="rounded-md border border-border bg-card p-2">
            <div className="flex justify-between">
              <span>Real Futsal</span>
              <span>–</span>
            </div>
            <div className="flex justify-between">
              <span>AS Tonnerre</span>
              <span>–</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
function BracketRow({ team, score, win }: { team: string; score?: number; win?: boolean }) {
  return (
    <div className={cn('flex items-center justify-between gap-2 px-3 py-2', win && 'bg-accent/60')}>
      <div className="flex min-w-0 items-center gap-2">
        <Crest name={team} />
        <span className={cn('truncate text-sm', win ? 'font-bold text-card-foreground' : 'font-medium text-muted-foreground')}>
          {team}
        </span>
      </div>
      <span
        className={cn(
          'grid h-6 w-6 place-items-center rounded-md text-sm font-bold tabular-nums',
          win ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
        )}
        style={head}
      >
        {score ?? '–'}
      </span>
    </div>
  )
}
function BracketAfter() {
  return (
    <div className="min-h-full bg-background p-5 text-foreground" style={{ fontFamily: 'var(--font-body)' }}>
      <h2 className="mb-4 text-2xl font-bold uppercase tracking-tight" style={head}>
        Arbre final
      </h2>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="space-y-4">
          {SEMIS.map((m, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <BracketRow team={m.a} score={m.sa} win={m.sa > m.sb} />
              <div className="border-t border-border" />
              <BracketRow team={m.b} score={m.sb} win={m.sb > m.sa} />
            </div>
          ))}
        </div>
        <div className="h-px w-5 bg-border" />
        <div className="rounded-xl border-2 border-primary/30 bg-card shadow-md">
          <div className="bg-primary px-3 py-1.5 text-center text-[11px] font-bold uppercase tracking-wide text-primary-foreground" style={head}>
            <Trophy className="mr-1 inline h-3.5 w-3.5" /> Finale
          </div>
          <BracketRow team="Real Futsal" win />
          <div className="border-t border-border" />
          <BracketRow team="AS Tonnerre" />
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// 4. PODIUM / RESULTS
// ============================================================================
function PodiumBefore() {
  return (
    <div className="min-h-full bg-background p-4 text-foreground">
      <h2 className="mb-3 text-lg font-bold">Classement final</h2>
      <ol className="space-y-2 text-sm">
        {[PODIUM[1], PODIUM[0], PODIUM[2]].map((p) => (
          <li key={p.rank} className="flex items-center gap-2 rounded-md border border-border bg-card p-2">
            <span className="font-bold">{p.rank}.</span>
            <span>{p.name}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
function PodiumAfter() {
  return (
    <div className="min-h-full bg-background p-5 text-foreground" style={{ fontFamily: 'var(--font-body)' }}>
      <h2 className="mb-5 text-2xl font-bold uppercase tracking-tight" style={head}>
        Classement final
      </h2>
      <div className="flex items-end justify-center gap-3">
        {PODIUM.map((p) => (
          <div key={p.rank} className="flex w-1/3 flex-col items-center">
            <span className="mb-1 text-2xl">{MEDAL[p.rank]}</span>
            <Crest name={p.name} />
            <span className="mt-1 truncate text-center text-xs font-semibold text-card-foreground">{p.name}</span>
            <div
              className={cn(
                'mt-2 flex w-full items-start justify-center rounded-t-xl pt-2 text-2xl font-bold',
                p.rank === 1 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground',
                p.h,
              )}
              style={head}
            >
              {p.rank}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// 5. TV SCOREBOARD (full-width showcase)
// ============================================================================
function TvScoreboard() {
  return (
    <div
      className="rounded-2xl bg-[var(--ink)] p-6 text-white sm:p-10"
      style={{ ...AFTER, fontFamily: 'var(--font-body)' } as CSSProperties}
    >
      <div className="mb-6 flex items-center justify-between text-xs uppercase tracking-widest text-white/50">
        <span>Coupe de Futsal 2026 · Finale</span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--primary)] px-2.5 py-1 font-bold text-white">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> En direct
        </span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 flex-col items-center gap-2">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-white/10 text-xl font-bold" style={head}>
            RF
          </span>
          <span className="text-center text-lg font-bold uppercase sm:text-2xl" style={head}>
            Real Futsal
          </span>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-6xl font-bold leading-none tabular-nums sm:text-8xl" style={head}>
            3<span className="px-2 text-white/30">:</span>2
          </div>
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-sm font-bold tabular-nums">
            <Clock className="h-4 w-4 text-white/50" /> 73:14
          </span>
        </div>
        <div className="flex flex-1 flex-col items-center gap-2">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-white/10 text-xl font-bold" style={head}>
            AT
          </span>
          <span className="text-center text-lg font-bold uppercase sm:text-2xl" style={head}>
            AS Tonnerre
          </span>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// 6. PRIMITIVES (buttons + badges)
// ============================================================================
function PrimitivesBefore() {
  return (
    <div className="min-h-full space-y-4 bg-background p-4 text-foreground">
      <div className="flex flex-wrap gap-2">
        <Button className="bg-primary text-primary-foreground">Principal</Button>
        <Button variant="secondary">Secondaire</Button>
        <Button variant="outline">Contour</Button>
        <Button variant="ghost">Ghost</Button>
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge>En cours</Badge>
        <Badge variant="secondary">Inscriptions</Badge>
        <Badge variant="outline">Terminé</Badge>
      </div>
    </div>
  )
}
function PrimitivesAfter() {
  return (
    <div className="min-h-full space-y-4 bg-background p-5 text-foreground" style={{ fontFamily: 'var(--font-body)' }}>
      <div className="flex flex-wrap gap-2">
        <Button className="rounded-xl bg-primary font-bold uppercase tracking-wide text-primary-foreground shadow-md transition hover:-translate-y-0.5">
          Principal
        </Button>
        <Button variant="secondary" className="rounded-xl font-semibold uppercase tracking-wide">
          Secondaire
        </Button>
        <Button variant="outline" className="rounded-xl border-primary/40 font-semibold uppercase tracking-wide text-primary">
          Contour
        </Button>
        <Button variant="ghost" className="rounded-xl font-semibold uppercase tracking-wide text-primary">
          Ghost
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-primary">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" /> En cours
        </span>
        <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-accent-foreground">
          Inscriptions
        </span>
        <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-secondary-foreground">
          Terminé
        </span>
      </div>
    </div>
  )
}

// ============================================================================
// 7. EMPTY STATE
// ============================================================================
function EmptyBefore() {
  return (
    <div className="grid min-h-[160px] place-items-center bg-background p-4 text-foreground">
      <p className="text-sm text-muted-foreground">Aucun match pour le moment.</p>
    </div>
  )
}
function EmptyAfter() {
  return (
    <div
      className="grid min-h-[160px] place-items-center bg-background p-6 text-center text-foreground"
      style={{ fontFamily: 'var(--font-body)' }}
    >
      <div>
        <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-accent text-accent-foreground">
          <Inbox className="h-6 w-6" />
        </span>
        <p className="font-bold uppercase tracking-tight text-card-foreground" style={head}>
          Pas encore de match
        </p>
        <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
          Le calendrier sera publié dès que le tirage des poules sera validé.
        </p>
        <Button className="mt-4 rounded-xl bg-primary font-bold uppercase tracking-wide text-primary-foreground transition hover:-translate-y-0.5">
          Voir les équipes
        </Button>
      </div>
    </div>
  )
}

// ============================================================================
// 8. MULTI-TENANT PROOF — the SAME redesign under 3 real tenant themes, built
// from the app's actual BASE_COLORS / accent / radius pipeline. The hero "ink"
// is DERIVED from each base color's dark surface (option A) — no hardcoded navy,
// so it re-themes per tenant. Everything else is token-pure.
// ============================================================================
function paletteToVars(p: Palette): Record<string, string> {
  return {
    '--background': p.background,
    '--foreground': p.foreground,
    '--card': p.card,
    '--card-foreground': p.cardForeground,
    '--popover': p.popover,
    '--popover-foreground': p.popoverForeground,
    '--primary': p.primary,
    '--primary-foreground': p.primaryForeground,
    '--secondary': p.secondary,
    '--secondary-foreground': p.secondaryForeground,
    '--muted': p.muted,
    '--muted-foreground': p.mutedForeground,
    '--accent': p.accent,
    '--accent-foreground': p.accentForeground,
    '--border': p.border,
    '--input': p.input,
    '--ring': p.ring,
  }
}

type Tenant = { name: string; base: BaseColorKey; accentKey: string; radius: RadiusKey; heading: string; body: string }
const TENANTS: Tenant[] = [
  { name: 'AS Lyon', base: 'slate', accentKey: 'blue', radius: 'large', heading: "'Oswald', sans-serif", body: "'Inter', sans-serif" },
  { name: 'Stone United', base: 'stone', accentKey: 'red', radius: 'default', heading: "'Playfair Display', serif", body: "'Work Sans', sans-serif" },
  { name: 'Zinc FC', base: 'zinc', accentKey: 'green', radius: 'medium', heading: "'Sora', sans-serif", body: "'DM Sans', sans-serif" },
]

function tenantVars(t: Tenant): CSSProperties {
  const base = BASE_COLORS[t.base]
  const accent = ACCENT_PRESETS.find((a) => a.key === t.accentKey)?.color ?? base.light.primary
  return {
    // nudge bg below white like buildThemeCss does, so cards separate
    ...paletteToVars({ ...base.light, background: 'oklch(0.985 0 0)' }),
    '--primary': accent,
    '--primary-foreground': accentForeground(accent),
    '--ring': accent,
    '--radius': `${RADIUS_PRESETS[t.radius].rem}rem`,
    '--ink': base.dark.background, // derived hero surface (option A)
    '--font-heading': t.heading,
    '--font-body': t.body,
  } as CSSProperties
}

// Condensed redesign, 100% token-pure (no literal colors): hero, stat blocks,
// segmented tabs, enriched standings, one live match card. Reads --ink, --primary,
// --primary-foreground, --accent and the org fonts — i.e. exactly what a tenant sets.
function MiniApp() {
  return (
    <div className="bg-background text-foreground" style={{ fontFamily: 'var(--font-body, inherit)' }}>
      <div className="bg-[var(--ink)] px-4 pb-4 pt-3 text-white">
        <div className="flex items-center justify-between text-[11px] text-white/55">
          <span className="truncate">Coupe de Futsal 2026</span>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-2 py-0.5 font-bold text-primary-foreground">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" /> Live
          </span>
        </div>
        <h1 className="mt-2 truncate text-2xl font-bold uppercase leading-none tracking-tight" style={head}>
          Real Futsal
        </h1>
        <div className="mt-3 grid grid-cols-3 divide-x divide-white/10 rounded-xl bg-white/[0.06] text-center">
          {[
            ['16', 'équipes'],
            ['4', 'poules'],
            ['21:00', 'finale'],
          ].map(([b, s]) => (
            <div key={s} className="px-1 py-2">
              <div className="text-lg font-bold leading-none tabular-nums" style={head}>
                {b}
              </div>
              <div className="mt-0.5 text-[10px] uppercase tracking-wide text-white/50">{s}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 pt-3">
        <nav className="flex gap-1 rounded-lg bg-muted p-1 text-xs">
          {['Poules', 'Arbre', 'Équipes'].map((t, i) => (
            <span
              key={t}
              className={cn(
                'flex-1 rounded-md px-2 py-1.5 text-center',
                i === 0 ? 'bg-card font-bold text-primary shadow-sm' : 'font-medium text-muted-foreground',
              )}
              style={i === 0 ? head : undefined}
            >
              {t}
            </span>
          ))}
        </nav>
      </div>

      <div className="space-y-3 px-4 py-3">
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {STANDINGS.slice(0, 3).map((row) => (
            <div
              key={row.rank}
              className={cn(
                'flex items-center gap-2 border-b border-border px-3 py-2 last:border-0',
                row.q && 'bg-accent/50',
              )}
            >
              <span
                className={cn(
                  'grid h-6 w-6 shrink-0 place-items-center rounded-md text-xs font-bold tabular-nums',
                  row.q ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                )}
                style={head}
              >
                {row.rank}
              </span>
              <Crest name={row.name} />
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-card-foreground">{row.name}</span>
              <span className="text-lg font-bold tabular-nums text-card-foreground" style={head}>
                {row.pts}
              </span>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" /> Live 73&apos;
          </span>
          {([
            ['Real Futsal', 4, true],
            ['Les Lynx', 2, false],
          ] as const).map(([team, score, win]) => (
            <div key={team} className="mt-1.5 flex items-center gap-2">
              <Crest name={team} />
              <span className={cn('min-w-0 flex-1 truncate text-sm', win ? 'font-bold text-card-foreground' : 'font-medium text-muted-foreground')}>
                {team}
              </span>
              <span
                className={cn(
                  'grid h-7 w-7 place-items-center rounded-md text-base font-bold tabular-nums',
                  win ? 'bg-primary text-primary-foreground' : 'bg-muted text-card-foreground',
                )}
                style={head}
              >
                {score}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// ALTERNATIVE DIRECTIONS — 3 distinct personalities proposed by ui-ux-pro-max,
// each with its OWN structure (not a recolor). Shown with their recommended
// palettes; whichever is chosen would then be wired token-pure to stay
// multi-tenant (see §9).
// ============================================================================

// A — Editorial: magazine, hairline rules, serif display, sparse, black + pink.
const EDITORIAL_VARS: CSSProperties = {
  '--background': '#FAFAFA',
  '--foreground': '#09090B',
  '--card': '#FFFFFF',
  '--card-foreground': '#09090B',
  '--primary': '#18181B',
  '--primary-foreground': '#FFFFFF',
  '--secondary': '#3F3F46',
  '--secondary-foreground': '#FFFFFF',
  '--muted': '#E8ECF0',
  '--muted-foreground': '#52525B',
  '--accent': '#EC4899',
  '--accent-foreground': '#FFFFFF',
  '--border': '#D4D4D8',
  '--ring': '#18181B',
  '--radius': '0.125rem',
  '--font-heading': "'Libre Bodoni', serif",
  '--font-body': "'Public Sans', sans-serif",
} as CSSProperties

// B — Broadcast: dark TV surface, dense, red live accent, big tabular score.
const BROADCAST_VARS: CSSProperties = {
  '--background': '#0B1220',
  '--foreground': '#F8FAFC',
  '--card': '#131C2B',
  '--card-foreground': '#F8FAFC',
  '--primary': '#DC2626',
  '--primary-foreground': '#FFFFFF',
  '--secondary': '#1E293B',
  '--secondary-foreground': '#F8FAFC',
  '--muted': '#1E293B',
  '--muted-foreground': '#94A3B8',
  '--accent': '#DC2626',
  '--accent-foreground': '#FFFFFF',
  '--border': 'rgba(255,255,255,0.10)',
  '--ring': '#DC2626',
  '--radius': '0.375rem',
  '--font-heading': "'Inter', sans-serif",
  '--font-body': "'Inter', sans-serif",
} as CSSProperties

// C — Clay: chunky rounded, thick borders, double shadows, indigo + orange.
const CLAY_VARS: CSSProperties = {
  '--background': '#EEF2FF',
  '--foreground': '#1E1B4B',
  '--card': '#FFFFFF',
  '--card-foreground': '#1E1B4B',
  '--primary': '#4F46E5',
  '--primary-foreground': '#FFFFFF',
  '--secondary': '#818CF8',
  '--secondary-foreground': '#1E1B4B',
  '--muted': '#E0E7FF',
  '--muted-foreground': '#6366F1',
  '--accent': '#EA580C',
  '--accent-foreground': '#FFFFFF',
  '--border': '#C7D2FE',
  '--ring': '#4F46E5',
  '--radius': '1.5rem',
  '--font-heading': "'Fredoka', sans-serif",
  '--font-body': "'Nunito', sans-serif",
} as CSSProperties

function EditorialMini() {
  return (
    <div className="min-h-full bg-background p-5 text-foreground" style={{ fontFamily: 'var(--font-body)' }}>
      <div className="flex items-center justify-between border-b-2 border-foreground pb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        <span>Coupe de Futsal</span>
        <span className="text-accent">● En direct</span>
      </div>
      <h1 className="mt-4 text-4xl leading-[0.92] sm:text-5xl" style={head}>
        Real Futsal <span className="italic text-muted-foreground">s&apos;impose</span>
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Poule A · 3ᵉ journée · qualification pour les phases finales.
      </p>
      <div className="mt-6 border-t border-border">
        {STANDINGS.slice(0, 3).map((row) => (
          <div key={row.rank} className="flex items-baseline gap-4 border-b border-border py-3">
            <span className="w-6 text-2xl tabular-nums text-muted-foreground" style={head}>
              {row.rank}
            </span>
            <span className="flex-1 text-base">
              {row.name}
              {row.q && <span className="ml-2 align-middle text-[10px] font-bold uppercase tracking-widest text-accent">Q</span>}
            </span>
            <span className="text-xl tabular-nums" style={head}>
              {row.pts}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-between border border-foreground p-4">
        <div className="text-sm">
          <div className="font-semibold">Real Futsal</div>
          <div className="text-muted-foreground">Les Lynx</div>
        </div>
        <div className="text-3xl tabular-nums" style={head}>
          4–2
        </div>
      </div>
    </div>
  )
}

function BroadcastMini() {
  return (
    <div className="min-h-full bg-background p-5 text-foreground" style={{ fontFamily: 'var(--font-body)' }}>
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        <span>Coupe de Futsal · Finale</span>
        <span className="inline-flex items-center gap-1.5 rounded bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground shadow-[0_0_12px_rgba(220,38,38,0.6)]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" /> LIVE
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col items-center gap-1.5">
          <span className="grid h-9 w-9 place-items-center rounded bg-secondary text-xs font-bold">RF</span>
          <span className="text-xs font-semibold">Real Futsal</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-4xl font-bold tabular-nums">
            3<span className="px-1.5 text-muted-foreground">:</span>2
          </span>
          <span className="mt-1 text-[11px] font-bold tabular-nums text-primary">73:14</span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <span className="grid h-9 w-9 place-items-center rounded bg-secondary text-xs font-bold">AT</span>
          <span className="text-xs font-semibold">AS Tonnerre</span>
        </div>
      </div>
      <div className="mt-4 overflow-hidden rounded-lg border border-border">
        {STANDINGS.slice(0, 3).map((row) => (
          <div key={row.rank} className="flex items-center gap-3 border-b border-border bg-card px-3 py-2 text-sm last:border-0">
            <span className={cn('w-5 text-center text-xs font-bold tabular-nums', row.q ? 'text-primary' : 'text-muted-foreground')}>
              {row.rank}
            </span>
            <span className="flex-1 truncate">{row.name}</span>
            <FormDots form={row.form} />
            <span className="w-6 text-right font-bold tabular-nums">{row.pts}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ClayMini() {
  const clay = 'rounded-3xl border-2 border-border bg-card shadow-[0_12px_30px_-10px_rgba(79,70,229,0.45)]'
  return (
    <div className="min-h-full bg-background p-5 text-foreground" style={{ fontFamily: 'var(--font-body)' }}>
      <div className={cn(clay, 'p-4')}>
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" /> En direct
          </span>
          <span className="text-xs font-bold text-muted-foreground">Poule A</span>
        </div>
        <h1 className="mt-3 text-3xl font-semibold" style={head}>
          Real Futsal
        </h1>
      </div>
      <div className="mt-4 space-y-2.5">
        {STANDINGS.slice(0, 3).map((row) => (
          <div key={row.rank} className={cn('flex items-center gap-3 p-3', clay, row.q && 'ring-4 ring-primary/25')}>
            <span
              className={cn(
                'grid h-9 w-9 place-items-center rounded-2xl text-sm font-bold',
                row.q ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
              )}
            >
              {row.rank}
            </span>
            <span className="flex-1 truncate font-semibold">{row.name}</span>
            <span className="text-2xl font-bold tabular-nums" style={head}>
              {row.pts}
            </span>
          </div>
        ))}
      </div>
      <button className="mt-4 w-full rounded-2xl bg-accent py-3 text-base font-bold text-accent-foreground shadow-[0_6px_0_0_rgba(154,52,18,0.45)] transition active:translate-y-1 active:shadow-[0_2px_0_0_rgba(154,52,18,0.45)]">
        Suivre mon équipe
      </button>
    </div>
  )
}

// --- Layout shell -----------------------------------------------------------

function Panel({ label, tag, vars, children }: { label: string; tag: string; vars: CSSProperties; children: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">{label}</span>
        <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-[11px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
          {tag}
        </span>
      </div>
      <div style={vars} className="overflow-hidden rounded-2xl border border-neutral-300 shadow-sm dark:border-neutral-700">
        {children}
      </div>
    </div>
  )
}

function Compare({ n, title, before, after }: { n: number; title: string; before: React.ReactNode; after: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
        <span className="grid h-6 w-6 place-items-center rounded-md bg-neutral-900 text-xs text-white dark:bg-white dark:text-neutral-900">
          {n}
        </span>
        {title}
      </h2>
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Panel label="Avant" tag="thème par défaut" vars={BEFORE}>
          {before}
        </Panel>
        <Panel label="Après" tag="UI/UX Pro Max" vars={AFTER}>
          {after}
        </Panel>
      </div>
    </section>
  )
}

export default function DesignPreviewPage() {
  return (
    <div className="min-h-screen bg-neutral-100 px-4 py-10 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;600;700&family=Barlow:wght@300;400;500;600;700&display=swap"
      />
      {/* Fonts used by the multi-tenant proof (§9) + alternative directions (§8) */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700&family=Work+Sans:wght@400;500;600;700&family=Sora:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&family=Libre+Bodoni:wght@400;500;600;700&family=Public+Sans:wght@300;400;500;600;700&family=Fredoka:wght@400;500;600;700&family=Nunito:wght@300;400;500;600;700&display=swap"
      />
      <DesignNav current="/design-preview" />

      <div className="mx-auto max-w-6xl space-y-12">
        <header>
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">ui-ux-pro-max · design preview</p>
          <h1 className="mt-1 text-2xl font-bold">Galerie Avant / Après</h1>
          <p className="mt-2 max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">
            Le design system appliqué à plusieurs écrans et composants. Le panneau <strong>Après</strong> est un
            redesign structurel (layout en blocs, hero, hiérarchie, espacements), pas une simple recoloration. Tout
            est scopé localement via variables CSS — <strong>aucun changement</strong> sur <code>globals.css</code>{' '}
            ni sur le thème par tenant.
          </p>
        </header>

        <Compare n={1} title="Vue tournoi (public)" before={<TournamentBefore />} after={<TournamentAfter />} />
        <Compare n={2} title="Inscription" before={<RegBefore />} after={<RegAfter />} />
        <Compare n={3} title="Arbre / phases finales" before={<BracketBefore />} after={<BracketAfter />} />
        <Compare n={4} title="Podium / résultats" before={<PodiumBefore />} after={<PodiumAfter />} />
        <Compare n={5} title="Primitives — boutons & badges" before={<PrimitivesBefore />} after={<PrimitivesAfter />} />
        <Compare n={6} title="État vide" before={<EmptyBefore />} after={<EmptyAfter />} />

        <section>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-neutral-900 text-xs text-white dark:bg-white dark:text-neutral-900">
              7
            </span>
            Écran TV — scoreboard live
            <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-[11px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
              UI/UX Pro Max
            </span>
          </h2>
          <TvScoreboard />
        </section>

        <section>
          <h2 className="mb-1 flex items-center gap-2 text-lg font-bold">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-neutral-900 text-xs text-white dark:bg-white dark:text-neutral-900">
              8
            </span>
            Autres directions — proposées par ui-ux-pro-max
          </h2>
          <p className="mb-4 max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">
            3 personnalités <strong>distinctes</strong> de la version navy/bloc actuelle (§1) — chacune avec sa propre
            <em> structure</em>, pas juste une recoloration. Direction à choisir ; la retenue serait ensuite câblée
            token-pur pour rester multi-tenant (cf. §9).
          </p>
          <div className="grid gap-6 lg:grid-cols-3">
            <Panel label="A · Éditorial" tag="serif · noir + rose" vars={EDITORIAL_VARS}>
              <EditorialMini />
            </Panel>
            <Panel label="B · Broadcast" tag="sombre · rouge live" vars={BROADCAST_VARS}>
              <BroadcastMini />
            </Panel>
            <Panel label="C · Clay" tag="ludique · indigo + orange" vars={CLAY_VARS}>
              <ClayMini />
            </Panel>
          </div>
        </section>

        <section>
          <h2 className="mb-1 flex items-center gap-2 text-lg font-bold">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-neutral-900 text-xs text-white dark:bg-white dark:text-neutral-900">
              9
            </span>
            Compatibilité multi-tenant
          </h2>
          <p className="mb-4 max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">
            Le <strong>même</strong> redesign rendu sous 3 thèmes tenant réels — via tes vraies palettes{' '}
            <code>BASE_COLORS</code> + accent + radius + fontes. Le hero hérite de la surface foncée de chaque
            palette de base (<em>option A</em>) : <strong>aucun navy codé en dur</strong>, tout se re-thème.
          </p>
          <div className="grid gap-6 sm:grid-cols-3">
            {TENANTS.map((t) => (
              <div key={t.name} className="flex flex-col">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">{t.name}</span>
                  <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-[11px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                    {t.base} · {t.accentKey}
                  </span>
                </div>
                <div
                  style={tenantVars(t)}
                  className="overflow-hidden rounded-2xl border border-neutral-300 shadow-sm dark:border-neutral-700"
                >
                  <MiniApp />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
