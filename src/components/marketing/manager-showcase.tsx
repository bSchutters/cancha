'use client'

import { useState } from 'react'
import { CalendarClock, Check, Dices, Flag, Lock, Minus, Pencil, Plus, RotateCcw, Trophy, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useT } from '@/i18n/use-t'
import { Button } from '@/components/ui/button'
import { nameById, type DemoMatch, type DemoTeam, type Step } from '@/lib/marketing/demo-engine'

export type TabKey = 'dashboard' | 'scores' | 'teams'

const TABS: TabKey[] = ['dashboard', 'scores', 'teams']

const CONTROL_STEPS = [
  { icon: Dices, key: 'draw' },
  { icon: CalendarClock, key: 'calendar' },
  { icon: Trophy, key: 'finals' },
  { icon: Flag, key: 'finish' },
]

function Stepper({ value, onDelta, disabled }: { value: number; onDelta: (d: number) => void; disabled: boolean }) {
  const tr = useT()
  return (
    <span className={cn('inline-flex items-center overflow-hidden rounded-md border border-border', disabled && 'opacity-60')}>
      <button
        type="button"
        aria-label={tr('demo.sandbox.stepper.decrease')}
        disabled={disabled}
        onClick={() => onDelta(-1)}
        className="cursor-pointer px-2 py-1 text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
      >
        <Minus className="size-3.5" />
      </button>
      <span className="min-w-7 border-x border-border py-1 text-center text-sm font-semibold tabular-nums">{value}</span>
      <button
        type="button"
        aria-label={tr('demo.sandbox.stepper.increase')}
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
 * Mirrors the real DashboardClient / ScoresClient / TeamsClient. The active tab is
 * lifted to the parent so the guided tour can keep its highlight on a visible tab.
 */
export function ManagerShowcase({
  teams,
  step,
  tab,
  matches,
  canKnockout,
  canFinish,
  onTab,
  onScore,
  onToggleLock,
  onStep,
  onReset,
  onSimulateScores,
  onSimulateFinals,
  onAddTeam,
  onTogglePaid,
  onToggleConfirmed,
}: {
  teams: DemoTeam[]
  step: Step
  tab: TabKey
  matches: DemoMatch[]
  canKnockout: boolean
  canFinish: boolean
  onTab: (t: TabKey) => void
  onScore: (id: string, side: 'hs' | 'as', d: number) => void
  onToggleLock: (id: string) => void
  onStep: (i: number) => void
  onReset: () => void
  onSimulateScores: () => void
  onSimulateFinals: () => void
  onAddTeam: (name: string) => void
  onTogglePaid: (id: number) => void
  onToggleConfirmed: (id: number) => void
}) {
  const tr = useT()
  const [newName, setNewName] = useState('')

  const stats = [
    { label: tr('demo.sandbox.stat.registered'), value: teams.length },
    { label: tr('demo.sandbox.stat.confirmed'), value: teams.filter((t) => t.confirmed).length },
    { label: tr('demo.sandbox.stat.paid'), value: teams.filter((t) => t.paid).length },
    { label: tr('demo.sandbox.stat.matches'), value: matches.length },
  ]

  const addTeam = (e: React.FormEvent) => {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    onAddTeam(name)
    setNewName('')
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-[0_24px_60px_-32px_rgba(26,26,24,0.22)]">
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold sm:text-xl">{tr('demo.sandbox.title')}</h3>
            <span className="rounded-md bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-700">
              {step === 0
                ? tr('demo.sandbox.status.registration')
                : step >= 4
                  ? tr('demo.sandbox.status.finished')
                  : tr('demo.sandbox.status.live')}
            </span>
          </div>
        </div>
        <nav className="mt-4 flex flex-wrap gap-1">
          {TABS.map((key) => (
            <button
              key={key}
              type="button"
              data-tour={key === 'dashboard' ? 'tab-dashboard' : key === 'scores' ? 'tab-scores' : undefined}
              onClick={() => onTab(key)}
              aria-pressed={tab === key}
              className={cn(
                '-mb-px shrink-0 cursor-pointer border-b-2 px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
                tab === key ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {tr(`demo.sandbox.tab.${key}`)}
            </button>
          ))}
        </nav>
      </div>

      <div className="space-y-6 bg-secondary/30 p-5 sm:p-7">
        {/* Quiet progress strip (the spotlight carries the instruction) */}
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-2.5">
          <span className="shrink-0 text-xs font-medium text-muted-foreground">
            {step >= 4
              ? tr('demo.sandbox.progress.finished')
              : tr('demo.sandbox.progress.step').replace('{step}', String(step + 1))}
          </span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${(step / 4) * 100}%` }} />
          </div>
          <button
            type="button"
            data-tour="reset"
            onClick={onReset}
            className="inline-flex shrink-0 cursor-pointer items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <RotateCcw className="size-3.5" /> {tr('demo.sandbox.reset')}
          </button>
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
              <h4 className="mb-1 font-bold text-primary">{tr('demo.sandbox.controlCenter.title')}</h4>
              <p className="mb-4 text-xs text-muted-foreground">{tr('demo.sandbox.controlCenter.intro')}</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {CONTROL_STEPS.map((c, i) => {
                  const blocked = i === step && ((i === 2 && !canKnockout) || (i === 3 && !canFinish))
                  const done = i < step
                  const available = i === step && !blocked
                  return (
                    <button
                      key={c.key}
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
                      <span className="text-sm font-medium">{tr(`demo.sandbox.control.${c.key}`)}</span>
                      <span className="text-xs text-muted-foreground">
                        {done
                          ? tr('demo.sandbox.control.statusDone')
                          : available
                            ? tr('demo.sandbox.control.clickToValidate')
                            : blocked && i === 2
                              ? tr('demo.sandbox.control.needGroupScores')
                              : blocked && i === 3
                                ? tr('demo.sandbox.control.needFinalScores')
                                : tr('demo.sandbox.control.locked')}
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
              {tr('demo.sandbox.scores.empty')}
            </div>
          ) : (
            <div className="space-y-4">
              {(matches.some((m) => m.phase === 'group' && !m.locked) ||
                matches.some((m) => m.phase === 'knockout' && !m.locked)) && (
                <div
                  data-tour="scores-area"
                  className="flex flex-col items-start justify-between gap-2 rounded-xl border border-primary/20 bg-primary/[0.06] p-4 sm:flex-row sm:items-center"
                >
                  <p className="text-sm text-foreground">{tr('demo.sandbox.scores.autoPrompt')}</p>
                  <Button
                    type="button"
                    size="sm"
                    onClick={matches.some((m) => m.phase === 'group' && !m.locked) ? onSimulateScores : onSimulateFinals}
                    className="shrink-0"
                  >
                    {tr('demo.sandbox.scores.autoFill')}
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
                          {m.time} · {tr('demo.sandbox.court')} {m.court}
                        </span>
                        <span>{m.pool ? `${tr('demo.sandbox.poolLabel')} ${m.pool}` : m.bracketLabel}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className={cn('min-w-0 truncate text-sm', !home && 'italic text-muted-foreground')}>
                            {home ?? tr('demo.sandbox.match.tbd')}
                          </span>
                          <Stepper value={m.hs} disabled={m.locked || !ready} onDelta={(d) => onScore(m.id, 'hs', d)} />
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className={cn('min-w-0 truncate text-sm', !away && 'italic text-muted-foreground')}>
                            {away ?? tr('demo.sandbox.match.tbd')}
                          </span>
                          <Stepper value={m.as} disabled={m.locked || !ready} onDelta={(d) => onScore(m.id, 'as', d)} />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-end">
                        {m.locked ? (
                          <Button type="button" size="sm" variant="secondary" onClick={() => onToggleLock(m.id)}>
                            <Pencil className="size-3.5" /> {tr('demo.sandbox.match.edit')}
                          </Button>
                        ) : (
                          <Button type="button" size="sm" disabled={!ready} onClick={() => onToggleLock(m.id)}>
                            {tr('demo.sandbox.match.save')}
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
                placeholder={tr('demo.sandbox.teams.namePlaceholder')}
                className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              />
              <Button type="submit" size="sm">
                <Plus className="size-3.5" /> {tr('demo.sandbox.teams.add')}
              </Button>
            </form>

            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="border-b border-border px-4 py-3 text-sm font-medium">
                {tr('demo.sandbox.teams.count').replace('{count}', String(teams.length))}
              </div>
              {teams.map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 text-sm last:border-b-0">
                  <span className="flex min-w-0 items-center gap-2">
                    <Users className="size-4 shrink-0 text-muted-foreground" />
                    <span className="truncate font-medium">{t.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {t.pool ? `${tr('demo.sandbox.poolLabel')} ${t.pool}` : tr('demo.sandbox.teams.poolToDraw')}
                    </span>
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
                      {t.confirmed ? tr('demo.sandbox.team.confirmed') : tr('demo.sandbox.team.pending')}
                    </button>
                    <button
                      type="button"
                      onClick={() => onTogglePaid(t.id)}
                      className={cn('cursor-pointer text-xs transition-colors', t.paid ? 'text-emerald-700' : 'text-muted-foreground hover:text-foreground')}
                    >
                      {t.paid ? tr('demo.sandbox.team.paid') : tr('demo.sandbox.team.pending')}
                    </button>
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{tr('demo.sandbox.teams.footnote')}</p>
          </div>
        )}

      </div>
    </div>
  )
}
