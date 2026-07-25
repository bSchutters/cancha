import type { Id } from './types'

/**
 * Serialize the generation actions of a single tournament.
 *
 * Draw / schedule / bracket generation all read the current state, then write —
 * so two calls racing each other can both pass the "does it already exist?"
 * check and duplicate a whole round. The realistic trigger is mundane: the same
 * organizer with two tabs open, or a double click, or a retried request.
 *
 * This is an in-process queue, so it does NOT protect against two concurrent
 * server instances; that would need a database lock. It removes the case that
 * actually happens in practice, and the existing "already exists" guards still
 * catch the rest.
 */
const chains = new Map<string, Promise<unknown>>()

export function withTournamentLock<T>(tournamentId: Id, fn: () => Promise<T>): Promise<T> {
  const key = String(tournamentId)
  const previous = chains.get(key) ?? Promise.resolve()
  // Run behind whatever is queued, whether it succeeded or failed: one caller's
  // error must not block the next.
  const result = previous.then(fn, fn)
  const chain = result.then(
    () => undefined,
    () => undefined,
  )
  chains.set(key, chain)
  // Drop the entry when this call is the last one queued, so the map does not
  // grow forever across tournaments.
  void chain.then(() => {
    if (chains.get(key) === chain) chains.delete(key)
  })
  return result
}
