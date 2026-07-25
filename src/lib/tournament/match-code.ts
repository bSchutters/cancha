import type { Id } from './types'
import { classifyBracket } from './bracket-kind'

export interface CodeableMatch {
  id: Id
  phase: string
  groupLabel?: string | null
  bracketLabel?: string | null
  round?: number | null
  court?: number | null
  scheduledTime?: string | null
}

/** Order matches by play order (time, then court, then round) for stable numbering. */
function byPlayOrder(a: CodeableMatch, b: CodeableMatch): number {
  const t = (a.scheduledTime ?? '').localeCompare(b.scheduledTime ?? '')
  if (t !== 0) return t
  const c = (a.court ?? 0) - (b.court ?? 0)
  if (c !== 0) return c
  return (a.round ?? 0) - (b.round ?? 0)
}

/** Short abbreviation for a knockout / classification bracket label. */
function koAbbr(label: string): string {
  // Double-elimination labels first, via the typed classifier: "Grande finale"
  // contains "finale", so the substring rules below would code it 'F' — exactly
  // like the winners final — and every "Repêchage N" collapsed to 'RE', making
  // codes repeat across losers rounds. Two matches sharing a code is a real
  // problem when announcing or entering a score.
  const kind = classifyBracket(label)
  if (kind.kind === 'grandFinal') return 'GF'
  if (kind.kind === 'repechage') return `LB${kind.n}`

  // Order matters: "quart de finale" / "demi-finale" / "huitième de finale" all
  // contain "finale", so the specific rounds must be matched before plain "Finale".
  const l = label.toLowerCase()
  if (l.includes('petite')) return 'P3'
  if (l.includes('barrage')) return 'BR'
  if (l.includes('huiti') || l.includes('8e')) return '8E'
  if (l.includes('quart')) return 'QF'
  if (l.includes('demi')) return 'DF'
  if (l.includes('finale')) return 'F'
  const places = /places?\s*(\d+)/i.exec(label)
  if (places) return `PL${places[1]}`
  return label.slice(0, 2).toUpperCase()
}

/**
 * Structured, human-readable code per match (for announcing / TV / score entry):
 *  - group: `A1, A2…` (per-pool sequence in play order),
 *  - knockout/classification: `QF1, DF1, F, P3, PL9…` by bracket label.
 */
export function buildMatchCodes(matches: readonly CodeableMatch[]): Map<Id, string> {
  const codes = new Map<Id, string>()

  // Group matches: `R{round}{group}` (Round 1 / Poule A → R1A). Several matches
  // of the same pool in one round get a trailing index (R1A1, R1A2).
  const groupBuckets = new Map<string, CodeableMatch[]>()
  const koByLabel = new Map<string, CodeableMatch[]>()
  for (const m of matches) {
    if (m.phase === 'group' && m.groupLabel) {
      const key = `${m.round ?? 0}|${m.groupLabel}`
      groupBuckets.set(key, [...(groupBuckets.get(key) ?? []), m])
    } else if (m.phase !== 'group') {
      const label = m.bracketLabel ?? `T${m.round ?? ''}`
      koByLabel.set(label, [...(koByLabel.get(label) ?? []), m])
    }
  }

  for (const [, ms] of groupBuckets) {
    ms.sort(byPlayOrder)
    ms.forEach((m, i) => {
      const base = `R${m.round ?? 0}${m.groupLabel}`
      codes.set(m.id, ms.length > 1 ? `${base}${i + 1}` : base)
    })
  }
  for (const [label, ms] of koByLabel) {
    ms.sort(byPlayOrder)
    const abbr = koAbbr(label)
    ms.forEach((m, i) => codes.set(m.id, ms.length > 1 ? `${abbr}${i + 1}` : abbr))
  }
  return codes
}

export interface FeederMatch {
  id: Id
  /** Match whose WINNER fills this match's home / away slot. */
  homeSourceId: Id | null
  awaySourceId: Id | null
  /** Where this match's LOSER drops (consolation / petite finale). */
  loserNextId: Id | null
  loserNextSlot: 'home' | 'away' | null
}

/**
 * Human placeholder for a not-yet-known team: `Vainqueur QF1`, `Perdant DF2`…
 * Derived from the bracket feeder links + the match codes, so a TBD bracket slot
 * names its source instead of showing "À déterminer".
 */
export function buildFeederNames(
  matches: readonly FeederMatch[],
  codes: Map<Id, string>,
): Map<Id, { home: string | null; away: string | null }> {
  const loserInto = new Map<string, Id>() // `${targetId}|${slot}` → source match id
  for (const m of matches) {
    if (m.loserNextId != null && m.loserNextSlot) loserInto.set(`${m.loserNextId}|${m.loserNextSlot}`, m.id)
  }
  const nameFor = (winnerSourceId: Id | null, targetId: Id, slot: 'home' | 'away'): string | null => {
    if (winnerSourceId != null && codes.has(winnerSourceId)) return `Vainqueur ${codes.get(winnerSourceId)}`
    const loserSrc = loserInto.get(`${targetId}|${slot}`)
    if (loserSrc != null && codes.has(loserSrc)) return `Perdant ${codes.get(loserSrc)}`
    return null
  }
  const out = new Map<Id, { home: string | null; away: string | null }>()
  for (const m of matches) {
    out.set(m.id, {
      home: nameFor(m.homeSourceId, m.id, 'home'),
      away: nameFor(m.awaySourceId, m.id, 'away'),
    })
  }
  return out
}
