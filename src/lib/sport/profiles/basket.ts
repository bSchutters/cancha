import type { SportProfile } from '../types'

// Basketball — FIBA-style group scoring: a win is worth 2 points, a loss 1, and
// matches can't end level (overtime decides), so there are no draws. The score
// columns count points, not goals.
export const basket: SportProfile = {
  id: 'basket',
  label: 'Basket',
  scoring: { win: 2, draw: 0, loss: 1 },
  drawsAllowed: false,
  scoreLabel: 'points',
  unit: 'team',
}
