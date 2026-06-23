import type { Metadata } from 'next'
import { MarketingShell } from '@/components/marketing/shell'
import { CtaSection } from '@/components/marketing/cta-section'
import { display } from '@/components/marketing/theme'
import { FAQ } from '@/lib/marketing/content'

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Questions fréquentes sur Cancha : sports pris en charge, prise en main, tarifs, suivi en direct et données.',
  alternates: { canonical: '/faq' },
}

// FAQ structured data for rich results.
const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
}

export default function FaqPage() {
  return (
    <MarketingShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <section className="mx-auto max-w-3xl px-4 pb-10 pt-20 text-center sm:px-6 lg:pt-24">
        <span className="text-sm font-medium text-primary">FAQ</span>
        <h1 style={display} className="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
          Questions fréquentes
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Tout ce qu’il faut savoir avant de lancer votre premier tournoi.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-8 sm:px-6">
        <div className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card">
          {FAQ.map((f) => (
            <details key={f.q} className="group p-6 [&_summary]:cursor-pointer">
              <summary className="flex items-center justify-between gap-4 text-left font-medium text-foreground marker:content-none">
                {f.q}
                <span className="text-primary transition-transform group-open:rotate-45" aria-hidden>
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <CtaSection title="Vous avez une autre question ?" subtitle="Posez-la nous, on vous répond sous 24 à 48h." />
    </MarketingShell>
  )
}
