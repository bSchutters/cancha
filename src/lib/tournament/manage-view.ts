import type { Payload } from 'payload'
import { computeStandings } from './standings'
import { fairplayRanking } from './fairplay'
import { buildScheduleMaps } from './schedule'
import { buildMatchCodes, buildFeederNames } from './match-code'
import { getSessionUser, getUserTenantId } from './session'
import { computeFinalRanking as computeFinalRankingRaw, type FinalMatchInput } from './final-ranking'
import type { Id, MatchResult, TeamRef } from './types'
import { DEFAULT_TEAM_LOGO } from './constants'

// ---- Admin DTOs (authenticated console only: includes contacts + fair-play) ----

export interface ManageTeam {
  id: Id
  name: string
  email: string
  phone: string
  logoUrl: string | null
  registrationStatus: 'pending' | 'confirmed' | 'waitlist' | 'rejected'
  paymentStatus: 'unpaid' | 'paid'
  groupLabel: string | null
}

export interface ManageMatch {
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
  fairplayWinner: 'home' | 'away' | 'none'
  penaltyWinner: 'home' | 'away' | null
  penaltyHome: number | null
  penaltyAway: number | null
  refereeId: Id | null
  refereeName: string | null
  status: 'scheduled' | 'finished'
}

export interface ManageStanding {
  rank: number
  teamId: Id
  teamName: string
  logoUrl: string | null
  played: number
  points: number
  goalDifference: number
  fairplayPoints: number
}

export interface ManageReferee {
  id: Id
  name: string
  contact: string | null
}

export interface ManageSponsor {
  id: Id
  name: string
  logoUrl: string | null
  url: string | null
}

export interface FinalRankingEntry {
  position: number
  positionLabel: string
  teamId: Id
  teamName: string
  logoUrl: string | null
  note: string
}

export interface ManageTournament {
  id: Id
  name: string
  slug: string
  status: string
  drawRevealed: boolean
  editionDate: string | null
  description: string | null
  format: {
    numGroups: number
    groupSize: number
    qualifiersPerGroup: number
    rankingDepth: 'full' | 'top_k' | 'qualifiers_only'
    rankingTopK: number
  }
  courts: { multiCourt: boolean; numCourts: number; assignment: string }
  refereeAssignment: 'manual' | 'random'
  devMode: boolean
  tvScreens: { name: string; views: string[] }[]
  schedule: {
    startTime: string | null
    matchDurationMin: number | null
    finalsMatchDurationMin: number | null
    gapBetweenMatchesMin: number | null
    mealBreakStart: string | null
    mealBreakDurationMin: number | null
    finalsStartTime: string | null
    globalOffsetMin: number
  }
  payment: { iban: string | null; amount: number | null; communication: string | null }
  venue: {
    name: string | null
    address: string | null
    mapsUrl: string | null
    mapId: number | null
    mapUrl: string | null
    info: string | null
  }
  counts: { registered: number; active: number; confirmed: number; waitlist: number; paid: number }
  teams: ManageTeam[]
  matches: ManageMatch[]
  groups: { label: string; standings: ManageStanding[] }[]
  fairplayRanking: { rank: number; teamId: Id; teamName: string; logoUrl: string | null; fairplayPoints: number }[]
  referees: ManageReferee[]
  sponsors: ManageSponsor[]
  finalRanking: FinalRankingEntry[]
  fairplayWinnerId: Id | null
}


// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyDoc = Record<string, any>

const idOf = (rel: unknown): Id | null => {
  if (rel == null) return null
  if (typeof rel === 'object') return (rel as { id: Id }).id
  return rel as Id
}

