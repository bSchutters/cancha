import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPayloadClient } from '@/lib/payload'
import { buildPublicTournament } from '@/lib/tournament/public-view'
import { TournamentView } from '@/components/tournament/TournamentView'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayloadClient()
  const t = await buildPublicTournament(payload, slug)
  if (!t) return { title: 'Tournoi introuvable | UD Asturiana Cup' }
  return {
    title: `${t.name} | UD Asturiana Cup`,
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
  const tournament = await buildPublicTournament(payload, slug)
  if (!tournament) notFound()

  return <TournamentView slug={slug} initial={tournament} />
}
