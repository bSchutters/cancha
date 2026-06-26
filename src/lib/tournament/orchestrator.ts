import type { Payload } from 'payload'
import { drawGroups } from './draw'
import { buildSchedule, buildScheduleMaps } from './schedule'
import { computeStandings } from './standings'
import { getSportProfile } from '../sport'
import { rankAll, type RankingDepth } from './bracket'
import type {
  CourtConfig,
  DrawnGroup,
  Id,
  MatchResult,
  QualifiedTeam,
  TeamRef,
  TimeParams,
} from './types'

export class TournamentError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message)
    this.name = 'TournamentError'
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyDoc = Record<string, any>

async function loadTournament(payload: Payload, id: Id): Promise<AnyDoc> {
  try {
    return await payload.findByID({ collection: 'tournaments', id: id as number })
  } catch {
    throw new TournamentError('NOT_FOUND', 'Tournoi introuvable')
  }
}

async function confirmedTeams(payload: Payload, tournamentId: Id): Promise<AnyDoc[]> {
  const res = await payload.find({
    collection: 'tournament-teams',
    where: {
      and: [
        { tournament: { equals: tournamentId } },
        { registration_status: { equals: 'confirmed' } },
      ],
    },
    limit: 1000,
    depth: 0,
  })
  return res.docs
}

function courtConfigOf(t: AnyDoc): CourtConfig {
  return {
    multiCourt: Boolean(t.multi_court),
    numCourts: t.num_courts ?? 1,
    assignment: t.court_assignment === 'random' ? 'random' : 'fixed',
  }
}

function timeParamsOf(t: AnyDoc): TimeParams {
  return {
    startTime: t.start_time || '09:00',
    matchDurationMin: t.match_duration_min ?? 15,
    gapBetweenMatchesMin: t.gap_between_matches_min ?? 5,
    mealBreakStart: t.meal_break_start || null,
    mealBreakDurationMin: t.meal_break_duration_min ?? 0,
  }
}

function scheduleConfigOf(t: AnyDoc) {
  return {
    timeParams: timeParamsOf(t),
    finalsMatchDurationMin: t.finals_match_duration_min ?? null,
    multiCourt: Boolean(t.multi_court),
    numCourts: t.num_courts ?? 1,
    finalsStartTime: t.finals_start_time || null,
  }
}

function rankingDepthOf(t: AnyDoc): RankingDepth {
  if (t.ranking_depth === 'qualifiers_only') return 'qualifiers_only'
  if (t.ranking_depth === 'top_k') return { topK: t.ranking_top_k ?? 8 }
  return 'full'
}

/** Draw: distribute confirmed teams into groups, persist `group_label`, set status. */
export async function runDraw(payload: Payload, tournamentId: Id) {
  const tournament = await loadTournament(payload, tournamentId)
  const teams = await confirmedTeams(payload, tournamentId)
  if (teams.length < tournament.num_groups) {
    throw new TournamentError(
      'PRECONDITION_FAILED',
      `Pas assez d’équipes confirmées (${teams.length}) pour ${tournament.num_groups} poules`,
    )
  }

  // Guard: a schedule already exists → re-drawing would orphan it. Reset first.
  const existingMatches = await groupPhaseMatches(payload, tournamentId)
  if (existingMatches.length > 0) {
    throw new TournamentError(
      'PRECONDITION_FAILED',
      'Le calendrier existe déjà. Réinitialisez le tournoi avant de relancer le tirage.',
    )
  }

  const refs: TeamRef[] = teams.map((t) => ({ id: t.id, name: t.name }))
  const groups = drawGroups(refs, tournament.num_groups)

  for (const group of groups) {
    for (const team of group.teams) {
      await payload.update({
        collection: 'tournament-teams',
        id: team.id as number,
        data: { group_label: group.label },
      })
    }
  }

  await payload.update({
    collection: 'tournaments',
    id: tournamentId as number,
    // Pools start hidden from the public until explicitly revealed (TV ceremony).
    data: { status: 'draw_done', draw_revealed: false },
  })

  return { groups: groups.map((g) => ({ label: g.label, teams: g.teams.map((t) => t.name) })) }
}

