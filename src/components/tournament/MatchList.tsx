import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { PublicMatch } from '@/lib/tournament/public-view'

function TeamLine({
  name,
  logo,
  score,
  winner,
  penaltyWin,
}: {
  name: string | null
  logo: string | null
  score: number | null
  winner: boolean
  penaltyWin: boolean
}) {
  return (
    <div className={cn('flex items-center justify-between gap-3', winner && 'font-bold')}>
      <span className={cn('flex min-w-0 items-center gap-1.5', !name && 'italic text-muted-foreground')}>
        {logo && name && (
          <span className="relative h-5 w-5 shrink-0">
            <Image src={logo} alt={name} fill sizes="20px" unoptimized className="object-contain" />
          </span>
        )}
        <span className="truncate">{name ?? 'À déterminer'}</span>
        {penaltyWin && (
          <span className="shrink-0 rounded-sm bg-emerald-400/20 px-1 text-[10px] font-semibold uppercase text-emerald-700 dark:text-emerald-300">
            t.a.b.
          </span>
        )}
      </span>
      <span className="shrink-0 tabular-nums">{score ?? '-'}</span>
    </div>
  )
}

export function MatchCard({ match, showMeta = true }: { match: PublicMatch; showMeta?: boolean }) {
  const finished = match.status === 'finished'
  const decided = finished && match.scoreHome != null && match.scoreAway != null
  const homeWin = decided && (match.scoreHome! > match.scoreAway! || match.penaltyWinner === 'home')
  const awayWin = decided && (match.scoreAway! > match.scoreHome! || match.penaltyWinner === 'away')

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      {showMeta && (
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            {match.code && (
              <span className="rounded-sm bg-muted px-1.5 py-0.5 font-bold text-muted-foreground">{match.code}</span>
            )}
            {match.scheduledTime ?? ''}
            {match.court != null ? ` · Terrain ${match.court}` : ''}
          </span>
          <span>
            {match.groupLabel ? `Poule ${match.groupLabel}` : match.bracketLabel ?? ''}
            {finished ? '' : ' · à venir'}
          </span>
        </div>
      )}
      <div className="space-y-1">
        <TeamLine
          name={match.homeName}
          logo={match.homeLogoUrl}
          score={match.scoreHome}
          winner={homeWin}
          penaltyWin={match.penaltyWinner === 'home'}
        />
        <TeamLine
          name={match.awayName}
          logo={match.awayLogoUrl}
          score={match.scoreAway}
          winner={awayWin}
          penaltyWin={match.penaltyWinner === 'away'}
        />
      </div>
      {match.refereeName && <p className="mt-1 text-xs text-muted-foreground">Arbitre : {match.refereeName}</p>}
    </div>
  )
}

export function MatchesByRound({ matches }: { matches: PublicMatch[] }) {
  const rounds = new Map<number, PublicMatch[]>()
  for (const m of matches) {
    const r = m.round ?? 0
    const arr = rounds.get(r) ?? []
    arr.push(m)
    rounds.set(r, arr)
  }
  const sortedRounds = [...rounds.entries()].sort(([a], [b]) => a - b)

  return (
    <div className="space-y-6">
      {sortedRounds.map(([round, list]) => (
        <div key={round}>
          <h3 className="mb-2 flex items-baseline gap-2 text-lg font-bold">
            Round {round}
            {list[0]?.scheduledTime && (
              <span className="text-sm font-normal text-muted-foreground">{list[0].scheduledTime}</span>
            )}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {list
              .sort((a, b) => (a.court ?? 0) - (b.court ?? 0))
              .map((m) => (
                <MatchCard key={String(m.id)} match={m} showMeta={false} />
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}

/** Finals (knockout + classification) grouped by their round label, for the calendar. */
export function MatchesByLabel({ matches }: { matches: PublicMatch[] }) {
  const byLabel = new Map<string, PublicMatch[]>()
  for (const m of matches) {
    const label = m.bracketLabel ?? 'Phase finale'
    byLabel.set(label, [...(byLabel.get(label) ?? []), m])
  }
  // Order by the earliest scheduled time of each group.
  const groups = [...byLabel.entries()].sort(
    ([, a], [, b]) => (a[0]?.scheduledTime ?? '').localeCompare(b[0]?.scheduledTime ?? ''),
  )

  return (
    <div className="space-y-6">
      {groups.map(([label, list]) => (
        <div key={label}>
          <h3 className="mb-2 flex items-baseline gap-2 text-lg font-bold">
            {label}
            {list[0]?.scheduledTime && (
              <span className="text-sm font-normal text-muted-foreground">{list[0].scheduledTime}</span>
            )}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {list.map((m) => (
              <MatchCard key={String(m.id)} match={m} showMeta={false} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
