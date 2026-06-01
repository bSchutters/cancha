import type { Id } from './types'

export interface FinalMatchInput {
  phase: 'group' | 'knockout' | 'classification'
  round: number | null
  bracketLabel: string | null
  homeTeamId: Id | null
  awayTeamId: Id | null
  scoreHome: number | null
  scoreAway: number | null
  penaltyWinner: 'home' | 'away' | null
  status: 'scheduled' | 'finished'
}

export interface FinalRankEntry {
  position: number
  positionLabel: string
  teamId: Id
  note: string
}

/**
 * Final tournament ranking derived from the knockout bracket (placement by
 * elimination round, champion first, 3rd/4th from the petite finale) followed
 * by the classification teams. Teams sharing a tier get a shared place range
 * (e.g. "5-8"). Pure: returns team ids only - callers attach names/logos.
 */
/** A placement match decides an exact place pair, e.g. "Places 5-6", "Places 9-10". */
const isPlaceMatch = (m: FinalMatchInput) => /places?\s*\d+\s*[-–]\s*\d+/i.test(m.bracketLabel ?? '')

function noteFor(pos: number): string {
  if (pos === 1) return 'Champion'
  if (pos === 2) return 'Finaliste'
  if (pos === 3) return '3e place'
  if (pos === 4) return '4e place'
  return 'Classement'
}

