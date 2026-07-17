import type { BracketMatch, Id, QualifiedTeam } from './types'

function nextPow2(n: number): number {
  let p = 1
  while (p < n) p *= 2
  return p
}

function isPow2(n: number): boolean {
  return n >= 1 && (n & (n - 1)) === 0
}

/**
 * Standard tournament seed order for a bracket of `size` slots: seed 1 meets the
 * lowest seed, etc. Byes (seed numbers greater than the team count) naturally
 * fall to the top seeds, so a round never exceeds size/2 real matches.
 */
export function standardSeedOrder(size: number): number[] {
  if (size <= 1) return [1]
  let seeds = [1, 2]
  while (seeds.length < size) {
    const sum = seeds.length * 2 + 1
    const next: number[] = []
    for (const s of seeds) {
      next.push(s)
      next.push(sum - s)
    }
    seeds = next
  }
  return seeds
}

export function roundLabel(matchesInRound: number): string {
  switch (matchesInRound) {
    case 1:
      return 'Finale'
    case 2:
      return 'Demi-finale'
    case 4:
      return 'Quart de finale'
    case 8:
      return '8e de finale'
    case 16:
      return '16e de finale'
    default:
      return `Tour (${matchesInRound} matchs)`
  }
}

type Feeder =
  | { kind: 'team'; teamId: Id }
  | { kind: 'match'; key: string }
  | { kind: 'bye' }

/**
 * Round-1 slot order for one crossed group pair (X, Y) with Q qualifiers each.
 * The 2Q teams are seeded `[X1, Y1, X2, Y2, …]` (interleaved by rank, so the two
 * group winners are the block's top seeds) and placed with `standardSeedOrder`,
 * which sends byes to the winners. When 2Q is a power of two (Q = 1, 2, 4) this
 * yields exactly "rank r of X vs rank (Q+1-r) of Y"; Q = 3 adds byes to X1/Y1.
 */
function pairBlockSlots(
  X: string,
  Y: string,
  Q: number,
  rankTeam: (g: string, rank: number) => Id | null,
): (Id | null)[] {
  const blockSeeds: (Id | null)[] = []
  for (let r = 1; r <= Q; r++) blockSeeds.push(rankTeam(X, r), rankTeam(Y, r))
  const size = nextPow2(2 * Q)
  return standardSeedOrder(size).map((s) => (s <= blockSeeds.length ? blockSeeds[s - 1] : null))
}

/**
 * Build the seeded first-round slot order for the knockout bracket. Generic for
 * an EVEN number of groups and any qualifiers-per-group Q.
 *
 * Groups are crossed by half-split (A↔C, B↔D…). Each crossed pair becomes a
 * seeded block (see {@link pairBlockSlots}); the blocks themselves are ordered
 * with `standardSeedOrder` so the strongest pair-regions sit on opposite halves
 * and the group winners can't meet before the latest possible round.
 */
function seededSlots(
  qualified: readonly QualifiedTeam[],
  numGroups: number,
  qualifiersPerGroup: number,
): (Id | null)[] {
  const rankTeam = (g: string, rank: number) =>
    qualified.find((q) => q.group === g && q.rankInGroup === rank)?.teamId ?? null
  const groups = [...new Set(qualified.map((q) => q.group))].sort()
  const Q = Math.max(1, qualifiersPerGroup)

  // Odd group counts (or a single group) can't be cleanly cross-paired: fall
  // back to plain rank-then-group seeding with byes to the top seeds.
  if (groups.length < 2 || groups.length % 2 !== 0) {
    const seeded = [...qualified].sort(
      (a, b) => a.rankInGroup - b.rankInGroup || a.group.localeCompare(b.group),
    )
    const size = nextPow2(seeded.length)
    return standardSeedOrder(size).map((s) => (s <= seeded.length ? seeded[s - 1].teamId : null))
  }

  const half = groups.length / 2
  const pairs: [string, string][] = []
  for (let k = 0; k < half; k++) pairs.push([groups[k], groups[k + half]])

  const blockSize = nextPow2(2 * Q)
  const slots: (Id | null)[] = []
  // Order the pair-blocks across the bracket; a bye super-seed = an empty block.
  for (const superSeed of standardSeedOrder(nextPow2(half))) {
    const pair = superSeed <= pairs.length ? pairs[superSeed - 1] : null
    if (pair) slots.push(...pairBlockSlots(pair[0], pair[1], Q, rankTeam))
    else slots.push(...new Array<Id | null>(blockSize).fill(null))
  }
  return slots
}

