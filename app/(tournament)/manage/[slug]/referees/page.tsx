import { notFound } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'
import { buildManageTournament } from '@/lib/tournament/manage-view'
import { TournamentNav } from '@/components/tournament/manage/TournamentNav'
import { RefereesClient } from '@/components/tournament/manage/RefereesClient'

export const dynamic = 'force-dynamic'

export default async function RefereesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayloadClient()
  const t = await buildManageTournament(payload, slug)
  if (!t) notFound()

  return (
    <main className="mx-auto max-w-screen-2xl px-4 py-10">
      <TournamentNav slug={slug} active="referees" />
      <h1 className="mb-6 text-2xl font-bold">Arbitres</h1>
      <RefereesClient tournamentId={t.id} referees={t.referees} />
    </main>
  )
}
