import type { Metadata } from 'next'
import { MarketingShell } from '@/components/marketing/shell'
import { Reveal } from '@/components/marketing/motion'
import { CtaSection } from '@/components/marketing/cta-section'
import { display } from '@/components/marketing/theme'
import { makeT } from '@/i18n'
import { isLocale, DEFAULT_LOCALE } from '@/i18n/config'
import { localizedAlternates } from '@/i18n/alternates'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const t = makeT(isLocale(lang) ? lang : DEFAULT_LOCALE)
  return {
    title: t('apropos.metaTitle'),
    description: t('apropos.metaDescription'),
    alternates: localizedAlternates(lang, '/a-propos'),
  }
}

export default async function AProposPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const t = makeT(isLocale(lang) ? lang : DEFAULT_LOCALE)

  return (
    <MarketingShell>
      <section className="mx-auto max-w-3xl px-4 pb-12 pt-20 sm:px-6 lg:pt-24">
        <span className="text-sm font-medium text-primary">{t('apropos.eyebrow')}</span>
        <h1 style={display} className="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
          {t('apropos.heroTitle')}
        </h1>
        <div className="mt-8 space-y-6">
          {[1, 2, 3].map((i) => (
            <Reveal key={i} delay={(i - 1) * 0.06}>
              <p className="text-lg leading-relaxed text-muted-foreground">{t(`apropos.paragraph${i}`)}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <CtaSection title={t('apropos.ctaTitle')} subtitle={t('apropos.ctaSubtitle')} />
    </MarketingShell>
  )
}