async function groupPhaseMatches(payload: Payload, tournamentId: Id): Promise<AnyDoc[]> {
  const res = await payload.find({
    collection: 'tournament-matches',
    where: {
      and: [{ tournament: { equals: tournamentId } }, { phase: { equals: 'group' } }],
    },
    limit: 2000,
    depth: 0,
  })
  return res.docs
}

/** Generate the group-stage schedule. Idempotent while no score has been entered. */
export async function generateSchedule(payload: Payload, tournamentId: Id) {
  const tournament = await loadTournament(payload, tournamentId)
  const teams = await confirmedTeams(payload, tournamentId)

  const grouped = new Map<string, TeamRef[]>()
  for (const t of teams) {
    if (!t.group_label) continue
    const arr = grouped.get(t.group_label) ?? []
    arr.push({ id: t.id, name: t.name })
    grouped.set(t.group_label, arr)
  }
  if (grouped.size === 0) {
    throw new TournamentError('PRECONDITION_FAILED', 'Lancez le tirage avant de générer le calendrier')
  }

  // Refuse to wipe matches that already have scores.
  const existing = await groupPhaseMatches(payload, tournamentId)
  const hasScores = existing.some((m) => typeof m.score_home === 'number' || typeof m.score_away === 'number')
  if (hasScores) {
    throw new TournamentError('PRECONDITION_FAILED', 'Des scores sont déjà saisis : régénération bloquée')
  }
  for (const m of existing) {
    await payload.delete({ collection: 'tournament-matches', id: m.id })
  }

  const groups: DrawnGroup[] = [...grouped.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, t]) => ({ label, teams: t }))

  const scheduled = buildSchedule(groups, courtConfigOf(tournament), timeParamsOf(tournament), Date.now())

  for (const sm of scheduled) {
    await payload.create({
      collection: 'tournament-matches',
      data: {
        tournament: tournamentId,
        phase: 'group',
        group_label: sm.groupLabel,
        round: sm.round,
        court: sm.court ?? undefined,
        scheduled_time: sm.scheduledTime,
        home_team: sm.homeTeamId,
        away_team: sm.awayTeamId,
        fairplay_winner: 'none',
        status: 'scheduled',
      },
    })
  }

  if (tournament.referee_assignment === 'random') {
    const refs = await loadReferees(payload, tournamentId)
    if (refs.length > 0) {
      const created = await groupPhaseMatches(payload, tournamentId)
      await assignRefereesNoClash(payload, created, refs)
    }
  }

  // Status follows progress automatically: a generated calendar means the
  // tournament is live. The beforeChange hook keeps a single tournament live.
  if (tournament.status !== 'finished' && tournament.status !== 'archived') {
    await payload.update({ collection: 'tournaments', id: tournamentId, data: { status: 'live' } })
  }

  return { created: scheduled.length, groups: groups.length }
}

