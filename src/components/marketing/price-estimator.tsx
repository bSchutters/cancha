'use client'

import { useState } from 'react'
import { priceForTeams, FOUNDER_DISCOUNT } from '@/lib/marketing/content'
import { display } from './theme'

/** Interactive price estimator: slide the team count, see the total up front. */
export function PriceEstimator() {
  const [teams, setTeams] = useState(16)
  const total = priceForTeams(teams)
  const founder = Math.round(total * (1 - FOUNDER_DISCOUNT))

  return (
    <div className="rounded-3xl border border-border bg-card p-8 shadow-[0_24px_60px_-32px_rgba(26,26,24,0.18)] sm:p-10">
      <div className="flex items-baseline justify-between">
        <label htmlFor="estimator" className="text-sm font-medium text-foreground">
          Nombre d’équipes
        </label>
        <span style={display} className="text-2xl font-semibold tabular-nums">
          {teams}
        </span>
      </div>
      <input
        id="estimator"
        type="range"
        min={4}
        max={48}
        step={1}
        value={teams}
        onChange={(e) => setTeams(Number(e.target.value))}
        aria-label="Nombre d’équipes"
        className="mt-3 w-full cursor-pointer accent-primary"
      />
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>4</span>
        <span>48</span>
      </div>

      <div className="mt-8 flex flex-col items-center gap-1 text-center">
        <span className="text-sm text-muted-foreground">Prix pour votre tournoi</span>
        <span style={display} className="text-5xl font-semibold tabular-nums">
          {total} €
        </span>
        <span className="text-sm text-primary">≈ {founder} € au tarif Organisateur fondateur</span>
      </div>

      <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
        Paiement unique, par équipe, dégressif au volume. Pas d’abonnement, et vous ne payez que si
        votre tournoi a lieu.
      </p>
    </div>
  )
}
