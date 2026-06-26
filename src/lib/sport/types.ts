// Sport profiles — the "dossier de sports". One profile per sport declares the
// rules that vary between sports. The tournament STRUCTURE (draw, brackets,
// schedule) is sport-agnostic and lives in src/lib/tournament; only the rules
// that genuinely differ per sport live here.
//
// This interface grows one facet at a time, as each step wires it in:
//   - step 1 (now): scoring points for the group standings
//   - later: score model (scalar vs sets/series), draws-allowed, tiebreaker
//     cascade, KO tie resolution, registration unit (team/pair/solo), allowed
//     formats, standings labels.
// Keeping it minimal-but-real avoids dead config: a field appears here only when
// something consumes it.

/** Sport identifiers. Grows as sports are added, one profile at a time. */
export type SportId = 'futsal'

/** Points awarded in the group stage (round-robin). */
export interface ScoringRules {
  win: number
  draw: number
  loss: number
}

export interface SportProfile {
  id: SportId
  /** Human label for the registry / future sport selector. */
  label: string
  scoring: ScoringRules
}
