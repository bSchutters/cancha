import type { SportProfile } from '../types'

// Badminton (singles) — sets, no draws, one player per side. Same shape as
// tennis: ranked by matches won then set difference.
export const badminton: SportProfile = {
  id: 'badminton',
  label: 'Badminton',
  scoring: { win: 1, draw: 0, loss: 0 },
  drawsAllowed: false,
  scoreLabel: 'sets',
  unit: 'solo',
}
