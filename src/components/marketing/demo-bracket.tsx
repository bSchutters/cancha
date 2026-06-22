import type { PublicMatch } from '@/lib/tournament/public-view'

// Branched knockout tree (SVG) for the demo, same look as the hero bracket but
// fed by live data: 2 semi-finals -> 1 final, with scores, winner highlight and
// "À déterminer" placeholders. Connecting branches are drawn at fixed coordinates.

const BW = 130
const BH = 40

function MatchBox({ x, y, m }: { x: number; y: number; m?: PublicMatch }) {
  const finished = m?.status === 'finished' && m.scoreHome != null && m.scoreAway != null
  const homeWin = !!finished && m != null && (m.scoreHome! > m.scoreAway! || m.penaltyWinner === 'home')
  const awayWin = !!finished && m != null && (m.scoreAway! > m.scoreHome! || m.penaltyWinner === 'away')

  const row = (name: string | null, score: number | null, win: boolean, rowY: number) => (
    <>
      <text
        x={x + 9}
        y={rowY}
        fontSize="9"
        fontStyle={name ? undefined : 'italic'}
        fontWeight={win ? 600 : 400}
        fill={win ? 'var(--primary)' : name ? 'var(--foreground)' : 'var(--muted-foreground)'}
      >
        {name ?? 'À déterminer'}
      </text>
      <text
        x={x + BW - 9}
        y={rowY}
        textAnchor="end"
        fontSize="9"
        fontWeight={win ? 600 : 400}
        fill={win ? 'var(--primary)' : 'var(--muted-foreground)'}
      >
        {finished ? score : '–'}
      </text>
    </>
  )

  return (
    <g className="hs-node">
      <rect x={x} y={y} width={BW} height={BH} rx={6} fill="var(--card)" stroke="var(--border)" />
      <line x1={x} y1={y + BH / 2} x2={x + BW} y2={y + BH / 2} stroke="var(--border)" />
      {row(m?.homeName ?? null, m?.scoreHome ?? null, homeWin, y + 14)}
      {row(m?.awayName ?? null, m?.scoreAway ?? null, awayWin, y + 33)}
    </g>
  )
}

export function DemoBracket({ matches }: { matches: PublicMatch[] }) {
  const semis = matches.filter((m) => (m.round ?? 1) === 1).slice(0, 2)
  const final = matches.find((m) => (m.round ?? 1) >= 2)
  if (semis.length < 2 || !final) return null

  return (
    <svg viewBox="0 0 300 138" className="w-full" fill="none" role="img" aria-label="Arbre de la phase finale">
      <g stroke="var(--border)" strokeWidth="1" strokeLinecap="round">
        <path d="M132 26 H150 M132 112 H150 M150 26 V112 M150 69 H168" />
      </g>
      <MatchBox x={2} y={6} m={semis[0]} />
      <MatchBox x={2} y={92} m={semis[1]} />
      <MatchBox x={168} y={49} m={final} />
    </svg>
  )
}
