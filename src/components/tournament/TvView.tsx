'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useT } from '@/i18n/use-t'
import type { Translate } from '@/i18n'
import { localizeBracketLabel, localizeFeederName } from '@/lib/tournament/bracket-label'
import { getSportProfile, scoreLabelKeys } from '@/lib/sport'
import type { PublicMatch, PublicTournament } from '@/lib/tournament/public-view'
import { useTournamentLive } from './useTournamentLive'
import { BracketView } from './BracketView'
import { toBracketView } from './Bracket'

const ROTATE_MS = 12000

/** Centered panel header: uppercase title + optional meta chips (round, time…). */
function PanelHeader({ title, meta }: { title: string; meta?: string[] }) {
  return (
    <div className="mb-6 text-center">
      <h2 className="text-3xl font-bold uppercase tracking-[0.2em] text-primary">{title}</h2>
      {meta && meta.length > 0 && (
        <div className="mt-3 flex items-center justify-center gap-3">
          {meta.map((m) => (
            <span
              key={m}
              className="rounded-md border border-primary/40 bg-primary/15 px-5 py-1.5 text-2xl font-bold text-primary"
            >
              {m}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

/** The next set of simultaneous matches to play, across all phases. */
function currentSlot(
  data: PublicTournament,
  t: Translate,
): { label: string; time: string | null; matches: PublicMatch[] } | null {
  const all = [...data.groupMatches, ...data.knockoutMatches, ...data.classificationMatches]
  const pending = all.filter((m) => m.status !== 'finished' && m.homeName && m.awayName)
  if (pending.length === 0) return null
  pending.sort(
    (a, b) => (a.scheduledTime ?? '').localeCompare(b.scheduledTime ?? '') || (a.round ?? 0) - (b.round ?? 0),
  )
  const first = pending[0]
  const key = `${first.phase}:${first.round}`
  const matches = pending.filter((m) => `${m.phase}:${m.round}` === key)
  const label = first.groupLabel
    ? `${t('product.round')} ${first.round}`
    : (localizeBracketLabel(first.bracketLabel, t) || t('product.tv.upcomingMatches'))
  return { label, time: first.scheduledTime ?? null, matches }
}

function ScoreboardTeam({
  name,
  logo,
  side,
  nameSize,
  logoSize,
  winner,
}: {
  name: string | null
  logo: string | null
  side: 'home' | 'away'
  nameSize: string
  logoSize: string
  winner: boolean
}) {
  return (
    <div
      className={cn(
        'flex min-w-0 items-center gap-4',
        side === 'home' ? 'flex-row-reverse text-right' : '',
        winner ? 'text-foreground' : 'text-foreground',
      )}
    >
      <span className={cn('relative shrink-0', logoSize)}>
        <Image
          src={logo ?? '/assets/images/svg/teams/default.svg'}
          alt={name ?? ''}
          fill
          sizes="80px"
          unoptimized
          className="object-contain"
        />
      </span>
      <span className={cn('min-w-0 truncate leading-tight', nameSize, winner ? 'font-extrabold' : 'font-bold')}>
        {name ?? '-'}
      </span>
    </div>
  )
}

function CurrentMatchesPanel({ data }: { data: PublicTournament }) {
  const t = useT()
  const slot = currentSlot(data, t)
  if (!slot) return null
  const n = slot.matches.length
  const big = n <= 2
  const nameSize = big ? 'text-5xl' : 'text-4xl'
  const logoSize = big ? 'h-16 w-16' : 'h-12 w-12'
  const midSize = big ? 'text-5xl' : 'text-4xl'

  return (
    <div className="flex h-full flex-col">
      <PanelHeader title={t('product.tv.upcomingMatches')} meta={[slot.label, ...(slot.time ? [slot.time] : [])]} />
      <div className="flex flex-1 flex-col justify-center gap-4">
        {slot.matches.map((m) => {
          const decided = m.status === 'finished' && m.scoreHome != null && m.scoreAway != null
          const homeWin = decided && (m.scoreHome! > m.scoreAway! || m.penaltyWinner === 'home')
          const awayWin = decided && (m.scoreAway! > m.scoreHome! || m.penaltyWinner === 'away')
          return (
            <div
              key={String(m.id)}
              className="grid grid-cols-[7rem_1fr_auto_1fr] items-center gap-6 rounded-lg border border-border bg-card px-8 py-6"
            >
              {/* Code + court + time block */}
              <div className="border-r border-border pr-6">
                {m.code && <p className="text-sm font-bold uppercase text-muted-foreground">{m.code}</p>}
                <p className="text-2xl font-extrabold text-primary">
                  {m.court != null ? `T${m.court}` : ''}
                </p>
                <p className="text-base text-muted-foreground">{m.scheduledTime ?? slot.time}</p>
              </div>
              <ScoreboardTeam name={localizeFeederName(m.homeName, t)} logo={m.homeLogoUrl} side="home" nameSize={nameSize} logoSize={logoSize} winner={homeWin} />
              {/* Center: score (played) or VS */}
              {decided ? (
                <span className={cn('flex shrink-0 items-center gap-3 font-extrabold tabular-nums', midSize)}>
                  <span className={homeWin ? 'text-primary' : 'text-foreground'}>{m.scoreHome}</span>
                  <span className="text-muted-foreground">–</span>
                  <span className={awayWin ? 'text-primary' : 'text-foreground'}>{m.scoreAway}</span>
                </span>
              ) : (
                <span className="shrink-0 rounded-md border border-border px-4 py-1 text-xl font-bold text-muted-foreground">
                  {t('product.tv.vs')}
                </span>
              )}
              <ScoreboardTeam name={localizeFeederName(m.awayName, t)} logo={m.awayLogoUrl} side="away" nameSize={nameSize} logoSize={logoSize} winner={awayWin} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

type StatCol = { key: string; value: (s: PublicTournament['groups'][number]['standings'][number]) => string | number }

// Columns depend on the sport: no draws column when the sport can't draw, and
// goals vs points labels for the for/against/diff columns.
function statsFor(sportId: PublicTournament['sport']): StatCol[] {
  const profile = getSportProfile(sportId)
  const keys = scoreLabelKeys(profile.scoreLabel)
  return [
    { key: 'played', value: (s) => s.played },
    { key: 'wins', value: (s) => s.wins },
    ...(profile.drawsAllowed ? ([{ key: 'draws', value: (s) => s.draws }] as StatCol[]) : []),
    { key: 'losses', value: (s) => s.losses },
    { key: keys.for, value: (s) => s.goalsFor },
    { key: keys.against, value: (s) => s.goalsAgainst },
    { key: keys.diff, value: (s) => (s.goalDifference > 0 ? `+${s.goalDifference}` : s.goalDifference) },
  ]
}
function StandingsGrid({ data, columns }: { data: PublicTournament; columns: string }) {
  const t = useT()
  const stats = statsFor(data.sport)
  const statCols = 'w-9 text-center tabular-nums'
  return (
    <div className={`grid ${columns} items-start gap-4`}>
      {data.groups.map((g) => (
        <div key={g.label} className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-2 text-2xl font-bold">
            {t('product.poolLabel')} {g.label}
          </h3>
          <Table>
            <TableHeader>
              <TableRow className="border-0 text-sm font-semibold text-muted-foreground hover:bg-transparent">
                <TableHead className="h-auto w-6 p-0" />
                <TableHead className="h-auto p-0" />
                {stats.map((c) => (
                  <TableHead
                    key={c.key}
                    className={cn('h-auto p-0', statCols)}
                    title={t(`product.standings.${c.key}.title`)}
                  >
                    {t(`product.standings.${c.key}.short`)}
                  </TableHead>
                ))}
                <TableHead className={cn('h-auto p-0 text-foreground', statCols)}>
                  {t('product.standings.points.short')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {g.standings.map((s) => {
                const qualified = s.rank <= data.format.qualifiersPerGroup
                return (
                  <TableRow key={String(s.teamId)} className="border-0 text-lg hover:bg-transparent">
                    <TableCell className="p-0 py-0.5 pr-3">
                      <span
                        className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-sm text-sm font-semibold ${
                          qualified ? 'bg-emerald-400/20 text-emerald-700 dark:text-emerald-300' : 'text-muted-foreground'
                        }`}
                      >
                        {s.rank}
                      </span>
                    </TableCell>
                    <TableCell className="p-0 py-0.5">
                      <span className="flex min-w-0 items-center gap-2">
                        {s.logoUrl && (
                          <span className="relative h-6 w-6 shrink-0">
                            <Image src={s.logoUrl} alt="" fill sizes="24px" unoptimized className="object-contain" />
                          </span>
                        )}
                        <span className="truncate">{s.teamName}</span>
                      </span>
                    </TableCell>
                    {stats.map((c) => (
                      <TableCell key={c.key} className={cn('p-0 py-0.5 text-muted-foreground', statCols)}>
                        {c.value(s)}
                      </TableCell>
                    ))}
                    <TableCell className={cn('p-0 py-0.5 font-bold', statCols)}>{s.points}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  )
}

function StandingsPanel({ data }: { data: PublicTournament }) {
  const t = useT()
  return (
    <div className="flex h-full flex-col">
      <PanelHeader title={t('product.tv.standings')} />
      {/* Centre the tables vertically so short standings don't cling to the top. */}
      <div className="flex min-h-0 flex-1 flex-col justify-center overflow-hidden">
        {/* 4 pools laid out on 2 rows while there is no bracket yet. */}
        <StandingsGrid data={data} columns="grid-cols-2" />
      </div>
    </div>
  )
}

/** Knockout bracket, full screen. */
function BracketPanel({ data }: { data: PublicTournament }) {
  const t = useT()
  // Pick a size that fits vertically: the tallest round drives the height, so a
  // 16-team bracket (round of 16 = 8 matches) must shrink, a final stays large.
  const byRound = new Map<number, number>()
  for (const m of data.knockoutMatches) {
    const label = (m.bracketLabel ?? '').toLowerCase()
    // Exclude petite + consolation/placement matches from the column sizing.
    if (label.includes('petite') || /places?\s*\d+\s*[-–]\s*\d+/i.test(label) || label.includes('barrage')) continue
    byRound.set(m.round ?? 1, (byRound.get(m.round ?? 1) ?? 0) + 1)
  }
  const maxCol = Math.max(1, ...byRound.values())
  const size = maxCol >= 8 ? 'sm' : maxCol >= 4 ? 'md' : 'lg'

  return (
    <div className="flex h-full flex-col">
      <PanelHeader title={t('product.finalsPhase')} />
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto">
        <BracketView matches={data.knockoutMatches.map(toBracketView)} size={size} />
      </div>
    </div>
  )
}

/** Subtracts `min` minutes from a HH:MM string (for showing the pre-delay time). */
function subtractMinutes(hhmm: string, min: number): string {
  const [h, m] = hhmm.split(':').map(Number)
  const total = ((h * 60 + m - min) % 1440 + 1440) % 1440
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

function ScheduleTeam({ name, logo, align }: { name: string | null; logo: string | null; align: 'right' | 'left' }) {
  const tbdLabel = useT()('product.match.tbd')
  const known = Boolean(name)
  return (
    <span className={cn('flex min-w-0 flex-1 items-center gap-1.5', align === 'right' ? 'flex-row-reverse text-right' : '')}>
      <span className={cn('relative h-6 w-6 shrink-0', !known && 'opacity-30')}>
        <Image
          src={logo ?? '/assets/images/svg/teams/default.svg'}
          alt={name ?? ''}
          fill
          sizes="24px"
          unoptimized
          className="object-contain"
        />
      </span>
      <span className={cn('min-w-0 truncate', known ? 'font-medium' : 'italic text-muted-foreground')}>
        {name ?? tbdLabel}
      </span>
    </span>
  )
}

/** Round/phase label of a match: "Round N" for pools, the bracket label for finals. */
function matchRoundLabel(m: PublicMatch, t: Translate): string {
  if (m.phase === 'group') return `${t('product.round')} ${m.round}`
  return (localizeBracketLabel(m.bracketLabel, t) || t('product.finalsPhase')).replace(/\s*\(.*\)$/, '')
}

function ProgrammeMatch({ m, showLabel }: { m: PublicMatch; showLabel: boolean }) {
  const t = useT()
  const decided = m.status === 'finished' && m.scoreHome != null && m.scoreAway != null
  return (
    <div className="flex min-w-0 items-center gap-1.5 text-base">
      {m.code && (
        <span className="w-10 shrink-0 text-xs font-bold uppercase text-muted-foreground">{m.code}</span>
      )}
      {showLabel && m.phase !== 'group' && (
        <span className="shrink-0 rounded-sm bg-primary/15 px-1.5 py-0.5 text-[11px] font-semibold text-primary">
          {matchRoundLabel(m, t)}
        </span>
      )}
      <ScheduleTeam name={localizeFeederName(m.homeName, t)} logo={m.homeLogoUrl} align="right" />
      {decided ? (
        <span className="shrink-0 rounded-sm bg-muted px-2 py-0.5 text-sm font-bold tabular-nums">
          {m.scoreHome}-{m.scoreAway}
        </span>
      ) : (
        <span className="shrink-0 text-sm text-muted-foreground">{t('product.versus')}</span>
      )}
      <ScheduleTeam name={localizeFeederName(m.awayName, t)} logo={m.awayLogoUrl} align="left" />
      {m.court != null && (
        <span className="w-7 shrink-0 text-right text-xs font-semibold text-muted-foreground">T{m.court}</span>
      )}
    </div>
  )
}

/** Day programme: the full running order, one card per kickoff time. */
function SchedulePanel({ data }: { data: PublicTournament }) {
  const t = useT()
  const offset = data.scheduleOffsetMin
  const byTime = new Map<string, PublicMatch[]>()
  for (const m of data.programme) {
    const key = m.scheduledTime ?? '-'
    byTime.set(key, [...(byTime.get(key) ?? []), m])
  }
  const slots = byTime.size
  const cols = slots <= 4 ? 'grid-cols-2' : slots <= 9 ? 'grid-cols-3' : 'grid-cols-4'

  return (
    <div className="flex h-full flex-col">
      <PanelHeader title={t('product.tv.programme')} />
      {offset > 0 && (
        <p className="mb-3 text-center">
          <span className="rounded-md bg-red-500/20 px-4 py-1 text-lg font-bold text-red-700 dark:text-red-300">
            {t('product.tv.delay')} +{offset} min
          </span>
        </p>
      )}
      <div className={cn('grid min-h-0 flex-1 content-start gap-4 overflow-hidden', cols)}>
        {[...byTime.entries()].map(([time, ms]) => {
          const labels = new Set(ms.map((m) => matchRoundLabel(m, t)))
          const single = labels.size === 1 ? [...labels][0] : null
          const sorted = [...ms].sort((a, b) => (a.court ?? 99) - (b.court ?? 99))
          return (
            <div key={time} className="rounded-lg border border-border bg-card p-4">
              <div className="mb-2 flex items-baseline justify-between border-b border-border pb-2">
                <span className="flex items-baseline gap-2">
                  {offset > 0 && time !== '-' && (
                    <span className="text-sm font-normal text-muted-foreground line-through">{subtractMinutes(time, offset)}</span>
                  )}
                  <span className="text-2xl font-bold text-primary">{time}</span>
                </span>
                {single && (
                  <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{single}</span>
                )}
              </div>
              <div className="space-y-1.5">
                {sorted.map((m) => (
                  <ProgrammeMatch key={String(m.id)} m={m} showLabel={!single} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export type TvPanelKey = 'prochains' | 'programme' | 'classements' | 'arbre'

export function TvView({
  slug,
  initial,
  views,
  org,
}: {
  slug: string
  initial: PublicTournament
  /** Panels this screen shows (rotates if several). Empty/undefined = smart auto. */
  views?: TvPanelKey[]
  org?: { name: string; logoUrl: string | null }
}) {
  const t = useT()
  const data = useTournamentLive(slug, initial, 15000)
  const viewsKey = views?.join(',') ?? ''

  const panels = useMemo(() => {
    // A configured screen shows exactly the chosen panels, in order (rotation if several).
    if (views && views.length > 0) {
      const make: Record<TvPanelKey, () => React.ReactNode> = {
        prochains: () => <CurrentMatchesPanel data={data} />,
        programme: () => <SchedulePanel data={data} />,
        classements: () => <StandingsPanel data={data} />,
        arbre: () => <BracketPanel data={data} />,
      }
      return views.map((v) => make[v])
    }

    const list: Array<() => React.ReactNode> = []
    const hasPending = currentSlot(data, t) != null
    const hasBracket = data.knockoutMatches.length > 0

    // "Prochains matchs" stays in the rotation as long as anything is unplayed
    // (group rounds early on, then knockout rounds).
    if (hasPending) list.push(() => <CurrentMatchesPanel data={data} />)
    // Full day programme whenever the schedule has been generated.
    if (data.programme.length > 0) list.push(() => <SchedulePanel data={data} />)
    // Pools and bracket each get their own full-screen panel in the rotation.
    if (data.groups.length > 0) list.push(() => <StandingsPanel data={data} />)
    if (hasBracket) list.push(() => <BracketPanel data={data} />)
    if (list.length === 0) list.push(() => <StandingsPanel data={data} />)
    return list
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, viewsKey])

  const [index, setIndex] = useState(0)
  // Bumped on manual selection to restart the auto-rotation timer from that panel.
  const [cycleKey, setCycleKey] = useState(0)
  useEffect(() => {
    if (panels.length <= 1) return
    const timer = setInterval(() => setIndex((i) => (i + 1) % panels.length), ROTATE_MS)
    return () => clearInterval(timer)
  }, [panels.length, cycleKey])

  const safeIndex = index % Math.max(1, panels.length)

  const selectPanel = (i: number) => {
    setIndex(i)
    setCycleKey((k) => k + 1)
  }

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-background p-10 text-foreground">
      <header className="mb-3 flex items-center justify-center gap-4 text-center">
        {org?.logoUrl && (
          <span className="relative h-14 w-14 shrink-0">
            <Image src={org.logoUrl} alt={org.name} fill sizes="56px" unoptimized className="object-contain" />
          </span>
        )}
        <h1 className="text-5xl font-extrabold uppercase tracking-[0.15em]">{data.name}</h1>
      </header>
      <div className="min-h-0 flex-1 overflow-hidden">
        <div key={safeIndex} className="h-full animate-in fade-in duration-700">
          {panels[safeIndex]?.()}
        </div>
      </div>

      {panels.length > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {panels.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => selectPanel(i)}
              aria-label={`${t('product.tv.view')} ${i + 1}`}
              className="h-2 w-10 cursor-pointer overflow-hidden rounded-full bg-foreground/20 transition-transform hover:scale-110 hover:bg-foreground/30"
            >
              {i === safeIndex && (
                <span
                  key={`${safeIndex}-${cycleKey}`}
                  className="block h-full rounded-full bg-primary"
                  style={{ animation: `tvDotFill ${ROTATE_MS}ms linear forwards` }}
                />
              )}
            </button>
          ))}
        </div>
      )}

      {data.sponsors.length > 0 && (
        <footer className="mt-6 rounded-lg border border-border bg-card px-8 py-4 text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-primary">
            {t('product.tv.sponsorsPartners')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
            {data.sponsors.map((sp) =>
              sp.logoUrl ? (
                <div key={String(sp.id)} className="relative h-16 w-32">
                  <Image src={sp.logoUrl} alt={sp.name} fill sizes="128px" unoptimized className="object-contain" />
                </div>
              ) : (
                <span key={String(sp.id)} className="text-xl font-semibold text-muted-foreground">
                  {sp.name}
                </span>
              ),
            )}
          </div>
        </footer>
      )}
    </main>
  )
}
