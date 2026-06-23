import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MarketingShell } from '@/components/marketing/shell'
import { MiniLanding } from '@/components/marketing/mini-landing'
import { Breadcrumbs } from '@/components/marketing/structured-data'
import { getRequestBaseUrl } from '@/lib/tournament/seo'
import { SPORTS } from '@/lib/marketing/content'
import { makeT } from '@/i18n'
import { isLocale, DEFAULT_LOCALE } from '@/i18n/config'

export function generateStaticParams() {
  return SPORTS.map((s) => ({ sport: s.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; sport: string }>
}): Promise<Metadata> {
  const { lang, sport } = await params
  if (!SPORTS.some((s) => s.slug === sport)) return {}
  const t = makeT(isLocale(lang) ? lang : DEFAULT_LOCALE)
  return {
    title: t(`sports.${sport}.eyebrow`),
    description: t(`sports.${sport}.intro`),
    alternates: { canonical: `/${lang}/sports/${sport}` },
  }
}

export default async function SportPage({ params }: { params: Promise<{ lang: string; sport: string }> }) {
  const { lang, sport } = await params
  if (!SPORTS.some((s) => s.slug === sport)) notFound()
  const t = makeT(isLocale(lang) ? lang : DEFAULT_LOCALE)
  const base = await getRequestBaseUrl()
  return (
    <MarketingShell>
      <Breadcrumbs
        baseUrl={base}
        items={[{ name: t('minilanding.breadcrumb.home'), href: `/${lang}` }, { name: t(`sports.${sport}.name`) }]}
      />
      <MiniLanding
        t={t}
        eyebrow={t(`sports.${sport}.eyebrow`)}
        h1={t(`sports.${sport}.h1`)}
        intro={t(`sports.${sport}.intro`)}
        formats={[0, 1, 2].map((i) => t(`sports.${sport}.formats.${i}`))}
      />
    </MarketingShell>
  )
}
