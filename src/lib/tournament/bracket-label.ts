import type { Translate } from '@/i18n'
import { classifyBracket } from './bracket-kind'

// Knockout/classification labels are generated in French and stored on the match
// (bracket.ts). classifyBracket turns a label into its typed identity; here we
// map that identity to a translation key. Unknown labels fall through to the raw
// (French) label — same graceful degradation as before i18n.
/** Localize a stored (FR) bracket label. Returns '' for null, raw label if unknown. */
export function localizeBracketLabel(label: string | null | undefined, t: Translate): string {
  if (!label) return ''
  const k = classifyBracket(label)
  switch (k.kind) {
    case 'final':
      return t('product.bracket.final')
    case 'semi':
      return t('product.bracket.semi')
    case 'quarter':
      return t('product.bracket.quarter')
    case 'r16':
      return t('product.bracket.r16')
    case 'r32':
      return t('product.bracket.r32')
    case 'thirdPlace':
      return t('product.bracket.thirdPlace')
    case 'grandFinal':
      return t('product.bracket.grandFinal')
    case 'repechage':
      return t('product.bracket.repechage').replace('{n}', String(k.n))
    case 'playoff':
      return t('product.bracket.playoff')
    case 'ranking':
      return t('product.bracket.ranking')
    case 'roundMatches':
      return t('product.bracket.roundMatches').replace('{count}', String(k.count))
    case 'placement':
      return t('product.bracket.placesRange').replace('{lo}', String(k.lo)).replace('{hi}', String(k.hi))
    case 'placeSingle':
      return t('product.bracket.placeSingle').replace('{n}', String(k.n))
    case 'other':
      return k.raw
  }
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
 *
 * The code is matched against its exact grammar — uppercase letters + digits, no
 * spaces (buildMatchCodes: R1A, QF1, DF, F, P3, PL9, BR, T3…) — so a real team
 * literally named "Vainqueur …" (with a space, lowercase, or accents) is left
 * untouched instead of being mistaken for a feeder placeholder.
 */
const FEEDER_CODE = '([A-Z0-9]+)'
export function localizeFeederName(name: string | null | undefined, t: Translate): string | null {
  if (!name) return name ?? null
  let m = new RegExp(`^Vainqueur ${FEEDER_CODE}$`).exec(name)
  if (m) return t('product.feeder.winner').replace('{code}', m[1])
  m = new RegExp(`^Perdant ${FEEDER_CODE}$`).exec(name)
  if (m) return t('product.feeder.loser').replace('{code}', m[1])
  return name
}
