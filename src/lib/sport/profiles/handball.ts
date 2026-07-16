import type { SportProfile } from '../types'

// Handball — 2 points for a win, 1 for a draw, 0 for a loss (IHF group stage).
// Matches can end level, and the score is counted in goals.
export const handball: SportProfile = {
  id: 'handball',
  label: 'Handball',
  scoring: { win: 2, draw: 1, loss: 0 },
  drawsAllowed: true,
  scoreLabel: 'goals',
  unit: 'team',
}
