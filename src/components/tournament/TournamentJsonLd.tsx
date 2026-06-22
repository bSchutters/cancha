import type { PublicTournament } from '@/lib/tournament/public-view'
import type { ResolvedTenant } from '@/lib/tournament/tenant'

/** Resolve a possibly-relative media URL against the canonical origin. */
function abs(origin: string, u: string | null | undefined): string | undefined {
  if (!u) return undefined
  try {
    return new URL(u, origin).toString()
  } catch {
    return undefined
  }
}

/**
 * schema.org SportsEvent JSON-LD for a tournament page, enabling event rich
 * results in search. Organizer/image URLs are anchored on the tenant's canonical
 * origin (multi-tenant), and `<` is escaped so tournament/venue text can't break
 * out of the <script> tag.
 */
export function TournamentJsonLd({
  tournament,
  org,
  url,
}: {
  tournament: PublicTournament
  org: ResolvedTenant | null
  url: string
}) {
  const origin = new URL(url).origin
  const logo = abs(origin, org?.logoUrl)
  const image = abs(origin, tournament.visualUrl)
  const venue = tournament.venue

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: tournament.name,
    sport: 'Futsal',
    url,
    eventStatus: 'https://schema.org/EventScheduled',
    organizer: {
      '@type': 'Organization',
      name: org?.name ?? 'Cancha',
      url: origin,
      ...(logo ? { logo } : {}),
    },
    ...(tournament.editionDate ? { startDate: tournament.editionDate } : {}),
    ...(tournament.description ? { description: tournament.description } : {}),
    ...(image ? { image } : {}),
  }

  if (venue?.name || venue?.address) {
    data.location = {
      '@type': 'Place',
      ...(venue.name ? { name: venue.name } : {}),
      ...(venue.address ? { address: venue.address } : {}),
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}
