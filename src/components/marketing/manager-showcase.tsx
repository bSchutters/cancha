'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  CalendarClock,
  Check,
  Dices,
  Flag,
  Lock,
  Minus,
  Pencil,
  Plus,
  RotateCcw,
  Trophy,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type TabKey = 'dashboard' | 'scores' | 'teams'
type Team = { id: number; name: string; pool: string; confirmed: boolean; paid: boolean }
type Match = { code: string; time: string; court: number; pool: string; home: string; away: string; hs: number; as: number; locked: boolean }

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

const INITIAL_TEAMS: Team[] = [
  { id: 1, name: 'Real Sporting', pool: 'A', confirmed: true, paid: true },
  { id: 2, name: 'AS Tonnerre', pool: 'A', confirmed: true, paid: true },
  { id: 3, name: 'Les Lynx', pool: 'A', confirmed: true, paid: false },
  { id: 4, name: 'FC Comète', pool: 'A', confirmed: true, paid: true },
  { id: 5, name: 'Olympic 7', pool: 'B', confirmed: true, paid: true },
  { id: 6, name: 'Stade Central', pool: 'B', confirmed: false, paid: false },
]

const INITIAL_MATCHES: Match[] = [
  { code: 'A1', time: '14:00', court: 1, pool: 'A', home: 'Real Sporting', away: 'FC Comète', hs: 5, as: 1, locked: true },
  { code: 'A3', time: '15:00', court: 1, pool: 'A', home: 'Real Sporting', away: 'AS Tonnerre', hs: 0, as: 0, locked: false },
]

function Stepper({ value, onDelta, disabled }: { value: number; onDelta: (d: number) => void; disabled: boolean }) {
  return (
    <span className={cn('inline-flex items-center overflow-hidden rounded-md border border-border', disabled && 'opacity-60')}>
      <button
        type="button"
        aria-label="Diminuer"
        disabled={disabled}
        onClick={() => onDelta(-1)}
        className="cursor-pointer px-2 py-1 text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed"
      >
        <Minus className="size-3.5" />
      </button>
      <span className="min-w-7 border-x border-border py-1 text-center text-sm font-semibold tabular-nums">{value}</span>
      <button
        type="button"
        aria-label="Augmenter"
        disabled={disabled}
        onClick={() => onDelta(1)}
        className="cursor-pointer px-2 py-1 text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed"
      >
        <Plus className="size-3.5" />
      </button>
    </span>
  )
}

/**
 * Interactive (non-persistent) preview of the organizer dashboard, mirroring the
 * real DashboardClient / ScoresClient / TeamsClient. State is local: it shows how
 * the platform works, then pushes toward a real demo.
 */
