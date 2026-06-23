import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MarketingShell } from '@/components/marketing/shell'
import { CtaSection } from '@/components/marketing/cta-section'
import { Breadcrumbs } from '@/components/marketing/structured-data'
import { LocaleLink } from '@/components/locale-link'
import { display, focusRing } from '@/components/marketing/theme'
import { getRequestBaseUrl } from '@/lib/tournament/seo'
import { BRAND_NAME } from '@/lib/site'
import { GUIDES } from '@/lib/marketing/guides'
import { GUIDE_KEY } from '../page'
import { makeT } from '@/i18n'
import { isLocale, DEFAULT_LOCALE } from '@/i18n/config'

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>
}): Promise<Metadata> {
  const { lang, slug } = await params
  const g = GUIDES.find((x) => x.slug === slug)
  if (!g) return {}
  const t = makeT(isLocale(lang) ? lang : DEFAULT_LOCALE)
  const k = GUIDE_KEY[slug] ?? slug
  return {
    title: t(`resources.guides.${k}.title`),
    description: t(`resources.guides.${k}.metaDescription`),
    alternates: { canonical: `/${lang}/ressources/${slug}` },
  }
}

export default async function GuidePage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params
  const g = GUIDES.find((x) => x.slug === slug)
  if (!g) notFound()
  const t = makeT(isLocale(lang) ? lang : DEFAULT_LOCALE)
  const base = await getRequestBaseUrl()
  const k = GUIDE_KEY[slug] ?? slug
  const title = t(`resources.guides.${k}.title`)

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: t(`resources.guides.${k}.metaDescription`),
    author: { '@type': 'Organization', name: BRAND_NAME },
  }

  return (
    <MarketingShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <Breadcrumbs
        baseUrl={base}
        items={[
          { name: t('resources.guide.breadcrumb.home'), href: `/${lang}` },
          { name: t('resources.guide.breadcrumb.resources'), href: `/${lang}/ressources` },
          { name: title },
        ]}
      />

      <article className="mx-auto max-w-2xl px-4 py-20 sm:px-6 lg:py-24">
        <LocaleLink
          href="/ressources"
          className={cn(
            'inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
            focusRing,
          )}
        >
          <ArrowLeft className="size-4" />
          {t('resources.guide.backLink')}
        </LocaleLink>

        <span className="mt-8 block text-xs text-muted-foreground">
          {g.readingMinutes} {t('resources.guide.readingTime')}
        </span>
        <h1 style={display} className="mt-2 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
          {title}
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{t(`resources.guides.${k}.excerpt`)}</p>

        <div className="mt-12 space-y-10">
          {g.sections.map((_s, i) => (
            <section key={i}>
              <h2 style={display} className="text-2xl font-medium tracking-tight">
                {t(`resources.guides.${k}.s${i + 1}.heading`)}
              </h2>
              <div className="mt-3 space-y-4">
                <p className="leading-relaxed text-muted-foreground">{t(`resources.guides.${k}.s${i + 1}.p1`)}</p>
                <p className="leading-relaxed text-muted-foreground">{t(`resources.guides.${k}.s${i + 1}.p2`)}</p>
              </div>
            </section>
          ))}
        </div>
      </article>

      <CtaSection title={t('resources.guide.cta.title')} subtitle={t('resources.guide.cta.subtitle')} />
    </MarketingShell>
  )
}
