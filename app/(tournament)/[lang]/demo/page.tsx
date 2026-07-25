import type { Metadata } from 'next'
import { MarketingShell } from '@/components/marketing/shell'
import { DemoExplorer } from '@/components/marketing/demo-explorer'
import { CtaSection } from '@/components/marketing/cta-section'
import { LiveDemo } from '@/components/marketing/live-demo'
import { isDemoEnabled } from '@/lib/demo/config'
import {
  DEMO_SHOWCASE_SLUG,
  DEMO_PLAYGROUND_NAME,
  DEMO_EMAIL,
  DEMO_PASSWORD,
} from '@/lib/demo/seed'
import { display } from '@/components/marketing/theme'
import { makeT } from '@/i18n'
import { isLocale, DEFAULT_LOCALE } from '@/i18n/config'
import { localizedAlternates } from '@/i18n/alternates'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const t = makeT(isLocale(lang) ? lang : DEFAULT_LOCALE)
  return {
    title: t('demo.meta.title'),
    description: t('demo.meta.description'),
    alternates: localizedAlternates(lang, '/demo'),
  }
}

export default async function DemoPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const t = makeT(isLocale(lang) ? lang : DEFAULT_LOCALE)

  return (
    <MarketingShell>
      <section className="mx-auto max-w-3xl px-4 pb-10 pt-20 text-center sm:px-6 lg:pt-24">
        <span className="text-sm font-medium text-primary">{t('demo.hero.eyebrow')}</span>
        <h1 style={display} className="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
          {t('demo.hero.title')}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">{t('demo.hero.intro')}</p>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
        <DemoExplorer />
      </section>

      {/* Only on a deployment that opted into the public demo (DEMO_ENABLED). */}
      {isDemoEnabled() && (
        <LiveDemo
          showcaseSlug={DEMO_SHOWCASE_SLUG}
          playgroundName={DEMO_PLAYGROUND_NAME}
          email={DEMO_EMAIL}
          password={DEMO_PASSWORD}
        />
      )}

      <CtaSection title={t('demo.cta.title')} />
    </MarketingShell>
  )
}
