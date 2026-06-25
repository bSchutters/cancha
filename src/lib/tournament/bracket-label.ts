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
