import type { Payload } from 'payload'
import { runDraw, generateSchedule, generateKnockoutPhase, enterScore } from '@/lib/tournament/orchestrator'
import { makeRng } from '@/lib/tournament/rng'

/**
 * The public live demo.
 *
 * Two tournaments in a dedicated organization:
 *  - a SHOWCASE, played to the end, so a visitor immediately sees a real
 *    tournament (pools, bracket, final ranking, TV screen) without touching
 *    anything;
 *  - a PLAYGROUND, left at "registration closed" with confirmed teams, so a
 *    visitor logging in with the demo account can actually run the draw, the
 *    schedule and the finals.
 *
 * The showcase is produced by the real engine (draw → schedule → scores →
 * knockout), never by hand-written fixtures: the demo therefore cannot drift
 * from what the product does, and a broken engine breaks the seed loudly.
 *
 * Safe to expose publicly because the demo user is a plain `manager` bound to
 * this organization only: the tenant guard in lib/tournament/server.ts stops it
 * from reading or touching any other club's data, and `requireOwner` keeps the
 * dev endpoints out of reach.
 */

export const DEMO_ORG_SLUG = 'demo'
export const DEMO_SHOWCASE_SLUG = 'demo-tournoi'
export const DEMO_PLAYGROUND_SLUG = 'demo-bac-a-sable'
/** Display name of the playground, for the marketing block. */
export const DEMO_PLAYGROUND_NAME = 'Bac à sable'

/** Credentials are public on purpose — this is a demo anyone may open. */
export const DEMO_EMAIL = process.env.DEMO_EMAIL?.trim() || 'demo@cancha.be'
export const DEMO_PASSWORD = process.env.DEMO_PASSWORD?.trim() || 'DemoCancha2026'

const SHOWCASE_TEAMS = [
  'Real Sporting',
  'AS Tonnerre',
  'FC Comète',
  'Les Lynx',
  'Olympic 7',
  'Dynamo Nord',
  'Étoile Rouge',
  'Les Aigles',
]