export function ManagerShowcase() {
  const [tab, setTab] = useState<TabKey>('dashboard')
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS)
  const [matches, setMatches] = useState<Match[]>(INITIAL_MATCHES)
  const [doneSteps, setDoneSteps] = useState(3)
  const [seq, setSeq] = useState(100)
  const [newName, setNewName] = useState('')
  const [newPool, setNewPool] = useState('A')

  const stats = [
    { label: 'Inscrites', value: teams.length },
    { label: 'Confirmées', value: teams.filter((t) => t.confirmed).length },
    { label: 'Payées', value: teams.filter((t) => t.paid).length },
    { label: 'Matchs', value: 9 },
  ]

  const bump = (i: number, side: 'hs' | 'as', d: number) =>
    setMatches((ms) => ms.map((m, idx) => (idx === i && !m.locked ? { ...m, [side]: Math.max(0, m[side] + d) } : m)))
  const toggleLock = (i: number) =>
    setMatches((ms) => ms.map((m, idx) => (idx === i ? { ...m, locked: !m.locked } : m)))

  const addTeam = (e: React.FormEvent) => {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    setTeams((ts) => [...ts, { id: seq, name, pool: newPool, confirmed: true, paid: false }])
    setSeq((s) => s + 1)
    setNewName('')
  }
  const togglePaid = (id: number) => setTeams((ts) => ts.map((t) => (t.id === id ? { ...t, paid: !t.paid } : t)))
  const toggleConfirmed = (id: number) =>
    setTeams((ts) => ts.map((t) => (t.id === id ? { ...t, confirmed: !t.confirmed } : t)))

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-[0_24px_60px_-32px_rgba(26,26,24,0.22)]">
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold sm:text-xl">Tournoi démo</h3>
            <span className="rounded-md bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-700">En cours</span>
          </div>
          <span className="text-xs text-muted-foreground">Tableau de bord organisateur</span>
        </div>
        <nav className="mt-4 flex flex-wrap gap-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
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
                {doneSteps > 0 && (
                  <button
                    type="button"
                    onClick={() => setDoneSteps(0)}
                    className="inline-flex cursor-pointer items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <RotateCcw className="size-3.5" /> Réinitialiser
                  </button>
                )}
              </div>
              <p className="mb-4 text-xs text-muted-foreground">
                Déroulez le tournoi étape par étape. Cliquez l’étape disponible pour la valider.
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {CONTROL_STEPS.map((c, i) => {
                  const done = i < doneSteps
                  const available = i === doneSteps
                  return (
                    <button
                      key={c.label}
                      type="button"
                      disabled={!available}
                      onClick={() => setDoneSteps(i + 1)}
                      className={cn(
                        'flex flex-col gap-2 rounded-lg border p-4 text-left transition-colors',
                        done && 'border-primary/30 bg-primary/5',
                        available && 'cursor-pointer border-primary bg-card hover:bg-primary/5',
                        !done && !available && 'border-border bg-card opacity-60',
                      )}
                    >
                      <span className={cn('flex items-center gap-2', done || available ? 'text-primary' : 'text-muted-foreground')}>
                        <c.icon className="size-5" />
                        {done ? <Check className="size-4" /> : !available ? <Lock className="size-3.5" /> : null}
                      </span>
                      <span className="text-sm font-medium">{c.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {done ? 'Fait' : available ? 'Cliquez pour valider' : 'Verrouillé'}
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>
          </>
        )}

        {tab === 'scores' && (
          <div className="grid gap-3 sm:grid-cols-2">
            {matches.map((m, i) => (
              <div key={m.code} className={cn('rounded-lg border border-border p-4', m.locked ? 'bg-muted/40' : 'bg-card')}>
                <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <span className="rounded-sm bg-muted px-1.5 py-0.5 font-bold text-foreground">{m.code}</span>
                    {m.time} · Terrain {m.court}
                  </span>
                  <span>Poule {m.pool}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="min-w-0 truncate text-sm">{m.home}</span>
                    <Stepper value={m.hs} disabled={m.locked} onDelta={(d) => bump(i, 'hs', d)} />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="min-w-0 truncate text-sm">{m.away}</span>
                    <Stepper value={m.as} disabled={m.locked} onDelta={(d) => bump(i, 'as', d)} />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-end">
                  {m.locked ? (
                    <Button type="button" size="sm" variant="secondary" onClick={() => toggleLock(i)}>
                      <Pencil className="size-3.5" /> Modifier
                    </Button>
                  ) : (
                    <Button type="button" size="sm" onClick={() => toggleLock(i)}>
                      Enregistrer
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'teams' && (
          <div className="space-y-4">
            <form onSubmit={addTeam} className="flex flex-wrap items-center gap-2">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nom de l’équipe"
                className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              />
              <select
                value={newPool}
                onChange={(e) => setNewPool(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              >
                <option value="A">Poule A</option>
                <option value="B">Poule B</option>
              </select>
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
                    <span className="shrink-0 text-xs text-muted-foreground">Poule {t.pool}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleConfirmed(t.id)}
                      className={cn(
                        'cursor-pointer rounded-md px-2 py-0.5 text-xs font-medium transition-colors',
                        t.confirmed ? 'bg-emerald-500/15 text-emerald-700' : 'bg-amber-500/15 text-amber-700',
                      )}
                    >
                      {t.confirmed ? 'Confirmée' : 'En attente'}
                    </button>
                    <button
                      type="button"
                      onClick={() => togglePaid(t.id)}
                      className={cn('cursor-pointer text-xs transition-colors', t.paid ? 'text-emerald-700' : 'text-muted-foreground hover:text-foreground')}
                    >
                      {t.paid ? 'Payé' : 'En attente'}
                    </button>
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Cliquez les statuts pour les changer, ajoutez une équipe : tout réagit en direct (aperçu non
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
