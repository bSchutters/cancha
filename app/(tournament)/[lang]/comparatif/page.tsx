import type { Metadata } from 'next'
import { Check } from 'lucide-react'
import { MarketingShell } from '@/components/marketing/shell'
import { Reveal } from '@/components/marketing/motion'
import { CtaSection } from '@/components/marketing/cta-section'
import { display } from '@/components/marketing/theme'
import { makeT } from '@/i18n'
import { isLocale, DEFAULT_LOCALE } from '@/i18n/config'
import { localizedAlternates } from '@/i18n/alternates'

const ROWS = [
  'registrations',
  'draw',
  'schedule',
  'recalc',
  'scores',
  'display',
  'referees',
  'sponsors',
  'onboarding',
  'cost',
]

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const t = makeT(isLocale(lang) ? lang : DEFAULT_LOCALE)
  return {
    title: t('comparatif.meta.title'),
    description: t('comparatif.meta.description'),
    alternates: localizedAlternates(lang, '/comparatif'),
  }
}

export default async function ComparatifPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const t = makeT(isLocale(lang) ? lang : DEFAULT_LOCALE)

  return (
    <MarketingShell>
      <section className="mx-auto max-w-3xl px-4 pb-10 pt-20 text-center sm:px-6 lg:pt-24">
        <span className="text-sm font-medium text-primary">{t('comparatif.eyebrow')}</span>
        <h1 style={display} className="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
          {t('comparatif.heroTitle')}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">{t('comparatif.intro')}</p>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-8 sm:px-6">
        <Reveal className="overflow-x-auto rounded-3xl border border-border bg-card">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="p-4 font-medium text-muted-foreground">{t('comparatif.table.header.task')}</th>
                <th className="p-4 font-medium text-muted-foreground">{t('comparatif.table.header.excel')}</th>
                <th className="p-4 font-medium text-muted-foreground">{t('comparatif.table.header.generic')}</th>
                <th className="p-4 font-medium text-primary">{t('comparatif.table.header.cancha')}</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r} className="border-b border-border last:border-b-0">
                  <td className="p-4 font-medium text-foreground">{t(`comparatif.row.${r}.criterion`)}</td>
                  <td className="p-4 text-muted-foreground">{t(`comparatif.row.${r}.excel`)}</td>
                  <td className="p-4 text-muted-foreground">{t(`comparatif.row.${r}.generic`)}</td>
                  <td className="bg-primary/[0.04] p-4">
                    <span className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span className="font-medium text-foreground">{t(`comparatif.row.${r}.cancha`)}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      </section>

      <CtaSection title={t('comparatif.cta.title')} />
    </MarketingShell>
  )
}
