import type { SportProfile } from '../types'

// Squash — best-of sets, no draws, one player per side. Ranked by matches won
// then set difference.
export const squash: SportProfile = {
  id: 'squash',
  label: 'Squash',
  scoring: { win: 1, draw: 0, loss: 0 },
  drawsAllowed: false,
  scoreLabel: 'sets',
  unit: 'solo',
}
