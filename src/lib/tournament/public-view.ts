import type { Payload } from 'payload'
import { unstable_cache } from 'next/cache'
import { computeStandings } from './standings'
import { getSportProfile } from '../sport'
import { buildScheduleMaps } from './schedule'
import { buildMatchCodes, buildFeederNames } from './match-code'
import { computeFinalRanking } from './final-ranking'
import { rankAll, type RankingDepth } from './bracket'
import type { BracketMatch, Id, MatchResult, QualifiedTeam, TeamRef } from './types'
import { DEFAULT_TEAM_LOGO } from './constants'

/** Reads the configured ranking depth from a tournament doc (default: full). */
function rankingDepthOf(t: { ranking_depth?: string; ranking_top_k?: number }): RankingDepth {
  if (t.ranking_depth === 'qualifiers_only') return 'qualifiers_only'
  if (t.ranking_depth === 'top_k') return { topK: t.ranking_top_k ?? 8 }
  return 'full'
}

// ---- Public DTOs (safe to send to the browser: no contacts, no fair-play) ----

export interface PublicStanding {
  rank: number
  teamId: Id
  teamName: string
  logoUrl: string | null
  played: number
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
}

export interface PublicMatch {
  id: Id
  code: string
  phase: 'group' | 'knockout' | 'classification'
  groupLabel: string | null
  round: number | null
  court: number | null
  scheduledTime: string | null
  bracketLabel: string | null
  homeTeamId: Id | null
  awayTeamId: Id | null
  homeName: string | null
  awayName: string | null
  homeLogoUrl: string | null
  awayLogoUrl: string | null
  scoreHome: number | null
  scoreAway: number | null
  penaltyWinner: 'home' | 'away' | null
  penaltyHome: number | null
  penaltyAway: number | null
  refereeName: string | null
  status: 'scheduled' | 'finished'
}

export interface PublicGroup {
  label: string
  standings: PublicStanding[]
}

export interface PublicTournamentSummary {
  id: Id
  name: string
  slug: string
  status: string
  editionDate: string | null
  visualUrl: string | null
}

