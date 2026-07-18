import type { SportProfile } from '../types'

// Team esport (LoL, CS2, Valorant, Rocket League…) — played as a best-of series
// of maps/games, which is exactly the sets model: the set tally IS the match
// score. No draws: a series always has a winner.
//
// One profile covers every team title on purpose. What the engine needs to know
// is "best-of series, teams, no draws", and that is identical across them;
// modelling one profile per game would be a catalogue to maintain for no
// behavioural difference.
export const esportTeam: SportProfile = {
  id: 'esport_team',
  label: 'Esport (équipe)',
  scoring: { win: 1, draw: 0, loss: 0 },
  drawsAllowed: false,
  scoreLabel: 'sets',
  unit: 'team',
}
