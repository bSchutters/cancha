import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MarketingShell } from '@/components/marketing/shell'
import { MiniLanding } from '@/components/marketing/mini-landing'
import { Breadcrumbs } from '@/components/marketing/structured-data'
import { getRequestBaseUrl } from '@/lib/tournament/seo'
import { PROFILES } from '@/lib/marketing/content'
import { makeT } from '@/i18n'
import { isLocale, DEFAULT_LOCALE } from '@/i18n/config'

export function generateStaticParams() {
  return PROFILES.map((p) => ({ profil: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; profil: string }>
}): Promise<Metadata> {
  const { lang, profil } = await params
  if (!PROFILES.some((p) => p.slug === profil)) return {}
  const t = makeT(isLocale(lang) ? lang : DEFAULT_LOCALE)
  return {
    title: t(`profiles.${profil}.eyebrow`),
    description: t(`profiles.${profil}.intro`),
    alternates: { canonical: `/${lang}/organisateurs/${profil}` },
  }
}

export default async function ProfilePage({ params }: { params: Promise<{ lang: string; profil: string }> }) {
  const { lang, profil } = await params
  if (!PROFILES.some((p) => p.slug === profil)) notFound()
  const t = makeT(isLocale(lang) ? lang : DEFAULT_LOCALE)
  const base = await getRequestBaseUrl()
  return (
    <MarketingShell>
      <Breadcrumbs
        baseUrl={base}
        items={[{ name: t('minilanding.breadcrumb.home'), href: `/${lang}` }, { name: t(`profiles.${profil}.name`) }]}
      />
      <MiniLanding
        t={t}
        eyebrow={t(`profiles.${profil}.eyebrow`)}
        h1={t(`profiles.${profil}.h1`)}
        intro={t(`profiles.${profil}.intro`)}
        bullets={[0, 1, 2].map((i) => t(`profiles.${profil}.bullets.${i}`))}
      />
    </MarketingShell>
  )
}
