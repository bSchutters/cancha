'use client'

import { useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { priceForTeams, FOUNDER_DISCOUNT } from '@/lib/marketing/content'
import { LocaleLink } from '@/components/locale-link'
import { useT } from '@/i18n/use-t'
import { display, focusRing } from './theme'
import { cn } from '@/lib/utils'

gsap.registerPlugin(useGSAP)

const MAX = 48

/** Interactive price estimator with an animated count-up total. */
export function PriceEstimator() {
  const t = useT()
  const [teams, setTeams] = useState(16)
  const total = priceForTeams(teams)
  const founder = Math.round(total * (1 - FOUNDER_DISCOUNT))
  const atMax = teams >= MAX

  const totalRef = useRef<HTMLSpanElement>(null)
  const proxy = useRef({ v: total })

  useGSAP(
    () => {
      if (!totalRef.current) return
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        totalRef.current.textContent = String(total)
        proxy.current.v = total
        return
      }
      gsap.to(proxy.current, {
        v: total,
        duration: 0.4,
        ease: 'power2.out',
        onUpdate: () => {
          if (totalRef.current) totalRef.current.textContent = String(Math.round(proxy.current.v))
        },
      })
    },
    { dependencies: [total] },
  )

  return (
    <div className="rounded-3xl border border-border bg-card p-8 shadow-[0_24px_60px_-32px_rgba(26,26,24,0.18)] sm:p-10">
      <div className="flex items-baseline justify-between">
        <label htmlFor="estimator" className="text-sm font-medium text-foreground">
          {t('tarifs.estimator.teamsLabel')}
        </label>
        <span style={display} className="text-2xl font-semibold tabular-nums">
          {teams}
          {atMax ? '+' : ''}
        </span>
      </div>
      <input
        id="estimator"
        type="range"
        min={4}
        max={MAX}
        step={1}
        value={teams}
        onChange={(e) => setTeams(Number(e.target.value))}
        aria-label={t('tarifs.estimator.teamsLabel')}
        className="mt-3 w-full cursor-pointer accent-primary"
      />
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>4</span>
        <span>{MAX}+</span>
      </div>

      <div className="mt-8 flex flex-col items-center gap-1 text-center">
        <span className="text-sm text-muted-foreground">{t('tarifs.estimator.priceLabel')}</span>
        <span style={display} className="text-5xl font-semibold tabular-nums">
          <span ref={totalRef}>{total}</span> €
        </span>
        <span className="text-sm text-primary">
          {t('tarifs.estimator.founderPrice').replace('{founder}', String(founder))}
        </span>
      </div>

      {atMax ? (
        <div className="mt-6 rounded-xl border border-primary/20 bg-primary/[0.06] px-4 py-4 text-center text-sm">
          <p className="text-muted-foreground">{t('tarifs.estimator.maxPrompt')}</p>
          <LocaleLink
            href="#contact"
            className={cn('mt-1 inline-block font-medium text-primary hover:underline', focusRing)}
          >
            {t('tarifs.estimator.maxCta')}
          </LocaleLink>
        </div>
      ) : (
        <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
          {t('tarifs.estimator.footnote')}
        </p>
      )}
    </div>
  )
}
