import type { PublicGroup, PublicMatch, PublicStanding } from '@/lib/tournament/public-view'

// A small, coherent end-to-end tournament simulation for the interactive demo.
// One source of truth (teams + step + matches): registrations -> draw -> schedule
// -> scores -> standings -> knockout -> finished. Shared by the organizer and
// public views so everything stays in sync.

export type Pool = 'A' | 'B'
export type Step = 0 | 1 | 2 | 3 | 4 // inscriptions, tirage, calendrier, phase finale, terminé

export type DemoTeam = { id: number; name: string; pool: Pool | null; confirmed: boolean; paid: boolean }
export type DemoMatch = {
  id: string
  code: string
  phase: 'group' | 'knockout'
  bracketLabel: string | null
  round: number
  time: string
  court: number
  pool: Pool | null
  homeId: number | null
  awayId: number | null
  hs: number
  as: number
  locked: boolean
}

export const QUALIFIERS = 2
export const POOLS: Pool[] = ['A', 'B']
const START = ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30']

export const INITIAL_TEAMS: DemoTeam[] = [
  { id: 1, name: 'Real Sporting', pool: null, confirmed: true, paid: true },
  { id: 2, name: 'AS Tonnerre', pool: null, confirmed: true, paid: true },
  { id: 3, name: 'Les Lynx', pool: null, confirmed: true, paid: false },
  { id: 4, name: 'Olympic 7', pool: null, confirmed: true, paid: true },
  { id: 5, name: 'Stade Central', pool: null, confirmed: true, paid: true },
  { id: 6, name: 'Les Aigles', pool: null, confirmed: true, paid: false },
  { id: 7, name: 'FC Comète', pool: null, confirmed: true, paid: true },
  { id: 8, name: 'Dynamo Nord', pool: null, confirmed: true, paid: false },
]

export const nameById = (teams: DemoTeam[], id: number | null): string | null =>
  id == null ? null : (teams.find((t) => t.id === id)?.name ?? null)

/** Draw: spread confirmed teams across pools A/B, alternating. */
export function drawPools(teams: DemoTeam[]): DemoTeam[] {
  let i = 0
  return teams.map((t) => {
    if (!t.confirmed) return { ...t, pool: null }
    const pool: Pool = i % 2 === 0 ? 'A' : 'B'
    i++
    return { ...t, pool }
  })
}

function poolIds(teams: DemoTeam[], pool: Pool): number[] {
  return teams.filter((t) => t.pool === pool).map((t) => t.id)
}

/** Round-robin pairs per pool, greedily packed into rounds (no team twice per round). */
function schedulePool(ids: number[]): { homeId: number; awayId: number; round: number }[] {
  const out: { homeId: number; awayId: number; round: number }[] = []
  const rounds: Set<number>[] = []
  for (let a = 0; a < ids.length; a++) {
    for (let b = a + 1; b < ids.length; b++) {
      let r = 0
      while (rounds[r] && (rounds[r].has(ids[a]) || rounds[r].has(ids[b]))) r++
      if (!rounds[r]) rounds[r] = new Set<number>()
      rounds[r].add(ids[a])
      rounds[r].add(ids[b])
      out.push({ homeId: ids[a], awayId: ids[b], round: r + 1 })
    }
  }
  return out
}

/** Generate the group calendar from the drawn pools (courts spread per round). */
export function buildGroupMatches(teams: DemoTeam[]): DemoMatch[] {
  const raw = POOLS.flatMap((pool) => schedulePool(poolIds(teams, pool)).map((m) => ({ pool, ...m })))
  raw.sort((x, y) => x.round - y.round || x.pool.localeCompare(y.pool))

  const courtPerRound = new Map<number, number>()
  const codePerPool = new Map<Pool, number>()
  return raw.map((m) => {
    const court = (courtPerRound.get(m.round) ?? 0) + 1
    courtPerRound.set(m.round, court)
    const ci = (codePerPool.get(m.pool) ?? 0) + 1
    codePerPool.set(m.pool, ci)
    return {
      id: `${m.pool}${ci}`,
      code: `${m.pool}${ci}`,
      phase: 'group',
      bracketLabel: null,
      round: m.round,
      time: START[m.round - 1] ?? '15:00',
      court,
      pool: m.pool,
      homeId: m.homeId,
      awayId: m.awayId,
      hs: 0,
      as: 0,
      locked: false,
    }
  })
}

/** Standings per pool, recomputed from the saved (locked) group scores. */
export function computeGroups(teams: DemoTeam[], matches: DemoMatch[]): PublicGroup[] {
  return POOLS.map((pool) => {
    const acc = new Map<number, PublicStanding>()
    teams
      .filter((t) => t.pool === pool)
      .forEach((t) =>
        acc.set(t.id, {
          rank: 0,
          teamId: String(t.id),
          teamName: t.name,
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
      if (m.pool !== pool || !m.locked || m.homeId == null || m.awayId == null) continue
      const h = acc.get(m.homeId)
      const a = acc.get(m.awayId)
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
    return { label: pool, standings }
  })
}

/** Semis + final from the group standings (cross seeding A1-B2 / B1-A2). */
export function buildKnockout(groups: PublicGroup[]): DemoMatch[] {
  const a = groups.find((g) => g.label === 'A')?.standings ?? []
  const b = groups.find((g) => g.label === 'B')?.standings ?? []
  const tid = (s?: PublicStanding) => (s ? Number(s.teamId) : null)
  return [
    { id: 'SF1', code: 'SF1', phase: 'knockout', bracketLabel: 'Demi-finale', round: 1, time: '15:45', court: 1, pool: null, homeId: tid(a[0]), awayId: tid(b[1]), hs: 0, as: 0, locked: false },
    { id: 'SF2', code: 'SF2', phase: 'knockout', bracketLabel: 'Demi-finale', round: 1, time: '15:45', court: 2, pool: null, homeId: tid(b[0]), awayId: tid(a[1]), hs: 0, as: 0, locked: false },
    { id: 'F', code: 'F', phase: 'knockout', bracketLabel: 'Finale', round: 2, time: '16:30', court: 1, pool: null, homeId: null, awayId: null, hs: 0, as: 0, locked: false },
  ]
}

const winnerId = (m: DemoMatch): number | null => {
  if (!m.locked || m.homeId == null || m.awayId == null) return null
  if (m.hs > m.as) return m.homeId
  if (m.as > m.hs) return m.awayId
  return null
}

/** Fill the final's participants from the semis' winners. */
export function resolveKnockout(ko: DemoMatch[]): DemoMatch[] {
  const sf1 = ko.find((m) => m.id === 'SF1')
  const sf2 = ko.find((m) => m.id === 'SF2')
  return ko.map((m) => (m.id === 'F' ? { ...m, homeId: sf1 ? winnerId(sf1) : null, awayId: sf2 ? winnerId(sf2) : null } : m))
}

export function toPublicMatch(m: DemoMatch, teams: DemoTeam[]): PublicMatch {
  const finished = m.locked
  return {
    id: m.id,
    code: m.code,
    phase: m.phase,
    groupLabel: m.pool,
    round: m.round,
    court: m.court,
    scheduledTime: m.time,
    bracketLabel: m.bracketLabel,
    homeTeamId: m.homeId == null ? null : String(m.homeId),
    awayTeamId: m.awayId == null ? null : String(m.awayId),
    homeName: nameById(teams, m.homeId),
    awayName: nameById(teams, m.awayId),
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
