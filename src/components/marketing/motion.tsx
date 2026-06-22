'use client'

import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP, ScrollTrigger)

// The active Lenis instance (null under reduced motion / before mount). Lets
// programmatic scrolls go THROUGH Lenis instead of fighting it with native
// smooth scroll. See smoothScrollTo / the Spotlight tour.
let activeLenis: Lenis | null = null

/** Scroll an element into view through Lenis when active; native fallback otherwise. */
export function smoothScrollTo(el: Element, { immediate = false }: { immediate?: boolean } = {}) {
  const target = el as HTMLElement
  if (activeLenis && !immediate) {
    activeLenis.scrollTo(target, { offset: -window.innerHeight / 2 + target.offsetHeight / 2 })
  } else {
    el.scrollIntoView({ behavior: immediate ? 'auto' : 'smooth', block: 'center' })
  }
}

/**
 * Lenis smooth scroll, synced to GSAP's ticker + ScrollTrigger. Scoped to the
 * marketing shell only (never mounted on /manage or /admin). Native scroll under
 * prefers-reduced-motion.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // `anchors: true` lets Lenis own in-page #hash jumps (smooth, not native).
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true, anchors: true })
    activeLenis = lenis
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    // Recompute trigger positions once Lenis drives the scroll and again after
    // the display font swaps in (the swap shifts layout / start-end pixels).
    requestAnimationFrame(() => ScrollTrigger.refresh())
    document.fonts?.ready.then(() => ScrollTrigger.refresh())

    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      activeLenis = null
    }
  }, [])

  return <>{children}</>
}

/** Fade + rise as the element scrolls into view (once). Static under reduced motion. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  y?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from(ref.current, {
          opacity: 0,
          y,
          duration: 0.9,
          delay,
          ease: 'power3.out',
          scrollTrigger: { trigger: ref.current, start: 'top 85%', once: true },
        })
      })
    },
    { scope: ref },
  )
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

/** Subtle parallax drift on scroll. No-op under reduced motion. */
export function Parallax({
  children,
  className,
  amount = 40,
}: {
  children: React.ReactNode
  className?: string
  amount?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.to(ref.current, {
          y: -amount,
          ease: 'none',
          scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: true },
        })
      })
    },
    { scope: ref },
  )
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
