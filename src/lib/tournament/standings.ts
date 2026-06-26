import type { Id, MatchResult, Standing, TeamRef } from './types'
import { futsal, type SportProfile } from '../sport'

function blankStanding(team: TeamRef): Standing {
  return {
    teamId: team.id,
    teamName: team.name,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
    fairplayPoints: 0,
    rank: 0,
  }
}

function isPlayed(m: MatchResult): boolean {
  return typeof m.scoreHome === 'number' && typeof m.scoreAway === 'number'
}

/** Head-to-head mini-table among a set of tied teams (their common matches only). */
function headToHead(
  tied: Standing[],
  results: readonly MatchResult[],
  scoring: SportProfile['scoring'],
): Map<Id, { points: number; gd: number; gf: number }> {
  const ids = new Set(tied.map((s) => s.teamId))
  const mini = new Map<Id, { points: number; gd: number; gf: number }>()
  tied.forEach((s) => mini.set(s.teamId, { points: 0, gd: 0, gf: 0 }))

  for (const m of results) {
    if (!isPlayed(m)) continue
    if (!ids.has(m.homeTeamId) || !ids.has(m.awayTeamId)) continue
    const h = mini.get(m.homeTeamId)!
    const a = mini.get(m.awayTeamId)!
    const sh = m.scoreHome as number
    const sa = m.scoreAway as number
    h.gf += sh
    a.gf += sa
    h.gd += sh - sa
    a.gd += sa - sh
    if (sh > sa) {
      h.points += scoring.win
      a.points += scoring.loss
    } else if (sa > sh) {
      a.points += scoring.win
      h.points += scoring.loss
    } else {
      h.points += scoring.draw
      a.points += scoring.draw
    }
  }
  return mini
}

/**
 * Compute a group standing with the agreed cascade:
 *   points → goal difference → head-to-head → fair-play points.
 * Points come from the sport profile (futsal = 3-1-0 by default). Teams still
 * tied after fair-play are left equal (penalties resolved on site).
 *
 * Head-to-head is a mini-table over the tied teams' common matches and handles
 * 3+ way ties correctly.
 */
export function computeStandings(
  teams: readonly TeamRef[],
  results: readonly MatchResult[],
  profile: SportProfile = futsal,
): Standing[] {
  const { scoring } = profile
  const table = new Map<Id, Standing>()
  teams.forEach((t) => table.set(t.id, blankStanding(t)))

  for (const m of results) {
    if (!isPlayed(m)) continue
    const home = table.get(m.homeTeamId)
    const away = table.get(m.awayTeamId)
    if (!home || !away) continue
    const sh = m.scoreHome as number
    const sa = m.scoreAway as number

    home.played++
    away.played++
    home.goalsFor += sh
    home.goalsAgainst += sa
    away.goalsFor += sa
    away.goalsAgainst += sh

    if (sh > sa) {
      home.wins++
      away.losses++
      home.points += scoring.win
      away.points += scoring.loss
    } else if (sa > sh) {
      away.wins++
      home.losses++
      away.points += scoring.win
      home.points += scoring.loss
    } else {
      home.draws++
      away.draws++
      home.points += scoring.draw
      away.points += scoring.draw
    }

    if (m.fairplayWinner === 'home') home.fairplayPoints++
    else if (m.fairplayWinner === 'away') away.fairplayPoints++
  }

  table.forEach((s) => {
    s.goalDifference = s.goalsFor - s.goalsAgainst
  })

  // Primary sort: points, then goal difference.
  const sorted = [...table.values()].sort(
    (a, b) => b.points - a.points || b.goalDifference - a.goalDifference,
  )

  // Resolve tie-groups (equal points AND goal difference) by head-to-head, then fair-play.
  const resolved: Standing[] = []
  let i = 0
  while (i < sorted.length) {
    let j = i + 1
    while (
      j < sorted.length &&
      sorted[j].points === sorted[i].points &&
      sorted[j].goalDifference === sorted[i].goalDifference
    ) {
      j++
    }
    const tie = sorted.slice(i, j)
    if (tie.length > 1) {
      const h2h = headToHead(tie, results, scoring)
      tie.sort((a, b) => {
        const ha = h2h.get(a.teamId)!
        const hb = h2h.get(b.teamId)!
        return (
          hb.points - ha.points ||
          hb.gd - ha.gd ||
          hb.gf - ha.gf ||
          b.fairplayPoints - a.fairplayPoints
        )
      })
    }
    resolved.push(...tie)
    i = j
  }

  resolved.forEach((s, idx) => {
    s.rank = idx + 1
  })
  return resolved
}
