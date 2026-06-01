import { notFound } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'
import { buildPublicTournament } from '@/lib/tournament/public-view'
import { resolveTenantId } from '@/lib/tournament/tenant'
import { TvDraw } from '@/components/tournament/TvDraw'

export const dynamic = 'force-dynamic'

export default async function TournamentTvDrawPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ mode?: string }>
}) {
  const { slug } = await params
  const { mode } = await searchParams
  const payload = await getPayloadClient()
  const tenantId = await resolveTenantId(payload)
  const tournament = await buildPublicTournament(payload, slug, tenantId)
  if (!tournament) notFound()

  return <TvDraw slug={slug} initial={tournament} mode={mode === 'manual' ? 'manual' : 'auto'} />
}
