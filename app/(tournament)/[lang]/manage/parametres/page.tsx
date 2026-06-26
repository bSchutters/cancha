import { redirect } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'
import { getSessionUser, isManager, isSuperAdmin } from '@/lib/tournament/session'
import { resolveManageOrgId } from '@/lib/tournament/tenant'
import { SettingsForm } from '@/components/tournament/manage/SettingsForm'
import { makeT } from '@/i18n'
import { isLocale, DEFAULT_LOCALE, type Locale } from '@/i18n/config'

export const dynamic = 'force-dynamic'

export default async function SettingsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const t = makeT(isLocale(lang) ? lang : DEFAULT_LOCALE)
  const user = await getSessionUser()
  if (!isManager(user)) redirect(`/${lang}/login`)

  const payload = await getPayloadClient()
  const orgId = await resolveManageOrgId(payload, user)

  // Ambiguous: a super-admin not bound to one org edits each from /admin.
  if (orgId == null) {
    return (
      <main className="mx-auto max-w-screen-2xl px-4 py-10">
        <h1 className="text-3xl font-bold">{t('product.settings.title')}</h1>
        <p className="mt-4 max-w-prose text-muted-foreground">
          {isSuperAdmin(user) ? t('product.settings.ambiguousSuperAdmin') : t('product.settings.noOrg')}
        </p>
      </main>
    )
  }

  const org = (await payload.findByID({
    collection: 'organizations',
    id: orgId,
    depth: 0,
    overrideAccess: true,
  })) as { name?: string; default_manage_locale?: string; default_public_locale?: string }

  const manageLocale: Locale = isLocale(org.default_manage_locale) ? org.default_manage_locale : DEFAULT_LOCALE
  const publicLocale: Locale = isLocale(org.default_public_locale) ? org.default_public_locale : DEFAULT_LOCALE

  return (
    <main className="mx-auto max-w-screen-2xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t('product.settings.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('product.settings.langSubtitle')}</p>
      </div>
      <SettingsForm orgId={orgId} initialManageLocale={manageLocale} initialPublicLocale={publicLocale} />
    </main>
  )
}
