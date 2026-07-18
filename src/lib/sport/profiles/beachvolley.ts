import type { SportProfile } from '../types'

// Beach volleyball — sets, no draws, and played by pairs rather than full
// teams (that's the difference with indoor volleyball).
export const beachvolley: SportProfile = {
  id: 'beachvolley',
  label: 'Beach-volley',
  scoring: { win: 1, draw: 0, loss: 0 },
  drawsAllowed: false,
  scoreLabel: 'sets',
  unit: 'pair',
}
