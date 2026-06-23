'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useT } from '@/i18n/use-t'
import type { PublicGroup, PublicMatch } from '@/lib/tournament/public-view'
import { GroupStandings } from '@/components/tournament/GroupStandings'
import { MatchesByRound } from '@/components/tournament/MatchList'
import { AnimatedDraw } from './animated-draw'
import { DemoBracket } from './demo-bracket'
import { QUALIFIERS, type Step } from '@/lib/marketing/demo-engine'

type TabKey = 'tirage' | 'poules' | 'calendrier' | 'finale'

const TABS: { key: TabKey; labelKey: string }[] = [
  { key: 'tirage', labelKey: 'draw' },
  { key: 'poules', labelKey: 'pools' },
  { key: 'calendrier', labelKey: 'calendar' },
  { key: 'finale', labelKey: 'finals' },
]

function Pending({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center text-sm text-muted-foreground">
      {children}
    </div>
  )
}

/**
 * Public-facing view of the shared simulation, rendered with the REAL public
 * components. Reflects the organizer's progress (draw, calendar, scores) live.
 */
export function DemoShowcase({
  step,
  pools,
  groups,
  groupMatches,
  knockout,
}: {
  step: Step
  pools: { label: string; teams: string[] }[]
  groups: PublicGroup[]
  groupMatches: PublicMatch[]
  knockout: PublicMatch[]
}) {
  const tr = useT()
  const [tab, setTab] = useState<TabKey>(() =>
    step >= 3 ? 'finale' : step >= 2 ? 'calendrier' : step >= 1 ? 'tirage' : 'poules',
  )

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-[0_24px_60px_-32px_rgba(26,26,24,0.22)]">
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold sm:text-xl">{tr('demo.sandbox.title')}</h3>
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-primary">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full rounded-full bg-primary opacity-75 motion-safe:animate-ping" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              {tr('demo.sandbox.live')}
            </div>
          </div>
          <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
            {tr('demo.sandbox.summary')}
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
              {tr(`demo.sandbox.public.tab.${t.labelKey}`)}
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-secondary/30 p-5 sm:p-7">
        {tab === 'tirage' &&
          (step >= 1 ? (
            <AnimatedDraw pools={pools} />
          ) : (
            <Pending>{tr('demo.sandbox.public.pending.draw')}</Pending>
          ))}
        {tab === 'poules' &&
          (step >= 1 ? (
            <div>
              {groups.every((g) => g.standings.every((s) => s.played === 0)) && (
                <p className="mb-4 rounded-lg border border-border bg-card px-4 py-2 text-center text-xs text-muted-foreground">
                  {tr('demo.sandbox.public.pools.fillNote')}
                </p>
              )}
              <GroupStandings groups={groups} qualifiersPerGroup={QUALIFIERS} />
            </div>
          ) : (
            <Pending>{tr('demo.sandbox.public.pending.pools')}</Pending>
          ))}
        {tab === 'calendrier' &&
          (step >= 2 ? (
            <MatchesByRound matches={groupMatches} />
          ) : (
            <Pending>{tr('demo.sandbox.public.pending.calendar')}</Pending>
          ))}
        {tab === 'finale' &&
          (step >= 3 ? (
            <div className="mx-auto max-w-md py-2">
              <DemoBracket matches={knockout} />
            </div>
          ) : (
            <Pending>{tr('demo.sandbox.public.pending.finals')}</Pending>
          ))}

        <p className="mt-6 text-center text-xs text-muted-foreground">{tr('demo.sandbox.public.footnote')}</p>
      </div>
    </div>
  )
}
