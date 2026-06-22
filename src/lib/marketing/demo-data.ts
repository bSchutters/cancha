import type { PublicGroup, PublicMatch } from '@/lib/tournament/public-view'

// Example tournament data for the interactive preview. It feeds the REAL public
// components (GroupStandings, MatchList, Bracket) so the preview matches the
// actual product UI. Values are illustrative.

export const DEMO_QUALIFIERS = 2

export const DEMO_GROUPS: PublicGroup[] = [
  {
    label: 'A',
    standings: [
      { rank: 1, teamId: 'a1', teamName: 'Real Sporting', logoUrl: null, played: 3, wins: 3, draws: 0, losses: 0, goalsFor: 9, goalsAgainst: 2, goalDifference: 7, points: 9 },
      { rank: 2, teamId: 'a2', teamName: 'AS Tonnerre', logoUrl: null, played: 3, wins: 2, draws: 0, losses: 1, goalsFor: 6, goalsAgainst: 4, goalDifference: 2, points: 6 },
      { rank: 3, teamId: 'a3', teamName: 'Les Lynx', logoUrl: null, played: 3, wins: 1, draws: 0, losses: 2, goalsFor: 3, goalsAgainst: 4, goalDifference: -1, points: 3 },
      { rank: 4, teamId: 'a4', teamName: 'FC Comète', logoUrl: null, played: 3, wins: 0, draws: 0, losses: 3, goalsFor: 1, goalsAgainst: 9, goalDifference: -8, points: 0 },
    ],
  },
  {
    label: 'B',
    standings: [
      { rank: 1, teamId: 'b1', teamName: 'Olympic 7', logoUrl: null, played: 3, wins: 2, draws: 1, losses: 0, goalsFor: 7, goalsAgainst: 3, goalDifference: 4, points: 7 },
      { rank: 2, teamId: 'b2', teamName: 'Stade Central', logoUrl: null, played: 3, wins: 1, draws: 2, losses: 0, goalsFor: 5, goalsAgainst: 4, goalDifference: 1, points: 5 },
      { rank: 3, teamId: 'b3', teamName: 'Les Aigles', logoUrl: null, played: 3, wins: 1, draws: 1, losses: 1, goalsFor: 4, goalsAgainst: 4, goalDifference: 0, points: 4 },
      { rank: 4, teamId: 'b4', teamName: 'Dynamo Nord', logoUrl: null, played: 3, wins: 0, draws: 1, losses: 2, goalsFor: 2, goalsAgainst: 7, goalDifference: -5, points: 1 },
    ],
  },
]

function gm(p: Partial<PublicMatch> & { id: string }): PublicMatch {
  return {
    code: '',
    phase: 'group',
    groupLabel: null,
    round: null,
    court: null,
    scheduledTime: null,
    bracketLabel: null,
    homeTeamId: null,
    awayTeamId: null,
    homeName: null,
    awayName: null,
    homeLogoUrl: null,
    awayLogoUrl: null,
    scoreHome: null,
    scoreAway: null,
    penaltyWinner: null,
    penaltyHome: null,
    penaltyAway: null,
    refereeName: null,
    status: 'scheduled',
    ...p,
  }
}

export const DEMO_GROUP_MATCHES: PublicMatch[] = [
  gm({ id: 'g1', code: 'A1', groupLabel: 'A', round: 1, court: 1, scheduledTime: '14:00', homeName: 'Real Sporting', awayName: 'FC Comète', scoreHome: 5, scoreAway: 1, status: 'finished' }),
  gm({ id: 'g2', code: 'B1', groupLabel: 'B', round: 1, court: 2, scheduledTime: '14:00', homeName: 'Olympic 7', awayName: 'Dynamo Nord', scoreHome: 3, scoreAway: 0, status: 'finished' }),
  gm({ id: 'g3', code: 'A2', groupLabel: 'A', round: 2, court: 1, scheduledTime: '14:30', homeName: 'AS Tonnerre', awayName: 'Les Lynx', scoreHome: 2, scoreAway: 2, status: 'finished' }),
  gm({ id: 'g4', code: 'B2', groupLabel: 'B', round: 2, court: 2, scheduledTime: '14:30', homeName: 'Stade Central', awayName: 'Les Aigles', scoreHome: 1, scoreAway: 1, status: 'finished' }),
  gm({ id: 'g5', code: 'A3', groupLabel: 'A', round: 3, court: 1, scheduledTime: '15:00', homeName: 'Real Sporting', awayName: 'AS Tonnerre', refereeName: 'M. Dubois' }),
  gm({ id: 'g6', code: 'B3', groupLabel: 'B', round: 3, court: 2, scheduledTime: '15:00', homeName: 'Olympic 7', awayName: 'Stade Central' }),
]

export const DEMO_KNOCKOUT: PublicMatch[] = [
  gm({ id: 'k1', code: 'SF1', phase: 'knockout', bracketLabel: 'Demi-finale', round: 1, court: 1, scheduledTime: '15:45', homeName: 'Real Sporting', awayName: 'Stade Central', scoreHome: 2, scoreAway: 1, status: 'finished' }),
  gm({ id: 'k2', code: 'SF2', phase: 'knockout', bracketLabel: 'Demi-finale', round: 1, court: 2, scheduledTime: '15:45', homeName: 'Olympic 7', awayName: 'AS Tonnerre', scoreHome: 1, scoreAway: 1, penaltyWinner: 'home', penaltyHome: 4, penaltyAway: 2, status: 'finished' }),
  gm({ id: 'k3', code: 'F', phase: 'knockout', bracketLabel: 'Finale', round: 2, court: 1, scheduledTime: '16:30', homeName: 'Real Sporting', awayName: 'Olympic 7' }),
]
