import Link from 'next/link'
import { cn } from '@/lib/utils'

// Shared switcher for the isolated design-demo pages. Not a route (plain module).
const LINKS = [
  { href: '/design-preview', label: 'Avant / Après' },
  { href: '/design-directions', label: 'Directions' },
]

export function DesignNav({ current }: { current: string }) {
  return (
    <div className="sticky top-3 z-50 mx-auto mb-8 flex w-fit items-center gap-1 rounded-full border border-neutral-300 bg-white/90 p-1 shadow-sm backdrop-blur dark:border-neutral-700 dark:bg-neutral-900/90">
      <span className="px-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">Design</span>
      {LINKS.map((l) => {
        const active = current === l.href
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium transition',
              active
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                : 'text-neutral-600 hover:bg-neutral-200 dark:text-neutral-300 dark:hover:bg-neutral-800',
            )}
          >
            {l.label}
          </Link>
        )
      })}
    </div>
  )
}
