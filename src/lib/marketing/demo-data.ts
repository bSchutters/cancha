import type { PublicGroup, PublicMatch, PublicStanding } from '@/lib/tournament/public-view'

// Example tournament data shared by the demo's organizer and public views, so a
// score entered on the dashboard flows through to the public standings/calendar.
// It feeds the REAL public components (GroupStandings, MatchList, Bracket).

export const DEMO_QUALIFIERS = 2

export const POOL_TEAMS: Record<string, string[]> = {
  A: ['Real Sporting', 'AS Tonnerre', 'Les Lynx', 'FC Comète'],
  B: ['Olympic 7', 'Stade Central', 'Les Aigles', 'Dynamo Nord'],
}

export type DemoMatch = {
  code: string
  round: number
  time: string
  court: number
  pool: string
  home: string
  away: string
  hs: number
  as: number
  locked: boolean
}

export const INITIAL_DEMO_MATCHES: DemoMatch[] = [
  { code: 'A1', round: 1, time: '14:00', court: 1, pool: 'A', home: 'Real Sporting', away: 'FC Comète', hs: 5, as: 1, locked: true },
  { code: 'B1', round: 1, time: '14:00', court: 2, pool: 'B', home: 'Olympic 7', away: 'Dynamo Nord', hs: 3, as: 0, locked: true },
  { code: 'A2', round: 2, time: '14:30', court: 1, pool: 'A', home: 'AS Tonnerre', away: 'Les Lynx', hs: 2, as: 2, locked: true },
  { code: 'B2', round: 2, time: '14:30', court: 2, pool: 'B', home: 'Stade Central', away: 'Les Aigles', hs: 1, as: 1, locked: true },
  { code: 'A3', round: 3, time: '15:00', court: 1, pool: 'A', home: 'Real Sporting', away: 'AS Tonnerre', hs: 0, as: 0, locked: false },
  { code: 'B3', round: 3, time: '15:00', court: 2, pool: 'B', home: 'Olympic 7', away: 'Stade Central', hs: 0, as: 0, locked: false },
]

export function toPublicMatch(m: DemoMatch): PublicMatch {
  const finished = m.locked
  return {
    id: m.code,
    code: m.code,
    phase: 'group',
    groupLabel: m.pool,
    round: m.round,
    court: m.court,
    scheduledTime: m.time,
    bracketLabel: null,
    homeTeamId: null,
    awayTeamId: null,
    homeName: m.home,
    awayName: m.away,
    homeLogoUrl: null,
    awayLogoUrl: null,
    scoreHome: finished ? m.hs : null,
    scoreAway: finished ? m.as : null,
    penaltyWinner: null,
    penaltyHome: null,
    penaltyAway: null,
    refereeName: null,
    status: finished ? 'finished' : 'scheduled',
  }
}

/** Standings recomputed from the saved (locked) match scores, per pool. */
export function computeGroups(matches: DemoMatch[]): PublicGroup[] {
  return Object.entries(POOL_TEAMS).map(([label, names]) => {
    const acc = new Map<string, PublicStanding>()
    names.forEach((name, i) =>
      acc.set(name, {
        rank: 0,
        teamId: `${label}${i}`,
        teamName: name,
        logoUrl: null,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
      }),
    )
    for (const m of matches) {
      if (m.pool !== label || !m.locked) continue
      const h = acc.get(m.home)
      const a = acc.get(m.away)
      if (!h || !a) continue
      h.played++
      a.played++
      h.goalsFor += m.hs
      h.goalsAgainst += m.as
      a.goalsFor += m.as
      a.goalsAgainst += m.hs
      if (m.hs > m.as) {
        h.wins++
        h.points += 3
        a.losses++
      } else if (m.hs < m.as) {
        a.wins++
        a.points += 3
        h.losses++
      } else {
        h.draws++
        a.draws++
        h.points++
        a.points++
      }
    }
    const standings = [...acc.values()]
    standings.forEach((s) => (s.goalDifference = s.goalsFor - s.goalsAgainst))
    standings.sort(
      (x, y) =>
        y.points - x.points ||
        y.goalDifference - x.goalDifference ||
        y.goalsFor - x.goalsFor ||
        x.teamName.localeCompare(y.teamName),
    )
    standings.forEach((s, i) => (s.rank = i + 1))
    return { label, standings }
  })
}

// Static projections for places the demo doesn't recompute live.
export const DEMO_GROUP_MATCHES: PublicMatch[] = INITIAL_DEMO_MATCHES.map(toPublicMatch)

export const DEMO_KNOCKOUT: PublicMatch[] = [
  { id: 'k1', code: 'SF1', phase: 'knockout', groupLabel: null, round: 1, court: 1, scheduledTime: '15:45', bracketLabel: 'Demi-finale', homeTeamId: null, awayTeamId: null, homeName: 'Real Sporting', awayName: 'Stade Central', homeLogoUrl: null, awayLogoUrl: null, scoreHome: 2, scoreAway: 1, penaltyWinner: null, penaltyHome: null, penaltyAway: null, refereeName: null, status: 'finished' },
  { id: 'k2', code: 'SF2', phase: 'knockout', groupLabel: null, round: 1, court: 2, scheduledTime: '15:45', bracketLabel: 'Demi-finale', homeTeamId: null, awayTeamId: null, homeName: 'Olympic 7', awayName: 'AS Tonnerre', homeLogoUrl: null, awayLogoUrl: null, scoreHome: 1, scoreAway: 1, penaltyWinner: 'home', penaltyHome: 4, penaltyAway: 2, refereeName: null, status: 'finished' },
  { id: 'k3', code: 'F', phase: 'knockout', groupLabel: null, round: 2, court: 1, scheduledTime: '16:30', bracketLabel: 'Finale', homeTeamId: null, awayTeamId: null, homeName: 'Real Sporting', awayName: 'Olympic 7', homeLogoUrl: null, awayLogoUrl: null, scoreHome: null, scoreAway: null, penaltyWinner: null, penaltyHome: null, penaltyAway: null, refereeName: null, status: 'scheduled' },
]
