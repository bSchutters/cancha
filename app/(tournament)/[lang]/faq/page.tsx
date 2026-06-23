import type { Metadata } from 'next'
import { MarketingShell } from '@/components/marketing/shell'
import { CtaSection } from '@/components/marketing/cta-section'
import { display } from '@/components/marketing/theme'
import { makeT } from '@/i18n'
import { isLocale, DEFAULT_LOCALE } from '@/i18n/config'
import { localizedAlternates } from '@/i18n/alternates'

const FAQ_KEYS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6']

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const t = makeT(isLocale(lang) ? lang : DEFAULT_LOCALE)
  return {
    title: t('faq.meta.title'),
    description: t('faq.meta.description'),
    alternates: localizedAlternates(lang, '/faq'),
  }
}

export default async function FaqPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const t = makeT(isLocale(lang) ? lang : DEFAULT_LOCALE)

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_KEYS.map((k) => ({
      '@type': 'Question',
      name: t(`faq.${k}.question`),
      acceptedAnswer: { '@type': 'Answer', text: t(`faq.${k}.answer`) },
    })),
  }

  return (
    <MarketingShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <section className="mx-auto max-w-3xl px-4 pb-10 pt-20 text-center sm:px-6 lg:pt-24">
        <span className="text-sm font-medium text-primary">{t('faq.hero.eyebrow')}</span>
        <h1 style={display} className="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
          {t('faq.hero.title')}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">{t('faq.hero.intro')}</p>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-8 sm:px-6">
        <div className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card">
          {FAQ_KEYS.map((k) => (
            <details key={k} className="group p-6 [&_summary]:cursor-pointer">
              <summary className="flex items-center justify-between gap-4 text-left font-medium text-foreground marker:content-none">
                {t(`faq.${k}.question`)}
                <span className="text-primary transition-transform group-open:rotate-45" aria-hidden>
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t(`faq.${k}.answer`)}</p>
            </details>
          ))}
        </div>
      </section>

      <CtaSection title={t('faq.cta.title')} subtitle={t('faq.cta.subtitle')} />
    </MarketingShell>
  )
}
