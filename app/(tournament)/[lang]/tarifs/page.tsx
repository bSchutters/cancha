import type { Metadata } from 'next'
import { Building2, Check, ShieldCheck, Sparkles } from 'lucide-react'
import { MarketingShell } from '@/components/marketing/shell'
import { Reveal } from '@/components/marketing/motion'
import { CtaSection } from '@/components/marketing/cta-section'
import { PriceEstimator } from '@/components/marketing/price-estimator'
import { LocaleLink } from '@/components/locale-link'
import { Button } from '@/components/ui/button'
import { display } from '@/components/marketing/theme'
import { PRICE_TIERS } from '@/lib/marketing/content'
import { makeT, type Translate } from '@/i18n'
import { isLocale, DEFAULT_LOCALE } from '@/i18n/config'
import { localizedAlternates } from '@/i18n/alternates'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const t = makeT(isLocale(lang) ? lang : DEFAULT_LOCALE)
  return {
    title: t('tarifs.meta.title'),
    description: t('tarifs.meta.description'),
    alternates: localizedAlternates(lang, '/tarifs'),
  }
}

function tierLabel(t: Translate, tier: { from: number; to: number | null }) {
  return tier.to == null
    ? t('tarifs.tierLabel.andMore').replace('{from}', String(tier.from))
    : t('tarifs.tierLabel.range').replace('{from}', String(tier.from)).replace('{to}', String(tier.to))
}

export default async function TarifsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const t = makeT(isLocale(lang) ? lang : DEFAULT_LOCALE)

  const customBody = t('tarifs.custom.body')
  const customLink = t('tarifs.custom.bodyLink')
  const customHasLink = customBody.includes(customLink)

  return (
    <MarketingShell>
      <section className="mx-auto max-w-3xl px-4 pb-10 pt-20 text-center sm:px-6 lg:pt-24">
        <span className="text-sm font-medium text-primary">{t('tarifs.hero.eyebrow')}</span>
        <h1 style={display} className="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
          {t('tarifs.hero.title')}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">{t('tarifs.hero.intro')}</p>
      </section>

      {/* Launch offer (prominent) */}
      <section className="mx-auto max-w-5xl px-4 pb-10 sm:px-6">
        <Reveal className="overflow-hidden rounded-3xl border border-primary/30 bg-primary p-8 text-center text-primary-foreground sm:p-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
            <Sparkles className="size-3.5" /> {t('tarifs.launch.badge')}
          </span>
          <h2 style={display} className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            {t('tarifs.launch.title')}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-primary-foreground/85">{t('tarifs.launch.body')}</p>
          <div className="mt-6">
            <Button asChild size="lg" variant="secondary">
              <LocaleLink href="#contact">{t('tarifs.launch.cta')}</LocaleLink>
            </Button>
          </div>
        </Reveal>
      </section>

      {/* Estimator + degressive grid, side by side */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="grid items-start gap-6 lg:grid-cols-2">
          <Reveal>
            <PriceEstimator />
          </Reveal>
          <Reveal delay={0.08} className="flex h-full flex-col gap-4">
            <div className="overflow-hidden rounded-3xl border border-border bg-card">
              <div className="border-b border-border px-5 py-3 text-sm font-medium text-muted-foreground">
                {t('tarifs.degressive.heading')}
              </div>
              {PRICE_TIERS.map((tier) => (
                <div
                  key={tier.from}
                  className="flex items-center justify-between border-b border-border px-5 py-3.5 text-sm last:border-b-0"
                >
                  <span className="font-medium">{tierLabel(t, tier)}</span>
                  <span style={display} className="font-semibold tabular-nums">
                    {tier.rate} €{' '}
                    <span className="text-xs font-normal text-muted-foreground">
                      {t('tarifs.degressive.rateSuffix')}
                    </span>
                  </span>
                </div>
              ))}
            </div>
            <div className="rounded-3xl border border-border bg-secondary/40 px-5 py-4 text-sm text-muted-foreground">
              {t('tarifs.degressive.note')}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Reassurance */}
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Reveal key={i} delay={i * 0.06} className="rounded-2xl border border-border bg-card p-6">
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Check className="size-5" />
              </span>
              <h2 style={display} className="mt-3 text-base font-medium">
                {t(`pricing.points.${i}.title`)}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t(`pricing.points.${i}.desc`)}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Guarantee + custom/large tournaments */}
      <section className="mx-auto max-w-5xl px-4 pb-12 sm:px-6">
        <Reveal className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="size-5" />
            </span>
            <h3 style={display} className="mt-3 text-lg font-medium">
              {t('tarifs.guarantee.title')}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{t('tarifs.guarantee.body')}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Building2 className="size-5" />
            </span>
            <h3 style={display} className="mt-3 text-lg font-medium">
              {t('tarifs.custom.title')}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {customHasLink ? (
                <>
                  {customBody.slice(0, customBody.indexOf(customLink))}
                  <LocaleLink href="#contact" className="font-medium text-primary underline underline-offset-2">
                    {customLink}
                  </LocaleLink>
                  {customBody.slice(customBody.indexOf(customLink) + customLink.length)}
                </>
              ) : (
                customBody
              )}
            </p>
          </div>
        </Reveal>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-4 pb-8 sm:px-6">
        <Reveal className="rounded-3xl border border-border bg-secondary/50 p-8 sm:p-12">
          <h2 style={display} className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {t('tarifs.howItWorks.title')}
          </h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i}>
                <span style={display} className="text-3xl font-medium tabular-nums text-primary/60">
                  0{i + 1}
                </span>
                <h3 style={display} className="mt-3 text-lg font-medium">
                  {t(`pricing.steps.${i}.title`)}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{t(`pricing.steps.${i}.desc`)}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <CtaSection title={t('tarifs.cta.title')} subtitle={t('tarifs.cta.subtitle')} />
    </MarketingShell>
  )
}
