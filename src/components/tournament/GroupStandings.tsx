import Image from 'next/image'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { PublicGroup } from '@/lib/tournament/public-view'

export function GroupStandings({
  groups,
  qualifiersPerGroup,
  compact = false,
  highlightTeamId,
}: {
  groups: PublicGroup[]
  qualifiersPerGroup: number
  compact?: boolean
  highlightTeamId?: string
}) {
  if (groups.length === 0) return null
  return (
    <div className={cn('grid gap-6', compact ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2')}>
      {groups.map((group) => (
        <div key={group.label} className="rounded-xl border border-border bg-card p-3 sm:p-4">
          <h3 className={cn('mb-3 font-bold', compact ? 'text-lg' : 'text-xl')}>Poule {group.label}</h3>
          <div className="-mx-1 overflow-x-auto">
            <Table className="min-w-[20rem]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-6 px-1">#</TableHead>
                  <TableHead className="px-1">Équipe</TableHead>
                  <TableHead className="px-1 text-center" title="Joués">J</TableHead>
                  <TableHead className="px-1 text-center" title="Victoires">V</TableHead>
                  <TableHead className="px-1 text-center" title="Nuls">N</TableHead>
                  <TableHead className="px-1 text-center" title="Défaites">D</TableHead>
                  <TableHead className="px-1 text-center" title="Buts pour">BP</TableHead>
                  <TableHead className="px-1 text-center" title="Buts contre">BC</TableHead>
                  <TableHead className="px-1 text-center" title="Différence">Diff</TableHead>
                  <TableHead className="px-1 text-center font-bold text-foreground">Pts</TableHead>
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
                            qualified ? 'bg-emerald-400/20 text-emerald-300' : 'text-muted-foreground',
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
                      <TableCell className="px-1 text-center tabular-nums text-muted-foreground">{s.draws}</TableCell>
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
