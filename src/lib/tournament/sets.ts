// Set-based sports (padel…): the match "score" is the number of sets won by
// each side, derived from the per-set game scores. A set with equal games is
// ignored (incomplete); a completed match has a decisive set tally.
export function setsWon(
  sets: readonly { home: number; away: number }[],
): { home: number; away: number } {
  let home = 0
  let away = 0
  for (const s of sets) {
    if (s.home > s.away) home++
    else if (s.away > s.home) away++
  }
  return { home, away }
}
