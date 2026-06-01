'use client'

import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

/**
 * Accessible +/- stepper replacing the native number input spinners.
 * `value` of null renders an empty field (used before a score is entered).
 */
export function NumberStepper({
  value,
  onChange,
  min = 0,
  max = 99,
  disabled = false,
  className,
  size = 'md',
}: {
  value: number | null
  onChange: (v: number) => void
  min?: number
  max?: number
  disabled?: boolean
  className?: string
  size?: 'sm' | 'md'
}) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n))
  const current = value ?? min
  const btn = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10'
  const field = size === 'sm' ? 'h-8 w-10 text-base' : 'h-10 w-12 text-lg'

  return (
    <div className={cn('inline-flex items-center gap-1', className)}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={disabled || (value != null && value <= min)}
        onClick={() => onChange(clamp(current - 1))}
        className={cn(
          btn,
          'rounded-md border border-white/30 bg-white/5 text-white hover:border-white/50 hover:bg-white/15 hover:text-white disabled:opacity-30',
        )}
        aria-label="Diminuer"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <input
        type="text"
        inputMode="numeric"
        disabled={disabled}
        value={value ?? ''}
        placeholder="–"
        onChange={(e) => {
          const raw = e.target.value.replace(/[^0-9]/g, '')
          onChange(raw === '' ? min : clamp(parseInt(raw, 10)))
        }}
        className={cn(
          field,
          'rounded-md border border-white/25 bg-transparent text-center font-semibold tabular-nums text-white outline-none focus:border-white/50',
          'placeholder:text-white/30 disabled:opacity-40',
        )}
        aria-label="Valeur"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={disabled || current >= max}
        onClick={() => onChange(clamp(current + 1))}
        className={cn(
          btn,
          'rounded-md border border-white/30 bg-white/5 text-white hover:border-white/50 hover:bg-white/15 hover:text-white disabled:opacity-30',
        )}
        aria-label="Augmenter"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}
