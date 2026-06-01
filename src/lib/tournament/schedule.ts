import type { CourtConfig, DrawnGroup, Id, ScheduledMatch, TimeParams } from './types'
import { makeRng, shuffle, type Rng } from './rng'

const BYE = Symbol('bye')
type Slot = Id | typeof BYE

/**
 * Circle method: returns the logical rounds of a single round-robin.
 * For n teams → (n-1) rounds (a phantom bye is added when n is odd).
 * Each team plays once per logical round (or rests against the bye).
 */
export function circleMethodRounds(ids: readonly Id[]): [Id, Id][][] {
  const teams: Slot[] = ids.slice()
  if (teams.length % 2 === 1) teams.push(BYE)
  const n = teams.length
  const arr = teams.slice()
  const rounds: [Id, Id][][] = []

  for (let r = 0; r < n - 1; r++) {
    const pairs: [Id, Id][] = []
    for (let i = 0; i < n / 2; i++) {
      const a = arr[i]
      const b = arr[n - 1 - i]
      if (a !== BYE && b !== BYE) pairs.push([a as Id, b as Id])
    }
    // Rotate, keeping the first element fixed.
    arr.splice(1, 0, arr.pop() as Slot)
    rounds.push(pairs)
  }
  return rounds
}

// Fixed, human-readable order for the standard 4-team group (positions 1-4):
// 1v2, 3v4, 1v4, 2v3, 1v3, 2v4. Same order for every group → predictable global
// rounds, and the optimal 2 back-to-backs (provably unavoidable for 4 on 1 track).
const FIXED_RR_4: [number, number][] = [
  [0, 1],
  [2, 3],
  [0, 3],
  [1, 2],
  [0, 2],
  [1, 3],
]

/**
 * Serialize a group's round-robin into an ordered list of matches such that no
 * team plays three consecutive matches. Groups of 4 use a fixed, predictable
 * fixture order; other sizes fall back to the circle method.
 */
export function serializeGroupMatches(ids: readonly Id[]): [Id, Id][] {
  if (ids.length === 4) return FIXED_RR_4.map(([a, b]) => [ids[a], ids[b]] as [Id, Id])
  return circleMethodRounds(ids).flat()
}

function toMinutes(hhmm: string): number {
  // Accept "13:00", "13h00", "13h", "13.00" - operators type the meal time freely.
  const norm = hhmm.trim().replace(/[hH.]/, ':')
  const [h, m] = norm.split(':')
  return (Number(h) || 0) * 60 + (Number(m) || 0)
}

