import { BracketView, type BracketMatchView } from './BracketView'
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
  if (matches.length === 0) return null
  return <BracketView matches={matches.map(toBracketView)} size={size} className="pb-4" />
}