/**
 * Generate the knockout bracket from the group standings' qualified teams.
 * Returns all bracket matches with progression links (`nextMatchKey`/`nextSlot`)
 * and source links. Byes auto-advance a team into the next round.
 */
export function generateKnockout(
  qualified: readonly QualifiedTeam[],
  numGroups: number,
  qualifiersPerGroup: number,
): BracketMatch[] {
  if (qualified.length < 2) return []

  const slots = seededSlots(qualified, numGroups, qualifiersPerGroup)
  const size = slots.length
  const totalRounds = Math.log2(size)

  const matches: BracketMatch[] = []
  let feeders: Feeder[] = slots.map((teamId) =>
    teamId == null ? ({ kind: 'bye' } as Feeder) : ({ kind: 'team', teamId } as Feeder),
  )

  for (let round = 1; round <= totalRounds; round++) {
    const matchesInRound = feeders.length / 2
    const label = roundLabel(matchesInRound)
    const nextFeeders: Feeder[] = []

    for (let k = 0; k < feeders.length; k += 2) {
      const fa = feeders[k]
      const fb = feeders[k + 1]

      // Bye handling: a single present feeder advances without a match.
      if (fa.kind === 'bye' && fb.kind === 'bye') {
        nextFeeders.push({ kind: 'bye' })
        continue
      }
      if (fa.kind === 'bye') {
        nextFeeders.push(fb)
        continue
      }
      if (fb.kind === 'bye') {
        nextFeeders.push(fa)
        continue
      }

      const key = `KO-R${round}-M${k / 2}`
      matches.push({
        key,
        phase: 'knockout',
        bracketLabel: label,
        round,
        homeTeamId: fa.kind === 'team' ? fa.teamId : null,
        awayTeamId: fb.kind === 'team' ? fb.teamId : null,
        homeSourceKey: fa.kind === 'match' ? fa.key : null,
        awaySourceKey: fb.kind === 'match' ? fb.key : null,
        nextMatchKey: null,
        nextSlot: null,
      })
      nextFeeders.push({ kind: 'match', key })
    }

    feeders = nextFeeders
  }

  // Wire progression: each match feeds the next round's match.
  const byKey = new Map(matches.map((m) => [m.key, m]))
  for (const m of matches) {
    if (m.homeSourceKey && byKey.has(m.homeSourceKey)) {
      const src = byKey.get(m.homeSourceKey)!
      src.nextMatchKey = m.key
      src.nextSlot = 'home'
    }
    if (m.awaySourceKey && byKey.has(m.awaySourceKey)) {
      const src = byKey.get(m.awaySourceKey)!
      src.nextMatchKey = m.key
      src.nextSlot = 'away'
    }
  }

  // 3rd-place match ("petite finale"): the two semifinal losers play for 3rd/4th.
  const final = matches.find((m) => m.round === totalRounds)
  const semis = matches.filter((m) => m.round === totalRounds - 1)
  if (final && semis.length === 2) {
    const thirdKey = 'KO-3RD'
    matches.push({
      key: thirdKey,
      phase: 'knockout',
      bracketLabel: 'Petite finale (3e place)',
      round: totalRounds,
      homeTeamId: null,
      awayTeamId: null,
      homeSourceKey: null,
      awaySourceKey: null,
      nextMatchKey: null,
      nextSlot: null,
    })
    semis[0].loserNextMatchKey = thirdKey
    semis[0].loserNextSlot = 'home'
    semis[1].loserNextMatchKey = thirdKey
    semis[1].loserNextSlot = 'away'
  }

  return matches
}

// ---------------------------------------------------------------------------
// Generic exact-ranking engine (rankAll) - adapts to any even group count,
// any qualifiers Q, any group size, with configurable ranking depth.
// ---------------------------------------------------------------------------

/** How far to rank the field: everyone, only the top K, or just the qualifiers. */
export type RankingDepth = 'full' | 'qualifiers_only' | { topK: number }

const placeLabel = (lo: number, hi: number) => (hi > lo ? `Places ${lo}-${hi}` : `Place ${lo}`)

interface LadderResult {
  matches: BracketMatch[]
  /** Where each entry slot (in bracket order) enters the ladder (round-1 match). */
  entries: { key: string; slot: 'home' | 'away' }[]
}

