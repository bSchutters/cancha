import type { SportId, SportProfile } from './types'
import { futsal } from './profiles/futsal'
import { basket } from './profiles/basket'

export type { SportId, SportProfile, ScoringRules, ScoreLabel } from './types'

/** Default sport — what existing tournaments (and tournaments with no sport set) use. */
export const DEFAULT_SPORT: SportId = 'futsal'

const PROFILES: Record<SportId, SportProfile> = {
  futsal,
  basket,
}

/**
 * Resolve a sport profile by id. Unknown / null / undefined falls back to the
 * default, so callers can pass a raw DB value without guarding.
 */
export function getSportProfile(id: SportId | string | null | undefined): SportProfile {
  return (id && PROFILES[id as SportId]) || PROFILES[DEFAULT_SPORT]
}

export const ALL_SPORTS: readonly SportProfile[] = Object.values(PROFILES)

export { futsal, basket }
