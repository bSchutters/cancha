'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CalendarClock, Check, Dices, Flag, Lock, Minus, Pencil, Plus, RotateCcw, Trophy, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { nameById, type DemoMatch, type DemoTeam, type Step } from '@/lib/marketing/demo-engine'

type TabKey = 'dashboard' | 'scores' | 'teams'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'dashboard', label: 'Tableau de bord' },
  { key: 'scores', label: 'Scores' },
  { key: 'teams', label: 'Équipes' },
]

const CONTROL_STEPS = [
  { icon: Dices, label: 'Tirage des poules' },
  { icon: CalendarClock, label: 'Générer le calendrier' },
  { icon: Trophy, label: 'Phase finale' },
  { icon: Flag, label: 'Terminer le tournoi' },
]

function Stepper({ value, onDelta, disabled }: { value: number; onDelta: (d: number) => void; disabled: boolean }) {
  return (
    <span className={cn('inline-flex items-center overflow-hidden rounded-md border border-border', disabled && 'opacity-60')}>
      <button
        type="button"
        aria-label="Diminuer"
        disabled={disabled}
        onClick={() => onDelta(-1)}
        className="cursor-pointer px-2 py-1 text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
      >
        <Minus className="size-3.5" />
      </button>
      <span className="min-w-7 border-x border-border py-1 text-center text-sm font-semibold tabular-nums">{value}</span>
      <button
        type="button"
        aria-label="Augmenter"
        disabled={disabled}
        onClick={() => onDelta(1)}
        className="cursor-pointer px-2 py-1 text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
      >
        <Plus className="size-3.5" />
      </button>
    </span>
  )
}

/**
 * Interactive (non-persistent) organizer dashboard driving the shared simulation.
 * Mirrors the real DashboardClient / ScoresClient / TeamsClient.
 */
