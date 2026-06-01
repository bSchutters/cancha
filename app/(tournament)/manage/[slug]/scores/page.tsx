import { notFound } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'
import { buildManageTournament } from '@/lib/tournament/manage-view'
import { TournamentNav } from '@/components/tournament/manage/TournamentNav'
import { ScoresClient } from '@/components/tournament/manage/ScoresClient'

export const dynamic = 'force-dynamic'

export default async function ScoresPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayloadClient()
  const t = await buildManageTournament(payload, slug)
  if (!t) notFound()

  return (
    <main className="mx-auto max-w-screen-2xl px-4 py-10">
      <TournamentNav slug={slug} active="scores" />
      <h1 className="mb-6 text-2xl font-bold">Saisie des scores</h1>
      <ScoresClient matches={t.matches} referees={t.referees} />
    </main>
  )
}
