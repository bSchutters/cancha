'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Dices, Trophy, RotateCcw, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PublicTournament } from '@/lib/tournament/public-view'
import { useTournamentLive } from './useTournamentLive'

type DrawTeam = { id: string; name: string; logoUrl: string | null }
type Pool = { label: string; teams: DrawTeam[] }
type RevealEntry = { team: DrawTeam; poolIndex: number }

// Slot-machine flicker before a team settles.
const FLICKER_MS = 1100
const FLICKER_TICK_MS = 75
// How long the settled team stays centre-stage before it drops into its pool.
const REVEAL_HOLD_MS = 1400
// Gap between one team landing and the next flicker starting (auto mode only).
const LAND_GAP_MS = 450

function nowMs(): number {
  // performance.now() avoids the Date.now() purity rule and is monotonic.
  return typeof performance !== 'undefined' ? performance.now() : 0
}

function sleep(ms: number, signal: { cancelled: boolean }): Promise<void> {
  return new Promise((resolve) => {
    const id = setTimeout(resolve, ms)
    const check = setInterval(() => {
      if (signal.cancelled) {
        clearTimeout(id)
        clearInterval(check)
        resolve()
      }
    }, 40)
    setTimeout(() => clearInterval(check), ms)
  })
}

function TeamLogo({ team, size }: { team: DrawTeam; size: number }) {
  return (
    <span className="relative shrink-0" style={{ height: size, width: size }}>
      <Image
        src={team.logoUrl ?? '/assets/images/svg/teams/default.svg'}
        alt=""
        fill
        sizes={`${size}px`}
        unoptimized
        className="object-contain"
      />
    </span>
  )
}