const PLAYGROUND_TEAMS = [
  'Les Corsaires',
  'FC Atlas',
  'Club Ardent',
  'Racing Vert',
  'US Meridian',
  'Les Faucons',
  'Sporting Lac',
  'AC Boréal',
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyDoc = Record<string, any>

async function upsertOrganization(payload: Payload): Promise<number> {
  const found = await payload.find({
    collection: 'organizations',
    where: { slug: { equals: DEMO_ORG_SLUG } },
    limit: 1,
    depth: 0,
  })
  if (found.docs[0]) return found.docs[0].id as number
  const created = await payload.create({
    collection: 'organizations',
    data: { name: 'Club de démonstration', slug: DEMO_ORG_SLUG },
  })
  return created.id as number
}

async function upsertDemoUser(payload: Payload, tenantId: number): Promise<void> {
  const found = await payload.find({
    collection: 'users',
    where: { email: { equals: DEMO_EMAIL } },
    limit: 1,
    depth: 0,
  })
  const data = {
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    role: 'manager' as const,
    tenants: [{ tenant: tenantId }],
  }
  if (found.docs[0]) {
    // Reset the password too: a visitor may have been handed stale credentials.
    await payload.update({ collection: 'users', id: found.docs[0].id, data })
    return
  }
  await payload.create({ collection: 'users', data })
}

/** Delete a tournament and everything hanging off it, if it exists. */
async function wipeTournament(payload: Payload, slug: string): Promise<void> {
  const found = await payload.find({
    collection: 'tournaments',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  })
  const t = found.docs[0] as AnyDoc | undefined
  if (!t) return
  for (const collection of ['tournament-matches', 'tournament-teams', 'tournament-sponsors', 'tournament-referees'] as const) {
    const docs = await payload.find({
      collection,
      where: { tournament: { equals: t.id } },
      limit: 2000,
      depth: 0,
    })
    for (const doc of docs.docs) {
      await payload.delete({ collection, id: doc.id as number })
    }
  }
  await payload.delete({ collection: 'tournaments', id: t.id as number })
}

async function createTournament(
  payload: Payload,
  tenantId: number,
  slug: string,
  name: string,
  teams: string[],
  extra: AnyDoc = {},
): Promise<number> {
  const created = await payload.create({
    collection: 'tournaments',
    data: {
      name,
      slug,
      tenant: tenantId,
      sport: 'futsal',
      format: 'groups_ko',
      status: 'registration_closed',
      num_groups: 2,
      group_size: 4,
      qualifiers_per_group: 2,
      start_time: '09:00',
      match_duration_min: 15,
      gap_between_matches_min: 5,
      multi_court: true,
      num_courts: 2,
      ...extra,
    },
  })
  const tournamentId = created.id as number
  for (const teamName of teams) {
    await payload.create({
      collection: 'tournament-teams',
      data: {
        tournament: tournamentId,
        name: teamName,
        representative_email: DEMO_EMAIL,
        representative_phone: '+32 470 00 00 00',
        registration_status: 'confirmed',
        payment_status: 'paid',
      },
    })
  }
  return tournamentId
}

/** Plausible, deterministic score for a demo match. */
function demoScore(rng: () => number): { home: number; away: number } {
  const home = Math.floor(rng() * 5)
  const away = Math.floor(rng() * 5)
  return { home, away }
}

/**
 * Play every match of a phase.
 *
 * Re-reads between passes on purpose: in a bracket, a later round has no teams
 * until the round feeding it is played (the winners are propagated by the match
 * hook). Fetching once and iterating would skip the final — leaving a tournament
 * with a champion on the podium but an empty final on the bracket.
 */
async function playPhase(payload: Payload, tournamentId: number, phase: 'group' | 'knockout' | 'classification') {
  // Fixed seed: the demo looks the same on every reset, which makes it easier to
  // talk about (a screenshot stays true).
  const rng = makeRng(20260101 + tournamentId)
  // A bracket of N teams has at most log2(N) rounds; the guard is a safety net,
  // the loop normally stops as soon as a pass plays nothing.
  for (let pass = 0; pass < 12; pass++) {
    const matches = await payload.find({
      collection: 'tournament-matches',
      where: { and: [{ tournament: { equals: tournamentId } }, { phase: { equals: phase } }] },
      limit: 2000,
      depth: 0,
      sort: 'id',
    })
    const playable = (matches.docs as AnyDoc[]).filter(
      (m) => m.home_team != null && m.away_team != null && m.status !== 'finished',
    )
    if (playable.length === 0) return
    for (const m of playable) {
      const { home: rawHome, away } = demoScore(rng)
      // Knockout matches must have a winner: nudge rather than enter penalties.
      const home = phase !== 'group' && rawHome === away ? rawHome + 1 : rawHome
      await enterScore(payload, m.id as number, {
        scoreHome: home,
        scoreAway: away,
        fairplayWinner: 'none',
        penaltyHome: null,
        penaltyAway: null,
      })
    }
  }
}

export interface DemoSeedResult {
  showcaseSlug: string
  playgroundSlug: string
  email: string
  password: string
}

/**
 * (Re)build the demo from scratch. Idempotent: it wipes the two demo tournaments
 * and rebuilds them, so a visitor who left the playground half-played does not
 * spoil it for the next one.
 */
export async function seedDemo(payload: Payload): Promise<DemoSeedResult> {
  const tenantId = await upsertOrganization(payload)
  await upsertDemoUser(payload, tenantId)

  await wipeTournament(payload, DEMO_SHOWCASE_SLUG)
  await wipeTournament(payload, DEMO_PLAYGROUND_SLUG)

  // 1. Showcase: driven all the way through the real engine.
  const showcaseId = await createTournament(
    payload,
    tenantId,
    DEMO_SHOWCASE_SLUG,
    'Tournoi de démonstration',
    SHOWCASE_TEAMS,
    { description: 'Un tournoi joué de bout en bout, pour voir le résultat final.' },
  )
  await runDraw(payload, showcaseId)
  await generateSchedule(payload, showcaseId)
  await playPhase(payload, showcaseId, 'group')
  await generateKnockoutPhase(payload, showcaseId)
  await playPhase(payload, showcaseId, 'knockout')
  await playPhase(payload, showcaseId, 'classification')
  await payload.update({
    collection: 'tournaments',
    id: showcaseId,
    data: { status: 'finished', draw_revealed: true },
  })

  // 2. Playground: teams confirmed, nothing generated — the visitor drives it.
  const playgroundId = await createTournament(
    payload,
    tenantId,
    DEMO_PLAYGROUND_SLUG,
    'Bac à sable',
    PLAYGROUND_TEAMS,
    { description: 'À vous de jouer : lancez le tirage, le calendrier et la phase finale.' },
  )
  void playgroundId

  return {
    showcaseSlug: DEMO_SHOWCASE_SLUG,
    playgroundSlug: DEMO_PLAYGROUND_SLUG,
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
  }
}
