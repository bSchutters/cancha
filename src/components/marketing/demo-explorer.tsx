'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ManagerShowcase } from './manager-showcase'
import { DemoShowcase } from './demo-showcase'

type View = 'organisateur' | 'public'

const VIEWS: { key: View; label: string; caption: string }[] = [
  { key: 'organisateur', label: 'Côté organisateur', caption: 'Votre poste de pilotage : scores, équipes, déroulé du tournoi.' },
  { key: 'public', label: 'Côté public', caption: 'Ce que voient les équipes et les spectateurs, en direct.' },
]

/** Lets the visitor switch between the manager dashboard and the public view. */
export function DemoExplorer() {
  const [view, setView] = useState<View>('organisateur')
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
      </div>

      <div className="mt-8">{view === 'organisateur' ? <ManagerShowcase /> : <DemoShowcase />}</div>
    </div>
  )
}
