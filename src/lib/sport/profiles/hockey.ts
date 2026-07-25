import type { SportProfile } from '../types'

// Field hockey — classic 3-1-0 group scoring (FIH), matches can end level, and
// the score is counted in goals.
export const hockey: SportProfile = {
  id: 'hockey',
  label: 'Hockey',
  scoring: { win: 3, draw: 1, loss: 0 },
  drawsAllowed: true,
  scoreLabel: 'goals',
  unit: 'team',
}
