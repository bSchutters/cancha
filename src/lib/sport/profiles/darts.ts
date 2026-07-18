import type { SportProfile } from '../types'

// Darts — played in legs / sets, no draws, one player per side. The sets model
// records the leg tally the same way it does for racket sports.
export const darts: SportProfile = {
  id: 'darts',
  label: 'Fléchettes',
  scoring: { win: 1, draw: 0, loss: 0 },
  drawsAllowed: false,
  scoreLabel: 'sets',
  unit: 'solo',
}
