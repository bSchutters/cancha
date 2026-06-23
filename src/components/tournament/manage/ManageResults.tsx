'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Award } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { BracketView, type BracketMatchView } from '@/components/tournament/BracketView'
import { useT } from '@/i18n/use-t'
import type { ManageMatch, ManageTournament } from '@/lib/tournament/manage-view'

function toBracketView(m: ManageMatch): BracketMatchView {
  return {
    id: m.id,
    round: m.round ?? 1,
    bracketLabel: m.bracketLabel,
    homeName: m.homeName,
    awayName: m.awayName,
    homeLogoUrl: m.homeLogoUrl,
    awayLogoUrl: m.awayLogoUrl,
    scoreHome: m.scoreHome,
    scoreAway: m.scoreAway,
    penaltyWinner: m.penaltyWinner,
    penaltyHome: m.penaltyHome,
    penaltyAway: m.penaltyAway,
    status: m.status,
  }
}

function NameWithLogo({ logo, name }: { logo: string | null; name: string }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      {logo && (
        <span className="relative h-5 w-5 shrink-0">
          <Image src={logo} alt="" fill sizes="20px" unoptimized className="object-contain" />
        </span>
      )}
      <span className="truncate">{name}</span>
    </span>
  )
}

function Tabs<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: { key: T; label: string }[]
  active: T
  onChange: (k: T) => void
}) {
  return (
    <div className="mb-4 flex flex-wrap gap-1">
      {tabs.map((x) => (
        <Button
          key={x.key}
          variant="ghost"
          size="sm"
          onClick={() => onChange(x.key)}
          className={cn(
            'rounded-md',
            active === x.key
              ? 'bg-primary/20 font-semibold text-foreground hover:bg-primary/20 hover:text-foreground'
              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
          )}
        >
          {x.label}
        </Button>
      ))}
    </div>
  )
}

