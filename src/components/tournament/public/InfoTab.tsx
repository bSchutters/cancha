'use client'

import Image from 'next/image'
import { MapPin, Navigation, Info } from 'lucide-react'
import type { PublicTournament } from '@/lib/tournament/public-view'

export function InfoTab({ data }: { data: PublicTournament }) {
  const venue = data.venue
  const sponsors = data.sponsors

  return (
    <div className="space-y-8">
      {venue && (venue.name || venue.address || venue.mapsUrl || venue.mapUrl) && (
        <section className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-spanish-accent-2" />
            <div className="min-w-0">
              {venue.name && <h3 className="text-lg font-bold">{venue.name}</h3>}
              {venue.address && <p className="whitespace-pre-line text-sm text-white/70">{venue.address}</p>}
            </div>
          </div>

          {venue.mapsUrl && (
            <a
              href={venue.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-spanish-accent-2 px-4 py-2 text-sm font-bold text-spanish-bg-dark"
            >
              <Navigation className="h-4 w-4" /> Itinéraire
            </a>
          )}

          {venue.mapUrl && (
            <a href={venue.mapUrl} target="_blank" rel="noopener noreferrer" className="block">
              <span className="relative block h-56 w-full overflow-hidden rounded-lg border border-white/10 bg-white/5 sm:h-80">
                <Image src={venue.mapUrl} alt="Plan du complexe" fill sizes="100vw" unoptimized className="object-contain" />
              </span>
            </a>
          )}
        </section>
      )}

      {venue?.info && (
        <section className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-white/50">
            <Info className="h-4 w-4" /> Infos pratiques
          </h3>
          <p className="whitespace-pre-line text-sm text-white/80">{venue.info}</p>
        </section>
      )}

      {sponsors.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/50">Partenaires</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {sponsors.map((sp) => {
              const inner = (
                <span className="flex h-20 items-center justify-center rounded-lg border border-white/10 bg-white/5 p-3">
                  {sp.logoUrl ? (
                    <span className="relative h-full w-full">
                      <Image src={sp.logoUrl} alt={sp.name} fill sizes="160px" unoptimized className="object-contain" />
                    </span>
                  ) : (
                    <span className="text-sm font-medium text-white/70">{sp.name}</span>
                  )}
                </span>
              )
              return sp.url ? (
                <a key={String(sp.id)} href={sp.url} target="_blank" rel="noopener noreferrer">
                  {inner}
                </a>
              ) : (
                <div key={String(sp.id)}>{inner}</div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
