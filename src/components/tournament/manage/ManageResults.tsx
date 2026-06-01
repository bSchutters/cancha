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
              ? 'bg-spanish-accent-2/20 font-semibold text-white hover:bg-spanish-accent-2/20 hover:text-white'
              : 'text-white/50 hover:bg-white/5 hover:text-white',
          )}
        >
          {x.label}
        </Button>
      ))}
    </div>
  )
}

function FairplayContent({ t }: { t: ManageTournament }) {
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
        toast.success('Vainqueur fair-play enregistré')
        router.refresh()
      } else {
        toast.error('Erreur')
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
            <TableHead>Équipe</TableHead>
            <TableHead className="text-right">Pts</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {t.fairplayRanking.map((e) => (
            <TableRow key={String(e.teamId)}>
              <TableCell className="text-white/40">{e.rank}</TableCell>
              <TableCell className="font-medium">
                <NameWithLogo logo={e.logoUrl} name={e.teamName} />
              </TableCell>
              <TableCell className="text-right font-bold text-spanish-accent-2">{e.fairplayPoints}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <p className="mt-3 text-xs text-white/40">Privé - révélé publiquement seulement à la fin.</p>
      {finished && (
        <div className="mt-4">
          <p className="mb-1 flex items-center gap-1 text-xs text-white/50">
            <Award className="h-3.5 w-3.5 text-spanish-accent-2" /> Vainqueur du trophée fair-play
          </p>
          <Select
            defaultValue={t.fairplayWinnerId ? String(t.fairplayWinnerId) : undefined}
            onValueChange={(v) => setWinner(v === '__none__' ? '' : v)}
            disabled={saving}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="- Désigner le vainqueur -" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">- Aucun -</SelectItem>
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
  if (t.finalRanking.length === 0) {
    return <p className="text-xs text-white/40">Disponible une fois la phase finale générée.</p>
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-8">#</TableHead>
          <TableHead>Équipe</TableHead>
          <TableHead className="text-right">Étape</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {t.finalRanking.map((e) => (
          <TableRow key={String(e.teamId)}>
            <TableCell>
              <span
                className={cn(
                  'inline-flex h-5 items-center justify-center rounded px-1.5 text-xs font-semibold',
                  e.position === 1
                    ? 'bg-amber-400/20 text-amber-300'
                    : e.position === 2
                      ? 'bg-zinc-300/20 text-zinc-200'
                      : e.position === 3
                        ? 'bg-orange-700/30 text-orange-300'
                        : 'text-white/40',
                )}
              >
                {e.positionLabel}
              </span>
            </TableCell>
            <TableCell className="font-medium">
              <NameWithLogo logo={e.logoUrl} name={e.teamName} />
            </TableCell>
            <TableCell className="text-right text-xs text-white/50">{e.note}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function GroupTable({ t, label }: { t: ManageTournament; label: string }) {
  const group = t.groups.find((g) => g.label === label)
  if (!group) return null
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-6">#</TableHead>
          <TableHead>Équipe</TableHead>
          <TableHead className="text-center">J</TableHead>
          <TableHead className="text-center">Diff</TableHead>
          <TableHead className="text-center">Pts</TableHead>
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
                    'inline-flex h-5 w-5 items-center justify-center rounded text-xs font-semibold',
                    qualified ? 'bg-emerald-400/20 text-emerald-300' : 'text-white/40',
                  )}
                >
                  {s.rank}
                </span>
              </TableCell>
              <TableCell className="font-medium">
                <NameWithLogo logo={s.logoUrl} name={s.teamName} />
              </TableCell>
              <TableCell className="text-center text-white/60">{s.played}</TableCell>
              <TableCell className="text-center text-white/60">
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
  const hasBracket = t.matches.some((m) => m.phase === 'knockout')
  const [leftTab, setLeftTab] = useState<'fairplay' | 'final'>('fairplay')
  const [rightTab, setRightTab] = useState<'groups' | 'bracket'>(hasBracket ? 'bracket' : 'groups')

  if (t.groups.length === 0 && !hasBracket) return null

  const rightTabs: { key: 'groups' | 'bracket'; label: string }[] = [
    { key: 'groups', label: 'Poules' },
    ...(hasBracket ? [{ key: 'bracket' as const, label: 'Arbre' }] : []),
  ]
  const activeRight = rightTabs.find((x) => x.key === rightTab) ? rightTab : 'groups'

  return (
    <section className="grid items-start gap-6 lg:grid-cols-3">
      {/* Classements (fair-play / final) - 1/3 */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <Tabs
          tabs={[
            { key: 'fairplay', label: 'Fair-play' },
            { key: 'final', label: 'Classement final' },
          ]}
          active={leftTab}
          onChange={setLeftTab}
        />
        {leftTab === 'fairplay' ? <FairplayContent t={t} /> : <FinalRankingContent t={t} />}
      </div>

      {/* Poules / Arbre - 2/3 */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 lg:col-span-2">
        <Tabs tabs={rightTabs} active={activeRight} onChange={setRightTab} />
        {activeRight === 'bracket' ? (
          <BracketView matches={t.matches.filter((m) => m.phase === 'knockout').map(toBracketView)} size="sm" className="pb-2" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {t.groups.map((g) => (
              <div key={g.label} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                <h4 className="mb-2 text-sm font-bold text-white/80">Poule {g.label}</h4>
                <GroupTable t={t} label={g.label} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
