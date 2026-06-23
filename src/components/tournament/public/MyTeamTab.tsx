'use client'

import Image from 'next/image'
import { CalendarOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useT } from '@/i18n/use-t'
import type { PublicMatch, PublicTournament } from '@/lib/tournament/public-view'
import { GroupStandings } from '../GroupStandings'
import { EmptyState } from '../EmptyState'

// 'V'/'N'/'D' result codes map to the standings short labels (localized).
const RESULT_KEY: Record<'V' | 'N' | 'D', string> = { V: 'wins', N: 'draws', D: 'losses' }

function TeamBadge({ logo, name, size = 24 }: { logo: string | null; name: string | null; size?: number }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      {logo && (
        <span className="relative shrink-0" style={{ height: size, width: size }}>
          <Image src={logo} alt={name ?? ''} fill sizes={`${size}px`} unoptimized className="object-contain" />
        </span>
      )}
      <span className="truncate font-medium">{name ?? '-'}</span>
    </span>
  )
}

type Side = 'home' | 'away'

function myView(m: PublicMatch, teamId: string): {
  side: Side
  oppName: string | null
  oppLogo: string | null
  myScore: number | null
  oppScore: number | null
  result: 'V' | 'N' | 'D' | null
} {
  const side: Side = String(m.homeTeamId) === teamId ? 'home' : 'away'
  const myScore = side === 'home' ? m.scoreHome : m.scoreAway
  const oppScore = side === 'home' ? m.scoreAway : m.scoreHome
  const oppName = side === 'home' ? m.awayName : m.homeName
  const oppLogo = side === 'home' ? m.awayLogoUrl : m.homeLogoUrl
  let result: 'V' | 'N' | 'D' | null = null
  if (m.status === 'finished' && myScore != null && oppScore != null) {
    if (myScore > oppScore) result = 'V'
    else if (myScore < oppScore) result = 'D'
    else result = m.penaltyWinner === side ? 'V' : m.penaltyWinner ? 'D' : 'N'
  }
  return { side, oppName, oppLogo, myScore, oppScore, result }
}

export function MyTeamTab({
  data,
  teamId,
  poolsRevealed = true,
  onChange,
}: {
  data: PublicTournament
  teamId: string
  poolsRevealed?: boolean
  onChange: () => void
}) {
  const t = useT()
  const team = data.teams.find((tm) => String(tm.id) === teamId)
  const allMatches = [...data.groupMatches, ...data.knockoutMatches, ...data.classificationMatches].filter(
    (m) => String(m.homeTeamId) === teamId || String(m.awayTeamId) === teamId,
  )
  const next = allMatches
    .filter((m) => m.status !== 'finished' && m.homeName && m.awayName)
    .sort((a, b) => (a.scheduledTime ?? '').localeCompare(b.scheduledTime ?? '') || (a.round ?? 0) - (b.round ?? 0))[0]
  // Most recent result first.
  const results = allMatches
    .filter((m) => m.status === 'finished')
    .sort((a, b) => (b.scheduledTime ?? '').localeCompare(a.scheduledTime ?? ''))

  const group = data.groups.find((g) => g.standings.some((s) => String(s.teamId) === teamId))
  const myStanding = group?.standings.find((s) => String(s.teamId) === teamId)

  if (!team) {
    return (
      <EmptyState
        title={t('product.myteam.notFoundTitle')}
        description={t('product.myteam.notFoundDesc')}
        action={
          <Button variant="secondary" size="sm" onClick={onChange}>
            {t('product.myteam.chooseTeam')}
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Team header */}
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
        <span className="flex items-center gap-3">
          {team.logoUrl && (
            <span className="relative h-10 w-10 shrink-0">
              <Image src={team.logoUrl} alt={team.name} fill sizes="40px" unoptimized className="object-contain" />
            </span>
          )}
          <span className="text-lg font-bold">{team.name}</span>
        </span>
        <Button
          variant="link"
          onClick={onChange}
          className="h-auto shrink-0 p-0 text-sm font-normal text-muted-foreground hover:text-foreground"
        >
          {t('product.myteam.change')}
        </Button>
      </div>

      {/* Next match */}
      <section>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{t('product.myteam.nextMatch')}</h3>
        {next ? (
          (() => {
            const v = myView(next, teamId)
            return (
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                <div className="mb-3 flex items-center justify-between text-sm text-muted-foreground">
                  <span className="font-semibold text-primary">
                    {next.scheduledTime ?? ''}
                    {next.court != null ? ` · ${t('product.court')} ${next.court}` : ''}
                  </span>
                  <span>{next.groupLabel ? `${t('product.poolLabel')} ${next.groupLabel}` : next.bracketLabel}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">{t('product.versus')}</span>
                  <TeamBadge logo={v.oppLogo} name={v.oppName} size={28} />
                </div>
              </div>
            )
          })()
        ) : (
          <EmptyState
            icon={<CalendarOff className="h-6 w-6" />}
            title={t('product.myteam.noUpcomingTitle')}
            description={t('product.myteam.noUpcomingDesc')}
            className="py-6"
          />
        )}
      </section>

      {/* Standing */}
      {poolsRevealed && group && myStanding && (
        <section>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{t('product.myteam.standing')}</h3>
          <GroupStandings
            groups={[group]}
            qualifiersPerGroup={data.format.qualifiersPerGroup}
            highlightTeamId={teamId}
          />
        </section>
      )}

      {/* Results */}
      {results.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{t('product.tab.results')}</h3>
          <div className="space-y-2">
            {results.map((m) => {
              const v = myView(m, teamId)
              return (
                <div key={String(m.id)} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3">
                  <span
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                      v.result === 'V' && 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
                      v.result === 'D' && 'bg-red-500/20 text-red-700 dark:text-red-300',
                      v.result === 'N' && 'bg-muted text-muted-foreground',
                    )}
                  >
                    {v.result && t(`product.standings.${RESULT_KEY[v.result]}.short`)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <TeamBadge logo={v.oppLogo} name={v.oppName} size={20} />
                  </span>
                  <span className="shrink-0 font-bold tabular-nums">
                    {v.myScore} – {v.oppScore}
                  </span>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
