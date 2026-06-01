import { rankAll, type RankingDepth } from './bracket'
import { buildSchedule, buildScheduleMaps } from './schedule'
import type { CourtConfig, DrawnGroup, QualifiedTeam, TimeParams } from './types'

export interface FormatInput {
  numGroups: number
  groupSize: number
  qualifiersPerGroup: number
  numCourts: number
  multiCourt: boolean
  timeParams: TimeParams
  finalsMatchDurationMin?: number | null
  finalsStartTime?: string | null
  depth: RankingDepth
}

export interface FeasibilityEstimate {
  teams: number
  totalMatches: number
  groupMatches: number
  finalsMatches: number
  /** HH:MM the last match finishes, or null if the format is degenerate. */
  endTime: string | null
}

function toMin(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}
function toHHMM(min: number): string {
  const t = ((min % 1440) + 1440) % 1440
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`
}

/**
 * Pure feasibility estimate for a tournament format: total matches and the
 * approximate finishing time, by materialising the whole schedule with
 * placeholder teams. Drives the admin warnings (e.g. "ranking everyone on 2
 * courts finishes ~19:00"). No DB access.
 */
export function estimateFeasibility(f: FormatInput): FeasibilityEstimate {
  const teams = f.numGroups * f.groupSize
  if (f.numGroups < 1 || f.groupSize < 2) {
    return { teams, totalMatches: 0, groupMatches: 0, finalsMatches: 0, endTime: null }
  }

  const groups: DrawnGroup[] = Array.from({ length: f.numGroups }, (_, gi) => ({
    label: String.fromCharCode(65 + (gi % 26)),
    teams: Array.from({ length: f.groupSize }, (_, i) => ({ id: gi * 1000 + i + 1, name: '' })),
  }))
  const courts: CourtConfig = { multiCourt: f.multiCourt, numCourts: f.numCourts, assignment: 'fixed' }
  const groupMatches = buildSchedule(groups, courts, f.timeParams, 1)

  const qpg = Math.min(f.qualifiersPerGroup, f.groupSize)
  const qualified: QualifiedTeam[] = groups.flatMap((g) =>
    g.teams.slice(0, qpg).map((t, r) => ({ teamId: t.id, teamName: '', group: g.label, rankInGroup: r + 1 })),
  )
  const nonQualified: QualifiedTeam[] = groups.flatMap((g) =>
    g.teams.slice(qpg).map((t, r) => ({ teamId: t.id, teamName: '', group: g.label, rankInGroup: qpg + r + 1 })),
  )
  const finals = rankAll(qualified, nonQualified, f.numGroups, qpg, f.depth)

  const { scheduleOf } = buildScheduleMaps(
    [
      ...groupMatches.map((m, i) => ({ id: `g${i}`, phase: 'group', round: m.round })),
      ...finals.map((b) => ({
        id: b.key,
        phase: b.phase,
        round: b.round,
        bracketLabel: b.bracketLabel,
        nextMatchId: b.nextMatchKey,
        loserNextMatchId: b.loserNextMatchKey,
      })),
    ],
    {
      timeParams: f.timeParams,
      finalsMatchDurationMin: f.finalsMatchDurationMin ?? null,
      multiCourt: f.multiCourt,
      numCourts: f.numCourts,
      finalsStartTime: f.finalsStartTime ?? null,
    },
  )

  const groupDur = f.timeParams.matchDurationMin
  const finalsDur =
    f.finalsMatchDurationMin && f.finalsMatchDurationMin > 0 ? f.finalsMatchDurationMin : f.timeParams.matchDurationMin
  let maxEnd = -1
  const consider = (time: string | null, dur: number) => {
    if (time) maxEnd = Math.max(maxEnd, toMin(time) + dur)
  }
  groupMatches.forEach((m, i) => consider(scheduleOf({ id: `g${i}`, phase: 'group', round: m.round }).time, groupDur))
  finals.forEach((b) => consider(scheduleOf({ id: b.key, phase: b.phase, round: b.round }).time, finalsDur))

  return {
    teams,
    totalMatches: groupMatches.length + finals.length,
    groupMatches: groupMatches.length,
    finalsMatches: finals.length,
    endTime: maxEnd >= 0 ? toHHMM(maxEnd) : null,
  }
}
