'use client'

import { BracketView, type BracketMatchView } from './BracketView'
import { useT } from '@/i18n/use-t'
import type { PublicMatch } from '@/lib/tournament/public-view'

export function toBracketView(m: PublicMatch): BracketMatchView {
  return {
    id: m.id,
    round: m.round ?? 1,
    bracketLabel: m.bracketLabel,
    homeName: m.homeName,
    awayName: m.awayName,
    homeLogoUrl: m.homeLogoUrl,
    awayLogoUrl: m.awayLogoUrl,
    scoreHome: m.scoreHome,
    scoreAway: m.scoreAway,
    penaltyWinner: m.penaltyWinner,
    penaltyHome: m.penaltyHome,
    penaltyAway: m.penaltyAway,
    status: m.status,
  }
}

export function Bracket({ matches, size = 'md' }: { matches: PublicMatch[]; size?: 'sm' | 'md' | 'lg' }) {
  const t = useT()
  if (matches.length === 0) return null

  // Double elimination carries a bracket side on each match: render the winners
  // tree, the losers tree and the grand final as separate labelled sections.
  const isDouble = matches.some((m) => m.bracketSide != null)
  if (isDouble) {
    const winners = matches.filter((m) => m.bracketSide === 'winners')
    const losers = matches.filter((m) => m.bracketSide === 'losers')
    const grandFinal = matches.filter((m) => m.bracketSide === 'grand_final')
    const section = (labelKey: string, list: PublicMatch[]) =>
      list.length === 0 ? null : (
        <section key={labelKey}>
          <h3 className="mb-3 text-lg font-bold">{t(labelKey)}</h3>
          <BracketView matches={list.map(toBracketView)} size={size} className="pb-4" />
        </section>
      )
    return (
      <div className="space-y-8">
        {section('product.bracket.winnersSide', winners)}
        {section('product.bracket.losersSide', losers)}
        {section('product.bracket.grandFinal', grandFinal)}
      </div>
    )
  }

  return <BracketView matches={matches.map(toBracketView)} size={size} className="pb-4" />
}
