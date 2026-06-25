'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { smoothScrollTo } from './motion'

/**
 * Guided-tour spotlight: dims everything except the targeted element (matched by
 * a CSS selector), scrolls it into view, and shows a tip bubble next to it. The
 * bubble is a child of the highlighted box so they move together (no jitter on
 * scroll). The target stays clickable (overlay is pointer-events-none).
 */
export function Spotlight({
  selector,
  text,
  action,
  dim = true,
  onSkip,
}: {
  selector: string
  text: string
  action?: { label: string; onClick: () => void }
  dim?: boolean
  onSkip: () => void
}) {
  const [rect, setRect] = useState<DOMRect | null>(null)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const el = document.querySelector(selector)
    if (el) {
      const r = el.getBoundingClientRect()
      if (r.top < 96 || r.bottom > window.innerHeight - 150) {
        // Route through Lenis (when active) so it doesn't fight native smooth scroll.
        smoothScrollTo(el, { immediate: mq.matches })
      }
    }
    const measure = () => {
      const t = document.querySelector(selector)
      const r = t?.getBoundingClientRect() ?? null
      const next = r && r.width > 0 ? r : null
      // Only re-render when the geometry actually changed: getBoundingClientRect
      // returns a fresh object every tick, so without this guard the 100ms poll
      // would re-render 10x/sec for the whole tour even on a static page.
      setRect((prev) => {
        if (!prev && !next) return prev
        if (
          prev &&
          next &&
          prev.top === next.top &&
          prev.left === next.left &&
          prev.width === next.width &&
          prev.height === next.height
        )
          return prev
        return next
      })
    }
    measure()
    const id = setInterval(measure, 100)
    window.addEventListener('resize', measure)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onSkip()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      clearInterval(id)
      window.removeEventListener('resize', measure)
      window.removeEventListener('keydown', onKey)
    }
  }, [selector, onSkip])

  if (!rect) return null

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const pad = 8
  const holeLeft = rect.left - pad
  const placeBelow = window.innerHeight - rect.bottom > 180
  // Keep the bubble on screen horizontally (offset relative to the hole's left).
  const tipShiftX = Math.min(0, window.innerWidth - 16 - 280 - holeLeft)

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      <div
        className={cn('absolute rounded-xl', !reduce && 'transition-all duration-300 ease-out')}
        style={{
          left: holeLeft,
          top: rect.top - pad,
          width: rect.width + pad * 2,
          height: rect.height + pad * 2,
          boxShadow: dim ? '0 0 0 2px var(--primary), 0 0 0 9999px rgba(15, 20, 30, 0.55)' : '0 0 0 2px var(--primary)',
        }}
      >
        <div
          role="dialog"
          aria-live="polite"
          className={cn(
            'pointer-events-auto absolute w-[280px] rounded-xl border border-border bg-card p-3 shadow-2xl',
            placeBelow ? 'top-full mt-3' : 'bottom-full mb-3',
          )}
          style={{ left: tipShiftX }}
        >
          <p className="text-sm text-foreground">{text}</p>
          {action && (
            <Button size="sm" className="mt-3 w-full" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
          <button
            type="button"
            onClick={onSkip}
            className="mt-2 cursor-pointer text-xs text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline"
          >
            Passer le guide
          </button>
        </div>
      </div>
    </div>
  )
}