function FairplayContent({ t }: { t: ManageTournament }) {
  const tr = useT()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const finished = t.status === 'finished' || t.status === 'archived'

  const setWinner = async (teamId: string) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/tournaments/${t.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ fairplay_winner_team: teamId ? Number(teamId) : null }),
      })
      if (res.ok) {
        toast.success(tr('product.results.fairplaySaved'))
        router.refresh()
      } else {
        toast.error(tr('product.toast.error'))
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8">#</TableHead>
            <TableHead>{tr('product.standings.team')}</TableHead>
            <TableHead className="text-right">{tr('product.standings.points.short')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {t.fairplayRanking.map((e) => (
            <TableRow key={String(e.teamId)}>
              <TableCell className="text-muted-foreground">{e.rank}</TableCell>
              <TableCell className="font-medium">
                <NameWithLogo logo={e.logoUrl} name={e.teamName} />
              </TableCell>
              <TableCell className="text-right font-bold text-primary">{e.fairplayPoints}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <p className="mt-3 text-xs text-muted-foreground">{tr('product.results.fairplayNote')}</p>
      {finished && (
        <div className="mt-4">
          <p className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
            <Award className="h-3.5 w-3.5 text-primary" /> {tr('product.results.fairplayWinner')}
          </p>
          <Select
            defaultValue={t.fairplayWinnerId ? String(t.fairplayWinnerId) : undefined}
            onValueChange={(v) => setWinner(v === '__none__' ? '' : v)}
            disabled={saving}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={tr('product.results.designateWinner')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">{tr('product.results.none')}</SelectItem>
              {t.teams.map((team) => (
                <SelectItem key={String(team.id)} value={String(team.id)}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </>
  )
}

function FinalRankingContent({ t }: { t: ManageTournament }) {
  const tr = useT()
  if (t.finalRanking.length === 0) {
    return <p className="text-xs text-muted-foreground">{tr('product.results.finalRankingEmpty')}</p>
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-8">#</TableHead>
          <TableHead>{tr('product.standings.team')}</TableHead>
          <TableHead className="text-right">{tr('product.results.stage')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {t.finalRanking.map((e) => (
          <TableRow key={String(e.teamId)}>
            <TableCell>
              <span
                className={cn(
                  'inline-flex h-5 items-center justify-center rounded-sm px-1.5 text-xs font-semibold',
                  e.position === 1
                    ? 'bg-amber-400/20 text-amber-700 dark:text-amber-300'
                    : e.position === 2
                      ? 'bg-zinc-400/20 text-zinc-600 dark:text-zinc-300'
                      : e.position === 3
                        ? 'bg-orange-700/30 text-orange-700 dark:text-orange-300'
                        : 'text-muted-foreground',
                )}
              >
                {e.positionLabel}
              </span>
            </TableCell>
            <TableCell className="font-medium">
              <NameWithLogo logo={e.logoUrl} name={e.teamName} />
            </TableCell>
            <TableCell className="text-right text-xs text-muted-foreground">{e.note}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function GroupTable({ t, label }: { t: ManageTournament; label: string }) {
  const tr = useT()
  const group = t.groups.find((g) => g.label === label)
  if (!group) return null
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-6">#</TableHead>
          <TableHead>{tr('product.standings.team')}</TableHead>
          <TableHead className="text-center">{tr('product.standings.played.short')}</TableHead>
          <TableHead className="text-center">{tr('product.standings.goalDiff.short')}</TableHead>
          <TableHead className="text-center">{tr('product.standings.points.short')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {group.standings.map((s) => {
          const qualified = s.rank <= t.format.qualifiersPerGroup
          return (
            <TableRow key={String(s.teamId)}>
              <TableCell>
                <span
                  className={cn(
                    'inline-flex h-5 w-5 items-center justify-center rounded-sm text-xs font-semibold',
                    qualified ? 'bg-emerald-400/20 text-emerald-700 dark:text-emerald-300' : 'text-muted-foreground',
                  )}
                >
                  {s.rank}
                </span>
              </TableCell>
              <TableCell className="font-medium">
                <NameWithLogo logo={s.logoUrl} name={s.teamName} />
              </TableCell>
              <TableCell className="text-center text-muted-foreground">{s.played}</TableCell>
              <TableCell className="text-center text-muted-foreground">
                {s.goalDifference > 0 ? `+${s.goalDifference}` : s.goalDifference}
              </TableCell>
              <TableCell className="text-center font-bold">{s.points}</TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

export function ManageResults({ t }: { t: ManageTournament }) {
  const tr = useT()
  const hasBracket = t.matches.some((m) => m.phase === 'knockout')
  const [leftTab, setLeftTab] = useState<'fairplay' | 'final'>('fairplay')
  const [rightTab, setRightTab] = useState<'groups' | 'bracket'>(hasBracket ? 'bracket' : 'groups')

  if (t.groups.length === 0 && !hasBracket) return null

  const rightTabs: { key: 'groups' | 'bracket'; label: string }[] = [
    { key: 'groups', label: tr('product.tab.pools') },
    ...(hasBracket ? [{ key: 'bracket' as const, label: tr('product.tab.bracket') }] : []),
  ]
  const activeRight = rightTabs.find((x) => x.key === rightTab) ? rightTab : 'groups'

  return (
    <section className="grid items-start gap-6 lg:grid-cols-3">
      {/* Classements (fair-play / final) - 1/3 */}
      <div className="rounded-xl border border-border bg-card p-4">
        <Tabs
          tabs={[
            { key: 'fairplay', label: tr('product.results.tab.fairplay') },
            { key: 'final', label: tr('product.results.tab.final') },
          ]}
          active={leftTab}
          onChange={setLeftTab}
        />
        {leftTab === 'fairplay' ? <FairplayContent t={t} /> : <FinalRankingContent t={t} />}
      </div>

      {/* Poules / Arbre - 2/3 */}
      <div className="rounded-xl border border-border bg-card p-4 lg:col-span-2">
        <Tabs tabs={rightTabs} active={activeRight} onChange={setRightTab} />
        {activeRight === 'bracket' ? (
          <BracketView matches={t.matches.filter((m) => m.phase === 'knockout').map(toBracketView)} size="sm" className="pb-2" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {t.groups.map((g) => (
              <div key={g.label} className="rounded-lg border border-border bg-muted/30 p-3">
                <h4 className="mb-2 text-sm font-bold text-foreground">{tr('product.poolLabel')} {g.label}</h4>
                <GroupTable t={t} label={g.label} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