export function computeFinalRanking(matches: FinalMatchInput[]): FinalRankEntry[] {
  // The real bracket = knockout matches that don't decide an explicit place pair.
  const ko = matches.filter((m) => m.phase === 'knockout' && !isPlaceMatch(m))
  if (ko.length === 0) return []
  const maxRound = Math.max(...ko.map((m) => m.round ?? 1))

  const winnerOf = (m: FinalMatchInput): Id | null => {
    if (m.scoreHome == null || m.scoreAway == null) return null
    if (m.scoreHome > m.scoreAway) return m.homeTeamId
    if (m.scoreAway > m.scoreHome) return m.awayTeamId
    if (m.penaltyWinner === 'home') return m.homeTeamId
    if (m.penaltyWinner === 'away') return m.awayTeamId
    return null
  }
  const loserOf = (m: FinalMatchInput): Id | null => {
    const w = winnerOf(m)
    if (w == null) return null
    return w === m.homeTeamId ? m.awayTeamId : m.homeTeamId
  }

  const isPetite = (m: FinalMatchInput) => (m.bracketLabel ?? '').toLowerCase().includes('petite')
  const petiteMatch = ko.find((m) => m.round === maxRound && isPetite(m))
  const finalMatch = ko.find((m) => m.round === maxRound && !isPetite(m))

  // Exact positions: 1-2 (final), 3-4 (petite), then every "Places X-Y" match.
  const posTeam = new Map<number, Id>()
  const used = new Set<Id>()
  const setPos = (p: number, team: Id | null) => {
    if (team != null && !used.has(team) && !posTeam.has(p)) {
      posTeam.set(p, team)
      used.add(team)
    }
  }
  if (finalMatch) {
    setPos(1, winnerOf(finalMatch))
    setPos(2, loserOf(finalMatch))
  }
  if (petiteMatch) {
    setPos(3, winnerOf(petiteMatch))
    setPos(4, loserOf(petiteMatch))
  }
  for (const m of matches.filter(isPlaceMatch)) {
    const range = (m.bracketLabel ?? '').match(/(\d+)\s*[-–]\s*(\d+)/)
    if (!range) continue
    setPos(Number(range[1]), winnerOf(m))
    setPos(Number(range[2]), loserOf(m))
  }

  // Fallback for teams not exactly placed (non-standard brackets): group KO teams
  // by elimination round, then any remaining classification teams.
  const koTeams = new Set<Id>()
  const eliminatedRound = new Map<Id, number>()
  const koGD = new Map<Id, number>()
  for (const m of ko) {
    if (m.homeTeamId != null) koTeams.add(m.homeTeamId)
    if (m.awayTeamId != null) koTeams.add(m.awayTeamId)
    if (m.status === 'finished' && m.scoreHome != null && m.scoreAway != null) {
      if (m.homeTeamId != null) koGD.set(m.homeTeamId, (koGD.get(m.homeTeamId) ?? 0) + (m.scoreHome - m.scoreAway))
      if (m.awayTeamId != null) koGD.set(m.awayTeamId, (koGD.get(m.awayTeamId) ?? 0) + (m.scoreAway - m.scoreHome))
      const l = loserOf(m)
      if (l != null) eliminatedRound.set(l, m.round ?? 1)
    }
  }

  // Tiers for teams that did NOT get an exact place - kept in rank order and used
  // to fill the positions the exact placements leave free. Never re-compresses an
  // exact place: a team stored at place 9 stays at position 9 even if 7-8 are gaps.
  const tierGroups: { teams: Id[]; note: string }[] = []

  const byElim = new Map<number, Id[]>()
  for (const id of [...koTeams].filter((x) => !used.has(x))) {
    const r = eliminatedRound.get(id) ?? 0
    byElim.set(r, [...(byElim.get(r) ?? []), id])
  }
  for (const r of [...byElim.keys()].sort((a, b) => b - a)) {
    const teams = byElim.get(r)!.sort((a, b) => (koGD.get(b) ?? 0) - (koGD.get(a) ?? 0))
    teams.forEach((id) => used.add(id))
    tierGroups.push({ teams, note: 'Éliminé' })
  }

  // Teams that appear only in an unplayed/tied place match never received an exact
  // position (setPos got null). Capture them so they don't vanish from the ranking.
  const placeOnly: Id[] = []
  for (const m of matches.filter(isPlaceMatch)) {
    for (const id of [m.homeTeamId, m.awayTeamId]) {
      if (id != null && !used.has(id)) {
        used.add(id)
        placeOnly.push(id)
      }
    }
  }
  if (placeOnly.length) tierGroups.push({ teams: placeOnly, note: 'Classement' })

  const clTeams = new Set<Id>()
  for (const m of matches.filter((mm) => mm.phase === 'classification' && !isPlaceMatch(mm))) {
    for (const id of [m.homeTeamId, m.awayTeamId]) if (id != null) clTeams.add(id)
  }
  const remainingCl = [...clTeams].filter((id) => !used.has(id))
  if (remainingCl.length) tierGroups.push({ teams: remainingCl, note: 'Classement' })

  // Assemble: exact placements keep their stored place; the tier groups fill the
  // remaining free positions in order, each labelled with the range it spans.
  const maxExact = posTeam.size > 0 ? Math.max(...posTeam.keys()) : 0
  const total = Math.max(maxExact, posTeam.size + tierGroups.reduce((n, g) => n + g.teams.length, 0))
  const slot = new Map<number, { teamId: Id; note: string; label: string }>()
  for (const [p, id] of posTeam) slot.set(p, { teamId: id, note: noteFor(p), label: String(p) })

  const freePositions: number[] = []
  for (let p = 1; p <= total; p++) if (!slot.has(p)) freePositions.push(p)
  let fi = 0
  for (const g of tierGroups) {
    const ps = freePositions.slice(fi, fi + g.teams.length)
    fi += g.teams.length
    if (ps.length === 0) continue
    const lo = ps[0]
    const hi = ps[ps.length - 1]
    const label = ps.length > 1 ? `${lo}-${hi}` : `${lo}`
    g.teams.forEach((id, i) => slot.set(ps[i], { teamId: id, note: g.note, label }))
  }

  const out: FinalRankEntry[] = []
  for (let p = 1; p <= total; p++) {
    const e = slot.get(p)
    if (e) out.push({ position: p, positionLabel: e.label, teamId: e.teamId, note: e.note })
  }
  return out
}
