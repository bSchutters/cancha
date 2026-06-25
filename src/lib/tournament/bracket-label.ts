import type { Translate } from '@/i18n'

// Knockout/classification labels are generated in French and stored on the match
// (bracket.ts). They're a small, stable set + two parametrized patterns, so we
// map them back to translation keys at render time. Anything unrecognized falls
// through to the raw (French) label — same graceful degradation as before i18n.
const EXACT: Record<string, string> = {
  Finale: 'product.bracket.final',
  'Demi-finale': 'product.bracket.semi',
  'Quart de finale': 'product.bracket.quarter',
  '8e de finale': 'product.bracket.r16',
  '16e de finale': 'product.bracket.r32',
  'Petite finale (3e place)': 'product.bracket.thirdPlace',
  'Barrage classement': 'product.bracket.playoff',
  Classement: 'product.bracket.ranking',
}

/** Localize a stored (FR) bracket label. Returns '' for null, raw label if unknown. */
export function localizeBracketLabel(label: string | null | undefined, t: Translate): string {
  if (!label) return ''
  const key = EXACT[label]
  if (key) return t(key)
  let m = /^Tour \((\d+) matchs\)$/.exec(label)
  if (m) return t('product.bracket.roundMatches').replace('{count}', m[1])
  m = /^Places (\d+)-(\d+)$/.exec(label)
  if (m) return t('product.bracket.placesRange').replace('{lo}', m[1]).replace('{hi}', m[2])
  m = /^Place (\d+)$/.exec(label)
  if (m) return t('product.bracket.placeSingle').replace('{n}', m[1])
  return label
}

// Final-ranking notes are generated in French (final-ranking.ts noteFor()).
const NOTE: Record<string, string> = {
  Champion: 'product.ranking.champion',
  Finaliste: 'product.ranking.finalist',
  '3e place': 'product.ranking.third',
  '4e place': 'product.ranking.fourth',
  Classement: 'product.ranking.ranking',
  Éliminé: 'product.ranking.eliminated',
}

/** Localize a final-ranking note ("Champion", "3e place"…). Raw label if unknown. */
export function localizeFinalNote(note: string | null | undefined, t: Translate): string {
  if (!note) return ''
  return NOTE[note] ? t(NOTE[note]) : note
}

/**
 * Localize a TBD bracket-slot feeder name ("Vainqueur QF1" / "Perdant DF2",
 * from match-code.ts). The match code (QF1…) is a compact identifier and stays;
 * only the Vainqueur/Perdant prefix is translated. Raw name if it isn't a feeder.
 */
export function localizeFeederName(name: string | null | undefined, t: Translate): string | null {
  if (!name) return name ?? null
  let m = /^Vainqueur (.+)$/.exec(name)
  if (m) return t('product.feeder.winner').replace('{code}', m[1])
  m = /^Perdant (.+)$/.exec(name)
  if (m) return t('product.feeder.loser').replace('{code}', m[1])
  return name
}