export function ManagerShowcase({
  teams,
  step,
  matches,
  canKnockout,
  onScore,
  onToggleLock,
  onStep,
  onReset,
  onSimulateScores,
  onAddTeam,
  onTogglePaid,
  onToggleConfirmed,
}: {
  teams: DemoTeam[]
  step: Step
  matches: DemoMatch[]
  canKnockout: boolean
  onScore: (id: string, side: 'hs' | 'as', d: number) => void
  onToggleLock: (id: string) => void
  onStep: (i: number) => void
  onReset: () => void
  onSimulateScores: () => void
  onAddTeam: (name: string) => void
  onTogglePaid: (id: number) => void
  onToggleConfirmed: (id: number) => void
}) {
  const [tab, setTab] = useState<TabKey>('dashboard')
  const [newName, setNewName] = useState('')

  const stats = [
    { label: 'Inscrites', value: teams.length },
    { label: 'Confirmées', value: teams.filter((t) => t.confirmed).length },
    { label: 'Payées', value: teams.filter((t) => t.paid).length },
    { label: 'Matchs', value: matches.length },
  ]

  const addTeam = (e: React.FormEvent) => {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    onAddTeam(name)
    setNewName('')
  }

  // Progressive coach: guide the visitor to do each step themselves (point to
  // the right place + track progress), rather than a one-click do-it-all button.
  const groupMatches = matches.filter((m) => m.phase === 'group')
  const savedGroup = groupMatches.filter((m) => m.locked).length
  const totalGroup = groupMatches.length

  const coach: { n: number; text: string; nav: { label: string; to: TabKey } | null } =
    step === 0
      ? { n: 1, text: 'Dans le centre de contrôle, cliquez sur « Tirage des poules ».', nav: { label: 'Centre de contrôle', to: 'dashboard' } }
      : step === 1
        ? { n: 2, text: 'Cliquez sur « Générer le calendrier » dans le centre de contrôle.', nav: { label: 'Centre de contrôle', to: 'dashboard' } }
        : step === 2 && !canKnockout
          ? {
              n: 3,
              text: `Saisissez le score de chaque match dans l'onglet Scores, puis enregistrez (${savedGroup}/${totalGroup} faits).`,
              nav: { label: 'Aller aux scores', to: 'scores' },
            }
          : step === 2
            ? { n: 3, text: 'Tous les scores sont saisis. Cliquez « Phase finale » dans le centre de contrôle.', nav: { label: 'Centre de contrôle', to: 'dashboard' } }
            : step === 3
              ? { n: 4, text: 'Saisissez les scores des demi-finales, puis cliquez « Terminer le tournoi ».', nav: { label: 'Aller aux scores', to: 'scores' } }
              : { n: 4, text: 'Tournoi terminé. Basculez côté public pour voir le résultat.', nav: null }

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-[0_24px_60px_-32px_rgba(26,26,24,0.22)]">
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold sm:text-xl">Tournoi démo</h3>
            <span className="rounded-md bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-700">
              {step === 0 ? 'Inscriptions' : step >= 4 ? 'Terminé' : 'En cours'}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">Tableau de bord organisateur</span>
        </div>
        <nav className="mt-4 flex flex-wrap gap-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              data-tour={t.key === 'scores' ? 'tab-scores' : undefined}
              onClick={() => setTab(t.key)}
              aria-pressed={tab === t.key}
              className={cn(
                '-mb-px shrink-0 cursor-pointer border-b-2 px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
                tab === t.key ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="space-y-6 bg-secondary/30 p-5 sm:p-7">
        {/* Guided next-step coach */}
        <div className="flex flex-col gap-3 rounded-xl border border-primary/30 bg-primary/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {coach.n}
            </span>
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-primary">Étape {coach.n} / 4</div>
              <p className="mt-0.5 text-sm text-foreground">{coach.text}</p>
            </div>
          </div>
          {coach.nav && (
            <Button size="sm" variant="secondary" onClick={() => setTab(coach.nav!.to)} className="shrink-0">
              {coach.nav.label}
            </Button>
          )}
        </div>

        {tab === 'dashboard' && (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="rounded-xl border border-border bg-card p-4">
                  <p className="text-3xl font-bold tabular-nums">{s.value}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>

            <section className="rounded-xl border border-primary/30 bg-primary/5 p-5">
              <div className="mb-1 flex items-center justify-between gap-2">
                <h4 className="font-bold text-primary">Centre de contrôle</h4>
                <button
                  type="button"
                  onClick={onReset}
                  className="inline-flex cursor-pointer items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  <RotateCcw className="size-3.5" /> Réinitialiser
                </button>
              </div>
              <p className="mb-4 text-xs text-muted-foreground">
                Déroulez le tournoi étape par étape. Cliquez l’étape disponible pour la valider.
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {CONTROL_STEPS.map((c, i) => {
                  const done = i < step
                  // "Phase finale" (i === 2) stays blocked until every group score is saved.
                  const blocked = i === step && i === 2 && !canKnockout
                  const available = i === step && !blocked
                  return (
                    <button
                      key={c.label}
                      type="button"
                      data-tour={`ctl-${i}`}
                      disabled={!available}
                      onClick={() => onStep(i)}
                      className={cn(
                        'flex flex-col gap-2 rounded-lg border p-4 text-left transition-colors',
                        done && 'border-primary/30 bg-primary/5',
                        available && 'cursor-pointer border-primary bg-card ring-2 ring-primary/40 hover:bg-primary/5',
                        !done && !available && 'border-border bg-card opacity-60',
                      )}
                    >
                      <span className={cn('flex items-center gap-2', done || available ? 'text-primary' : 'text-muted-foreground')}>
                        <c.icon className="size-5" />
                        {done ? <Check className="size-4" /> : !available ? <Lock className="size-3.5" /> : null}
                      </span>
                      <span className="text-sm font-medium">{c.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {done
                          ? 'Fait'
                          : available
                            ? 'Cliquez pour valider'
                            : blocked
                              ? 'Saisissez les scores de poule'
                              : 'Verrouillé'}
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>
          </>
        )}

        {tab === 'scores' &&
          (matches.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center text-sm text-muted-foreground">
              Générez le calendrier dans le centre de contrôle pour saisir les scores.
            </div>
          ) : (
            <div className="space-y-4">
              {matches.some((m) => m.phase === 'group' && !m.locked) && (
                <div className="flex justify-end">
                  <Button type="button" size="sm" variant="secondary" onClick={onSimulateScores}>
                    Simuler les scores
                  </Button>
                </div>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
              {matches.map((m) => {
                const home = nameById(teams, m.homeId)
                const away = nameById(teams, m.awayId)
                const ready = Boolean(home && away)
                return (
                  <div key={m.id} className={cn('rounded-lg border border-border p-4', m.locked ? 'bg-muted/40' : 'bg-card')}>
                    <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <span className="rounded-sm bg-muted px-1.5 py-0.5 font-bold text-foreground">{m.code}</span>
                        {m.time} · Terrain {m.court}
                      </span>
                      <span>{m.pool ? `Poule ${m.pool}` : m.bracketLabel}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className={cn('min-w-0 truncate text-sm', !home && 'italic text-muted-foreground')}>
                          {home ?? 'À déterminer'}
                        </span>
                        <Stepper value={m.hs} disabled={m.locked || !ready} onDelta={(d) => onScore(m.id, 'hs', d)} />
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className={cn('min-w-0 truncate text-sm', !away && 'italic text-muted-foreground')}>
                          {away ?? 'À déterminer'}
                        </span>
                        <Stepper value={m.as} disabled={m.locked || !ready} onDelta={(d) => onScore(m.id, 'as', d)} />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-end">
                      {m.locked ? (
                        <Button type="button" size="sm" variant="secondary" onClick={() => onToggleLock(m.id)}>
                          <Pencil className="size-3.5" /> Modifier
                        </Button>
                      ) : (
                        <Button type="button" size="sm" disabled={!ready} onClick={() => onToggleLock(m.id)}>
                          Enregistrer
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
              </div>
            </div>
          ))}

        {tab === 'teams' && (
          <div className="space-y-4">
            <form onSubmit={addTeam} className="flex flex-wrap items-center gap-2">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nom de l’équipe"
                className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              />
              <Button type="submit" size="sm">
                <Plus className="size-3.5" /> Ajouter
              </Button>
            </form>

            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="border-b border-border px-4 py-3 text-sm font-medium">{teams.length} équipes inscrites</div>
              {teams.map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 text-sm last:border-b-0">
                  <span className="flex min-w-0 items-center gap-2">
                    <Users className="size-4 shrink-0 text-muted-foreground" />
                    <span className="truncate font-medium">{t.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">{t.pool ? `Poule ${t.pool}` : 'Poule à tirer'}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onToggleConfirmed(t.id)}
                      className={cn(
                        'cursor-pointer rounded-md px-2 py-0.5 text-xs font-medium transition-colors',
                        t.confirmed ? 'bg-emerald-500/15 text-emerald-700' : 'bg-amber-500/15 text-amber-700',
                      )}
                    >
                      {t.confirmed ? 'Confirmée' : 'En attente'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onTogglePaid(t.id)}
                      className={cn('cursor-pointer text-xs transition-colors', t.paid ? 'text-emerald-700' : 'text-muted-foreground hover:text-foreground')}
                    >
                      {t.paid ? 'Payé' : 'En attente'}
                    </button>
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Ajoutez une équipe, changez les statuts : les poules seront attribuées au tirage (aperçu non
              enregistré).
            </p>
          </div>
        )}

        <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/[0.06] p-5 text-center sm:flex-row sm:text-left">
          <p className="text-sm text-muted-foreground">
            Vous tenez le pilotage. Sur votre vrai tournoi, on configure tout avec vous.
          </p>
          <Button asChild size="sm" className="shrink-0">
            <Link href="#contact">Demander une démo</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
