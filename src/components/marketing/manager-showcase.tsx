'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  CalendarClock,
  Check,
  Dices,
  Flag,
  Minus,
  Pencil,
  Plus,
  Trophy,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type TabKey = 'dashboard' | 'scores' | 'teams'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'dashboard', label: 'Tableau de bord' },
  { key: 'scores', label: 'Scores' },
  { key: 'teams', label: 'Équipes' },
]

const STATS = [
  { label: 'Inscrites', value: '8 / 8' },
  { label: 'Confirmées', value: '8' },
  { label: 'Payées', value: '6' },
  { label: 'Matchs', value: '9' },
]

const CONTROLS = [
  { icon: Dices, label: 'Tirage des poules', done: true },
  { icon: CalendarClock, label: 'Générer le calendrier', done: true },
  { icon: Trophy, label: 'Phase finale', done: true },
  { icon: Flag, label: 'Terminer le tournoi', done: false },
]

const SCORE_MATCHES = [
  { code: 'A1', time: '14:00', court: 1, pool: 'A', home: 'Real Sporting', away: 'FC Comète', hs: 5, as: 1, locked: true },
  { code: 'A3', time: '15:00', court: 1, pool: 'A', home: 'Real Sporting', away: 'AS Tonnerre', hs: 0, as: 0, locked: false },
]

const TEAMS = [
  { name: 'Real Sporting', pool: 'A', status: 'Confirmée', paid: true },
  { name: 'AS Tonnerre', pool: 'A', status: 'Confirmée', paid: true },
  { name: 'Les Lynx', pool: 'A', status: 'Confirmée', paid: false },
  { name: 'FC Comète', pool: 'A', status: 'Confirmée', paid: true },
  { name: 'Olympic 7', pool: 'B', status: 'Confirmée', paid: true },
  { name: 'Stade Central', pool: 'B', status: 'En attente', paid: false },
]

function Stepper({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center overflow-hidden rounded-md border border-border">
      <span className="px-2 py-1 text-muted-foreground">
        <Minus className="size-3.5" />
      </span>
      <span className="min-w-7 border-x border-border py-1 text-center text-sm font-semibold tabular-nums">{value}</span>
      <span className="px-2 py-1 text-muted-foreground">
        <Plus className="size-3.5" />
      </span>
    </span>
  )
}

/**
 * Static preview of the organizer dashboard (mirrors the real DashboardClient /
 * ScoresClient / TeamsClient layouts). Non-interactive: it is an "aperçu" that
 * pushes toward a real demo.
 */
export function ManagerShowcase() {
  const [tab, setTab] = useState<TabKey>('dashboard')

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-[0_24px_60px_-32px_rgba(26,26,24,0.22)]">
      {/* Dashboard-style header */}
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold sm:text-xl">Tournoi démo</h3>
            <span className="rounded-md bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-700">
              En cours
            </span>
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
              {STATS.map((s) => (
                <div key={s.label} className="rounded-xl border border-border bg-card p-4">
                  <p className="text-3xl font-bold tabular-nums">{s.value}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>

            <section className="rounded-xl border border-primary/30 bg-primary/5 p-5">
              <h4 className="mb-1 font-bold text-primary">Centre de contrôle</h4>
              <p className="mb-4 text-xs text-muted-foreground">
                Déroulez le tournoi étape par étape. Chaque étape se verrouille une fois faite.
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {CONTROLS.map((c) => (
                  <div
                    key={c.label}
                    className={cn(
                      'flex flex-col gap-2 rounded-lg border p-4',
                      c.done ? 'border-primary/30 bg-primary/5' : 'border-border bg-card',
                    )}
                  >
                    <span className={cn('flex items-center gap-2', c.done ? 'text-primary' : 'text-muted-foreground')}>
                      <c.icon className="size-5" />
                      {c.done && <Check className="size-4" />}
                    </span>
                    <span className="text-sm font-medium">{c.label}</span>
                    {c.done && <span className="text-xs text-primary">Fait</span>}
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {tab === 'scores' && (
          <div className="grid gap-3 sm:grid-cols-2">
            {SCORE_MATCHES.map((m) => (
              <div
                key={m.code}
                className={cn('rounded-lg border border-border p-4', m.locked ? 'bg-muted/40' : 'bg-card')}
              >
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
                    <Stepper value={m.hs} />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="min-w-0 truncate text-sm">{m.away}</span>
                    <Stepper value={m.as} />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{m.locked ? 'Enregistré' : 'À saisir'}</span>
                  {m.locked ? (
                    <span className="inline-flex items-center gap-1 text-xs text-primary">
                      <Pencil className="size-3.5" /> Modifier
                    </span>
                  ) : (
                    <span className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                      Enregistrer
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'teams' && (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="text-sm font-medium">{TEAMS.length} équipes inscrites</span>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                <Plus className="size-3.5" /> Ajouter une équipe
              </span>
            </div>
            {TEAMS.map((t) => (
              <div key={t.name} className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 text-sm last:border-b-0">
                <span className="flex min-w-0 items-center gap-2">
                  <Users className="size-4 shrink-0 text-muted-foreground" />
                  <span className="truncate font-medium">{t.name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">Poule {t.pool}</span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span
                    className={cn(
                      'rounded-md px-2 py-0.5 text-xs font-medium',
                      t.status === 'Confirmée' ? 'bg-emerald-500/15 text-emerald-700' : 'bg-amber-500/15 text-amber-700',
                    )}
                  >
                    {t.status}
                  </span>
                  <span className={cn('text-xs', t.paid ? 'text-emerald-700' : 'text-muted-foreground')}>
                    {t.paid ? 'Payé' : 'En attente'}
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Push to a real demo */}
        <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/[0.06] p-5 text-center sm:flex-row sm:text-left">
          <p className="text-sm text-muted-foreground">
            Ceci n’est qu’un aperçu. La vraie prise en main, sur votre tournoi, se découvre en démo.
          </p>
          <Button asChild size="sm" className="shrink-0">
            <Link href="#contact">Demander une démo</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
