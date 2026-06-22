'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ManagerShowcase, type TabKey } from './manager-showcase'
import { DemoShowcase } from './demo-showcase'
import { Spotlight } from './spotlight'
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
  const [tourOn, setTourOn] = useState(false)
  const [managerTab, setManagerTab] = useState<TabKey>('dashboard')
  const [sawAfterGroups, setSawAfterGroups] = useState(false)
  const [sawAfterFinals, setSawAfterFinals] = useState(false)

  const groups = computeGroups(teams, groupMatches)
  const ko = resolveKnockout(koMatches)
  const editableMatches = [...groupMatches, ...ko]
  const drawnPools = POOLS.map((p) => ({ label: p, teams: teams.filter((t) => t.pool === p).map((t) => t.name) }))
  // The knockout can only start once every group match is played (saved); the
  // tournament can only finish once the knockout is played too.
  const groupReady = groupMatches.length > 0 && groupMatches.every((m) => m.locked)
  const koReady = koMatches.length > 0 && koMatches.every((m) => m.locked)

  const onSimulateScores = () =>
    setGroupMatches((ms) => ms.map((m, i) => ({ ...m, hs: (i * 3 + 1) % 5, as: (i * 2) % 4, locked: true })))

  const onSimulateFinals = () =>
    setKoMatches((ms) => {
      const semis = ms.map((m) =>
        m.id === 'SF1'
          ? { ...m, hs: 2, as: 1, locked: true }
          : m.id === 'SF2'
            ? { ...m, hs: 3, as: 2, locked: true }
            : m,
      )
      // Resolve the final's participants from the semis, then score + lock it.
      return resolveKnockout(semis).map((m) => (m.id === 'F' ? { ...m, hs: 1, as: 0, locked: true } : m))
    })

  // Spotlight tour target for the current step (organizer side only). Tab-aware:
  // if the relevant control lives on a hidden tab, point at the tab first.
  const tour: { sel: string; text: string; action?: { label: string; onClick: () => void }; dim?: boolean } | null = (() => {
    if (!tourOn) return null
    if (view === 'public')
      return {
        sel: '[data-tour="view-organisateur"]',
        text: 'Quand vous avez vu le résultat, revenez côté organisateur pour continuer le guide.',
        dim: false,
      }
    const onDash = managerTab === 'dashboard'
    const onScores = managerTab === 'scores'
    const goDash = { sel: '[data-tour="tab-dashboard"]', text: 'Ouvrez le Tableau de bord pour continuer.' }
    const goScores = { sel: '[data-tour="tab-scores"]', text: 'Ouvrez l’onglet Scores pour saisir les matchs.' }
    if (step === 0) return onDash ? { sel: '[data-tour="ctl-0"]', text: 'Cliquez ici pour lancer le tirage des poules.' } : goDash
    if (step === 1) return onDash ? { sel: '[data-tour="ctl-1"]', text: 'Générez le calendrier des matchs.' } : goDash
    if (step === 2 && !groupReady)
      return onScores
        ? { sel: '[data-tour="scores-area"]', text: 'Le plus rapide : cliquez « Remplir automatiquement » (ou saisissez les scores un par un).' }
        : goScores
    if (step === 2)
      return !sawAfterGroups
        ? { sel: '[data-tour="view-public"]', text: 'Scores enregistrés ! Allez voir le classement se remplir côté public.' }
        : onDash
          ? { sel: '[data-tour="ctl-2"]', text: 'Maintenant, générez la phase finale.' }
          : goDash
    if (step === 3 && !koReady)
      return onScores
        ? { sel: '[data-tour="tab-scores"]', text: 'Saisissez les scores des demi-finales et de la finale.' }
        : goScores
    if (step === 3)
      return !sawAfterFinals
        ? { sel: '[data-tour="view-public"]', text: 'Allez voir l’arbre de la phase finale côté public, avant de terminer.' }
        : onDash
          ? { sel: '[data-tour="ctl-3"]', text: 'Dernière étape : terminez le tournoi.' }
          : goDash
    return {
      sel: '[data-tour="reset"]',
      text: 'Bravo, le tournoi est terminé ! Réinitialisez pour tout réessayer librement, à votre rythme.',
      action: {
        label: 'Réinitialiser et explorer',
        onClick: () => {
          onReset()
          setTourOn(false)
        },
      },
    }
  })()

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
      if (!koReady) return
      setStep(4)
    }
  }
  const onReset = () => {
    setTeams(INITIAL_TEAMS)
    setStep(0)
    setGroupMatches([])
    setKoMatches([])
    setManagerTab('dashboard')
    setSawAfterGroups(false)
    setSawAfterFinals(false)
  }

  // Switching to the public side after a milestone marks it as "seen", so the
  // tour can send the visitor to admire the result before moving on.
  const selectView = (v: View) => {
    if (v === 'public') {
      if (groupReady) setSawAfterGroups(true)
      if (koReady) setSawAfterFinals(true)
    }
    setView(v)
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
              data-tour={v.key === 'public' ? 'view-public' : 'view-organisateur'}
              onClick={() => selectView(v.key)}
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
        {!tourOn && view === 'organisateur' && (
          <Button size="sm" variant="secondary" onClick={() => setTourOn(true)}>
            <Sparkles className="size-4" /> Lancer le guide pas à pas
          </Button>
        )}
      </div>

      <div className="mt-8">
        {view === 'organisateur' ? (
          <ManagerShowcase
            teams={teams}
            step={step}
            tab={managerTab}
            matches={editableMatches}
            canKnockout={groupReady}
            canFinish={koReady}
            onTab={setManagerTab}
            onScore={onScore}
            onToggleLock={onToggleLock}
            onStep={onStep}
            onReset={onReset}
            onSimulateScores={onSimulateScores}
            onSimulateFinals={onSimulateFinals}
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

      {tour && (
        <Spotlight selector={tour.sel} text={tour.text} action={tour.action} dim={tour.dim} onSkip={() => setTourOn(false)} />
      )}
    </div>
  )
}
