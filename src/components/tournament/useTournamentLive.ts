'use client'

import { useEffect, useRef, useState } from 'react'
import type { PublicTournament } from '@/lib/tournament/public-view'

export interface TournamentLiveState {
  data: PublicTournament
  /** False once no successful refresh has happened for ~3 polling intervals. */
  online: boolean
}

/**
 * Polls the public tournament endpoint for near-live updates and tracks freshness.
 * Polling pauses while the tab is hidden to save mobile data (4G), and resumes
 * (with an immediate refresh) when the tab becomes visible again.
 */
export function useTournamentLiveState(
  slug: string,
  initial: PublicTournament,
  intervalMs = 20000,
): TournamentLiveState {
  const [data, setData] = useState<PublicTournament>(initial)
  const [online, setOnline] = useState(true)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)
  const watchdog = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastSuccess = useRef(0)

  useEffect(() => {
    let cancelled = false
    // Treat mount as the last successful refresh (initial data is server-fresh).
    lastSuccess.current = Date.now()
    // Consider the feed offline after ~3 missed intervals (min 30s).
    const staleMs = Math.max(intervalMs * 3, 30000)

    const fetchOnce = async () => {
      try {
        const res = await fetch(`/api/tournament/${slug}`, { cache: 'no-store' })
        if (!res.ok) return
        const body = await res.json()
        if (!cancelled && body?.data) {
          setData(body.data)
          lastSuccess.current = Date.now()
          setOnline(true)
        }
      } catch {
        // keep last-known state on network hiccups; the watchdog flips `online`.
      }
    }

    const start = () => {
      if (timer.current) return
      timer.current = setInterval(fetchOnce, intervalMs)
    }
    const stop = () => {
      if (timer.current) {
        clearInterval(timer.current)
        timer.current = null
      }
    }

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchOnce()
        start()
      } else {
        stop()
      }
    }

    start()
    // Watchdog recomputes freshness even when no new data arrives.
    watchdog.current = setInterval(() => {
      if (!cancelled) setOnline(Date.now() - lastSuccess.current < staleMs)
    }, 5000)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelled = true
      stop()
      if (watchdog.current) clearInterval(watchdog.current)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [slug, intervalMs])

  return { data, online }
}

/** Convenience wrapper returning just the live data (most consumers). */
export function useTournamentLive(
  slug: string,
  initial: PublicTournament,
  intervalMs = 20000,
): PublicTournament {
  return useTournamentLiveState(slug, initial, intervalMs).data
}
