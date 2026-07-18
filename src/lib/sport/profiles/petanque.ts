import type { SportProfile } from '../types'

// Pétanque — a game is played to 13 points, so there is always a winner and no
// draws. Ranked by games won then points difference. `team` covers the usual
// triplette / doublette formats.
export const petanque: SportProfile = {
  id: 'petanque',
  label: 'Pétanque',
  scoring: { win: 1, draw: 0, loss: 0 },
  drawsAllowed: false,
  scoreLabel: 'points',
  unit: 'team',
}
