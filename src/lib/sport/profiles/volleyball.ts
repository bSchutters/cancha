import type { SportProfile } from '../types'

// Volleyball — played in sets, always has a winner (no draws), teams. Ranked by
// matches won (1 point per win) then set difference. (A finer 3-2-1-0 volleyball
// scheme can replace the flat 1-0 later.)
export const volleyball: SportProfile = {
  id: 'volleyball',
  label: 'Volley',
  scoring: { win: 1, draw: 0, loss: 0 },
  drawsAllowed: false,
  scoreLabel: 'sets',
  unit: 'team',
}
