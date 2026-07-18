import type { SportProfile } from '../types'

// Water polo — 3-1-0 group scoring, matches can end level in the group stage,
// and the score is counted in goals.
export const waterpolo: SportProfile = {
  id: 'waterpolo',
  label: 'Water-polo',
  scoring: { win: 3, draw: 1, loss: 0 },
  drawsAllowed: true,
  scoreLabel: 'goals',
  unit: 'team',
}
