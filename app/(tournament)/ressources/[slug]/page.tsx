import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MarketingShell } from '@/components/marketing/shell'
import { CtaSection } from '@/components/marketing/cta-section'
import { display, focusRing } from '@/components/marketing/theme'
import { GUIDES } from '@/lib/marketing/guides'

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const g = GUIDES.find((x) => x.slug === slug)
  if (!g) return {}
  return { title: g.title, description: g.metaDescription, alternates: { canonical: `/ressources/${g.slug}` } }
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const g = GUIDES.find((x) => x.slug === slug)
  if (!g) notFound()

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: g.title,
    description: g.metaDescription,
    author: { '@type': 'Organization', name: 'Cup Generator' },
  }

  return (
    <MarketingShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />

      <article className="mx-auto max-w-2xl px-4 py-20 sm:px-6 lg:py-24">
        <Link
          href="/ressources"
          className={cn('inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground', focusRing)}
        >
          <ArrowLeft className="size-4" />
          Toutes les ressources
        </Link>

        <span className="mt-8 block text-xs text-muted-foreground">{g.readingMinutes} min de lecture</span>
        <h1 style={display} className="mt-2 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
          {g.title}
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{g.excerpt}</p>

        <div className="mt-12 space-y-10">
          {g.sections.map((s) => (
            <section key={s.heading}>
              <h2 style={display} className="text-2xl font-medium tracking-tight">
                {s.heading}
              </h2>
              <div className="mt-3 space-y-4">
                {s.body.map((p, i) => (
                  <p key={i} className="leading-relaxed text-muted-foreground">
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>

      <CtaSection title="Passez de la théorie au terrain" subtitle="On configure votre premier tournoi avec vous. Demandez une démo." />
    </MarketingShell>
  )
}
