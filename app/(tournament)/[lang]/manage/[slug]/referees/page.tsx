import { notFound } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'
import { buildManageTournament } from '@/lib/tournament/manage-view'
import { TournamentNav } from '@/components/tournament/manage/TournamentNav'
import { RefereesClient } from '@/components/tournament/manage/RefereesClient'
import { makeT } from '@/i18n'
import { isLocale, DEFAULT_LOCALE } from '@/i18n/config'

export const dynamic = 'force-dynamic'

export default async function RefereesPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params
  const tr = makeT(isLocale(lang) ? lang : DEFAULT_LOCALE)
  const payload = await getPayloadClient()
  const t = await buildManageTournament(payload, slug)
  if (!t) notFound()

  return (
    <main className="mx-auto max-w-screen-2xl px-4 py-10">
      <TournamentNav slug={slug} active="referees" />
      <h1 className="mb-6 text-2xl font-bold">{tr('product.nav.referees')}</h1>
      <RefereesClient tournamentId={t.id} referees={t.referees} />
    </main>
  )
}
