import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPayloadClient } from '@/lib/payload'
import { buildPublicTournament } from '@/lib/tournament/public-view'
import { resolveTenant, resolveTournamentTenant } from '@/lib/tournament/tenant'
import { getRequestBaseUrl, socialMetadata, tenantBaseUrl } from '@/lib/tournament/seo'
import { TournamentView } from '@/components/tournament/TournamentView'
import { TournamentJsonLd } from '@/components/tournament/TournamentJsonLd'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayloadClient()
  const hostOrg = await resolveTenant(payload)
  const t = await buildPublicTournament(payload, slug, hostOrg?.id ?? null)
  if (!t) return { title: 'Tournoi introuvable', robots: { index: false, follow: false } }
  const description = t.description ?? `Suivez le tournoi ${t.name} en direct.`
  // On a tenant host this is the host org; on the apex fallback, resolve the
  // tournament's owner so the canonical points at its real tenant host.
  const org = hostOrg ?? (await resolveTournamentTenant(payload, slug))
  const base = await getRequestBaseUrl()
  const canonical = `${tenantBaseUrl(org, base)}/${slug}`
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
  const org = await resolveTenant(payload)
  const tournament = await buildPublicTournament(payload, slug, org?.id ?? null)
  if (!tournament) notFound()

  const base = await getRequestBaseUrl()
  const canonical = `${tenantBaseUrl(org, base)}/${slug}`

  return (
    <>
      <TournamentJsonLd tournament={tournament} org={org} url={canonical} />
      <TournamentView
        slug={slug}
        initial={tournament}
        org={org ? { name: org.name, logoUrl: org.logoUrl } : undefined}
      />
    </>
  )
}