/**
 * Exact-ranking ladder over `entry` seeds (bracket order, length a power of two,
 * `null` = bye) into places `[bandLo .. bandLo + M - 1]`. Both the winner and the
 * loser of every match keep playing, so the whole band is ranked exactly.
 *
 * Structure (matches the hand-tuned format):
 *  - 2 teams  → 1 deciding match.
 *  - 4 teams  → 2 deciding matches in ONE round (the consolation "5-8" shape).
 *  - 8+ teams → one split round (winners up, losers down) then recurse - the
 *               2-round placement bracket shape for 8, 3 rounds for 16, …
 */
function placementLadder(
  entry: readonly (Id | null)[],
  bandLo: number,
  prefix: string,
  phase: 'knockout' | 'classification',
  round: number,
): LadderResult {
  const M = entry.length
  const matches: BracketMatch[] = []
  const entries: { key: string; slot: 'home' | 'away' }[] = new Array(M)

  const decide = (key: string, home: Id | null, away: Id | null, lo: number, r: number): BracketMatch => ({
    key,
    phase,
    bracketLabel: placeLabel(lo, lo + 1),
    round: r,
    homeTeamId: home,
    awayTeamId: away,
    homeSourceKey: null,
    awaySourceKey: null,
    nextMatchKey: null,
    nextSlot: null,
  })

  if (M <= 1) return { matches, entries }

  if (M === 2 || M === 4) {
    for (let j = 0; j < M / 2; j++) {
      const key = `${prefix}-D${j}`
      matches.push(decide(key, entry[2 * j], entry[2 * j + 1], bandLo + 2 * j, round))
      entries[2 * j] = { key, slot: 'home' }
      entries[2 * j + 1] = { key, slot: 'away' }
    }
    return { matches, entries }
  }

  // M >= 8: split round (adjacent bracket pairs), then recurse on winners/losers.
  const half = M / 2
  const upper = placementLadder(new Array<Id | null>(half).fill(null), bandLo, `${prefix}U`, phase, round + 1)
  const lower = placementLadder(new Array<Id | null>(half).fill(null), bandLo + half, `${prefix}L`, phase, round + 1)
  for (let j = 0; j < half; j++) {
    const key = `${prefix}-S${j}`
    matches.push({
      key,
      phase,
      bracketLabel: 'Barrage classement',
      round,
      homeTeamId: entry[2 * j],
      awayTeamId: entry[2 * j + 1],
      homeSourceKey: null,
      awaySourceKey: null,
      nextMatchKey: upper.entries[j].key,
      nextSlot: upper.entries[j].slot,
      loserNextMatchKey: lower.entries[j].key,
      loserNextSlot: lower.entries[j].slot,
    })
    // Wire the WINNER's destination (upper decider) back to this barrage match so
    // the public view names its slot "Vainqueur {code}" instead of "À déterminer".
    // (The loser's destination is named via the loserNext link / loserInto map.)
    const dest = upper.entries[j]
    const destMatch = upper.matches.find((mm) => mm.key === dest.key)
    if (destMatch) {
      if (dest.slot === 'home') destMatch.homeSourceKey = key
      else destMatch.awaySourceKey = key
    }
    entries[2 * j] = { key, slot: 'home' }
    entries[2 * j + 1] = { key, slot: 'away' }
  }
  matches.push(...upper.matches, ...lower.matches)
  return { matches, entries }
}

/** Whether a place band [lo..hi] should be produced given the ranking depth. */
function bandInDepth(lo: number, depth: RankingDepth): boolean {
  if (depth === 'full') return true
  if (depth === 'qualifiers_only') return false
  return lo <= depth.topK
}

/**
 * Pair the given teams into single "Classement" deciding matches - the graceful
 * fallback when a field cannot be split into a clean power-of-two ladder (byes).
 * The teams are ranked into a coarse tier rather than exact places, but none of
 * them ever vanishes from the final ranking. The generic label deliberately does
 * NOT look like "Places X-Y", so the final-ranking step treats it as a tier.
 */
function tierClassification(
  teams: readonly QualifiedTeam[],
  prefix: string,
  phase: 'knockout' | 'classification',
): BracketMatch[] {
  const sorted = [...teams].sort((a, b) => a.rankInGroup - b.rankInGroup || a.group.localeCompare(b.group))
  const out: BracketMatch[] = []
  for (let i = 0; i < sorted.length; i += 2) {
    out.push({
      key: `${prefix}-T${i / 2}`,
      phase,
      bracketLabel: 'Classement',
      round: 1,
      homeTeamId: sorted[i].teamId,
      awayTeamId: sorted[i + 1]?.teamId ?? null,
      homeSourceKey: null,
      awaySourceKey: null,
      nextMatchKey: null,
      nextSlot: null,
    })
  }
  return out
}

