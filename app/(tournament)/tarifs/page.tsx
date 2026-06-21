import type { Metadata } from 'next'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MarketingShell } from '@/components/marketing/shell'
import { Reveal } from '@/components/marketing/motion'
import { CtaSection } from '@/components/marketing/cta-section'
import { display } from '@/components/marketing/theme'
import { PRICING } from '@/lib/marketing/content'

export const metadata: Metadata = {
  title: 'Tarifs',
  description:
    'Cup Generator est en lancement : la mise en place de vos premiers tournois est gratuite. Offres clubs et sur mesure disponibles.',
  alternates: { canonical: '/tarifs' },
}

export default function TarifsPage() {
  return (
    <MarketingShell>
      <section className="mx-auto max-w-3xl px-4 pb-12 pt-20 text-center sm:px-6 lg:pt-24">
        <span className="text-sm font-medium text-primary">Tarifs</span>
        <h1 style={display} className="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
          Des prix simples, pensés pour les organisateurs
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Cup Generator est en lancement : profitez-en pour organiser vos premiers tournois
          gratuitement. On définit ensemble l’offre qui colle à votre événement.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
        <div className="grid gap-4 lg:grid-cols-3">
          {PRICING.map((p, i) => (
            <Reveal
              key={p.name}
              delay={i * 0.08}
              className={cn(
                'flex flex-col rounded-3xl border p-8',
                p.highlighted ? 'border-primary/30 bg-primary/[0.06]' : 'border-border bg-card',
              )}
            >
              <h2 style={display} className="text-xl font-medium">
                {p.name}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{p.tagline}</p>
              <p style={display} className="mt-6 text-4xl font-semibold tracking-tight">
                {p.price}
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span className="text-foreground">{f}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </section>

      <CtaSection title="Une question sur l’offre adaptée à votre tournoi ?" />
    </MarketingShell>
  )
}
