// Structured identity of a knockout / classification bracket match.
//
// Bracket labels are generated in French (bracket.ts) and stored on the match.
// Historically every consumer re-parsed that string with its own regexes
// (final-ranking, schedule, match-code, i18n). This is the SINGLE place that
// interprets a label — everything else branches on the typed `kind`. Adding a
// new format means adding its label shapes here, once.

export type BracketKind =
  | { kind: 'final' }
  | { kind: 'semi' }
  | { kind: 'quarter' }
  | { kind: 'r16' } // 8e de finale
  | { kind: 'r32' } // 16e de finale
  | { kind: 'thirdPlace' } // petite finale
  | { kind: 'grandFinal' } // grande finale (double élimination)
  | { kind: 'repechage'; n: number } // "Repêchage N" (tableau des perdants)
  | { kind: 'playoff' } // barrage classement
  | { kind: 'ranking' } // classement
  | { kind: 'roundMatches'; count: number } // "Tour (N matchs)"
  | { kind: 'placement'; lo: number; hi: number } // "Places X-Y"
  | { kind: 'placeSingle'; n: number } // "Place N"
  | { kind: 'other'; raw: string }

const EXACT: Record<string, BracketKind> = {
  Finale: { kind: 'final' },
  'Demi-finale': { kind: 'semi' },
  'Quart de finale': { kind: 'quarter' },
  '8e de finale': { kind: 'r16' },
  '16e de finale': { kind: 'r32' },
  'Petite finale (3e place)': { kind: 'thirdPlace' },
  'Grande finale': { kind: 'grandFinal' },
  'Barrage classement': { kind: 'playoff' },
  Classement: { kind: 'ranking' },
}

export function classifyBracket(label: string | null | undefined): BracketKind {
  if (!label) return { kind: 'other', raw: '' }
  const exact = EXACT[label]
  if (exact) return exact
  let m = /^Tour \((\d+) matchs\)$/.exec(label)
  if (m) return { kind: 'roundMatches', count: Number(m[1]) }
  m = /^Repêchage (\d+)$/.exec(label)
  if (m) return { kind: 'repechage', n: Number(m[1]) }
  // Lenient (matches the old final-ranking/schedule predicate): spaces, en-dash.
  m = /places?\s*(\d+)\s*[-–]\s*(\d+)/i.exec(label)
  if (m) return { kind: 'placement', lo: Number(m[1]), hi: Number(m[2]) }
  m = /^Place (\d+)$/.exec(label)
  if (m) return { kind: 'placeSingle', n: Number(m[1]) }
  return { kind: 'other', raw: label }
}

/** A placement match ("Places X-Y"). */
export const isPlaceMatch = (label: string | null | undefined) => classifyBracket(label).kind === 'placement'

/** The 3rd-place match (petite finale). */
export const isPetiteMatch = (label: string | null | undefined) => classifyBracket(label).kind === 'thirdPlace'
