import type { SportProfile } from '../types'

// Padel — a match is played in sets and always has a winner (no draws). The
// standings rank by matches won (1 point per win), then by set difference, so
// the score columns count sets won/lost.
//
// Step 1 of the sets model: the set tally (e.g. 2-0) is recorded directly.
// Per-set game scores and pair/solo rosters come in a later step.
export const padel: SportProfile = {
  id: 'padel',
  label: 'Padel',
  scoring: { win: 1, draw: 0, loss: 0 },
  drawsAllowed: false,
  scoreLabel: 'sets',
}
