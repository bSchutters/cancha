import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPayloadClient } from '@/lib/payload'
import { buildPublicTournament } from '@/lib/tournament/public-view'
import { resolveTenant } from '@/lib/tournament/tenant'
import { TournamentView } from '@/components/tournament/TournamentView'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayloadClient()
  const org = await resolveTenant(payload)
  const t = await buildPublicTournament(payload, slug, org?.id ?? null)
  const orgName = org?.name ?? 'Cup Generator'
  if (!t) return { title: `Tournoi introuvable | ${orgName}` }
  return {
    title: `${t.name} | ${orgName}`,
    description: t.description ?? `Suivez le tournoi ${t.name} en direct.`,
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

  return (
    <TournamentView
      slug={slug}
      initial={tournament}
      org={org ? { name: org.name, logoUrl: org.logoUrl } : undefined}
    />
  )
}
