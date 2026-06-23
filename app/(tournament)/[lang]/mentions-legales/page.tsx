import type { Metadata } from 'next'
import { MarketingShell } from '@/components/marketing/shell'
import { display } from '@/components/marketing/theme'
import { makeT } from '@/i18n'
import { isLocale, DEFAULT_LOCALE } from '@/i18n/config'
import { localizedAlternates } from '@/i18n/alternates'

// Placeholders to complete with real company details before launch (raison
// sociale, BCE, adresse, hébergeur, contact RGPD) — translated copy lives in the
// dictionaries under legal.*.
const SECTION_KEYS = ['editor', 'hosting', 'gdpr', 'cookies', 'ip']

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const t = makeT(isLocale(lang) ? lang : DEFAULT_LOCALE)
  return {
    title: t('legal.meta.title'),
    description: t('legal.meta.description'),
    alternates: localizedAlternates(lang, '/mentions-legales'),
    robots: { index: false, follow: true },
  }
}

export default async function MentionsLegalesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const t = makeT(isLocale(lang) ? lang : DEFAULT_LOCALE)

  return (
    <MarketingShell>
      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:py-24">
        <h1 style={display} className="text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
          {t('legal.hero.title')}
        </h1>
        <div className="mt-10 space-y-10">
          {SECTION_KEYS.map((k) => (
            <div key={k}>
              <h2 style={display} className="text-xl font-medium">
                {t(`legal.${k}.title`)}
              </h2>
              <p className="mt-2 leading-relaxed text-muted-foreground">{t(`legal.${k}.body`)}</p>
            </div>
          ))}
        </div>
      </section>
    </MarketingShell>
  )
}
