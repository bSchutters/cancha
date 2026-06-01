'use client'

import Image from 'next/image'
import { CalendarOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { PublicMatch, PublicTournament } from '@/lib/tournament/public-view'
import { GroupStandings } from '../GroupStandings'
import { EmptyState } from '../EmptyState'

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
  const team = data.teams.find((t) => String(t.id) === teamId)
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
        title="Équipe introuvable"
        description="Cette équipe n’existe plus. Choisissez-en une autre."
        action={
          <Button variant="secondary" size="sm" onClick={onChange}>
            Choisir une équipe
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Team header */}
      <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
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
          className="h-auto shrink-0 p-0 text-sm font-normal text-white/50 hover:text-white"
        >
          Changer
        </Button>
      </div>

      {/* Next match */}
      <section>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-white/50">Prochain match</h3>
        {next ? (
          (() => {
            const v = myView(next, teamId)
            return (
              <div className="rounded-xl border border-spanish-accent-2/30 bg-spanish-accent-2/5 p-4">
                <div className="mb-3 flex items-center justify-between text-sm text-white/60">
                  <span className="font-semibold text-spanish-accent-2">
                    {next.scheduledTime ?? ''}
                    {next.court != null ? ` · Terrain ${next.court}` : ''}
                  </span>
                  <span>{next.groupLabel ? `Poule ${next.groupLabel}` : next.bracketLabel}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-white/60">vs</span>
                  <TeamBadge logo={v.oppLogo} name={v.oppName} size={28} />
                </div>
              </div>
            )
          })()
        ) : (
          <EmptyState
            icon={<CalendarOff className="h-6 w-6" />}
            title="Aucun match à venir"
            description="Le prochain match de votre équipe s’affichera ici dès qu’il sera programmé."
            className="py-6"
          />
        )}
      </section>

      {/* Standing */}
      {poolsRevealed && group && myStanding && (
        <section>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-white/50">Classement</h3>
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
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-white/50">Résultats</h3>
          <div className="space-y-2">
            {results.map((m) => {
              const v = myView(m, teamId)
              return (
                <div key={String(m.id)} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
                  <span
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                      v.result === 'V' && 'bg-emerald-500/20 text-emerald-300',
                      v.result === 'D' && 'bg-red-500/20 text-red-300',
                      v.result === 'N' && 'bg-white/10 text-white/60',
                    )}
                  >
                    {v.result}
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
