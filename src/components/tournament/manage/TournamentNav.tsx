import Link from 'next/link'
import { cn } from '@/lib/utils'

const TABS = [
  { key: 'dashboard', label: 'Dashboard', path: '' },
  { key: 'teams', label: 'Inscriptions', path: '/teams' },
  { key: 'scores', label: 'Saisie scores', path: '/scores' },
  { key: 'results', label: 'Résultats', path: '/results' },
  { key: 'referees', label: 'Arbitres', path: '/referees' },
  { key: 'sponsors', label: 'Sponsors', path: '/sponsors' },
  { key: 'config', label: 'Configuration', path: '/config' },
]

export function TournamentNav({ slug, active }: { slug: string; active: string }) {
  return (
    <nav className="mb-8 flex flex-wrap gap-1 border-b border-white/10">
      {TABS.map((tab) => (
        <Link
          key={tab.key}
          href={`/manage/${slug}${tab.path}`}
          className={cn(
            'border-b-2 px-3 py-2 text-sm transition-colors',
            active === tab.key
              ? 'border-spanish-accent-2 font-semibold text-white'
              : 'border-transparent text-white/50 hover:text-white',
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  )
}
