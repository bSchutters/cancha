import type { SportProfile } from '../types'

// Football games (FIFA / EA FC, eFootball) — the one esport family that does NOT
// fit the best-of model: a match is a single game counted in goals, and a group
// match can end level, exactly like real football. Hence classic 3-1-0 and goals
// rather than sets. Usually played 1v1, so a solo unit.
export const esportFoot: SportProfile = {
  id: 'esport_foot',
  label: 'Jeu de foot (FIFA, eFootball)',
  scoring: { win: 3, draw: 1, loss: 0 },
  drawsAllowed: true,
  scoreLabel: 'goals',
  unit: 'solo',
}
