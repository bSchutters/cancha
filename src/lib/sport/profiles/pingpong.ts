import type { SportProfile } from '../types'

// Table tennis (singles) — sets, no draws, one player per side. Ranked by
// matches won then set difference.
export const pingpong: SportProfile = {
  id: 'pingpong',
  label: 'Ping-pong',
  scoring: { win: 1, draw: 0, loss: 0 },
  drawsAllowed: false,
  scoreLabel: 'sets',
  unit: 'solo',
}
