import type { Id, TeamRef } from './types'
import type { Rng } from './rng'

/** A played Swiss match. `awayTeamId === null` means the home team had a bye. */
export interface SwissMatchResult {
  homeTeamId: Id
  awayTeamId: Id | null
  scoreHome: number | null
  scoreAway: number | null
}

/** A pairing for the next round. `away === null` is a bye (a free win). */
export interface SwissPairing {
  home: Id
  away: Id | null
}

type Scoring = { win: number; draw: number; loss: number }

const pairKey = (a: Id, b: Id) => [String(a), String(b)].sort().join('|')

/** Points each team has so far (byes count as a win). */
function pointsByTeam(played: readonly SwissMatchResult[], scoring: Scoring): Map<Id, number> {
  const pts = new Map<Id, number>()
  const add = (id: Id, p: number) => pts.set(id, (pts.get(id) ?? 0) + p)
  for (const m of played) {
    if (m.awayTeamId == null) {
      add(m.homeTeamId, scoring.win) // bye
      continue
    }
    if (m.scoreHome == null || m.scoreAway == null) {
      // Not played yet: register both teams at 0 so they appear in the table.
      if (!pts.has(m.homeTeamId)) pts.set(m.homeTeamId, 0)
      if (!pts.has(m.awayTeamId)) pts.set(m.awayTeamId, 0)
      continue
    }
    if (m.scoreHome > m.scoreAway) {
      add(m.homeTeamId, scoring.win)
      add(m.awayTeamId, scoring.loss)
    } else if (m.scoreAway > m.scoreHome) {
      add(m.awayTeamId, scoring.win)
      add(m.homeTeamId, scoring.loss)
    } else {
      add(m.homeTeamId, scoring.draw)
      add(m.awayTeamId, scoring.draw)
    }
  }
  return pts
}

/**
 * Pair the next Swiss round: order teams by current points (ties broken randomly
 * so equal-score teams don't always meet in registration order), then greedily
 * pair adjacent teams, skipping any pair that has already met (falling back to a
 * rematch only if unavoidable). With an odd field, the lowest-ranked team that
 * hasn't had a bye yet gets one.
 */
export function pairSwissRound(
  teams: readonly TeamRef[],
  played: readonly SwissMatchResult[],
  scoring: Scoring,
  rng: Rng,
): SwissPairing[] {
  const points = pointsByTeam(played, scoring)
  for (const t of teams) if (!points.has(t.id)) points.set(t.id, 0)

  const alreadyMet = new Set<string>()
  const hadBye = new Set<Id>()
  for (const m of played) {
    if (m.awayTeamId == null) hadBye.add(m.homeTeamId)
    else alreadyMet.add(pairKey(m.homeTeamId, m.awayTeamId))
  }

  // Order: points desc, then a stable random key for equal scores.
  const jitter = new Map<Id, number>(teams.map((t) => [t.id, rng()]))
  const ordered = [...teams].sort(
    (a, b) => (points.get(b.id) ?? 0) - (points.get(a.id) ?? 0) || (jitter.get(a.id)! - jitter.get(b.id)!),
  )

  const pairings: SwissPairing[] = []
  const pool = [...ordered]

  // Odd field → give a bye to the lowest-ranked team without one yet.
  if (pool.length % 2 === 1) {
    let idx = -1
    for (let i = pool.length - 1; i >= 0; i--) {
      if (!hadBye.has(pool[i].id)) {
        idx = i
        break
      }
    }
    if (idx === -1) idx = pool.length - 1 // everyone had a bye: lowest gets a second
    const [bye] = pool.splice(idx, 1)
    pairings.push({ home: bye.id, away: null })
  }

  while (pool.length > 0) {
    const a = pool.shift()!
    let j = pool.findIndex((b) => !alreadyMet.has(pairKey(a.id, b.id)))
    if (j === -1) j = 0 // all remaining already met → unavoidable rematch
    const [b] = pool.splice(j, 1)
    pairings.push({ home: a.id, away: b.id })
  }
  return pairings
}
