// Compact knockout tree (SVG) with real connecting branches, for the hero's
// "phase finale" preview. Deterministic layout, winner path highlighted.

type Node = { x: number; y: number; name: string; win?: boolean }

const W = 76
const H = 22

const NODES: Node[] = [
  { x: 2, y: 6, name: 'Real Sporting', win: true },
  { x: 2, y: 40, name: 'Stade Central' },
  { x: 2, y: 86, name: 'Olympic 7' },
  { x: 2, y: 120, name: 'AS Tonnerre' },
  { x: 92, y: 23, name: 'Real Sporting', win: true },
  { x: 92, y: 103, name: 'Olympic 7' },
  { x: 182, y: 63, name: 'Real Sporting', win: true },
]

const BRANCHES = [
  // Quarts -> Demi (top pair)
  'M78 17 H86 M78 51 H86 M86 17 V51 M86 34 H92',
  // Quarts -> Demi (bottom pair)
  'M78 97 H86 M78 131 H86 M86 97 V131 M86 114 H92',
  // Demi -> Finale
  'M168 34 H176 M168 114 H176 M176 34 V114 M176 74 H182',
]

export function HeroBracket() {
  return (
    <svg viewBox="0 0 260 150" className="w-full" fill="none" role="img" aria-label="Arbre de la phase finale">
      <g stroke="var(--border)" strokeWidth="1" strokeLinecap="round">
        {BRANCHES.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      {NODES.map((n, i) => (
        <g key={i} className="hs-node">
          <rect
            x={n.x}
            y={n.y}
            width={W}
            height={H}
            rx={5}
            fill={n.win ? 'var(--primary)' : 'var(--card)'}
            fillOpacity={n.win ? 0.12 : 1}
            stroke={n.win ? 'var(--primary)' : 'var(--border)'}
          />
          <text
            x={n.x + W / 2}
            y={n.y + H / 2 + 3}
            textAnchor="middle"
            fontSize="8.5"
            fontWeight={n.win ? 600 : 400}
            fill={n.win ? 'var(--primary)' : 'var(--foreground)'}
          >
            {n.name}
          </text>
        </g>
      ))}
    </svg>
  )
}