export function TvDraw({
  slug,
  initial,
  mode = 'auto',
}: {
  slug: string
  initial: PublicTournament
  mode?: 'auto' | 'manual'
}) {
  const data = useTournamentLive(slug, initial, 8000)
  const router = useRouter()

  // End of draw: reveal the pools publicly, then show the standings on the TV.
  const revealAndShow = useCallback(async () => {
    try {
      await fetch(`/api/tournaments/${initial.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ draw_revealed: true }),
      })
    } catch {
      // ignored: a public screen without a manager session just navigates
    }
    router.push(`/${slug}/tv`)
  }, [initial.id, router, slug])

  const pools: Pool[] = useMemo(
    () =>
      data.groups.map((g) => ({
        label: g.label,
        teams: g.standings.map((s) => ({
          id: String(s.teamId),
          name: s.teamName,
          logoUrl: s.logoUrl,
        })),
      })),
    [data.groups],
  )

  // Lockstep reveal order: one team per pool, round by round (A1, B1, C1, D1, A2…).
  const order: RevealEntry[] = useMemo(() => {
    const out: RevealEntry[] = []
    const maxLen = pools.reduce((m, p) => Math.max(m, p.teams.length), 0)
    for (let slot = 0; slot < maxLen; slot++) {
      pools.forEach((p, poolIndex) => {
        const team = p.teams[slot]
        if (team) out.push({ team, poolIndex })
      })
    }
    return out
  }, [pools])

  const drawn = pools.length > 0

  const [phase, setPhase] = useState<'idle' | 'running' | 'done'>('idle')
  // Teams that have landed in their pool so far.
  const [landed, setLanded] = useState(0)
  // The currently-revealing entry (flickering then settling), or null between reveals.
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [flickerTeam, setFlickerTeam] = useState<DrawTeam | null>(null)
  const [settled, setSettled] = useState(false)

  // Invalidates any in-flight ceremony loop on replay/unmount.
  const runIdRef = useRef(0)
  // In manual mode, the driver awaits this resolver before each reveal.
  const nextResolverRef = useRef<(() => void) | null>(null)

  const advance = () => {
    const r = nextResolverRef.current
    if (r) {
      nextResolverRef.current = null
      r()
    }
  }

  const waitForNext = useCallback(
    (signal: { cancelled: boolean }) =>
      new Promise<void>((resolve) => {
        if (mode === 'auto') {
          resolve()
          return
        }
        let done = false
        const state: { check?: ReturnType<typeof setInterval> } = {}
        const finish = () => {
          if (done) return
          done = true
          if (state.check) clearInterval(state.check)
          resolve()
        }
        nextResolverRef.current = finish
        state.check = setInterval(() => {
          if (signal.cancelled) finish()
        }, 40)
      }),
    [mode],
  )

  const start = useCallback(() => {
    const myRun = ++runIdRef.current
    const signal = { cancelled: false }
    setLanded(0)
    setActiveIndex(null)
    setFlickerTeam(null)
    setSettled(false)
    setPhase('running')

    ;(async () => {
      for (let i = 0; i < order.length; i++) {
        if (signal.cancelled || runIdRef.current !== myRun) return

        // Manual mode: wait for the presenter to hit "Suivante" before each team.
        await waitForNext(signal)
        if (signal.cancelled || runIdRef.current !== myRun) return

        const entry = order[i]
        setActiveIndex(i)
        setSettled(false)

        // Slot-machine flicker through the remaining (not-yet-placed) teams.
        const remaining = order.slice(i).map((e) => e.team)
        const flickerEnd = nowMs() + FLICKER_MS
        let f = 0
        while (nowMs() < flickerEnd) {
          if (signal.cancelled || runIdRef.current !== myRun) return
          setFlickerTeam(remaining[f % remaining.length])
          f++
          await sleep(FLICKER_TICK_MS, signal)
        }

        // Settle on the real team.
        setFlickerTeam(entry.team)
        setSettled(true)
        await sleep(REVEAL_HOLD_MS, signal)
        if (signal.cancelled || runIdRef.current !== myRun) return

        // Drop it into its pool.
        setLanded(i + 1)
        setActiveIndex(null)
        setFlickerTeam(null)
        setSettled(false)
        if (mode === 'auto') await sleep(LAND_GAP_MS, signal)
      }

      if (signal.cancelled || runIdRef.current !== myRun) return
      setPhase('done')
    })()
  }, [order, mode, waitForNext])

  // Cancel any running ceremony on unmount.
  useEffect(() => () => void runIdRef.current++, [])

  const activeEntry = activeIndex != null ? order[activeIndex] : null
  const incomingPool = activeEntry ? activeEntry.poolIndex : null
  const displayTeam = flickerTeam ?? activeEntry?.team ?? null

  // Teams placed in each pool so far.
  const placedByPool: DrawTeam[][] = useMemo(() => {
    const out: DrawTeam[][] = pools.map(() => [])
    const count = phase === 'idle' ? 0 : phase === 'done' ? order.length : landed
    for (let i = 0; i < count; i++) {
      const e = order[i]
      if (e) out[e.poolIndex].push(e.team)
    }
    return out
  }, [pools, order, phase, landed])

  const gridCols = pools.length <= 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2 lg:grid-cols-4'
  const waitingForManual =
    phase === 'running' && mode === 'manual' && activeIndex === null && landed < order.length

  return (
    <main className="relative flex h-screen flex-col overflow-hidden bg-background p-10 text-foreground">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-lg font-semibold uppercase tracking-widest text-primary">Tirage au sort</p>
          <h1 className="text-4xl font-bold">{data.name}</h1>
        </div>
        {phase === 'running' && (
          <div className="text-2xl font-bold tabular-nums text-muted-foreground">
            {landed} <span className="text-muted-foreground">/ {order.length}</span>
          </div>
        )}
      </header>

      {/* Center stage */}
      <div className="relative mb-8 flex h-44 items-center justify-center">
        {!drawn && <p className="text-3xl text-muted-foreground">En attente du tirage des poules…</p>}

        {drawn && phase === 'idle' && (
          <Button
            onClick={start}
            className="h-auto gap-3 rounded-lg bg-primary px-8 py-4 text-2xl font-bold text-primary-foreground shadow-lg transition-transform hover:scale-105 hover:bg-primary/90"
          >
            <Dices className="size-7" /> Lancer le tirage
          </Button>
        )}

        {waitingForManual && (
          <Button
            onClick={advance}
            className="h-auto animate-pulse gap-3 rounded-lg bg-primary px-8 py-4 text-2xl font-bold text-primary-foreground shadow-lg hover:scale-105 hover:bg-primary/90"
          >
            <ChevronRight className="size-7" /> {landed === 0 ? 'Premier tirage' : 'Équipe suivante'}
          </Button>
        )}

        {displayTeam && (
          <div
            className={`flex items-center gap-6 rounded-lg border px-12 py-6 transition-all duration-200 ${
              settled
                ? 'animate-in border-primary bg-primary/20 zoom-in-95 duration-300'
                : 'border-primary/30 bg-primary/5'
            }`}
          >
            <TeamLogo team={displayTeam} size={120} />
            <div>
              <p className={`text-5xl font-bold transition-opacity ${settled ? 'opacity-100' : 'opacity-70'}`}>
                {displayTeam.name}
              </p>
              <p className="mt-1 text-2xl font-semibold text-primary">
                {settled && activeEntry ? `Poule ${pools[activeEntry.poolIndex].label}` : '…'}
              </p>
            </div>
          </div>
        )}

        {phase === 'done' && (
          <div className="flex animate-in flex-col items-center gap-4 fade-in zoom-in-95 duration-700">
            <p className="flex items-center gap-3 text-5xl font-bold text-primary">
              <Trophy className="h-12 w-12" /> Tirage terminé !
            </p>
            <div className="flex gap-3">
              <Button
                onClick={revealAndShow}
                className="h-auto rounded-full bg-primary px-6 py-3 text-lg font-bold text-primary-foreground hover:bg-primary/90"
              >
                Dévoiler les poules &amp; afficher
              </Button>
              <Button
                variant="outline"
                onClick={start}
                className="h-auto gap-2 rounded-full border-border bg-transparent px-6 py-3 text-lg font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <RotateCcw className="size-5" /> Rejouer
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Pools */}
      {drawn ? (
        <div className={`grid min-h-0 flex-1 content-start gap-5 ${gridCols}`}>
          {pools.map((pool, poolIndex) => {
            const placed = placedByPool[poolIndex]
            const incoming = incomingPool === poolIndex && activeEntry != null
            return (
              <div
                key={pool.label}
                className={`flex flex-col rounded-lg border bg-card p-4 transition-all duration-300 ${
                  incoming ? 'border-primary ring-2 ring-ring/50' : 'border-border'
                }`}
              >
                <h3 className="mb-3 text-2xl font-bold">Poule {pool.label}</h3>
                <ul className="space-y-2">
                  {pool.teams.map((team, slot) => {
                    const isPlaced = slot < placed.length
                    return (
                      <li
                        key={team.id}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xl ${
                          isPlaced
                            ? 'animate-in bg-muted fade-in slide-in-from-bottom-2 duration-500'
                            : 'opacity-25'
                        }`}
                      >
                        <span className="w-5 shrink-0 text-base font-semibold text-muted-foreground">{slot + 1}</span>
                        {isPlaced ? (
                          <>
                            <TeamLogo team={team} size={32} />
                            <span className="truncate font-medium">{team.name}</span>
                          </>
                        ) : (
                          <span className="h-8 flex-1 rounded-sm bg-card" />
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </div>
      ) : (
        /* Waiting: show the pot of registered teams */
        <div className="grid min-h-0 flex-1 grid-cols-3 content-start gap-3 overflow-hidden lg:grid-cols-4">
          {data.teams.map((team) => (
            <div
              key={String(team.id)}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-xl"
            >
              <TeamLogo team={{ id: String(team.id), name: team.name, logoUrl: team.logoUrl }} size={32} />
              <span className="truncate font-medium">{team.name}</span>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
