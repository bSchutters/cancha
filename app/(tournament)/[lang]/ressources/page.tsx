import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MarketingShell } from '@/components/marketing/shell'
import { Reveal } from '@/components/marketing/motion'
import { CtaSection } from '@/components/marketing/cta-section'
import { Breadcrumbs } from '@/components/marketing/structured-data'
import { LocaleLink } from '@/components/locale-link'
import { display, focusRing } from '@/components/marketing/theme'
import { getRequestBaseUrl } from '@/lib/tournament/seo'
import { GUIDES } from '@/lib/marketing/guides'
import { makeT } from '@/i18n'
import { isLocale, DEFAULT_LOCALE } from '@/i18n/config'
import { localizedAlternates } from '@/i18n/alternates'

export const GUIDE_KEY: Record<string, string> = {
  'organiser-tournoi-futsal': 'futsal',
  'formats-de-tournoi': 'formats',
  'checklist-jour-j': 'checklist',
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const t = makeT(isLocale(lang) ? lang : DEFAULT_LOCALE)
  return {
    title: t('resources.meta.title'),
    description: t('resources.meta.description'),
    alternates: localizedAlternates(lang, '/ressources'),
  }
}

export default async function RessourcesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const t = makeT(isLocale(lang) ? lang : DEFAULT_LOCALE)
  const base = await getRequestBaseUrl()

  return (
    <MarketingShell>
      <Breadcrumbs
        baseUrl={base}
        items={[
          { name: t('resources.breadcrumb.home'), href: `/${lang}` },
          { name: t('resources.breadcrumb.resources') },
        ]}
      />
      <section className="mx-auto max-w-3xl px-4 pb-10 pt-20 text-center sm:px-6 lg:pt-24">
        <span className="text-sm font-medium text-primary">{t('resources.eyebrow')}</span>
        <h1 style={display} className="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
          {t('resources.heroTitle')}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          {t('resources.heroIntro')}
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-8 sm:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {GUIDES.map((g, i) => {
            const k = GUIDE_KEY[g.slug] ?? g.slug
            return (
              <Reveal key={g.slug} delay={i * 0.08}>
                <LocaleLink
                  href={`/ressources/${g.slug}`}
                  className={cn(
                    'group flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/30',
                    focusRing,
                  )}
                >
                  <span className="text-xs text-muted-foreground">
                    {g.readingMinutes} {t('resources.card.readingTime')}
                  </span>
                  <h2 style={display} className="mt-2 text-xl font-medium leading-snug">
                    {t(`resources.guides.${k}.title`)}
                  </h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {t(`resources.guides.${k}.excerpt`)}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                    {t('resources.card.cta')}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </LocaleLink>
              </Reveal>
            )
          })}
        </div>
      </section>

      <CtaSection />
    </MarketingShell>
  )
}
