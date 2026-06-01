import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { Id } from '@/lib/tournament/types'

export interface BracketMatchView {
  id: Id
  round: number
  bracketLabel: string | null
  homeName: string | null
  awayName: string | null
  homeLogoUrl?: string | null
  awayLogoUrl?: string | null
  scoreHome: number | null
  scoreAway: number | null
  penaltyWinner: 'home' | 'away' | null
  penaltyHome: number | null
  penaltyAway: number | null
  status: 'scheduled' | 'finished'
}

const SIZES = {
  sm: { card: 'p-2 text-sm', col: 'min-w-[150px]', head: 'text-[11px]', gap: 'gap-2' },
  md: { card: 'p-3 text-base', col: 'min-w-[190px]', head: 'text-xs', gap: 'gap-3' },
  lg: { card: 'p-4 text-2xl', col: 'min-w-[230px]', head: 'text-sm', gap: 'gap-3' },
}

function TeamRow({
  name,
  logo,
  score,
  penalty,
  winner,
  loser,
  tab,
}: {
  name: string | null
  logo?: string | null
  score: number | null
  penalty: number | null
  winner: boolean
  loser: boolean
  tab: boolean
}) {
  return (
    <div className={cn('flex items-center justify-between gap-2', winner && 'font-bold', loser && 'text-muted-foreground')}>
      <span className={cn('flex min-w-0 items-center gap-1.5', !name && 'italic text-muted-foreground')}>
        {logo && name && (
          <span className="relative h-4 w-4 shrink-0">
            <Image src={logo} alt="" fill sizes="16px" unoptimized className="object-contain" />
          </span>
        )}
        <span className={cn('truncate', loser && 'line-through')}>{name ?? 'À déterminer'}</span>
        {tab && (
          <span className="shrink-0 rounded bg-emerald-400/20 px-1 text-[10px] font-semibold uppercase text-emerald-300">
            tab
          </span>
        )}
      </span>
      <span className="shrink-0 tabular-nums">
        {score ?? '–'}
        {penalty != null && <span className="ml-1 text-muted-foreground">({penalty})</span>}
      </span>
    </div>
  )
}

export function BracketView({
  matches,
  size = 'md',
  className,
}: {
  matches: BracketMatchView[]
  size?: keyof typeof SIZES
  className?: string
}) {
  const s = SIZES[size]

  const isPetite = (m: BracketMatchView) => (m.bracketLabel ?? '').toLowerCase().includes('petite')
  // Consolation / placement matches ("Places 5-6", "Barrage classement") are not
  // part of the main elimination tree - keep them out of the bracket columns.
  const isAside = (m: BracketMatchView) =>
    /places?\s*\d+\s*[-–]\s*\d+/i.test(m.bracketLabel ?? '') || /barrage/i.test(m.bracketLabel ?? '')
  const main = matches.filter((m) => !isAside(m))
  const petite = main.filter(isPetite)
  if (main.length === 0) return null

  const rounds = new Map<number, BracketMatchView[]>()
  for (const m of main) {
    if (isPetite(m)) continue
    const r = m.round ?? 1
    rounds.set(r, [...(rounds.get(r) ?? []), m])
  }
  const columns = [...rounds.entries()]
    .sort(([a], [b]) => a - b)
    .map(([round, list]) => ({ key: `r${round}`, label: list[0]?.bracketLabel ?? `Tour ${round}`, matches: list }))

  const matchBox = (m: BracketMatchView) => {
    const decided = m.status === 'finished' && m.scoreHome != null && m.scoreAway != null
    const homeWin = decided && (m.scoreHome! > m.scoreAway! || m.penaltyWinner === 'home')
    const awayWin = decided && (m.scoreAway! > m.scoreHome! || m.penaltyWinner === 'away')
    return (
      <div key={String(m.id)} className={cn('rounded-lg border border-border bg-card', s.card)}>
        <TeamRow
          name={m.homeName}
          logo={m.homeLogoUrl}
          score={m.scoreHome}
          penalty={m.penaltyWinner != null ? m.penaltyHome : null}
          winner={homeWin}
          loser={awayWin}
          tab={m.penaltyWinner === 'home'}
        />
        <TeamRow
          name={m.awayName}
          logo={m.awayLogoUrl}
          score={m.scoreAway}
          penalty={m.penaltyWinner != null ? m.penaltyAway : null}
          winner={awayWin}
          loser={homeWin}
          tab={m.penaltyWinner === 'away'}
        />
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="flex items-stretch gap-4 overflow-x-auto">
        {columns.map((col) => (
          <div key={col.key} className={cn('flex flex-col', s.col)}>
            <h4 className={cn('mb-2 text-center font-bold uppercase tracking-wide text-muted-foreground', s.head)}>
              {col.label}
            </h4>
            <div className={cn('flex flex-1 flex-col justify-around', s.gap)}>{col.matches.map(matchBox)}</div>
          </div>
        ))}
      </div>

      {/* Petite finale shown below the bracket so it never widens the columns. */}
      {petite.length > 0 && (
        <div className="border-t border-border pt-3">
          <h4 className={cn('mb-2 font-bold uppercase tracking-wide text-orange-300/70', s.head)}>
            {petite[0]?.bracketLabel ?? 'Petite finale (3e place)'}
          </h4>
          <div className={cn('flex flex-wrap', s.gap)}>
            {petite.map((m) => (
              <div key={String(m.id)} className={cn(s.col)}>
                {matchBox(m)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
