'use client'

import { useCallback, useSyncExternalStore } from 'react'

/**
 * Remembers the team a spectator follows, per tournament, in localStorage
 * (no login on the public site). Backed by useSyncExternalStore so it is
 * SSR-safe (server snapshot = null) and reacts to changes in this and other tabs.
 */
export function useFollowedTeam(slug: string): [string | null, (id: string | null) => void] {
  const key = `cup:follow:${slug}`

  const subscribe = useCallback(
    (onChange: () => void) => {
      const handler = (e: StorageEvent) => {
        if (e.key === key) onChange()
      }
      window.addEventListener('storage', handler)
      return () => window.removeEventListener('storage', handler)
    },
    [key],
  )

  const getSnapshot = useCallback(() => {
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  }, [key])

  const teamId = useSyncExternalStore(subscribe, getSnapshot, () => null)

  const set = useCallback(
    (id: string | null) => {
      try {
        if (id) localStorage.setItem(key, id)
        else localStorage.removeItem(key)
      } catch {
        // ignore (privacy mode)
      }
      // The native "storage" event does not fire in the tab that made the change,
      // so notify our own subscribers to re-read immediately.
      window.dispatchEvent(new StorageEvent('storage', { key }))
    },
    [key],
  )

  return [teamId, set]
}
