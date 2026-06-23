import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { MarketingShell } from '@/components/marketing/shell'
import { Reveal } from '@/components/marketing/motion'
import { CtaSection } from '@/components/marketing/cta-section'
import { LocaleLink } from '@/components/locale-link'
import { display, focusRing } from '@/components/marketing/theme'
import { HeroBracket } from '@/components/marketing/hero-bracket'
import { TvDisplayDemo } from '@/components/marketing/tv-display'
import {
  DelayDemo,
  DrawDemo,
  FairplayDemo,
  LiveScoresDemo,
  PublicPageDemo,
  RefereeDemo,
  RegistrationDemo,
  ScheduleDemo,
  SponsorsDemo,
} from '@/components/marketing/feature-demos'
import { makeT } from '@/i18n'
import { isLocale, DEFAULT_LOCALE } from '@/i18n/config'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const t = makeT(isLocale(lang) ? lang : DEFAULT_LOCALE)
  return {
    title: t('fonctionnalites.meta.title'),
    description: t('fonctionnalites.meta.description'),
    alternates: { canonical: `/${lang}/fonctionnalites` },
  }
}

const SPOTLIGHTS: { key: string; visual: React.ReactNode }[] = [
  { key: 'inscriptions', visual: <RegistrationDemo /> },
  { key: 'tirage', visual: <DrawDemo /> },
  { key: 'calendrier', visual: <ScheduleDemo /> },
  { key: 'arbitres', visual: <RefereeDemo /> },
  { key: 'endirect', visual: <LiveScoresDemo /> },
  { key: 'imprevus', visual: <DelayDemo /> },
  { key: 'phasefinale', visual: null },
  { key: 'espritsportif', visual: <FairplayDemo /> },
  { key: 'surplace', visual: <TvDisplayDemo /> },
  { key: 'pagepublique', visual: <PublicPageDemo /> },
  { key: 'votremarque', visual: <SponsorsDemo /> },
]

export default async function FonctionnalitesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const t = makeT(isLocale(lang) ? lang : DEFAULT_LOCALE)

  return (
    <MarketingShell>
      <section className="mx-auto max-w-3xl px-4 pb-6 pt-20 text-center sm:px-6 lg:pt-24">
        <span className="text-sm font-medium text-primary">{t('fonctionnalites.hero.eyebrow')}</span>
        <h1 style={display} className="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
          {t('fonctionnalites.hero.title')}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          {t('fonctionnalites.hero.intro')}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          <Button asChild size="lg">
            <LocaleLink href="/#contact">
              {t('fonctionnalites.hero.ctaDemo')}
              <ArrowRight />
            </LocaleLink>
          </Button>
          <LocaleLink
            href="/demo"
            className={cn(
              'inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-primary',
              focusRing,
            )}
          >
            {t('fonctionnalites.hero.ctaPreview')}
            <ArrowRight className="size-4" />
          </LocaleLink>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {SPOTLIGHTS.map((s, i) => {
          const flip = i % 2 === 1
          const visual =
            s.key === 'phasefinale' ? (
              <div className="rounded-3xl border border-border bg-card p-6 shadow-[0_24px_60px_-32px_rgba(26,26,24,0.22)]">
                <span style={display} className="font-medium">
                  {t('fonctionnalites.spotlight.phasefinale.visualLabel')}
                </span>
                <div className="mt-5">
                  <HeroBracket />
                </div>
              </div>
            ) : (
              s.visual
            )
          return (
            <section
              key={s.key}
              className="grid items-center gap-10 border-t border-border py-16 lg:grid-cols-2 lg:gap-16 lg:py-24"
            >
              <Reveal className={cn(flip && 'lg:order-2')}>
                <span className="text-sm font-medium text-primary">
                  {t(`fonctionnalites.spotlight.${s.key}.eyebrow`)}
                </span>
                <h2 style={display} className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                  {t(`fonctionnalites.spotlight.${s.key}.title`)}
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                  {t(`fonctionnalites.spotlight.${s.key}.desc`)}
                </p>
                <p className="mt-5 flex items-start gap-2.5 text-base leading-relaxed">
                  <ArrowRight className="mt-1 size-4 shrink-0 text-primary" />
                  <span className="font-medium text-foreground">
                    {t(`fonctionnalites.spotlight.${s.key}.benefit`)}
                  </span>
                </p>
              </Reveal>

              <Reveal delay={0.1} y={24} className={cn(flip && 'lg:order-1')}>
                {visual}
              </Reveal>
            </section>
          )
        })}
      </div>

      <CtaSection title={t('fonctionnalites.cta.title')} />
    </MarketingShell>
  )
}
