import type { DrawnGroup, TeamRef } from './types'
import { makeRng, shuffle, type Rng } from './rng'

const GROUP_LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

export function groupLabel(index: number): string {
  if (index < GROUP_LABELS.length) return GROUP_LABELS[index]
  // AA, AB… for very large tournaments
  const first = Math.floor(index / GROUP_LABELS.length) - 1
  return GROUP_LABELS[first] + GROUP_LABELS[index % GROUP_LABELS.length]
}

/**
 * Randomly distribute teams into `numGroups` groups of (near-)equal size.
 * Sizes differ by at most 1. Deterministic when given a seed.
 *
 * @throws if there are fewer teams than groups, or fewer than 1 group.
 */
export function drawGroups(
  teams: readonly TeamRef[],
  numGroups: number,
  seedOrRng: number | Rng = Math.random,
): DrawnGroup[] {
  if (numGroups < 1) throw new Error('numGroups doit être ≥ 1')
  if (teams.length < numGroups) {
    throw new Error(`Pas assez d’équipes (${teams.length}) pour ${numGroups} poules`)
  }

  const rng: Rng = typeof seedOrRng === 'function' ? seedOrRng : makeRng(seedOrRng)
  const shuffled = shuffle(teams, rng)

  const groups: DrawnGroup[] = Array.from({ length: numGroups }, (_, i) => ({
    label: groupLabel(i),
    teams: [],
  }))

  // Snake/round-robin distribution keeps sizes balanced (diff ≤ 1).
  shuffled.forEach((team, i) => {
    groups[i % numGroups].teams.push(team)
  })

  return groups
}
