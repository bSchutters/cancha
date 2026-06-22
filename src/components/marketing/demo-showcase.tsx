'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { GroupStandings } from '@/components/tournament/GroupStandings'
import { MatchesByRound } from '@/components/tournament/MatchList'
import { Bracket } from '@/components/tournament/Bracket'
import { AnimatedDraw } from './animated-draw'
import {
  computeGroups,
  toPublicMatch,
  DEMO_KNOCKOUT,
  DEMO_QUALIFIERS,
  type DemoMatch,
} from '@/lib/marketing/demo-data'

type TabKey = 'tirage' | 'poules' | 'calendrier' | 'finale'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'tirage', label: 'Tirage' },
  { key: 'poules', label: 'Poules' },
  { key: 'calendrier', label: 'Calendrier' },
  { key: 'finale', label: 'Phase finale' },
]

/**
 * Public-facing preview. Renders the REAL public components on the shared demo
 * matches, so standings and calendar reflect scores saved on the organizer side.
 */
export function DemoShowcase({ matches }: { matches: DemoMatch[] }) {
  const [tab, setTab] = useState<TabKey>('poules')

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-[0_24px_60px_-32px_rgba(26,26,24,0.22)]">
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold sm:text-xl">Tournoi démo</h3>
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-primary">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full rounded-full bg-primary opacity-75 motion-safe:animate-ping" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              En direct
            </div>
          </div>
          <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
            8 équipes · 2 poules
          </span>
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

      <div className="bg-secondary/30 p-5 sm:p-7">
        {tab === 'tirage' && <AnimatedDraw />}
        {tab === 'poules' && <GroupStandings groups={computeGroups(matches)} qualifiersPerGroup={DEMO_QUALIFIERS} />}
        {tab === 'calendrier' && <MatchesByRound matches={matches.map(toPublicMatch)} />}
        {tab === 'finale' && <Bracket matches={DEMO_KNOCKOUT} />}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Aperçu sur données d’exemple, avec les composants réels du produit.
        </p>
      </div>
    </div>
  )
}
