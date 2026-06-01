import type { Id, MatchResult, TeamRef } from './types'

export interface FairplayEntry {
  teamId: Id
  teamName: string
  fairplayPoints: number
  rank: number
}

/**
 * Tournament-wide fair-play ranking: 1 point to the designated team per match
 * (0-0 when `fairplayWinner === 'none'`). Used for the fair-play trophy.
 *
 * ⚠️ Admin/private use only - must never be exposed publicly before the
 * tournament is finished.
 */
export function fairplayRanking(
  teams: readonly TeamRef[],
  results: readonly MatchResult[],
): FairplayEntry[] {
  const points = new Map<Id, number>()
  teams.forEach((t) => points.set(t.id, 0))

  for (const m of results) {
    if (m.fairplayWinner === 'home') points.set(m.homeTeamId, (points.get(m.homeTeamId) ?? 0) + 1)
    else if (m.fairplayWinner === 'away') points.set(m.awayTeamId, (points.get(m.awayTeamId) ?? 0) + 1)
  }

  const ranked = teams
    .map((t) => ({ teamId: t.id, teamName: t.name, fairplayPoints: points.get(t.id) ?? 0, rank: 0 }))
    .sort((a, b) => b.fairplayPoints - a.fairplayPoints)

  ranked.forEach((e, idx) => {
    e.rank = idx + 1
  })
  return ranked
}
