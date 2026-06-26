import { notFound } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'
import { buildManageTournament } from '@/lib/tournament/manage-view'
import { TournamentNav } from '@/components/tournament/manage/TournamentNav'
import { TeamsClient } from '@/components/tournament/manage/TeamsClient'
import { makeT } from '@/i18n'
import { isLocale, DEFAULT_LOCALE } from '@/i18n/config'

export const dynamic = 'force-dynamic'

export default async function TeamsPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params
  const tr = makeT(isLocale(lang) ? lang : DEFAULT_LOCALE)
  const payload = await getPayloadClient()
  const t = await buildManageTournament(payload, slug)
  if (!t) notFound()

  return (
    <main className="mx-auto max-w-screen-2xl px-4 py-10">
      <TournamentNav slug={slug} active="teams" />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{tr('product.nav.teams')}</h1>
        <p className="text-sm text-muted-foreground">
          {tr('product.page.teamsCounts')
            .replace('{confirmed}', String(t.counts.confirmed))
            .replace('{registered}', String(t.counts.registered))
            .replace('{paid}', String(t.counts.paid))}
        </p>
      </div>
      <TeamsClient tournamentId={t.id} teams={t.teams} />
    </main>
  )
}
