// Sport profiles — the "dossier de sports". One profile per sport declares the
// rules that vary between sports. The tournament STRUCTURE (draw, brackets,
// schedule) is sport-agnostic and lives in src/lib/tournament; only the rules
// that genuinely differ per sport live here.
//
// This interface grows one facet at a time, as each step wires it in:
//   - scoring points for the group standings
//   - drawsAllowed + scoreLabel: drive the standings columns (and later score entry)
//   - later: score model (scalar vs sets/series), tiebreaker cascade, KO tie
//     resolution, registration unit (team/pair/solo), allowed formats.
// Keeping it minimal-but-real avoids dead config: a field appears here only when
// something consumes it.

/** Sport identifiers. Grows as sports are added, one profile at a time. */
export type SportId = 'futsal' | 'basket' | 'handball'

/** Points awarded in the group stage (round-robin). */
export interface ScoringRules {
  win: number
  draw: number
  loss: number
}

/** Which noun the standings score columns use (goals vs points, …). */
export type ScoreLabel = 'goals' | 'points'

export interface SportProfile {
  id: SportId
  /** Human label for the registry / sport selector. */
  label: string
  scoring: ScoringRules
  /** Can a match end level? Basketball: no (overtime decides). Drives the
   *  standings "draws" column and (later) score entry. */
  drawsAllowed: boolean
  /** Noun for the for/against/difference standings columns. */
  scoreLabel: ScoreLabel
}