export async function buildManageTournament(
  payload: Payload,
  slug: string,
): Promise<ManageTournament | null> {
  // Tenant isolation: a manager can only load their own organization's tournament
  // (a super-admin is not scoped). Slug uniqueness is per-tenant, so we filter on both.
  const tenantId = getUserTenantId(await getSessionUser())
  const slugFilter = { slug: { equals: slug } }
  const res = await payload.find({
    collection: 'tournaments',
    where: tenantId != null ? { and: [slugFilter, { tenant: { equals: tenantId } }] } : slugFilter,
    limit: 1,
    depth: 1,
  })
  const t = res.docs[0] as AnyDoc | undefined
  if (!t) return null

  const [teamsRes, matchesRes, refsRes, sponsorsRes] = await Promise.all([
    payload.find({ collection: 'tournament-teams', where: { tournament: { equals: t.id } }, limit: 1000, depth: 1 }),
    payload.find({ collection: 'tournament-matches', where: { tournament: { equals: t.id } }, limit: 2000, depth: 1 }),
    payload.find({
      collection: 'tournament-referees',
      where: { or: [{ tournament: { equals: t.id } }, { tournament: { exists: false } }] },
      limit: 500,
      depth: 0,
    }),
    payload.find({ collection: 'tournament-sponsors', where: { tournament: { equals: t.id } }, limit: 200, depth: 1 }),
  ])

  const teamDocs: AnyDoc[] = teamsRes.docs
  const nameById = new Map<Id, string>()
  const logoById = new Map<Id, string>()
  teamDocs.forEach((tm) => {
    nameById.set(tm.id, tm.name)
    logoById.set(tm.id, (tm.logo && typeof tm.logo === 'object' ? tm.logo.url : null) || DEFAULT_TEAM_LOGO)
  })

  const teams: ManageTeam[] = teamDocs.map((tm) => ({
    id: tm.id,
    name: tm.name,
    email: tm.representative_email,
    phone: tm.representative_phone,
    logoUrl: tm.logo && typeof tm.logo === 'object' ? (tm.logo.url ?? null) : null,
    registrationStatus: tm.registration_status ?? 'pending',
    paymentStatus: tm.payment_status ?? 'unpaid',
    groupLabel: tm.group_label ?? null,
  }))

  const matchDocs = matchesRes.docs as AnyDoc[]
  const { scheduleOf } = buildScheduleMaps(
    matchDocs.map((m) => ({
      id: m.id,
      phase: m.phase,
      round: m.round ?? null,
      bracketLabel: m.bracket_label ?? null,
      nextMatchId: idOf(m.next_match),
      loserNextMatchId: idOf(m.loser_next_match),
    })),
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

  const matches: ManageMatch[] = matchDocs.map((m) => {
    const sched = scheduleOf({ id: m.id, phase: m.phase, round: m.round ?? null })
    return {
    id: m.id,
    code: '',
    phase: m.phase,
    groupLabel: m.group_label ?? null,
    round: m.round ?? null,
    court: m.phase === 'group' ? (m.court ?? null) : sched.court,
    scheduledTime: sched.time,
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
      return id != null ? (logoById.get(id) ?? DEFAULT_TEAM_LOGO) : null
    })(),
    awayLogoUrl: (() => {
      const id = idOf(m.away_team)
      return id != null ? (logoById.get(id) ?? DEFAULT_TEAM_LOGO) : null
    })(),
    scoreHome: typeof m.score_home === 'number' ? m.score_home : null,
    scoreAway: typeof m.score_away === 'number' ? m.score_away : null,
    fairplayWinner: m.fairplay_winner ?? 'none',
    penaltyWinner: m.penalty_winner ?? null,
    penaltyHome: typeof m.penalty_home === 'number' ? m.penalty_home : null,
    penaltyAway: typeof m.penalty_away === 'number' ? m.penalty_away : null,
    refereeId: idOf(m.referee),
    refereeName: m.referee && typeof m.referee === 'object' ? (m.referee.name ?? null) : null,
    status: m.status === 'finished' ? 'finished' : 'scheduled',
    }
  })

  const matchCodes = buildMatchCodes(matches)
  for (const m of matches) m.code = matchCodes.get(m.id) ?? ''

  // Name TBD bracket slots by their feeder ("Vainqueur QF1") instead of "À déterminer".
  const feeders = buildFeederNames(
    matchDocs.map((m) => ({
      id: m.id,
      homeSourceId: idOf(m.home_source_match),
      awaySourceId: idOf(m.away_source_match),
      loserNextId: idOf(m.loser_next_match),
      loserNextSlot: m.loser_next_slot ?? null,
    })),
    matchCodes,
  )
  for (const m of matches) {
    const f = feeders.get(m.id)
    if (m.homeTeamId == null && m.homeName == null && f?.home) m.homeName = f.home
    if (m.awayTeamId == null && m.awayName == null && f?.away) m.awayName = f.away
  }

  // Standings + fair-play across confirmed/grouped teams.
  const teamsByGroup = new Map<string, TeamRef[]>()
  teamDocs.forEach((tm) => {
    if (!tm.group_label) return
    const arr = teamsByGroup.get(tm.group_label) ?? []
    arr.push({ id: tm.id, name: tm.name })
    teamsByGroup.set(tm.group_label, arr)
  })

  const groupMatchResults = (label: string): MatchResult[] =>
    matches
      .filter((m) => m.phase === 'group' && m.groupLabel === label)
      .map((m) => ({
        homeTeamId: m.homeTeamId as Id,
        awayTeamId: m.awayTeamId as Id,
        scoreHome: m.scoreHome,
        scoreAway: m.scoreAway,
        fairplayWinner: m.fairplayWinner,
      }))

  const groups = [...teamsByGroup.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, groupTeams]) => ({
      label,
      standings: computeStandings(groupTeams, groupMatchResults(label)).map((s) => ({
        rank: s.rank,
        teamId: s.teamId,
        teamName: s.teamName,
        logoUrl: logoById.get(s.teamId) ?? DEFAULT_TEAM_LOGO,
        played: s.played,
        points: s.points,
        goalDifference: s.goalDifference,
        fairplayPoints: s.fairplayPoints,
      })),
    }))

  const allResults: MatchResult[] = matches.map((m) => ({
    homeTeamId: m.homeTeamId as Id,
    awayTeamId: m.awayTeamId as Id,
    scoreHome: m.scoreHome,
    scoreAway: m.scoreAway,
    fairplayWinner: m.fairplayWinner,
  }))
  const fpRanking = fairplayRanking(
    teamDocs.map((tm) => ({ id: tm.id, name: tm.name })),
    allResults,
  ).map((e) => ({
    rank: e.rank,
    teamId: e.teamId,
    teamName: e.teamName,
    logoUrl: logoById.get(e.teamId) ?? DEFAULT_TEAM_LOGO,
    fairplayPoints: e.fairplayPoints,
  }))

  const finalRanking: FinalRankingEntry[] = computeFinalRankingRaw(
    matches.map(
      (m): FinalMatchInput => ({
        phase: m.phase,
        round: m.round,
        bracketLabel: m.bracketLabel,
        homeTeamId: m.homeTeamId,
        awayTeamId: m.awayTeamId,
        scoreHome: m.scoreHome,
        scoreAway: m.scoreAway,
        penaltyWinner: m.penaltyWinner,
        status: m.status,
      }),
    ),
  ).map((e) => ({
    ...e,
    teamName: nameById.get(e.teamId) ?? '',
    logoUrl: logoById.get(e.teamId) ?? DEFAULT_TEAM_LOGO,
  }))

  return {
    id: t.id,
    name: t.name,
    slug: t.slug,
    status: t.status,
    drawRevealed: t.draw_revealed === true,
    editionDate: t.edition_date ?? null,
    description: t.description ?? null,
    format: {
      numGroups: t.num_groups ?? 0,
      groupSize: t.group_size ?? 0,
      qualifiersPerGroup: t.qualifiers_per_group ?? 0,
      rankingDepth: (t.ranking_depth as 'full' | 'top_k' | 'qualifiers_only') ?? 'full',
      rankingTopK: t.ranking_top_k ?? 8,
    },
    courts: {
      multiCourt: Boolean(t.multi_court),
      numCourts: t.num_courts ?? 1,
      assignment: t.court_assignment ?? 'fixed',
    },
    refereeAssignment: t.referee_assignment === 'random' ? 'random' : 'manual',
    devMode: Boolean(t.dev_mode),
    tvScreens: Array.isArray(t.tv_screens)
      ? (t.tv_screens as AnyDoc[]).map((s) => ({
          name: typeof s.name === 'string' ? s.name : '',
          views: Array.isArray(s.views) ? (s.views as string[]) : [],
        }))
      : [],
    schedule: {
      startTime: t.start_time ?? null,
      matchDurationMin: t.match_duration_min ?? null,
      finalsMatchDurationMin: t.finals_match_duration_min ?? null,
      gapBetweenMatchesMin: t.gap_between_matches_min ?? null,
      mealBreakStart: t.meal_break_start ?? null,
      mealBreakDurationMin: t.meal_break_duration_min ?? null,
      finalsStartTime: t.finals_start_time ?? null,
      globalOffsetMin: t.global_offset_min ?? 0,
    },
    payment: {
      iban: t.payment_iban ?? null,
      amount: t.payment_amount ?? null,
      communication: t.payment_communication ?? null,
    },
    venue: {
      name: t.venue_name ?? null,
      address: t.venue_address ?? null,
      mapsUrl: t.venue_maps_url ?? null,
      mapId: t.venue_map && typeof t.venue_map === 'object' ? (t.venue_map.id ?? null) : (t.venue_map ?? null),
      mapUrl: t.venue_map && typeof t.venue_map === 'object' ? (t.venue_map.url ?? null) : null,
      info: t.practical_info ?? null,
    },
    counts: {
      registered: teams.length,
      active: teams.filter((x) => x.registrationStatus === 'pending' || x.registrationStatus === 'confirmed').length,
      confirmed: teams.filter((x) => x.registrationStatus === 'confirmed').length,
      waitlist: teams.filter((x) => x.registrationStatus === 'waitlist').length,
      paid: teams.filter((x) => x.paymentStatus === 'paid').length,
    },
    teams,
    matches,
    groups,
    fairplayRanking: fpRanking,
    referees: (refsRes.docs as AnyDoc[]).map((r) => ({ id: r.id, name: r.name, contact: r.contact ?? null })),
    sponsors: (sponsorsRes.docs as AnyDoc[]).map((sp) => ({
      id: sp.id,
      name: sp.name,
      logoUrl: sp.logo && typeof sp.logo === 'object' ? (sp.logo.url ?? null) : null,
      url: sp.url ?? null,
    })),
    finalRanking,
    fairplayWinnerId: idOf(t.fairplay_winner_team),
  }
}
