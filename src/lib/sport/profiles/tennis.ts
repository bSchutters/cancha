import type { SportProfile } from '../types'

// Tennis (singles) — sets, no draws, one player per side. Ranked by matches won
// then set difference.
export const tennis: SportProfile = {
  id: 'tennis',
  label: 'Tennis',
  scoring: { win: 1, draw: 0, loss: 0 },
  drawsAllowed: false,
  scoreLabel: 'sets',
  unit: 'solo',
}
