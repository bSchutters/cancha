'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Checkbox({
  checked,
  onChange,
  disabled,
  className,
  'aria-label': ariaLabel,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
  'aria-label'?: string
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors disabled:opacity-40',
        checked
          ? 'border-spanish-accent-2 bg-spanish-accent-2 text-spanish-bg-dark'
          : 'border-white/30 bg-transparent hover:border-white/50',
        className,
      )}
    >
      {checked && <Check className="h-3 w-3" strokeWidth={3} />}
    </button>
  )
}
