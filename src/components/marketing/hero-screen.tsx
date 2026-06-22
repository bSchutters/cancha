'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { cn } from '@/lib/utils'
import { HeroBracket } from './hero-bracket'

gsap.registerPlugin(useGSAP)

type Standing = { rank: number; name: string; pts: number; q: boolean }
type View = 'poules' | 'finale'

/**
 * Hero "screen" that alternates between the live pool standings and the knockout
 * tree (like the in-venue display cycling views). Auto-cycles, and the toggle
 * lets the visitor pin either view to see it in full. Each switch animates in
 * (staggered rows / bracket reveal). Static under reduced motion.
 */
export function HeroScreen({ standings }: { standings: Standing[] }) {
  const [view, setView] = useState<View>('poules')
  const [auto, setAuto] = useState(true)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!auto) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => setView((v) => (v === 'poules' ? 'finale' : 'poules')), 4800)
    return () => clearInterval(id)
  }, [auto])

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline()
        if (view === 'poules') {
          tl.from('.hs-row', { opacity: 0, x: -14, duration: 0.4, stagger: 0.06, ease: 'power3.out' })
        } else {
          tl.from('.hs-bracket', { opacity: 0, scale: 0.94, duration: 0.45, ease: 'back.out(1.4)' })
          tl.from('.hs-node', { opacity: 0, y: 8, duration: 0.3, stagger: 0.04, ease: 'power2.out' }, '-=0.25')
        }
      })
    },
    { scope: contentRef, dependencies: [view] },
  )

  const pick = (v: View) => {
    setAuto(false)
    setView(v)
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[0_12px_40px_-20px_rgba(26,26,24,0.18)]">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-2">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-full rounded-full bg-primary opacity-75 motion-safe:animate-ping" />
            <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
          </span>
          <span className="text-sm font-medium text-muted-foreground">En direct</span>
        </span>

        <div className="inline-flex gap-0.5 rounded-full border border-border bg-background p-0.5 text-xs">
          {(['poules', 'finale'] as View[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => pick(v)}
              aria-pressed={view === v}
              className={cn(
                'cursor-pointer rounded-full px-2.5 py-1 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
                view === v ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {v === 'poules' ? 'Poules' : 'Phase finale'}
            </button>
          ))}
        </div>
      </div>

      <div ref={contentRef} className="mt-4 min-h-[208px]">
        {view === 'poules' ? (
          <div>
            <div className="hs-row mb-2 text-xs text-muted-foreground">Poule A · Terrain 1</div>
            <div className="space-y-1">
              {standings.map((t) => (
                <div
                  key={t.name}
                  className={cn(
                    'hs-row flex items-center justify-between rounded-lg px-3 py-2 text-sm',
                    t.q && 'bg-primary/10',
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        'w-4 text-center font-semibold tabular-nums',
                        t.q ? 'text-primary' : 'text-muted-foreground',
                      )}
                    >
                      {t.rank}
                    </span>
                    <span className="font-medium">{t.name}</span>
                  </div>
                  <span className="font-semibold tabular-nums">{t.pts} pts</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-2 text-xs text-muted-foreground">Phase finale · arbre</div>
            <div className="hs-bracket mx-auto max-w-[300px] py-2">
              <HeroBracket />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
