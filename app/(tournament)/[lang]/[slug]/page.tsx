import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Payload } from 'payload'
import { getPayloadClient } from '@/lib/payload'
import { getCachedPublicTournament } from '@/lib/tournament/public-view'
import { resolveTenant, resolveTournamentTenant, type ResolvedTenant } from '@/lib/tournament/tenant'
import { getRequestBaseUrl, socialMetadata, tenantBaseUrl } from '@/lib/tournament/seo'
import { TournamentView } from '@/components/tournament/TournamentView'
import { TournamentJsonLd } from '@/components/tournament/TournamentJsonLd'

export const dynamic = 'force-dynamic'

/**
 * Effective tenant + canonical URL for a tournament, shared by generateMetadata
 * and the page render so the <link rel=canonical> and the JSON-LD agree - incl.
 * on the apex, where the canonical points at the tournament's owning tenant host.
 * (resolveTenant / resolveTournamentTenant are request-cached, so the repeated
 * calls across both functions collapse to one lookup each.)
 */
async function tournamentCanonical(payload: Payload, slug: string, hostOrg: ResolvedTenant | null) {
  const org = hostOrg ?? (await resolveTournamentTenant(payload, slug))
  const base = await getRequestBaseUrl()
  return { org, canonical: `${tenantBaseUrl(org, base)}/${slug}` }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayloadClient()
  const hostOrg = await resolveTenant(payload)
  const t = await getCachedPublicTournament(payload, slug, hostOrg?.id ?? null)
  if (!t) return { title: 'Tournoi introuvable', robots: { index: false, follow: false } }
  const description = t.description ?? `Suivez le tournoi ${t.name} en direct.`
  const { org, canonical } = await tournamentCanonical(payload, slug, hostOrg)
  return {
    title: t.name,
    description,
    alternates: { canonical },
    // og:image/twitter:image are produced by the opengraph-image route.
    ...socialMetadata({ org, title: t.name, description, path: canonical, images: [], card: 'summary_large_image' }),
  }
}

export default async function TournamentPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const payload = await getPayloadClient()
  const hostOrg = await resolveTenant(payload)
  const tournament = await getCachedPublicTournament(payload, slug, hostOrg?.id ?? null)
  if (!tournament) notFound()

  const { org, canonical } = await tournamentCanonical(payload, slug, hostOrg)

  return (
    <>
      <TournamentJsonLd tournament={tournament} org={org} url={canonical} />
      <TournamentView
        slug={slug}
        initial={tournament}
        org={hostOrg ? { name: hostOrg.name, logoUrl: hostOrg.logoUrl } : undefined}
      />
    </>
  )
}