/**
 * Consolation brackets ranking the knockout losers below the final/petite: the
 * losers of each elimination round play a ladder for their exact place band.
 * Mutates the knockout matches to wire their `loserNext*` links. Returns the
 * generated matches and the next free place (a shared cursor the placement
 * brackets continue from, so the two towers never overlap).
 *
 * An exact ladder is only built when a round's loser count is a power of two
 * (no byes); otherwise those losers are left eliminated and fall to a coarse
 * tier in the final ranking - never dropped, never assigned a phantom place.
 */
function consolationBrackets(
  knockout: BracketMatch[],
  depth: RankingDepth,
  startPlace: number,
): { matches: BracketMatch[]; nextPlace: number } {
  if (depth === 'qualifiers_only' || knockout.length === 0) return { matches: [], nextPlace: startPlace }
  const isPetite = (m: BracketMatch) => (m.bracketLabel ?? '').toLowerCase().includes('petite')
  const totalRounds = Math.max(...knockout.map((m) => m.round))
  const out: BracketMatch[] = []
  let bandLo = startPlace // places 1-4 come from the final + petite finale

  // Quarter-finals first (band 5-8), then earlier rounds (9-16, …).
  for (let t = totalRounds - 2; t >= 1; t--) {
    const roundMatches = knockout
      .filter((m) => m.round === t && !isPetite(m))
      .sort((a, b) => a.key.localeCompare(b.key))
    const L = roundMatches.length
    if (L < 2) continue
    // Only a power-of-two loser set splits into a clean exact ladder. The ladder
    // spans exactly L places, so the cursor always advances by L.
    if (isPow2(L) && bandInDepth(bandLo, depth)) {
      const ladder = placementLadder(new Array<Id | null>(L).fill(null), bandLo, `KO-C${t}`, 'knockout', t + 1)
      roundMatches.forEach((m, idx) => {
        m.loserNextMatchKey = ladder.entries[idx].key
        m.loserNextSlot = ladder.entries[idx].slot
      })
      out.push(...ladder.matches)
    }
    bandLo += L
  }
  return { matches: out, nextPlace: bandLo }
}

/**
 * Placement brackets for the non-qualified teams: cross-seed the whole field
 * (3rd-vs-4th across crossed groups, etc., via {@link seededSlots} with the
 * non-qualified ranks remapped) and rank it exactly with a single ladder when
 * the field is a clean power of two (no byes); otherwise fall back to a coarse
 * "Classement" tier so every non-qualified team is still ranked.
 */
function placementBrackets(
  nonQualified: readonly QualifiedTeam[],
  numGroups: number,
  qualifiersPerGroup: number,
  base: number,
  depth: RankingDepth,
): BracketMatch[] {
  if (depth === 'qualifiers_only' || nonQualified.length < 2) return []
  if (!bandInDepth(base + 1, depth)) return []
  const numNonQualRanks = Math.max(1, Math.max(...nonQualified.map((q) => q.rankInGroup)) - qualifiersPerGroup)
  const remapped = nonQualified.map((q) => ({ ...q, rankInGroup: q.rankInGroup - qualifiersPerGroup }))
  const slots = seededSlots(remapped, numGroups, numNonQualRanks)
  // The ladder ranks exactly only when every slot carries a real team (no byes)
  // and the field size is a power of two; byes would emit phantom place bands.
  if (isPow2(slots.length) && slots.every((s) => s != null)) {
    return placementLadder(slots, base + 1, 'PL', 'classification', 1).matches
  }
  return tierClassification(nonQualified, 'PL', 'classification')
}

/**
 * Single entry point: build every match that fully (exactly) ranks the field -
 * the seeded knockout (1-4), the per-level consolations (5-8, 9-16, …) and the
 * non-qualified placement bracket - honouring the configured ranking depth.
 */
export function rankAll(
  qualified: readonly QualifiedTeam[],
  nonQualified: readonly QualifiedTeam[],
  numGroups: number,
  qualifiersPerGroup: number,
  depth: RankingDepth = 'full',
): BracketMatch[] {
  const knockout = generateKnockout(qualified, numGroups, qualifiersPerGroup)
  // The consolations rank places 5..N of the qualified field; their shared cursor
  // tells the placement tower exactly where to start so the bands never overlap.
  const { matches: consolations, nextPlace } = consolationBrackets(knockout, depth, 5)
  const base = Math.max(qualified.length, nextPlace - 1)
  const placements = placementBrackets(nonQualified, numGroups, qualifiersPerGroup, base, depth)
  return [...knockout, ...consolations, ...placements]
}
