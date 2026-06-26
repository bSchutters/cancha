'use client'

import Image from 'next/image'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { useT } from '@/i18n/use-t'
import type { PublicGroup } from '@/lib/tournament/public-view'
import { getSportProfile, DEFAULT_SPORT, type SportId } from '@/lib/sport'

export function GroupStandings({
  groups,
  qualifiersPerGroup,
  compact = false,
  highlightTeamId,
  sport = DEFAULT_SPORT,
}: {
  groups: PublicGroup[]
  qualifiersPerGroup: number
  compact?: boolean
  highlightTeamId?: string
  sport?: SportId
}) {
  const t = useT()
  // The sport decides whether draws can happen (so whether the column is shown)
  // and which noun the for/against/diff columns use (goals vs points).
  const profile = getSportProfile(sport)
  const showDraws = profile.drawsAllowed
  const isPoints = profile.scoreLabel === 'points'
  const forShort = t(isPoints ? 'product.standings.pointsFor.short' : 'product.standings.goalsFor.short')
  const forTitle = t(isPoints ? 'product.standings.pointsFor.title' : 'product.standings.goalsFor.title')
  const againstShort = t(isPoints ? 'product.standings.pointsAgainst.short' : 'product.standings.goalsAgainst.short')
  const againstTitle = t(isPoints ? 'product.standings.pointsAgainst.title' : 'product.standings.goalsAgainst.title')
  const diffShort = t(isPoints ? 'product.standings.pointsDiff.short' : 'product.standings.goalDiff.short')
  const diffTitle = t(isPoints ? 'product.standings.pointsDiff.title' : 'product.standings.goalDiff.title')
  if (groups.length === 0) return null
  return (
    <div className={cn('grid gap-6', compact ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2')}>
      {groups.map((group) => (
        <div key={group.label} className="rounded-xl border border-border bg-card p-3 sm:p-4">
          <h3 className={cn('mb-3 font-bold', compact ? 'text-lg' : 'text-xl')}>
            {t('product.poolLabel')} {group.label}
          </h3>
          <div className="-mx-1 overflow-x-auto">
            <Table className="min-w-[20rem]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-6 px-1">#</TableHead>
                  <TableHead className="px-1">{t('product.standings.team')}</TableHead>
                  <TableHead className="px-1 text-center" title={t('product.standings.played.title')}>
                    {t('product.standings.played.short')}
                  </TableHead>
                  <TableHead className="px-1 text-center" title={t('product.standings.wins.title')}>
                    {t('product.standings.wins.short')}
                  </TableHead>
                  {showDraws && (
                    <TableHead className="px-1 text-center" title={t('product.standings.draws.title')}>
                      {t('product.standings.draws.short')}
                    </TableHead>
                  )}
                  <TableHead className="px-1 text-center" title={t('product.standings.losses.title')}>
                    {t('product.standings.losses.short')}
                  </TableHead>
                  <TableHead className="px-1 text-center" title={forTitle}>
                    {forShort}
                  </TableHead>
                  <TableHead className="px-1 text-center" title={againstTitle}>
                    {againstShort}
                  </TableHead>
                  <TableHead className="px-1 text-center" title={diffTitle}>
                    {diffShort}
                  </TableHead>
                  <TableHead className="px-1 text-center font-bold text-foreground">
                    {t('product.standings.points.short')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {group.standings.map((s) => {
                  const qualified = s.rank <= qualifiersPerGroup
                  const me = highlightTeamId != null && String(s.teamId) === highlightTeamId
                  return (
                    <TableRow key={String(s.teamId)} className={cn(me && 'bg-primary/10')}>
                      <TableCell className="px-1">
                        <span
                          className={cn(
                            'inline-flex h-6 w-6 items-center justify-center rounded-md text-xs font-semibold',
                            qualified ? 'bg-emerald-400/20 text-emerald-700 dark:text-emerald-300' : 'text-muted-foreground',
                          )}
                        >
                          {s.rank}
                        </span>
                      </TableCell>
                      <TableCell className="px-1 font-medium">
                        <span className="flex items-center gap-2">
                          {s.logoUrl && (
                            <span className="relative h-5 w-5 shrink-0">
                              <Image src={s.logoUrl} alt={s.teamName} fill sizes="20px" unoptimized className="object-contain" />
                            </span>
                          )}
                          <span className="truncate">{s.teamName}</span>
                        </span>
                      </TableCell>
                      <TableCell className="px-1 text-center tabular-nums text-muted-foreground">{s.played}</TableCell>
                      <TableCell className="px-1 text-center tabular-nums text-muted-foreground">{s.wins}</TableCell>
                      {showDraws && (
                        <TableCell className="px-1 text-center tabular-nums text-muted-foreground">{s.draws}</TableCell>
                      )}
                      <TableCell className="px-1 text-center tabular-nums text-muted-foreground">{s.losses}</TableCell>
                      <TableCell className="px-1 text-center tabular-nums text-muted-foreground">{s.goalsFor}</TableCell>
                      <TableCell className="px-1 text-center tabular-nums text-muted-foreground">{s.goalsAgainst}</TableCell>
                      <TableCell className="px-1 text-center tabular-nums text-muted-foreground">
                        {s.goalDifference > 0 ? `+${s.goalDifference}` : s.goalDifference}
                      </TableCell>
                      <TableCell className="px-1 text-center font-bold tabular-nums">{s.points}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      ))}
    </div>
  )
}