export interface PublicTournament extends PublicTournamentSummary {
  description: string | null
  /** Pools revealed to the public (false right after the draw, until the TV reveal). */
  drawRevealed: boolean
  /** Global schedule delay in minutes (already applied to scheduledTime). */
  scheduleOffsetMin: number
  format: { numGroups: number; qualifiersPerGroup: number }
  payment: { iban: string | null; amount: number | null; communication: string | null } | null
  groups: PublicGroup[]
  groupMatches: PublicMatch[]
  knockoutMatches: PublicMatch[]
  classificationMatches: PublicMatch[]
  /** Full running order (all phases), with projected finals as "À déterminer" when not yet generated. */
  programme: PublicMatch[]
  fairplayWinnerName: string | null
  courts: number
  multiCourt: boolean
  sponsors: { id: Id; name: string; logoUrl: string | null; url: string | null }[]
  venue: { name: string | null; address: string | null; mapsUrl: string | null; mapUrl: string | null; info: string | null } | null
  teams: { id: Id; name: string; logoUrl: string | null; status: 'confirmed' | 'pending' | 'waitlist' }[]
  finalRanking: { position: number; positionLabel: string; teamId: Id; teamName: string; logoUrl: string | null; note: string }[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyDoc = Record<string, any>

const idOf = (rel: unknown): Id | null => {
  if (rel == null) return null
  if (typeof rel === 'object') return (rel as { id: Id }).id
  return rel as Id
}

function addOffset(hhmm: string | null | undefined, offsetMin: number): string | null {
  if (!hhmm) return null
  if (!offsetMin) return hhmm
  const [h, m] = hhmm.split(':').map(Number)
  const total = h * 60 + m + offsetMin
  const hh = Math.floor(((total % 1440) + 1440) % 1440 / 60)
  const mm = (((total % 60) + 60) % 60)
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

function visualUrl(visual: unknown): string | null {
  if (visual && typeof visual === 'object') {
    const v = visual as { url?: string }
    return v.url ?? null
  }
  return null
}

export async function listPublicTournaments(
  payload: Payload,
  tenantId: string | number | null,
): Promise<PublicTournamentSummary[]> {
  // Scope to the organization resolved from the host (apex/bare localhost -> all).
  // tenantId is resolved by the caller (host headers) so this stays cacheable.
  const notDraft = { status: { not_equals: 'draft' } }
  const res = await payload.find({
    collection: 'tournaments',
    where: tenantId != null ? { and: [notDraft, { tenant: { equals: tenantId } }] } : notDraft,
    sort: '-edition_date',
    limit: 100,
    depth: 1,
  })
  return res.docs.map((t: AnyDoc) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    status: t.status,
    editionDate: t.edition_date ?? null,
    visualUrl: visualUrl(t.visual),
  }))
}

/**
 * Cached public-tournament read, shared by the page, its metadata and OG image
 * so a request hits the DB once. Kept fresh by the `tournament-${slug}` tag,
 * which every tournament/match/team/sponsor afterChange hook purges (e.g. score
 * entry), so cached live scores are invalidated on write - the 30s window is
 * just a backstop. Tenant is part of the key (headers can't run inside the
 * cache), mirroring app/api/tournament/[slug].
 */
export function getCachedPublicTournament(
  payload: Payload,
  slug: string,
  tenantId: string | number | null,
): Promise<PublicTournament | null> {
  return unstable_cache(
    () => buildPublicTournament(payload, slug, tenantId),
    ['tournament', slug, String(tenantId ?? 'all')],
    { tags: [`tournament-${slug}`], revalidate: 30 },
  )()
}

export async function buildPublicTournament(
  payload: Payload,
  slug: string,
  tenantId: string | number | null,
): Promise<PublicTournament | null> {
  // A tournament is only reachable on its organization's host (apex -> unscoped).
  // tenantId is resolved by the caller (host headers) so this stays cacheable.
  const slugFilter = { slug: { equals: slug } }
  const res = await payload.find({
    collection: 'tournaments',
    where: tenantId != null ? { and: [slugFilter, { tenant: { equals: tenantId } }] } : slugFilter,
    limit: 1,
    depth: 1,
  })
  const t = res.docs[0] as AnyDoc | undefined
  if (!t || t.status === 'draft') return null

  const [teamsRes, matchesRes, sponsorsRes] = await Promise.all([
    payload.find({ collection: 'tournament-teams', where: { tournament: { equals: t.id } }, limit: 1000, depth: 1 }),
    payload.find({ collection: 'tournament-matches', where: { tournament: { equals: t.id } }, limit: 2000, depth: 1 }),
    payload.find({ collection: 'tournament-sponsors', where: { tournament: { equals: t.id } }, limit: 200, depth: 1 }),
  ])

  const offset = t.global_offset_min ?? 0
  const teams: AnyDoc[] = teamsRes.docs
  const nameById = new Map<Id, string>()
  const logoById = new Map<Id, string | null>()
  teams.forEach((tm) => {
    nameById.set(tm.id, tm.name)
    logoById.set(tm.id, tm.logo && typeof tm.logo === 'object' ? (tm.logo.url ?? null) : null)
  })

  const allMatches: AnyDoc[] = matchesRes.docs

  // Project the full finals structure (TBD matchups) before the knockout is
  // generated, so the public programme shows the whole tournament start to finish.
  // Reuses rankAll for an exact match of the real bracket, then blanks the teams.
  const numGroups = t.num_groups ?? 0
  const qpg = t.qualifiers_per_group ?? 0
  const groupSize = t.group_size ?? 0
  const hasGroupSchedule = allMatches.some((m) => m.phase === 'group')
  const hasRealFinals = allMatches.some((m) => m.phase !== 'group')
  const groupLabels = [...new Set(teams.map((tm) => tm.group_label).filter(Boolean) as string[])].sort()
  let projected: BracketMatch[] = []
  if (!hasRealFinals && hasGroupSchedule && numGroups >= 2 && qpg >= 1 && groupSize > qpg && groupLabels.length >= 2) {
    const ph = (g: string, r: number): QualifiedTeam => ({ teamId: `proj-${g}-${r}`, teamName: '', group: g, rankInGroup: r })
    const pq = groupLabels.flatMap((g) => Array.from({ length: qpg }, (_, i) => ph(g, i + 1)))
    const pnq = groupLabels.flatMap((g) => Array.from({ length: groupSize - qpg }, (_, i) => ph(g, qpg + i + 1)))
    // Keep the synthetic seed ids (proj-A-1…) so round-1 slots can be named "1er Poule A".
    projected = rankAll(pq, pnq, numGroups, qpg, rankingDepthOf(t))
  }

  const { scheduleOf } = buildScheduleMaps(
    [
      ...allMatches.map((m) => ({
        id: m.id,
        phase: m.phase,
        round: m.round ?? null,
        bracketLabel: m.bracket_label ?? null,
        nextMatchId: idOf(m.next_match),
        loserNextMatchId: idOf(m.loser_next_match),
      })),
      ...projected.map((b) => ({
        id: b.key,
        phase: b.phase,
        round: b.round,
        bracketLabel: b.bracketLabel,
        nextMatchId: b.nextMatchKey,
        loserNextMatchId: b.loserNextMatchKey,
      })),
    ],
    {
      timeParams: {
        startTime: t.start_time || '09:00',
        matchDurationMin: t.match_duration_min ?? 15,
        gapBetweenMatchesMin: t.gap_between_matches_min ?? 5,
        mealBreakStart: t.meal_break_start || null,
        mealBreakDurationMin: t.meal_break_duration_min ?? 0,
      },
      finalsMatchDurationMin: t.finals_match_duration_min ?? null,
      multiCourt: Boolean(t.multi_court),
      numCourts: t.num_courts ?? 1,
      finalsStartTime: t.finals_start_time || null,
    },
  )

  const toPublicMatch = (m: AnyDoc): PublicMatch => {
    const sched = scheduleOf({ id: m.id, phase: m.phase, round: m.round ?? null })
    return {
    id: m.id,
    code: '',
    phase: m.phase,
    groupLabel: m.group_label ?? null,
    round: m.round ?? null,
    court: m.phase === 'group' ? (m.court ?? null) : sched.court,
    scheduledTime: addOffset(sched.time, offset),
    bracketLabel: m.bracket_label ?? null,
    homeTeamId: idOf(m.home_team),
    awayTeamId: idOf(m.away_team),
    homeName: (() => {
      const id = idOf(m.home_team)
      return id != null ? (nameById.get(id) ?? null) : null
    })(),
    awayName: (() => {
      const id = idOf(m.away_team)
      return id != null ? (nameById.get(id) ?? null) : null
    })(),
    homeLogoUrl: (() => {
      const id = idOf(m.home_team)
      return id != null ? (logoById.get(id) || DEFAULT_TEAM_LOGO) : null
    })(),
    awayLogoUrl: (() => {
      const id = idOf(m.away_team)
      return id != null ? (logoById.get(id) || DEFAULT_TEAM_LOGO) : null
    })(),
    scoreHome: typeof m.score_home === 'number' ? m.score_home : null,
    scoreAway: typeof m.score_away === 'number' ? m.score_away : null,
    penaltyWinner: m.penalty_winner ?? null,
    penaltyHome: typeof m.penalty_home === 'number' ? m.penalty_home : null,
    penaltyAway: typeof m.penalty_away === 'number' ? m.penalty_away : null,
    refereeName: m.referee && typeof m.referee === 'object' ? (m.referee.name ?? null) : null,
    status: m.status === 'finished' ? 'finished' : 'scheduled',
    }
  }

  const matches: AnyDoc[] = matchesRes.docs
  const groupMatches = matches.filter((m) => m.phase === 'group')
  const knockoutMatches = matches.filter((m) => m.phase === 'knockout')
  const classifMatches = matches.filter((m) => m.phase === 'classification')

  // Build group standings (fair-play points intentionally omitted from the DTO).
  const teamsByGroup = new Map<string, TeamRef[]>()
  teams.forEach((tm) => {
    if (!tm.group_label) return
    const arr = teamsByGroup.get(tm.group_label) ?? []
    arr.push({ id: tm.id, name: tm.name })
    teamsByGroup.set(tm.group_label, arr)
  })

  const groups: PublicGroup[] = [...teamsByGroup.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, groupTeams]) => {
      const results: MatchResult[] = groupMatches
        .filter((m) => m.group_label === label)
        .map((m) => ({
          homeTeamId: idOf(m.home_team) as Id,
          awayTeamId: idOf(m.away_team) as Id,
          scoreHome: typeof m.score_home === 'number' ? m.score_home : null,
          scoreAway: typeof m.score_away === 'number' ? m.score_away : null,
          fairplayWinner: m.fairplay_winner ?? 'none',
        }))
      const standings = computeStandings(groupTeams, results, getSportProfile(t.sport)).map((s) => ({
        rank: s.rank,
        teamId: s.teamId,
        teamName: s.teamName,
        logoUrl: logoById.get(s.teamId) || DEFAULT_TEAM_LOGO,
        played: s.played,
        wins: s.wins,
        draws: s.draws,
        losses: s.losses,
        goalsFor: s.goalsFor,
        goalsAgainst: s.goalsAgainst,
        goalDifference: s.goalDifference,
        points: s.points,
      }))
      return { label, standings }
    })

  const finished = t.status === 'finished' || t.status === 'archived'
  const fairplayWinnerName = finished
    ? t.fairplay_winner_team && typeof t.fairplay_winner_team === 'object'
      ? (t.fairplay_winner_team.name ?? null)
      : null
    : null

  const registrationOpen = t.status === 'registration'

  // Registered teams for the public list / "follow my team" picker. Pending and
  // waitlisted teams are shown (with a tag) so people see the full field; refused
  // teams are excluded. Ordered by registration time.
  const publicTeams = teams
    .filter((tm) => ['confirmed', 'pending', 'waitlist'].includes(tm.registration_status))
    .sort((a, b) => String(a.createdAt ?? '').localeCompare(String(b.createdAt ?? '')))
    .map((tm) => ({
      id: tm.id as Id,
      name: tm.name as string,
      logoUrl: logoById.get(tm.id) || DEFAULT_TEAM_LOGO,
      status: tm.registration_status as 'confirmed' | 'pending' | 'waitlist',
    }))

  // Final ranking - revealed publicly only once finished.
  const allPublicMatches = [...knockoutMatches, ...classifMatches].map(toPublicMatch)
  const finalRanking = finished
    ? computeFinalRanking(
        allPublicMatches.map((m) => ({
          phase: m.phase,
          round: m.round,
          bracketLabel: m.bracketLabel,
          homeTeamId: m.homeTeamId,
          awayTeamId: m.awayTeamId,
          scoreHome: m.scoreHome,
          scoreAway: m.scoreAway,
          penaltyWinner: m.penaltyWinner,
          status: m.status,
        })),
      ).map((e) => ({
        ...e,
        teamName: nameById.get(e.teamId) ?? '',
        logoUrl: logoById.get(e.teamId) ?? DEFAULT_TEAM_LOGO,
      }))
    : []

  // Real matches: codes + feeder names ("Vainqueur QF1") for TBD bracket slots.
  const publicGroup = groupMatches.map(toPublicMatch).sort(sortMatches)
  const publicKo = knockoutMatches.map(toPublicMatch)
  const publicCl = classifMatches.map(toPublicMatch)
  const codeOf = buildMatchCodes([...publicGroup, ...publicKo, ...publicCl])
  const feeders = buildFeederNames(
    [...knockoutMatches, ...classifMatches].map((m) => ({
      id: m.id,
      homeSourceId: idOf(m.home_source_match),
      awaySourceId: idOf(m.away_source_match),
      loserNextId: idOf(m.loser_next_match),
      loserNextSlot: (m.loser_next_slot ?? null) as 'home' | 'away' | null,
    })),
    codeOf,
  )
  const withCode = (m: PublicMatch): PublicMatch => {
    const f = feeders.get(m.id)
    return {
      ...m,
      code: codeOf.get(m.id) ?? '',
      homeName: m.homeTeamId == null && m.homeName == null && f?.home ? f.home : m.homeName,
      awayName: m.awayTeamId == null && m.awayName == null && f?.away ? f.away : m.awayName,
    }
  }

  // Projected finals (before the knockout is generated): same codes + feeder names,
  // and round-1 slots named by their group seed ("1er Poule A").
  const seedLabel = (id: Id | null): string | null => {
    if (typeof id !== 'string') return null
    const mm = /^proj-(.+)-(\d+)$/.exec(id)
    if (!mm) return null
    const r = Number(mm[2])
    return `${r}${r === 1 ? 'er' : 'e'} Poule ${mm[1]}`
  }
  const projectedBase: PublicMatch[] = projected.map((b) => {
    const sched = scheduleOf({ id: b.key, phase: b.phase, round: b.round })
    return {
      id: b.key,
      code: '',
      phase: b.phase,
      groupLabel: null,
      round: b.round,
      court: sched.court,
      scheduledTime: addOffset(sched.time, offset),
      bracketLabel: b.bracketLabel,
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
      status: 'scheduled' as const,
    }
  })
  const projCodeOf = buildMatchCodes(projectedBase)
  const projFeeders = buildFeederNames(
    projected.map((b) => ({
      id: b.key,
      homeSourceId: b.homeSourceKey ?? null,
      awaySourceId: b.awaySourceKey ?? null,
      loserNextId: b.loserNextMatchKey ?? null,
      loserNextSlot: b.loserNextSlot ?? null,
    })),
    projCodeOf,
  )
  const projectedMatches: PublicMatch[] = projectedBase.map((m, i) => {
    const b = projected[i]
    const f = projFeeders.get(m.id)
    return {
      ...m,
      code: projCodeOf.get(m.id) ?? '',
      homeName: f?.home ?? seedLabel(b.homeTeamId),
      awayName: f?.away ?? seedLabel(b.awayTeamId),
    }
  })

  const programme = [...publicGroup.map(withCode), ...publicKo.map(withCode), ...publicCl.map(withCode), ...projectedMatches]
    .filter((m) => m.scheduledTime)
    .sort(
      (a, b) =>
        (a.scheduledTime ?? '').localeCompare(b.scheduledTime ?? '') || (a.round ?? 0) - (b.round ?? 0),
    )

  return {
    id: t.id,
    name: t.name,
    slug: t.slug,
    status: t.status,
    editionDate: t.edition_date ?? null,
    visualUrl: visualUrl(t.visual),
    description: t.description ?? null,
    drawRevealed: t.draw_revealed === true,
    scheduleOffsetMin: offset,
    format: { numGroups: t.num_groups ?? 0, qualifiersPerGroup: t.qualifiers_per_group ?? 0 },
    payment: registrationOpen
      ? {
          iban: t.payment_iban ?? null,
          amount: t.payment_amount ?? null,
          communication: t.payment_communication ?? null,
        }
      : null,
    groups,
    groupMatches: publicGroup.map(withCode),
    knockoutMatches: publicKo.map(withCode),
    classificationMatches: publicCl.map(withCode),
    programme,
    fairplayWinnerName,
    courts: t.num_courts ?? 1,
    multiCourt: Boolean(t.multi_court),
    sponsors: (sponsorsRes.docs as AnyDoc[]).map((sp) => ({
      id: sp.id,
      name: sp.name,
      logoUrl: sp.logo && typeof sp.logo === 'object' ? (sp.logo.url ?? null) : null,
      url: sp.url ?? null,
    })),
    venue:
      t.venue_name || t.venue_address || t.venue_maps_url || t.venue_map || t.practical_info
        ? {
            name: t.venue_name ?? null,
            address: t.venue_address ?? null,
            mapsUrl: t.venue_maps_url ?? null,
            mapUrl: visualUrl(t.venue_map),
            info: t.practical_info ?? null,
          }
        : null,
    teams: publicTeams,
    finalRanking,
  }
}

function sortMatches(a: PublicMatch, b: PublicMatch): number {
  return (a.round ?? 0) - (b.round ?? 0) || (a.court ?? 0) - (b.court ?? 0)
}
