import { notFound } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'
import { buildPublicTournament } from '@/lib/tournament/public-view'
import { TvView, type TvPanelKey } from '@/components/tournament/TvView'

export const dynamic = 'force-dynamic'

const PANELS: TvPanelKey[] = ['prochains', 'programme', 'classements', 'arbre']

export default async function TournamentTvPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ vues?: string }>
}) {
  const { slug } = await params
  const { vues } = await searchParams
  // ?vues=programme,classements - the panels this screen rotates through.
  const views = (vues ?? '')
    .split(',')
    .map((v) => v.trim())
    .filter((v): v is TvPanelKey => PANELS.includes(v as TvPanelKey))

  const payload = await getPayloadClient()
  const tournament = await buildPublicTournament(payload, slug)
  if (!tournament) notFound()

  return <TvView slug={slug} initial={tournament} views={views.length ? views : undefined} />
}
