import type { ScoreLabel } from './types'

// The i18n key SUFFIXES for the "for / against / difference" standings columns,
// per sport score label. Components prefix them with `product.standings.` and
// append `.short` / `.title`. Keeps the goals/points/sets mapping in one place
// instead of a ternary duplicated across every standings view.
export function scoreLabelKeys(label: ScoreLabel): { for: string; against: string; diff: string } {
  return {
    for: `${label}For`, // goalsFor | pointsFor | setsFor
    against: `${label}Against`,
    // "goals" is irregular (goalDiff, not goalsDiff); points/sets are regular.
    diff: label === 'goals' ? 'goalDiff' : `${label}Diff`,
  }
}
