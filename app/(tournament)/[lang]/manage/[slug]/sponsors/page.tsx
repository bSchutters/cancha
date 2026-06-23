import { notFound } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'
import { buildManageTournament } from '@/lib/tournament/manage-view'
import { TournamentNav } from '@/components/tournament/manage/TournamentNav'
import { SponsorsClient } from '@/components/tournament/manage/SponsorsClient'
import { makeT } from '@/i18n'
import { isLocale, DEFAULT_LOCALE } from '@/i18n/config'

export const dynamic = 'force-dynamic'

export default async function SponsorsPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params
  const tr = makeT(isLocale(lang) ? lang : DEFAULT_LOCALE)
  const payload = await getPayloadClient()
  const t = await buildManageTournament(payload, slug)
  if (!t) notFound()

  return (
    <main className="mx-auto max-w-screen-2xl px-4 py-10">
      <TournamentNav slug={slug} active="sponsors" />
      <h1 className="mb-6 text-2xl font-bold">{tr('product.nav.sponsors')}</h1>
      <SponsorsClient tournamentId={t.id} sponsors={t.sponsors} />
    </main>
  )
}
