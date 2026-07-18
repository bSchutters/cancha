import type { SportProfile } from '../types'

// Solo esport (fighting games, StarCraft, Tekken, Street Fighter…) — same
// best-of series as the team titles, but one player per side.
export const esportSolo: SportProfile = {
  id: 'esport_solo',
  label: 'Esport (solo)',
  scoring: { win: 1, draw: 0, loss: 0 },
  drawsAllowed: false,
  scoreLabel: 'sets',
  unit: 'solo',
}
