'use client'

import { useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { Dices } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { display } from './theme'

gsap.registerPlugin(useGSAP)

const TEAMS = [
  'Real Sporting',
  'AS Tonnerre',
  'Les Lynx',
  'FC Comète',
  'Olympic 7',
  'Stade Central',
  'Les Aigles',
  'Dynamo Nord',
  'Étoile Sud',
  'US Vaillante',
  'Les Panthères',
  'Racing Est',
  'FC Horizon',
  'Les Faucons',
  'Atlético Parc',
  'Union Libre',
]
const POOL_NAMES = ['Poule A', 'Poule B', 'Poule C', 'Poule D']

function distribute(teams: string[]): string[][] {
  const pools: string[][] = [[], [], [], []]
  teams.forEach((t, i) => pools[i % 4].push(t))
  return pools
}

function shuffle(arr: string[]): string[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Animated pool draw: teams drop into their group with a staggered reveal. */
export function AnimatedDraw() {
  const root = useRef<HTMLDivElement>(null)
  const [order, setOrder] = useState<string[]>(TEAMS)
  const pools = distribute(order)

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
          stagger: { each: 0.045, from: 'start' },
        })
      })
    },
    { scope: root, dependencies: [order], revertOnUpdate: true },
  )

  const replay = contextSafe(() => setOrder(shuffle(TEAMS)))

  return (
    <div ref={root}>
      <div className="flex items-center justify-between">
        <span style={display} className="font-medium">
          Tirage des poules
        </span>
        <Button size="sm" variant="secondary" onClick={replay}>
          <Dices className="size-4" />
          Relancer le tirage
        </Button>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {pools.map((teams, pi) => (
          <div key={pi} className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-3 text-sm font-medium text-primary">{POOL_NAMES[pi]}</div>
            <div className="space-y-2">
              {teams.map((t) => (
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
