// Shared domain types for the tournament engines (pure, no Payload coupling).

export type Id = number | string

export interface TeamRef {
  id: Id
  name: string
}

/** A team placed into a group by the draw. */
export interface GroupedTeam extends TeamRef {
  group: string // group label: 'A', 'B', ...
}

export interface DrawnGroup {
  label: string
  teams: TeamRef[]
}

export interface TimeParams {
  startTime: string // "HH:MM"
  matchDurationMin: number
  gapBetweenMatchesMin: number
  mealBreakStart?: string | null // "HH:MM"
  mealBreakDurationMin?: number
}

export interface CourtConfig {
  multiCourt: boolean
  numCourts: number
  assignment: 'fixed' | 'random'
}

/** A generated group-stage match (lockstep round model). */
export interface ScheduledMatch {
  phase: 'group'
  groupLabel: string
  round: number // 1-based global round
  court: number | null // null when single-court
  scheduledTime: string // "HH:MM"
  homeTeamId: Id
  awayTeamId: Id
}

/** A played (or partially played) group match used to compute standings. */
export interface MatchResult {
  homeTeamId: Id
  awayTeamId: Id
  scoreHome: number | null
  scoreAway: number | null
  fairplayWinner: 'home' | 'away' | 'none'
}

export interface Standing {
  teamId: Id
  teamName: string
  played: number
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  fairplayPoints: number
  rank: number
}

export interface QualifiedTeam {
  teamId: Id
  teamName: string
  group: string
  rankInGroup: number
}

export interface BracketMatch {
  /** Stable key within the generated bracket, e.g. 'KO-R1-M0'. */
  key: string
  phase: 'knockout' | 'classification'
  bracketLabel: string // 'Quart', 'Demi', 'Finale', 'Classement'…
  round: number // 1-based bracket round
  homeTeamId: Id | null
  awayTeamId: Id | null
  /** Source match keys when the team comes from a previous winner. */
  homeSourceKey: string | null
  awaySourceKey: string | null
  nextMatchKey: string | null
  nextSlot: 'home' | 'away' | null
  /** For semifinals feeding a 3rd-place match: where the LOSER goes. */
  loserNextMatchKey?: string | null
  loserNextSlot?: 'home' | 'away' | null
}
