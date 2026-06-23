import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MarketingShell } from '@/components/marketing/shell'
import { Reveal } from '@/components/marketing/motion'
import { CtaSection } from '@/components/marketing/cta-section'
import { Breadcrumbs } from '@/components/marketing/structured-data'
import { display, focusRing } from '@/components/marketing/theme'
import { getRequestBaseUrl } from '@/lib/tournament/seo'
import { GUIDES } from '@/lib/marketing/guides'

export const metadata: Metadata = {
  title: 'Ressources',
  description:
    'Guides pratiques pour organiser un tournoi : formats, étapes, checklist du jour J. Conseils concrets pour les organisateurs.',
  alternates: { canonical: '/ressources' },
}

export default async function RessourcesPage() {
  const base = await getRequestBaseUrl()
  return (
    <MarketingShell>
      <Breadcrumbs baseUrl={base} items={[{ name: 'Accueil', href: '/' }, { name: 'Ressources' }]} />
      <section className="mx-auto max-w-3xl px-4 pb-10 pt-20 text-center sm:px-6 lg:pt-24">
        <span className="text-sm font-medium text-primary">Ressources</span>
        <h1 style={display} className="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
          Guides pour organiser un tournoi
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Des conseils concrets, tirés du terrain, pour préparer et gérer votre événement.
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-8 sm:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {GUIDES.map((g, i) => (
            <Reveal key={g.slug} delay={i * 0.08}>
              <Link
                href={`/ressources/${g.slug}`}
                className={cn(
                  'group flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/30',
                  focusRing,
                )}
              >
                <span className="text-xs text-muted-foreground">{g.readingMinutes} min de lecture</span>
                <h2 style={display} className="mt-2 text-xl font-medium leading-snug">
                  {g.title}
                </h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{g.excerpt}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                  Lire le guide
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <CtaSection />
    </MarketingShell>
  )
}
