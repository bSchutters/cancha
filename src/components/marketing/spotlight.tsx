'use client'

import { useEffect, useState } from 'react'

/**
 * Guided-tour spotlight: dims everything except the targeted element (matched by
 * a CSS selector), scrolls it into view, and shows a tip bubble next to it
 * (above or below, never overlapping). The target stays clickable (overlay is
 * pointer-events-none) so the visitor performs the step themselves.
 */
export function Spotlight({ selector, text, onSkip }: { selector: string; text: string; onSkip: () => void }) {
  const [rect, setRect] = useState<DOMRect | null>(null)

  useEffect(() => {
    const el = document.querySelector(selector)
    if (el) {
      const r = el.getBoundingClientRect()
      if (r.top < 96 || r.bottom > window.innerHeight - 150) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
    const measure = () => {
      const t = document.querySelector(selector)
      const r = t?.getBoundingClientRect() ?? null
      setRect(r && r.width > 0 ? r : null)
    }
    measure()
    // Poll so the highlight follows layout / smooth-scroll without a per-frame listener.
    const id = setInterval(measure, 100)
    window.addEventListener('resize', measure)
    return () => {
      clearInterval(id)
      window.removeEventListener('resize', measure)
    }
  }, [selector])

  if (!rect) return null

  const pad = 8
  const placeBelow = window.innerHeight - rect.bottom > 170
  const tipLeft = Math.max(12, Math.min(rect.left, window.innerWidth - 300))
  const tipStyle = placeBelow
    ? { left: tipLeft, top: rect.bottom + pad + 8 }
    : { left: tipLeft, top: rect.top - pad - 8, transform: 'translateY(-100%)' }

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      <div
        className="absolute rounded-xl transition-all duration-300 ease-out"
        style={{
          left: rect.left - pad,
          top: rect.top - pad,
          width: rect.width + pad * 2,
          height: rect.height + pad * 2,
          boxShadow: '0 0 0 2px var(--primary), 0 0 0 9999px rgba(15, 20, 30, 0.55)',
        }}
      />
      <div
        className="pointer-events-auto absolute w-[280px] rounded-xl border border-border bg-card p-3 shadow-2xl"
        style={tipStyle}
      >
        <p className="text-sm text-foreground">{text}</p>
        <button
          type="button"
          onClick={onSkip}
          className="mt-2 cursor-pointer text-xs text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline"
        >
          Passer le guide
        </button>
      </div>
    </div>
  )
}
