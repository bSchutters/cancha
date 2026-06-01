import { notFound } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'
import { buildManageTournament } from '@/lib/tournament/manage-view'
import { TournamentNav } from '@/components/tournament/manage/TournamentNav'
import { TeamsClient } from '@/components/tournament/manage/TeamsClient'

export const dynamic = 'force-dynamic'

export default async function TeamsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayloadClient()
  const t = await buildManageTournament(payload, slug)
  if (!t) notFound()

  return (
    <main className="mx-auto max-w-screen-2xl px-4 py-10">
      <TournamentNav slug={slug} active="teams" />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inscriptions</h1>
        <p className="text-sm text-white/50">
          {t.counts.confirmed}/{t.counts.registered} confirmées · {t.counts.paid} payées
        </p>
      </div>
      <TeamsClient tournamentId={t.id} teams={t.teams} />
    </main>
  )
}
