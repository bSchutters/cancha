import type { BracketMatch, Id } from './types'
import { standardSeedOrder, roundLabel } from './bracket'

export interface SeededTeam {
  id: Id
  name: string
}

/** A power of two is the only field size a clean double-elim draw supports. */
export function isPowerOfTwo(n: number): boolean {
  return n >= 2 && (n & (n - 1)) === 0
}

/**
 * Build a full double-elimination draw from an already-seeded team list.
 *
 * Everyone starts in the winners bracket (WB). Losing there drops a team into
 * the losers bracket (LB) instead of eliminating it; a second loss (in the LB)
 * is fatal. The LB alternates "drop-in" rounds (an LB survivor meets a freshly
 * demoted WB loser) with "consolidation" rounds (two LB survivors meet). The WB
 * champion and the LB champion meet in a single grand final.
 *
 * Winner routing uses `nextMatchKey`/`nextSlot`; loser routing reuses the
 * existing `loserNextMatchKey`/`loserNextSlot` links, so the match hook that
 * already propagates 3rd-place losers propagates WB demotions unchanged.
 *
 * Only power-of-two fields are supported (no byes) — throws otherwise.
 */
export function generateDoubleElim(teams: SeededTeam[]): BracketMatch[] {
  const n = teams.length
  if (!isPowerOfTwo(n)) {
    throw new Error('DOUBLE_ELIM_POWER_OF_TWO')
  }
  const k = Math.log2(n)

  const matches: BracketMatch[] = []
  const byKey = new Map<string, BracketMatch>()
  const add = (m: BracketMatch): BracketMatch => {
    matches.push(m)
    byKey.set(m.key, m)
    return m
  }
  const linkWinner = (fromKey: string, toKey: string, slot: 'home' | 'away') => {
    const m = byKey.get(fromKey)!
    m.nextMatchKey = toKey
    m.nextSlot = slot
  }
  const linkLoser = (fromKey: string, toKey: string, slot: 'home' | 'away') => {
    const m = byKey.get(fromKey)!
    m.loserNextMatchKey = toKey
    m.loserNextSlot = slot
  }

  // --- Winners bracket -----------------------------------------------------
  const order = standardSeedOrder(n) // slot order → seed numbers (1..n)
  const wbByRound: string[][] = []

  const r1: string[] = []
  for (let i = 0; i < n / 2; i++) {
    const home = teams[order[2 * i] - 1]
    const away = teams[order[2 * i + 1] - 1]
    const key = `WB-R1-M${i}`
    add({
      key,
      phase: 'knockout',
      bracketLabel: roundLabel(n / 2),
      round: 1,
      bracketSide: 'winners',
      homeTeamId: home.id,
      awayTeamId: away.id,
      homeSourceKey: null,
      awaySourceKey: null,
      nextMatchKey: null,
      nextSlot: null,
      loserNextMatchKey: null,
      loserNextSlot: null,
    })
    r1.push(key)
  }
  wbByRound.push(r1)

  for (let r = 2; r <= k; r++) {
    const count = n / 2 ** r
    const prev = wbByRound[r - 2]
    const cur: string[] = []
    for (let i = 0; i < count; i++) {
      const key = `WB-R${r}-M${i}`
      const homeSrc = prev[2 * i]
      const awaySrc = prev[2 * i + 1]
      add({
        key,
        phase: 'knockout',
        bracketLabel: roundLabel(count),
        round: r,
        bracketSide: 'winners',
        homeTeamId: null,
        awayTeamId: null,
        homeSourceKey: homeSrc,
        awaySourceKey: awaySrc,
        nextMatchKey: null,
        nextSlot: null,
        loserNextMatchKey: null,
        loserNextSlot: null,
      })
      linkWinner(homeSrc, key, 'home')
      linkWinner(awaySrc, key, 'away')
      cur.push(key)
    }
    wbByRound.push(cur)
  }
  const wbFinalKey = wbByRound[k - 1][0]

  // --- Losers bracket ------------------------------------------------------
  let lbRoundNum = 1
  const lbLabel = () => `Repêchage ${lbRoundNum}`

  // LB round 1: the WB round-1 losers meet each other.
  let cur: string[] = []
  const firstLosers = wbByRound[0]
  for (let i = 0; i < firstLosers.length / 2; i++) {
    const key = `LB-R${lbRoundNum}-M${i}`
    const homeSrc = firstLosers[2 * i]
    const awaySrc = firstLosers[2 * i + 1]
    add({
      key,
      phase: 'knockout',
      bracketLabel: lbLabel(),
      round: lbRoundNum,
      bracketSide: 'losers',
      homeTeamId: null,
      awayTeamId: null,
      homeSourceKey: homeSrc,
      awaySourceKey: awaySrc,
      nextMatchKey: null,
      nextSlot: null,
      loserNextMatchKey: null,
      loserNextSlot: null,
    })
    linkLoser(homeSrc, key, 'home')
    linkLoser(awaySrc, key, 'away')
    cur.push(key)
  }
  lbRoundNum++

  for (let wbDrop = 2; wbDrop <= k; wbDrop++) {
    // Drop-in round: each LB survivor (home) meets a demoted WB-R{wbDrop} loser.
    const wbLosers = wbByRound[wbDrop - 1] // count === cur.length
    const next: string[] = []
    for (let i = 0; i < cur.length; i++) {
      const key = `LB-R${lbRoundNum}-M${i}`
      add({
        key,
        phase: 'knockout',
        bracketLabel: lbLabel(),
        round: lbRoundNum,
        bracketSide: 'losers',
        homeTeamId: null,
        awayTeamId: null,
        homeSourceKey: cur[i],
        awaySourceKey: wbLosers[i],
        nextMatchKey: null,
        nextSlot: null,
        loserNextMatchKey: null,
        loserNextSlot: null,
      })
      linkWinner(cur[i], key, 'home')
      linkLoser(wbLosers[i], key, 'away')
      next.push(key)
    }
    cur = next
    lbRoundNum++

    // Consolidation round: pair the drop-in winners (skip when only one remains).
    if (cur.length > 1) {
      const consolidated: string[] = []
      for (let i = 0; i < cur.length / 2; i++) {
        const key = `LB-R${lbRoundNum}-M${i}`
        add({
          key,
          phase: 'knockout',
          bracketLabel: lbLabel(),
          round: lbRoundNum,
          bracketSide: 'losers',
          homeTeamId: null,
          awayTeamId: null,
          homeSourceKey: cur[2 * i],
          awaySourceKey: cur[2 * i + 1],
          nextMatchKey: null,
          nextSlot: null,
          loserNextMatchKey: null,
          loserNextSlot: null,
        })
        linkWinner(cur[2 * i], key, 'home')
        linkWinner(cur[2 * i + 1], key, 'away')
        consolidated.push(key)
      }
      cur = consolidated
      lbRoundNum++
    }
  }
  const lbFinalKey = cur[0]

  // --- Grand final ---------------------------------------------------------
  add({
    key: 'GF',
    phase: 'knockout',
    bracketLabel: 'Grande finale',
    round: 1,
    bracketSide: 'grand_final',
    homeTeamId: null,
    awayTeamId: null,
    homeSourceKey: wbFinalKey,
    awaySourceKey: lbFinalKey,
    nextMatchKey: null,
    nextSlot: null,
    loserNextMatchKey: null,
    loserNextSlot: null,
  })
  linkWinner(wbFinalKey, 'GF', 'home')
  linkWinner(lbFinalKey, 'GF', 'away')

  return matches
}
