'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ManagerShowcase } from './manager-showcase'
import { DemoShowcase } from './demo-showcase'
import {
  INITIAL_TEAMS,
  POOLS,
  buildGroupMatches,
  buildKnockout,
  computeGroups,
  drawPools,
  resolveKnockout,
  toPublicMatch,
  type DemoMatch,
  type DemoTeam,
  type Step,
} from '@/lib/marketing/demo-engine'

type View = 'organisateur' | 'public'

const VIEWS: { key: View; label: string; caption: string }[] = [
  { key: 'organisateur', label: 'Côté organisateur', caption: 'Votre poste de pilotage : du tirage aux scores, étape par étape.' },
  { key: 'public', label: 'Côté public', caption: 'Ce que voient les équipes et les spectateurs, en direct.' },
]

/**
 * Drives a coherent end-to-end tournament simulation and shares it between the
 * organizer and public views. Steps run from the control center: a registered
 * team flows into the draw, the calendar, the scores, the standings and the
 * knockout, visible on both sides live.
 */
export function DemoExplorer() {
  const [view, setView] = useState<View>('organisateur')
  const [teams, setTeams] = useState<DemoTeam[]>(INITIAL_TEAMS)
  const [step, setStep] = useState<Step>(0)
  const [groupMatches, setGroupMatches] = useState<DemoMatch[]>([])
  const [koMatches, setKoMatches] = useState<DemoMatch[]>([])
  const [seq, setSeq] = useState(100)

  const groups = computeGroups(teams, groupMatches)
  const ko = resolveKnockout(koMatches)
  const editableMatches = [...groupMatches, ...ko]
  const drawnPools = POOLS.map((p) => ({ label: p, teams: teams.filter((t) => t.pool === p).map((t) => t.name) }))
  // The knockout can only start once every group match is played (saved).
  const groupReady = groupMatches.length > 0 && groupMatches.every((m) => m.locked)

  const onSimulateScores = () =>
    setGroupMatches((ms) => ms.map((m, i) => ({ ...m, hs: (i * 3 + 1) % 5, as: (i * 2) % 4, locked: true })))

  const editArr = (id: string, fn: (m: DemoMatch) => DemoMatch) => {
    setGroupMatches((a) => a.map((m) => (m.id === id ? fn(m) : m)))
    setKoMatches((a) => a.map((m) => (m.id === id ? fn(m) : m)))
  }
  const onScore = (id: string, side: 'hs' | 'as', d: number) =>
    editArr(id, (m) => (m.locked ? m : { ...m, [side]: Math.max(0, m[side] + d) }))
  const onToggleLock = (id: string) => editArr(id, (m) => ({ ...m, locked: !m.locked }))

  const onStep = (i: number) => {
    if (i === 0) {
      setTeams((ts) => drawPools(ts))
      setStep(1)
    } else if (i === 1) {
      setGroupMatches(buildGroupMatches(teams))
      setStep(2)
    } else if (i === 2) {
      if (!groupReady) return
      setKoMatches(buildKnockout(computeGroups(teams, groupMatches)))
      setStep(3)
    } else if (i === 3) {
      setStep(4)
    }
  }
  const onReset = () => {
    setTeams(INITIAL_TEAMS)
    setStep(0)
    setGroupMatches([])
    setKoMatches([])
  }

  const onAddTeam = (name: string) => {
    setTeams((ts) => [...ts, { id: seq, name, pool: null, confirmed: true, paid: false }])
    setSeq((s) => s + 1)
  }
  const onTogglePaid = (id: number) => setTeams((ts) => ts.map((t) => (t.id === id ? { ...t, paid: !t.paid } : t)))
  const onToggleConfirmed = (id: number) =>
    setTeams((ts) => ts.map((t) => (t.id === id ? { ...t, confirmed: !t.confirmed } : t)))

  const current = VIEWS.find((v) => v.key === view) ?? VIEWS[0]

  return (
    <div>
      <div className="flex flex-col items-center gap-3">
        <div className="inline-flex gap-1 rounded-full border border-border bg-card p-1">
          {VIEWS.map((v) => (
            <button
              key={v.key}
              type="button"
              onClick={() => setView(v.key)}
              aria-pressed={view === v.key}
              className={cn(
                'cursor-pointer rounded-full px-5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
                view === v.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {v.label}
            </button>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">{current.caption}</p>
        <p className="text-xs text-primary">
          Déroulez le tournoi côté organisateur (tirage, calendrier, scores), puis basculez côté public.
        </p>
      </div>

      <div className="mt-8">
        {view === 'organisateur' ? (
          <ManagerShowcase
            teams={teams}
            step={step}
            matches={editableMatches}
            canKnockout={groupReady}
            onScore={onScore}
            onToggleLock={onToggleLock}
            onStep={onStep}
            onReset={onReset}
            onSimulateScores={onSimulateScores}
            onAddTeam={onAddTeam}
            onTogglePaid={onTogglePaid}
            onToggleConfirmed={onToggleConfirmed}
          />
        ) : (
          <DemoShowcase
            step={step}
            pools={drawnPools}
            groups={groups}
            groupMatches={groupMatches.map((m) => toPublicMatch(m, teams))}
            knockout={ko.map((m) => toPublicMatch(m, teams))}
          />
        )}
      </div>
    </div>
  )
}
