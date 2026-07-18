import type { SportId, SportProfile } from './types'
import { futsal } from './profiles/futsal'
import { basket } from './profiles/basket'
import { handball } from './profiles/handball'
import { padel } from './profiles/padel'
import { volleyball } from './profiles/volleyball'
import { tennis } from './profiles/tennis'
import { pingpong } from './profiles/pingpong'
import { badminton } from './profiles/badminton'
import { squash } from './profiles/squash'
import { beachvolley } from './profiles/beachvolley'
import { hockey } from './profiles/hockey'
import { rugby } from './profiles/rugby'
import { waterpolo } from './profiles/waterpolo'
import { petanque } from './profiles/petanque'
import { darts } from './profiles/darts'

export type { SportId, SportProfile, ScoringRules, ScoreLabel, SportUnit } from './types'
export { scoreLabelKeys } from './standings-labels'

/** Default sport — what existing tournaments (and tournaments with no sport set) use. */
export const DEFAULT_SPORT: SportId = 'futsal'

const PROFILES: Record<SportId, SportProfile> = {
  futsal,
  basket,
  handball,
  padel,
  volleyball,
  tennis,
  pingpong,
  badminton,
  squash,
  beachvolley,
  hockey,
  rugby,
  waterpolo,
  petanque,
  darts,
}

/**
 * Resolve a sport profile by id. Unknown / null / undefined falls back to the
 * default, so callers can pass a raw DB value without guarding.
 */
export function getSportProfile(id: SportId | string | null | undefined): SportProfile {
  return (id && PROFILES[id as SportId]) || PROFILES[DEFAULT_SPORT]
}

export const ALL_SPORTS: readonly SportProfile[] = Object.values(PROFILES)

export {
  futsal,
  basket,
  handball,
  padel,
  volleyball,
  tennis,
  pingpong,
  badminton,
  squash,
  beachvolley,
  hockey,
  rugby,
  waterpolo,
  petanque,
  darts,
}
