import type { SportProfile } from '../types'

// Rugby — World Rugby group scoring: 4 points for a win, 2 for a draw, 0 for a
// loss. (Offensive / losing bonus points are deliberately left out: they need a
// per-match bonus input the score model doesn't have yet.)
export const rugby: SportProfile = {
  id: 'rugby',
  label: 'Rugby',
  scoring: { win: 4, draw: 2, loss: 0 },
  drawsAllowed: true,
  scoreLabel: 'points',
  unit: 'team',
}
