import { LocaleLink } from '@/components/locale-link'
import { getSessionUser, isOwner } from '@/lib/tournament/session'
import { TournamentConfigForm } from '@/components/tournament/manage/TournamentConfigForm'
import { makeT } from '@/i18n'
import { isLocale, DEFAULT_LOCALE } from '@/i18n/config'

export const dynamic = 'force-dynamic'

export default async function NewTournamentPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const t = makeT(isLocale(lang) ? lang : DEFAULT_LOCALE)
  const owner = isOwner(await getSessionUser())
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <LocaleLink href="/manage" className="text-sm text-muted-foreground hover:text-foreground">
        ← {t('product.manage.tournaments')}
      </LocaleLink>
      <h1 className="mt-4 mb-8 text-3xl font-bold">{t('product.manage.newTournamentTitle')}</h1>
      <TournamentConfigForm isOwner={owner} />
    </main>
  )
}
