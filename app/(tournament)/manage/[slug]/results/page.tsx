import { notFound } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'
import { buildManageTournament } from '@/lib/tournament/manage-view'
import { TournamentNav } from '@/components/tournament/manage/TournamentNav'
import { ManageResults } from '@/components/tournament/manage/ManageResults'
import { EmptyState } from '@/components/tournament/EmptyState'

export const dynamic = 'force-dynamic'

export default async function ResultsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayloadClient()
  const t = await buildManageTournament(payload, slug)
  if (!t) notFound()

  const hasData = t.groups.length > 0 || t.matches.length > 0

  return (
    <main className="mx-auto max-w-screen-2xl px-4 py-10">
      <TournamentNav slug={slug} active="results" />
      <h1 className="mb-6 text-2xl font-bold">Résultats</h1>
      {hasData ? (
        <ManageResults t={t} />
      ) : (
        <EmptyState
          title="Aucun résultat pour l'instant"
          description="Les classements, poules et arbre s'afficheront ici une fois le tirage et le calendrier générés."
        />
      )}
    </main>
  )
}
