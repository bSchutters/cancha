'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { AnimatedDraw } from './animated-draw'

type TabKey = 'tirage' | 'poules' | 'calendrier' | 'classement'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'tirage', label: 'Tirage' },
  { key: 'poules', label: 'Poules' },
  { key: 'calendrier', label: 'Calendrier' },
  { key: 'classement', label: 'Classement' },
]

const POULE_A = [
  { rank: 1, name: 'Real Sporting', pts: 9, gd: '+7' },
  { rank: 2, name: 'AS Tonnerre', pts: 6, gd: '+2' },
  { rank: 3, name: 'Les Lynx', pts: 3, gd: '-1' },
  { rank: 4, name: 'FC Comète', pts: 0, gd: '-8' },
]
const POULE_B = [
  { rank: 1, name: 'Olympic 7', pts: 7, gd: '+4' },
  { rank: 2, name: 'Stade Central', pts: 5, gd: '+1' },
  { rank: 3, name: 'Les Aigles', pts: 4, gd: '0' },
  { rank: 4, name: 'Dynamo Nord', pts: 1, gd: '-5' },
]

const SCHEDULE = [
  { time: '14:00', court: 'Terrain 1', home: 'Real Sporting', away: 'FC Comète', score: '5 - 1' },
  { time: '14:00', court: 'Terrain 2', home: 'Olympic 7', away: 'Dynamo Nord', score: '3 - 0' },
  { time: '14:30', court: 'Terrain 1', home: 'AS Tonnerre', away: 'Les Lynx', score: '2 - 2' },
  { time: '14:30', court: 'Terrain 2', home: 'Stade Central', away: 'Les Aigles', score: 'à venir' },
  { time: '15:00', court: 'Terrain 1', home: 'Real Sporting', away: 'AS Tonnerre', score: 'à venir' },
]

const RANKING = [
  { rank: 1, name: 'Real Sporting' },
  { rank: 2, name: 'Olympic 7' },
  { rank: 3, name: 'AS Tonnerre' },
  { rank: 4, name: 'Stade Central' },
]

function Standings({ title, rows }: { title: string; rows: typeof POULE_A }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 text-sm font-medium text-primary">{title}</div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-muted-foreground">
            <th className="w-6 font-medium">#</th>
            <th className="font-medium">Équipe</th>
            <th className="w-12 text-right font-medium">Diff</th>
            <th className="w-12 text-right font-medium">Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => (
            <tr key={t.name} className={cn('border-t border-border', t.rank <= 2 && 'text-primary')}>
              <td className="py-2 tabular-nums">{t.rank}</td>
              <td className="py-2 font-medium text-foreground">{t.name}</td>
              <td className="py-2 text-right tabular-nums text-muted-foreground">{t.gd}</td>
              <td className="py-2 text-right font-semibold tabular-nums">{t.pts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function DemoShowcase() {
  const [tab, setTab] = useState<TabKey>('tirage')

  return (
    <div>
      <div className="flex flex-wrap gap-1 rounded-full border border-border bg-card p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            aria-pressed={tab === t.key}
            className={cn(
              'cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
              tab === t.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-3xl border border-border bg-secondary/40 p-5 sm:p-7">
        {tab === 'tirage' && <AnimatedDraw />}

        {tab === 'poules' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Standings title="Poule A" rows={POULE_A} />
            <Standings title="Poule B" rows={POULE_B} />
          </div>
        )}

        {tab === 'calendrier' && (
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            {SCHEDULE.map((m, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 text-sm last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <span className="tabular-nums text-muted-foreground">{m.time}</span>
                  <span className="hidden text-xs text-muted-foreground sm:inline">{m.court}</span>
                </div>
                <div className="flex-1 text-center font-medium">
                  {m.home} <span className="text-muted-foreground">vs</span> {m.away}
                </div>
                <span
                  className={cn(
                    'w-16 text-right tabular-nums',
                    m.score === 'à venir' ? 'text-xs text-muted-foreground' : 'font-semibold',
                  )}
                >
                  {m.score}
                </span>
              </div>
            ))}
          </div>
        )}

        {tab === 'classement' && (
          <div className="mx-auto max-w-md space-y-2">
            {RANKING.map((t) => (
              <div
                key={t.rank}
                className={cn(
                  'flex items-center gap-4 rounded-xl border px-4 py-3',
                  t.rank === 1 ? 'border-primary/30 bg-primary/[0.06]' : 'border-border bg-card',
                )}
              >
                <span
                  className={cn(
                    'flex size-7 items-center justify-center rounded-full text-sm font-semibold tabular-nums',
                    t.rank === 1 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground',
                  )}
                >
                  {t.rank}
                </span>
                <span className="font-medium">{t.name}</span>
                {t.rank === 1 && <span className="ml-auto text-sm text-primary">Vainqueur</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Données d’illustration. Relancez le tirage pour voir l’animation.
      </p>
    </div>
  )
}