/** Generate the knockout bracket + classification matches once all group matches are played. */
export async function generateKnockoutPhase(payload: Payload, tournamentId: Id) {
  const tournament = await loadTournament(payload, tournamentId)
  const teams = await confirmedTeams(payload, tournamentId)
  const groupMatches = await groupPhaseMatches(payload, tournamentId)

  if (groupMatches.length === 0) {
    throw new TournamentError('PRECONDITION_FAILED', 'Aucun match de poule généré')
  }
  // Guard: don't regenerate the bracket on top of an existing one.
  const existingFinals = await payload.find({
    collection: 'tournament-matches',
    where: {
      and: [
        { tournament: { equals: tournamentId } },
        { or: [{ phase: { equals: 'knockout' } }, { phase: { equals: 'classification' } }] },
      ],
    },
    limit: 1,
    depth: 0,
  })
  if (existingFinals.docs.length > 0) {
    throw new TournamentError(
      'PRECONDITION_FAILED',
      'La phase finale existe déjà. Réinitialisez-la avant de régénérer.',
    )
  }
  const unfinished = groupMatches.filter((m) => m.status !== 'finished')
  if (unfinished.length > 0) {
    throw new TournamentError(
      'PRECONDITION_FAILED',
      `${unfinished.length} match(s) de poule sans score : terminez les poules d’abord`,
    )
  }

  // Standings per group → qualified / non-qualified.
  const teamsByGroup = new Map<string, TeamRef[]>()
  const idToName = new Map<Id, string>()
  for (const t of teams) {
    idToName.set(t.id, t.name)
    if (!t.group_label) continue
    const arr = teamsByGroup.get(t.group_label) ?? []
    arr.push({ id: t.id, name: t.name })
    teamsByGroup.set(t.group_label, arr)
  }

  const qualified: QualifiedTeam[] = []
  const nonQualified: QualifiedTeam[] = []
  const qpg = tournament.qualifiers_per_group ?? 2

  for (const [label, groupTeams] of [...teamsByGroup.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const results: MatchResult[] = groupMatches
      .filter((m) => m.group_label === label)
      .map((m) => ({
        homeTeamId: idOf(m.home_team),
        awayTeamId: idOf(m.away_team),
        scoreHome: m.score_home ?? null,
        scoreAway: m.score_away ?? null,
        fairplayWinner: m.fairplay_winner ?? 'none',
      }))
    const standing = computeStandings(groupTeams, results, getSportProfile(tournament.sport))
    standing.forEach((s) => {
      const entry: QualifiedTeam = {
        teamId: s.teamId,
        teamName: s.teamName,
        group: label,
        rankInGroup: s.rank,
      }
      if (s.rank <= qpg) qualified.push(entry)
      else nonQualified.push(entry)
    })
  }

  // Generate the full exact-ranking bracket family (knockout + consolations +
  // placement), honouring the configured ranking depth.
  const all = rankAll(qualified, nonQualified, teamsByGroup.size, qpg, rankingDepthOf(tournament))

  // Compute finals times + courts via the multi-chain scheduler (keys as ids).
  const { scheduleOf } = buildScheduleMaps(
    [
      ...groupMatches.map((m) => ({ id: `g-${m.id}`, phase: 'group', round: m.round ?? null })),
      ...all.map((b) => ({
        id: b.key,
        phase: b.phase,
        round: b.round,
        bracketLabel: b.bracketLabel,
        nextMatchId: b.nextMatchKey,
        loserNextMatchId: b.loserNextMatchKey,
      })),
    ],
    scheduleConfigOf(tournament),
  )

  // First pass: create matches, remember key → created id.
  const keyToId = new Map<string, number>()
  for (const b of all) {
    const sched = scheduleOf({ id: b.key, phase: b.phase, round: b.round })
    const created = await payload.create({
      collection: 'tournament-matches',
      data: {
        tournament: tournamentId,
        phase: b.phase,
        bracket_label: b.bracketLabel,
        round: b.round,
        scheduled_time: sched.time ?? undefined,
        court: sched.court ?? undefined,
        home_team: b.homeTeamId ?? undefined,
        away_team: b.awayTeamId ?? undefined,
        fairplay_winner: 'none',
        status: 'scheduled',
      },
    })
    keyToId.set(b.key, created.id as number)
  }

  // Second pass: wire progression + source links.
  for (const b of all) {
    const data: AnyDoc = {}
    if (b.nextMatchKey && keyToId.has(b.nextMatchKey)) {
      data.next_match = keyToId.get(b.nextMatchKey)
      data.next_slot = b.nextSlot
    }
    if (b.loserNextMatchKey && keyToId.has(b.loserNextMatchKey)) {
      data.loser_next_match = keyToId.get(b.loserNextMatchKey)
      data.loser_next_slot = b.loserNextSlot
    }
    if (b.homeSourceKey && keyToId.has(b.homeSourceKey)) data.home_source_match = keyToId.get(b.homeSourceKey)
    if (b.awaySourceKey && keyToId.has(b.awaySourceKey)) data.away_source_match = keyToId.get(b.awaySourceKey)
    if (Object.keys(data).length > 0) {
      await payload.update({ collection: 'tournament-matches', id: keyToId.get(b.key)!, data })
    }
  }

  if (tournament.referee_assignment === 'random') {
    const refs = await loadReferees(payload, tournamentId)
    if (refs.length > 0) {
      const finals = await payload.find({
        collection: 'tournament-matches',
        where: {
          and: [
            { tournament: { equals: tournamentId } },
            { or: [{ phase: { equals: 'knockout' } }, { phase: { equals: 'classification' } }] },
          ],
        },
        limit: 2000,
        depth: 0,
      })
      await assignRefereesNoClash(payload, finals.docs as AnyDoc[], refs)
    }
  }

  const koCount = all.filter((b) => b.phase === 'knockout').length
  const clCount = all.filter((b) => b.phase === 'classification').length
  return { knockout: koCount, classification: clCount, qualified: qualified.length }
}

function idOf(rel: unknown): Id {
  if (rel != null && typeof rel === 'object') return (rel as { id: Id }).id
  return rel as Id
}

// ---------------------------------------------------------------------------
// Dev mode - test helpers (only callable when the tournament has dev_mode on).
// ---------------------------------------------------------------------------

async function requireDevMode(payload: Payload, slugOrId: Id): Promise<AnyDoc> {
  const t = await resolveTournament(payload, slugOrId)
  if (!t.dev_mode) throw new TournamentError('PRECONDITION_FAILED', 'Mode développeur désactivé')
  return t
}

const FAKE_TEAM_NAMES = [
  'Los Galácticos', 'FC Dynamite', 'Real Sporting', 'Atlético Bruxelles', 'Futsal Kings',
  'Les Lynx', 'CD Esperanza', 'Panthers FS', 'Olympique Midi', 'Racing Étoile',
  'Inter Quartier', 'AS Tonnerre', 'Deportivo Sol', 'Les Aigles', 'FC Cobra',
  'Union Futsal', 'Samba Boys', 'Titans FS', 'Rojos United', 'Vélodrome FC',
  'Les Faucons', 'Sporting Norte', 'CD Relámpago', 'Phoenix Futsal', 'Lobos FS',
  'Toros Bravos', 'Gladiators FS', 'Estrella Roja', 'Les Loups', 'Bantous FC',
]
const FAKE_FIRST = ['Diego', 'Karim', 'Bryan', 'Mehdi', 'Luca', 'Samuel', 'Yanis', 'Tom', 'Hugo', 'Rayan']
const FAKE_LAST = ['Garcia', 'Diallo', 'Lopez', 'Mertens', 'Nguyen', 'Rossi', 'Dubois', 'Ben Ali', 'Costa', 'Marchand']

/** Seed confirmed+paid teams with realistic generated data (up to num_groups × group_size). */
export async function devSeedTeams(payload: Payload, slugOrId: Id) {
  const t = await requireDevMode(payload, slugOrId)
  const target = (t.num_groups ?? 4) * (t.group_size ?? 4)
  const existing = await payload.find({
    collection: 'tournament-teams',
    where: { tournament: { equals: t.id } },
    limit: 1000,
    depth: 0,
  })
  const have = existing.docs.length
  const usedNames = new Set<string>(existing.docs.map((d) => (d as { name?: string }).name ?? ''))
  let created = 0
  for (let i = have; i < target; i++) {
    let name = FAKE_TEAM_NAMES[i % FAKE_TEAM_NAMES.length]
    if (usedNames.has(name)) name = `${name} ${Math.floor(i / FAKE_TEAM_NAMES.length) + 2}`
    usedNames.add(name)
    const first = FAKE_FIRST[Math.floor(Math.random() * FAKE_FIRST.length)]
    const last = FAKE_LAST[Math.floor(Math.random() * FAKE_LAST.length)]
    const phone = `+324${Math.floor(10000000 + Math.random() * 89999999)}`
    await payload.create({
      collection: 'tournament-teams',
      overrideAccess: true,
      data: {
        tournament: t.id,
        name,
        representative_email: `${first}.${last}@example.com`.toLowerCase().replace(/\s/g, ''),
        representative_phone: phone,
        registration_status: 'confirmed',
        payment_status: 'paid',
      },
    })
    created++
  }
  return { created, total: target }
}

function randomScore(): number {
  return Math.floor(Math.random() * 7)
}

/** Fill matches with random scores (+ fair-play, + penalties on knockout draws). */
export async function devRandomScores(
  payload: Payload,
  slugOrId: Id,
  phases: ('group' | 'knockout' | 'classification')[],
) {
  const t = await requireDevMode(payload, slugOrId)
  const res = await payload.find({
    collection: 'tournament-matches',
    where: { tournament: { equals: t.id } },
    limit: 2000,
    depth: 0,
  })
  const matches = (res.docs as AnyDoc[])
    .filter((m) => phases.includes(m.phase))
    .sort((a, b) => (a.round ?? 0) - (b.round ?? 0))

  let scored = 0
  for (const snapshot of matches) {
    // Re-fetch to pick up teams filled by bracket propagation.
    const m = await payload.findByID({ collection: 'tournament-matches', id: snapshot.id, depth: 0 })
    if (!idOf(m.home_team) || !idOf(m.away_team)) continue

    const sh = randomScore()
    const sa = randomScore()
    const data: AnyDoc = {
      score_home: sh,
      score_away: sa,
      fairplay_winner: ['home', 'away', 'none'][Math.floor(Math.random() * 3)],
    }
    if (m.phase !== 'group' && sh === sa) {
      const ph = Math.floor(Math.random() * 4) + 3
      let pa = Math.floor(Math.random() * 4) + 3
      if (ph === pa) pa = ph + 1
      data.penalty_home = ph
      data.penalty_away = pa
    }
    await payload.update({ collection: 'tournament-matches', id: m.id, data })
    scored++
  }
  return { scored }
}

/** Full simulation: seed → draw → schedule → random group scores → knockout → random scores. */
export async function devSimulate(payload: Payload, slugOrId: Id) {
  const t = await requireDevMode(payload, slugOrId)
  const steps: string[] = []

  const confirmed = await confirmedTeams(payload, t.id)
  if (confirmed.length < (t.num_groups ?? 4)) {
    await devSeedTeams(payload, t.id)
    steps.push('seed')
  }

  const groupMatches = await groupPhaseMatches(payload, t.id)
  if (groupMatches.length === 0) {
    await runDraw(payload, t.id)
    await generateSchedule(payload, t.id)
    steps.push('draw+schedule')
  }

  await devRandomScores(payload, t.id, ['group'])
  steps.push('group-scores')

  const finals = await payload.find({
    collection: 'tournament-matches',
    where: {
      and: [
        { tournament: { equals: t.id } },
        { or: [{ phase: { equals: 'knockout' } }, { phase: { equals: 'classification' } }] },
      ],
    },
    limit: 1,
    depth: 0,
  })
  if (finals.docs.length === 0) {
    await generateKnockoutPhase(payload, t.id)
    steps.push('knockout')
  }

  await devRandomScores(payload, t.id, ['knockout', 'classification'])
  steps.push('final-scores')

  await payload.update({ collection: 'tournaments', id: t.id, data: { status: 'live' } })
  return { steps }
}

/** Resolve a tournament by slug, falling back to numeric id. */
async function resolveTournament(payload: Payload, slugOrId: Id): Promise<AnyDoc> {
  const bySlug = await payload.find({
    collection: 'tournaments',
    where: { slug: { equals: String(slugOrId) } },
    limit: 1,
    depth: 0,
  })
  if (bySlug.docs[0]) return bySlug.docs[0] as AnyDoc
  return loadTournament(payload, slugOrId)
}

/**
 * Reset a tournament: delete all matches, clear group assignments, and set the
 * status back to `registration`. Inscriptions (teams) are kept.
 */
export async function resetTournament(payload: Payload, slugOrId: Id) {
  const tournament = await resolveTournament(payload, slugOrId)

  const matches = await payload.find({
    collection: 'tournament-matches',
    where: { tournament: { equals: tournament.id } },
    limit: 5000,
    depth: 0,
  })
  for (const m of matches.docs as AnyDoc[]) {
    await payload.delete({ collection: 'tournament-matches', id: m.id })
  }

  const teams = await payload.find({
    collection: 'tournament-teams',
    where: { tournament: { equals: tournament.id } },
    limit: 1000,
    depth: 0,
  })
  for (const t of teams.docs as AnyDoc[]) {
    if (t.group_label) {
      await payload.update({ collection: 'tournament-teams', id: t.id, data: { group_label: null } })
    }
  }

  await payload.update({
    collection: 'tournaments',
    id: tournament.id,
    data: { status: 'registration', fairplay_winner_team: null, draw_revealed: false },
  })

  return { deletedMatches: matches.docs.length, status: 'registration' }
}

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

async function loadReferees(payload: Payload, tournamentId: Id): Promise<AnyDoc[]> {
  const res = await payload.find({
    collection: 'tournament-referees',
    where: { or: [{ tournament: { equals: tournamentId } }, { tournament: { exists: false } }] },
    limit: 500,
    depth: 0,
  })
  return res.docs as AnyDoc[]
}

/**
 * Assign referees so that the same referee is never on two simultaneous matches
 * (matches in the same phase + round play at the same time in the lockstep model).
 */
async function assignRefereesNoClash(payload: Payload, matches: AnyDoc[], referees: AnyDoc[]) {
  if (referees.length === 0) return 0
  const slots = new Map<string, AnyDoc[]>()
  for (const m of matches) {
    const key = `${m.phase}:${m.round ?? 'x'}`
    const arr = slots.get(key) ?? []
    arr.push(m)
    slots.set(key, arr)
  }
  let assigned = 0
  for (const group of slots.values()) {
    const pool = shuffleInPlace(referees.slice())
    for (let i = 0; i < group.length; i++) {
      const ref = pool[i % pool.length]
      await payload.update({ collection: 'tournament-matches', id: group[i].id, data: { referee: ref.id } })
      assigned++
    }
  }
  return assigned
}

/** Randomly assign a referee to every match (override stays possible per match). */
export async function assignRefereesRandomly(payload: Payload, slugOrId: Id) {
  const tournament = await resolveTournament(payload, slugOrId)
  const [matchesRes, referees] = await Promise.all([
    payload.find({ collection: 'tournament-matches', where: { tournament: { equals: tournament.id } }, limit: 2000, depth: 0 }),
    loadReferees(payload, tournament.id),
  ])
  if (referees.length === 0) {
    throw new TournamentError('PRECONDITION_FAILED', 'Aucun arbitre à affecter')
  }
  const assigned = await assignRefereesNoClash(payload, matchesRes.docs as AnyDoc[], referees)
  return { assigned, referees: referees.length }
}

export interface ScoreInput {
  scoreHome: number
  scoreAway: number
  fairplayWinner?: 'home' | 'away' | 'none'
  penaltyHome?: number | null
  penaltyAway?: number | null
}

/** Enter (or correct) a match score. Hooks handle bracket propagation + cache. */
export async function enterScore(payload: Payload, matchId: Id, input: ScoreInput) {
  if (typeof input.scoreHome !== 'number' || typeof input.scoreAway !== 'number') {
    throw new TournamentError('VALIDATION_ERROR', 'Scores requis')
  }
  let match: AnyDoc
  try {
    match = await payload.findByID({ collection: 'tournament-matches', id: matchId as number, depth: 0 })
  } catch {
    throw new TournamentError('NOT_FOUND', 'Match introuvable')
  }

  const needsPenalties = match.phase !== 'group' // knockout + classification
  const draw = input.scoreHome === input.scoreAway
  const hasPenalties = typeof input.penaltyHome === 'number' && typeof input.penaltyAway === 'number'
  if (needsPenalties && draw) {
    if (!hasPenalties) {
      throw new TournamentError('VALIDATION_ERROR', 'Match nul : saisissez le score des tirs au but')
    }
    if (input.penaltyHome === input.penaltyAway) {
      throw new TournamentError('VALIDATION_ERROR', 'Les tirs au but ne peuvent pas être à égalité')
    }
  }

  await payload.update({
    collection: 'tournament-matches',
    id: matchId as number,
    data: {
      score_home: input.scoreHome,
      score_away: input.scoreAway,
      fairplay_winner: input.fairplayWinner ?? 'none',
      penalty_home: needsPenalties && draw ? input.penaltyHome : null,
      penalty_away: needsPenalties && draw ? input.penaltyAway : null,
      penalty_winner: needsPenalties && draw ? undefined : null, // derived in beforeChange
    },
  })

  return { ok: true }
}

/** Clear a match score (un-save it): back to scheduled, no score / fair-play / penalties. */
export async function clearScore(payload: Payload, matchId: Id) {
  await payload.update({
    collection: 'tournament-matches',
    id: matchId as number,
    data: {
      score_home: null,
      score_away: null,
      fairplay_winner: 'none',
      penalty_home: null,
      penalty_away: null,
      penalty_winner: null,
      status: 'scheduled',
    },
  })
  return { ok: true }
}