function toHHMM(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/**
 * Start time (HH:MM) of each successive round, inserting the meal break once the
 * clock reaches `mealBreakStart`. Shared by the group schedule and the finals so
 * the knockout timeline continues seamlessly after the pools.
 */
/** Start time of each slot, advancing by `steps[i]` after slot i; meal break inserted once. */
export function timelineSlots(time: TimeParams, steps: number[]): string[] {
  const out: string[] = []
  let clock = toMinutes(time.startTime)
  const mealStart = time.mealBreakStart ? toMinutes(time.mealBreakStart) : null
  const mealDur = time.mealBreakDurationMin ?? 0
  let mealInserted = mealStart == null || mealDur <= 0

  for (let i = 0; i < steps.length; i++) {
    if (!mealInserted && mealStart != null && clock >= mealStart) {
      clock += mealDur
      mealInserted = true
    }
    out.push(toHHMM(clock))
    clock += steps[i]
  }
  return out
}

export function roundStartTimes(time: TimeParams, count: number): string[] {
  const step = time.matchDurationMin + time.gapBetweenMatchesMin
  return timelineSlots(time, new Array(count).fill(step))
}

export interface ScheduleConfig {
  timeParams: TimeParams
  finalsMatchDurationMin?: number | null
  multiCourt: boolean
  numCourts: number
  /** Optional HH:MM at which the finals (quarter-finals) restart after lunch. */
  finalsStartTime?: string | null
}

export interface MatchSchedule {
  time: string | null
  court: number | null
}

/** A finals match for scheduling, with its feeder links (who it advances to). */
export interface ScheduleMatch {
  id: Id
  phase: string
  round: number | null
  bracketLabel?: string | null
  /** Match the winner advances to (drives the dependency graph). */
  nextMatchId?: Id | null
  /** Match the loser drops into (consolation / petite finale). */
  loserNextMatchId?: Id | null
}

function addMinutes(hhmm: string, min: number): string {
  return toHHMM(((toMinutes(hhmm) + min) % 1440 + 1440) % 1440)
}

const isPlaceMatch = (label?: string | null) => /places?\s*\d+\s*[-–]\s*\d+/i.test(label ?? '')
const isPetiteMatch = (label?: string | null) => (label ?? '').toLowerCase().includes('petite')

/**
 * Multi-chain finals scheduler. Generalises the old even/odd interleave to any
 * number of independent bracket chains (main knockout, per-level consolations,
 * placement bracket) sharing C courts.
 *
 * Greedy list-scheduling over the feeder dependency graph:
 *  - a match starts ≥ 2 slots after every match that feeds it (so an advancing
 *    team always rests one slot - no back-to-back), and
 *  - each slot holds ≤ C matches (overflow spills to the next slot).
 * The final (+ petite) is placed alone in the last slot.
 *
 * For the standard 4-groups / 4-courts format this reproduces the hand-tuned
 * layout: quarts → placement T1 → demis+5-8 → placement T2 → final+petite.
 */
function scheduleFinals(finals: ScheduleMatch[], courts: number): Map<Id, number> {
  const C = Math.max(1, courts)
  // Dependency graph: B depends on A when A feeds B (winner or loser).
  const prereq = new Map<Id, Id[]>()
  for (const a of finals) {
    for (const target of [a.nextMatchId, a.loserNextMatchId]) {
      if (target != null) prereq.set(target, [...(prereq.get(target) ?? []), a.id])
    }
  }

  // The final + petite play alone in the last slot.
  const koReal = finals.filter(
    (m) => m.phase === 'knockout' && !isPlaceMatch(m.bracketLabel) && !isPetiteMatch(m.bracketLabel),
  )
  const maxKoRound = koReal.length ? Math.max(...koReal.map((m) => m.round ?? 1)) : 0
  const finalM =
    koReal.find((m) => (m.round ?? 1) === maxKoRound && m.nextMatchId == null) ??
    koReal.find((m) => (m.round ?? 1) === maxKoRound)
  const petiteM = finals.find((m) => isPetiteMatch(m.bracketLabel))
  const lastIds = new Set<Id>([finalM?.id, petiteM?.id].filter((x): x is Id => x != null))

  const depthCache = new Map<Id, number>()
  const inProgress = new Set<Id>()
  const depth = (id: Id): number => {
    if (depthCache.has(id)) return depthCache.get(id)!
    // Cycle guard: a back-edge in (possibly admin-edited) feeder data resolves to
    // 0 instead of recursing forever - degrade gracefully rather than overflow.
    if (inProgress.has(id)) return 0
    inProgress.add(id)
    const ps = prereq.get(id) ?? []
    const d = ps.length === 0 ? 0 : 1 + Math.max(...ps.map(depth))
    inProgress.delete(id)
    depthCache.set(id, d)
    return d
  }

  const slotOf = new Map<Id, number>()
  const countPerSlot = new Map<number, number>()
  const earliest = (id: Id) => {
    // Only count prereqs already placed: an unplaced prereq (e.g. one held back
    // into the last slot) must not default to slot 0 and collapse the ≥2 gap.
    const ps = (prereq.get(id) ?? []).filter((p) => slotOf.has(p))
    return ps.length === 0 ? 0 : Math.max(...ps.map((p) => slotOf.get(p)! + 2))
  }

  const ordered = finals
    .filter((m) => !lastIds.has(m.id))
    .sort(
      (a, b) =>
        depth(a.id) - depth(b.id) ||
        (a.phase === b.phase ? 0 : a.phase === 'knockout' ? -1 : 1) ||
        String(a.id).localeCompare(String(b.id)),
    )
  for (const m of ordered) {
    let s = earliest(m.id)
    while ((countPerSlot.get(s) ?? 0) >= C) s++
    slotOf.set(m.id, s)
    countPerSlot.set(s, (countPerSlot.get(s) ?? 0) + 1)
  }

  // Final (+ petite) in fresh last slot(s), respecting court capacity: with
  // enough courts they share the final slot; at C=1 the petite spills so the
  // final still ends alone in the very last slot - never 2 matches on 1 court.
  const maxOther = slotOf.size ? Math.max(...slotOf.values()) : -1
  let s = maxOther + 1
  let inSlot = 0
  const placeLast = (id: Id | undefined) => {
    if (id == null) return
    s = Math.max(s, earliest(id))
    if (inSlot >= C) {
      s++
      inSlot = 0
    }
    slotOf.set(id, s)
    inSlot++
  }
  placeLast(petiteM?.id)
  placeLast(finalM?.id)

  return slotOf
}

/**
 * Compute display times + courts for every match from the *current* config
 * (so changing the start time, finals start, durations… is reflected
 * immediately, without regenerating). Group rounds keep their meal-break-aware
 * timeline; the finals use {@link scheduleFinals}.
 */
export function buildScheduleMaps(
  matches: ScheduleMatch[],
  config: ScheduleConfig,
): { scheduleOf: (m: { id: Id; phase: string; round: number | null }) => MatchSchedule } {
  const groupRounds = matches.filter((m) => m.phase === 'group').reduce((mx, x) => Math.max(mx, x.round ?? 0), 0)
  const finals = matches.filter((m) => m.phase !== 'group')

  const slotOf = scheduleFinals(finals, config.multiCourt ? config.numCourts : 1)

  // Court per finals match: stable order within each slot (knockout first).
  const bySlot = new Map<number, ScheduleMatch[]>()
  for (const m of finals) {
    const s = slotOf.get(m.id) ?? 0
    bySlot.set(s, [...(bySlot.get(s) ?? []), m])
  }
  const courtById = new Map<Id, number | null>()
  for (const ms of bySlot.values()) {
    ms.sort(
      (a, b) =>
        (a.phase === b.phase ? 0 : a.phase === 'knockout' ? -1 : 1) || String(a.id).localeCompare(String(b.id)),
    )
    ms.forEach((m, i) => courtById.set(m.id, config.multiCourt ? i + 1 : null))
  }
  const numFinalsSlots = bySlot.size > 0 ? Math.max(...bySlot.keys()) + 1 : 0

  const groupStep = config.timeParams.matchDurationMin + config.timeParams.gapBetweenMatchesMin
  const finalsDur =
    config.finalsMatchDurationMin && config.finalsMatchDurationMin > 0
      ? config.finalsMatchDurationMin
      : config.timeParams.matchDurationMin
  const finalsStep = finalsDur + config.timeParams.gapBetweenMatchesMin

  const groupTimes = timelineSlots(config.timeParams, new Array(groupRounds).fill(groupStep))
  const lastGroup = groupRounds > 0 ? groupTimes[groupRounds - 1] : null
  const naturalStart = lastGroup ? addMinutes(lastGroup, groupStep) : config.timeParams.startTime
  const finalsStart =
    config.finalsStartTime && (!lastGroup || config.finalsStartTime > lastGroup)
      ? config.finalsStartTime
      : naturalStart
  // Non-wrapping forward clock (a long single-court bracket can run past midnight;
  // toHHMM renders 24:30 etc.) - never let the final's time wrap below its feeders.
  // The meal break is already consumed by the group timeline, so disable it here.
  const finalsTimes = timelineSlots(
    { ...config.timeParams, startTime: finalsStart, mealBreakStart: null },
    new Array(numFinalsSlots).fill(finalsStep),
  )

  const scheduleOf = (m: { id: Id; phase: string; round: number | null }): MatchSchedule => {
    if (m.phase === 'group') return { time: groupTimes[(m.round ?? 1) - 1] ?? null, court: null }
    const s = slotOf.get(m.id)
    return { time: s == null ? null : (finalsTimes[s] ?? null), court: courtById.get(m.id) ?? null }
  }

  return { scheduleOf }
}

/**
 * Returns a resolver for finals' start times, continuing the timeline after the
 * pools. Used as a display fallback for knockout/classification matches whose
 * `scheduled_time` was never persisted (e.g. generated before times existed).
 */
export function finalsTimeResolver(
  time: TimeParams,
  lastGroupRound: number,
  maxKoRound: number,
): (phase: string, round: number | null) => string | null {
  const times = roundStartTimes(time, lastGroupRound + maxKoRound + 2)
  return (phase, round) => {
    if (phase === 'group') return null
    const idx = phase === 'classification' ? lastGroupRound : lastGroupRound + (round ?? 1)
    return times[Math.min(times.length - 1, Math.max(0, idx))] ?? null
  }
}

/**
 * Build the full group-stage schedule using the lockstep round model:
 * each global round hosts up to `numCourts` simultaneous matches (one per
 * group in the ideal case), advancing every group's round-robin in parallel.
 *
 * Court assignment:
 *  - single court (`multiCourt = false`): `court = null`, one match per round.
 *  - `fixed`: a group keeps the same court across its matches.
 *  - `random`: courts are reshuffled every round.
 *
 * Times are computed from `TimeParams`, inserting the meal break once the
 * clock reaches `mealBreakStart`.
 */
export function buildSchedule(
  groups: readonly DrawnGroup[],
  courts: CourtConfig,
  time: TimeParams,
  seedOrRng: number | Rng = 1,
): ScheduledMatch[] {
  const rng: Rng = typeof seedOrRng === 'function' ? seedOrRng : makeRng(seedOrRng)
  const effectiveCourts = courts.multiCourt ? Math.max(1, courts.numCourts) : 1

  const queues = groups.map((g) => ({
    label: g.label,
    matches: serializeGroupMatches(g.teams.map((t) => t.id)),
  }))
  const cursors = new Array(queues.length).fill(0)
  const G = queues.length

  // Spread the courts across the groups: when there are more courts than groups
  // (e.g. 2 groups of 5 on 4 courts) each group may run several disjoint matches
  // in parallel instead of leaving courts idle. Distribution is as even as
  // possible; with G === courts each group keeps exactly one court (unchanged).
  // At least one court per group (when courts < groups the per-round capacity,
  // not this cap, limits how many groups play each round); extra courts beyond
  // the group count are spread so groups can run matches in parallel.
  const courtsForGroup = (gi: number) =>
    Math.max(1, Math.floor(effectiveCourts / G) + (gi < effectiveCourts % G ? 1 : 0))
  const courtBase: number[] = []
  for (let gi = 0, acc = 0; gi < G; gi++) {
    courtBase[gi] = acc
    acc += courtsForGroup(gi)
  }

  // Pack matches into global rounds. Hard constraints: ≤ effectiveCourts per
  // round, a group plays at most its court allotment, never the same team twice
  // in a round. Soft constraint (preferred): no team plays 3 rounds in a row -
  // honoured greedily, relaxed only when nothing else can progress.
  type RoundEntry = { groupIndex: number; groupLabel: string; home: Id; away: Id; courtSeq: number }
  const packedRounds: RoundEntry[][] = []

  let prev = new Set<Id>() // teams that played the previous round
  let prev2 = new Set<Id>() // teams that played two rounds ago
  const remaining = () => queues.some((q, i) => cursors[i] < q.matches.length)

  while (remaining()) {
    const round: RoundEntry[] = []
    const busy = new Set<Id>()
    const perGroup = new Array(G).fill(0)
    const tired = (t: Id) => prev.has(t) && prev2.has(t) // would be a 3rd consecutive round

    const fill = (respectRest: boolean) => {
      let progress = true
      while (round.length < effectiveCourts && progress) {
        progress = false
        for (let gi = 0; gi < G; gi++) {
          if (round.length >= effectiveCourts) break
          if (perGroup[gi] >= courtsForGroup(gi)) continue
          const q = queues[gi]
          const idx = cursors[gi]
          if (idx >= q.matches.length) continue
          const [home, away] = q.matches[idx]
          if (busy.has(home) || busy.has(away)) continue
          if (respectRest && (tired(home) || tired(away))) continue
          round.push({ groupIndex: gi, groupLabel: q.label, home, away, courtSeq: perGroup[gi] })
          busy.add(home)
          busy.add(away)
          perGroup[gi]++
          cursors[gi]++
          progress = true
        }
      }
    }

    fill(true)
    if (round.length === 0) fill(false) // everything left is "tired" → relax to keep progressing
    if (round.length === 0) break // safety
    packedRounds.push(round)
    prev2 = prev
    prev = new Set(busy)
  }

  // Assign courts + times.
  const out: ScheduledMatch[] = []
  const times = roundStartTimes(time, packedRounds.length)

  packedRounds.forEach((round, r) => {
    const scheduledTime = times[r]

    const ordered = courts.assignment === 'random' && courts.multiCourt ? shuffle(round, rng) : round
    ordered.forEach((entry, slot) => {
      let court: number | null
      if (!courts.multiCourt) court = null
      // Fixed: each group owns a contiguous court block (its parallel matches sit
      // side by side); Random: courts handed out by slot order in the round.
      else if (courts.assignment === 'fixed') court = (courtBase[entry.groupIndex] + entry.courtSeq) % effectiveCourts + 1
      else court = slot + 1
      out.push({
        phase: 'group',
        groupLabel: entry.groupLabel,
        round: r + 1,
        court,
        scheduledTime,
        homeTeamId: entry.home,
        awayTeamId: entry.away,
      })
    })
  })

  return out
}
