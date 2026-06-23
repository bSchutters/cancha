import { notFound } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'
import { buildManageTournament } from '@/lib/tournament/manage-view'
import { TournamentNav } from '@/components/tournament/manage/TournamentNav'
import { ManageResults } from '@/components/tournament/manage/ManageResults'
import { EmptyState } from '@/components/tournament/EmptyState'
import { makeT } from '@/i18n'
import { isLocale, DEFAULT_LOCALE } from '@/i18n/config'

export const dynamic = 'force-dynamic'

export default async function ResultsPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params
  const tr = makeT(isLocale(lang) ? lang : DEFAULT_LOCALE)
  const payload = await getPayloadClient()
  const t = await buildManageTournament(payload, slug)
  if (!t) notFound()

  const hasData = t.groups.length > 0 || t.matches.length > 0

  return (
    <main className="mx-auto max-w-screen-2xl px-4 py-10">
      <TournamentNav slug={slug} active="results" />
      <h1 className="mb-6 text-2xl font-bold">{tr('product.nav.results')}</h1>
      {hasData ? (
        <ManageResults t={t} />
      ) : (
        <EmptyState
          title={tr('product.page.resultsEmptyTitle')}
          description={tr('product.page.resultsEmptyDesc')}
        />
      )}
    </main>
  )
}
