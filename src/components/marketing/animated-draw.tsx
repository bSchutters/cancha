'use client'

import { useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { display } from './theme'

gsap.registerPlugin(useGSAP)

/** Animated reveal of the drawn pools (the real draw result). */
export function AnimatedDraw({ pools }: { pools: { label: string; teams: string[] }[] }) {
  const root = useRef<HTMLDivElement>(null)
  const [replay, setReplay] = useState(0)

  const { contextSafe } = useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.draw-chip', {
          opacity: 0,
          y: 14,
          scale: 0.9,
          duration: 0.45,
          ease: 'back.out(1.6)',
          stagger: { each: 0.05, from: 'start' },
        })
      })
    },
    { scope: root, dependencies: [replay, pools] },
  )

  const rejouer = contextSafe(() => setReplay((r) => r + 1))

  return (
    <div ref={root}>
      <div className="flex items-center justify-between">
        <span style={display} className="font-medium">
          Tirage des poules
        </span>
        <Button size="sm" variant="secondary" onClick={rejouer}>
          <RotateCcw className="size-4" />
          Rejouer l’animation
        </Button>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {pools.map((pool) => (
          <div key={pool.label} className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-3 text-sm font-medium text-primary">Poule {pool.label}</div>
            <div className="space-y-2">
              {pool.teams.map((t) => (
                <div
                  key={t}
                  className="draw-chip flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  <span className="size-1.5 rounded-full bg-primary/50" />
                  <span className="truncate font-medium">{t}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
