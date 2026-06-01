import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Consistent placeholder for empty / not-found sections across the public pages. */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-10 text-center',
        className,
      )}
    >
      {icon && <div className="text-white/40">{icon}</div>}
      <p className="font-semibold text-white/80">{title}</p>
      {description && <p className="max-w-sm text-sm text-white/50">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
