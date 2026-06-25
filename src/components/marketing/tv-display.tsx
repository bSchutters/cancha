'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { LIVE_STANDINGS, Screen } from './feature-demos'

// Rotating in-hall TV mockup: full-width panels that cycle, so nothing is
// truncated and the page shows the variety of what the screen displays.

const NEXT = [
  { home: 'Real Sporting', away: 'Les Lynx', time: '15:30', court: 'T1' },
  { home: 'AS Tonnerre', away: 'FC Comète', time: '15:30', court: 'T2' },
  { home: 'Olympic 7', away: 'Dynamo Nord', time: '16:00', court: 'T1' },
]

const RESULTS = [
  { home: 'Real Sporting', away: 'FC Comète', sh: 5, sa: 1 },
  { home: 'AS Tonnerre', away: 'Les Lynx', sh: 2, sa: 2 },
  { home: 'Olympic 7', away: 'Dynamo Nord', sh: 3, sa: 0 },
]

const PANELS = ['Prochains matchs', 'Classement · Poule A', 'Derniers résultats'] as const

function NextPanel() {
  return (
    <div className="space-y-3.5">
      {NEXT.map((m, i) => (
        <div key={i} className="flex items-center justify-between gap-4 text-base">
          <span className="font-medium">
            {m.home} <span className="text-muted-foreground">vs</span> {m.away}
          </span>
          <span className="shrink-0 tabular-nums text-muted-foreground">
            {m.time} · {m.court}
          </span>
        </div>
      ))}
    </div>
  )
}

function StandingsPanel() {
  return (
    <div className="space-y-2.5">
      {LIVE_STANDINGS.map((s) => (
        <div key={s.rank} className="flex items-center justify-between text-base">
          <span className="flex items-center gap-4">
            <span
              className={cn(
                'w-5 text-center font-semibold tabular-nums',
                s.rank <= 2 ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              {s.rank}
            </span>
            <span className="font-medium">{s.name}</span>
          </span>
          <span className="font-semibold tabular-nums">{s.pts} pts</span>
        </div>
      ))}
    </div>
  )
}

function ResultsPanel() {
  return (
    <div className="space-y-3.5">
      {RESULTS.map((m, i) => (
        <div key={i} className="flex items-center justify-between gap-4 text-base">
          <span className="font-medium">
            {m.home} <span className="text-muted-foreground">vs</span> {m.away}
          </span>
          <span className="shrink-0 rounded-md bg-secondary px-2.5 py-0.5 font-semibold tabular-nums">
            {m.sh} – {m.sa}
          </span>
        </div>
      ))}
    </div>
  )
}

export function TvDisplayDemo() {
  const [i, setI] = useState(0)

  useEffect(() => {
    // Don't auto-advance content for visitors who asked for reduced motion.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => setI((v) => (v + 1) % PANELS.length), 3800)
    return () => clearInterval(id)
  }, [])

  return (
    <Screen title="Affichage sur écran" live>
      <div className="px-6 pb-5 pt-5">
        <h3 className="text-sm font-medium text-muted-foreground">{PANELS[i]}</h3>
        <div
          key={i}
          className="mt-4 flex min-h-[168px] flex-col justify-center motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1 motion-safe:duration-500"
        >
          {i === 0 ? <NextPanel /> : i === 1 ? <StandingsPanel /> : <ResultsPanel />}
        </div>

        {/* progress dots */}
        <div className="mt-5 flex items-center justify-center gap-1.5">
          {PANELS.map((p, idx) => (
            <span
              key={p}
              className={cn(
                'h-1.5 rounded-full transition-all',
                idx === i ? 'w-5 bg-primary' : 'w-1.5 bg-border',
              )}
            />
          ))}
        </div>
      </div>
    </Screen>
  )
}
