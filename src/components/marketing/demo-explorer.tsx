'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ManagerShowcase } from './manager-showcase'
import { DemoShowcase } from './demo-showcase'
import { INITIAL_DEMO_MATCHES, type DemoMatch } from '@/lib/marketing/demo-data'

type View = 'organisateur' | 'public'

const VIEWS: { key: View; label: string; caption: string }[] = [
  { key: 'organisateur', label: 'Côté organisateur', caption: 'Votre poste de pilotage : scores, équipes, déroulé du tournoi.' },
  { key: 'public', label: 'Côté public', caption: 'Ce que voient les équipes et les spectateurs, en direct.' },
]

/**
 * Lets the visitor switch between the manager dashboard and the public view.
 * Match scores live here so a score saved on the organizer side flows into the
 * public standings + calendar (the real link between the two sides).
 */
export function DemoExplorer() {
  const [view, setView] = useState<View>('organisateur')
  const [matches, setMatches] = useState<DemoMatch[]>(INITIAL_DEMO_MATCHES)
  const current = VIEWS.find((v) => v.key === view) ?? VIEWS[0]

  const onDelta = (i: number, side: 'hs' | 'as', d: number) =>
    setMatches((ms) => ms.map((m, idx) => (idx === i && !m.locked ? { ...m, [side]: Math.max(0, m[side] + d) } : m)))
  const onToggleLock = (i: number) =>
    setMatches((ms) => ms.map((m, idx) => (idx === i ? { ...m, locked: !m.locked } : m)))
  // Reset clears the tournament: matches back to unplayed, which empties the
  // public standings/calendar too (the two sides stay in sync).
  const onReset = () => setMatches((ms) => ms.map((m) => ({ ...m, hs: 0, as: 0, locked: false })))

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
          Astuce : saisissez un score côté organisateur, puis basculez côté public pour le voir apparaître.
        </p>
      </div>

      <div className="mt-8">
        {view === 'organisateur' ? (
          <ManagerShowcase matches={matches} onDelta={onDelta} onToggleLock={onToggleLock} onReset={onReset} />
        ) : (
          <DemoShowcase matches={matches} />
        )}
      </div>
    </div>
  )
}
