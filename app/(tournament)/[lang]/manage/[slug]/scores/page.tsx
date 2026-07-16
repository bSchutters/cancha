import { notFound } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'
import { buildManageTournament } from '@/lib/tournament/manage-view'
import { TournamentNav } from '@/components/tournament/manage/TournamentNav'
import { ScoresClient } from '@/components/tournament/manage/ScoresClient'
import { makeT } from '@/i18n'
import { isLocale, DEFAULT_LOCALE } from '@/i18n/config'

export const dynamic = 'force-dynamic'

export default async function ScoresPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params
  const tr = makeT(isLocale(lang) ? lang : DEFAULT_LOCALE)
  const payload = await getPayloadClient()
  const t = await buildManageTournament(payload, slug)
  if (!t) notFound()

  return (
    <main className="mx-auto max-w-screen-2xl px-4 py-10">
      <TournamentNav slug={slug} active="scores" />
      <h1 className="mb-6 text-2xl font-bold">{tr('product.page.scoresTitle')}</h1>
      <ScoresClient matches={t.matches} referees={t.referees} sport={t.sport} />
    </main>
  )
}
