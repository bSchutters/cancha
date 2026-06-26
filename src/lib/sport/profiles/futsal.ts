import type { SportProfile } from '../types'

// Futsal / football — the original (and currently only) ruleset. It reproduces
// the behavior the engine had before sport profiles existed: classic 3-1-0
// points. It is the default profile, so every existing tournament keeps the
// exact same standings.
export const futsal: SportProfile = {
  id: 'futsal',
  label: 'Futsal / Football',
  scoring: { win: 3, draw: 1, loss: 0 },
}
