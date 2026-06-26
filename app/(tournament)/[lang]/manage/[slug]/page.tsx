import { notFound } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'
import { buildManageTournament } from '@/lib/tournament/manage-view'
import { getSessionUser, isOwner } from '@/lib/tournament/session'
import { TournamentNav } from '@/components/tournament/manage/TournamentNav'
import { DashboardClient } from '@/components/tournament/manage/DashboardClient'

export const dynamic = 'force-dynamic'

export default async function DashboardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayloadClient()
  const t = await buildManageTournament(payload, slug)
  if (!t) notFound()
  const owner = isOwner(await getSessionUser())

  return (
    <main className="mx-auto max-w-screen-2xl px-4 py-10">
      <TournamentNav slug={slug} active="dashboard" />
      <DashboardClient initial={t} isOwner={owner} />
    </main>
  )
}
