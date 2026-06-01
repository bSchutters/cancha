'use client'

import { cn } from '@/lib/utils'

export function Switch({
  checked,
  onChange,
  disabled = false,
  label,
  description,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
  label?: string
  description?: string
}) {
  const toggle = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50',
        checked ? 'bg-spanish-accent-2' : 'bg-white/20',
      )}
    >
      <span
        className={cn(
          'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0.5',
        )}
      />
    </button>
  )

  if (!label) return toggle

  return (
    <label className="flex w-fit cursor-pointer items-center gap-3">
      {toggle}
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {description && <span className="block text-xs text-white/40">{description}</span>}
      </span>
    </label>
  )
}
