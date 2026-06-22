import type { Metadata } from 'next'
import { Check } from 'lucide-react'
import { MarketingShell } from '@/components/marketing/shell'
import { Reveal } from '@/components/marketing/motion'
import { CtaSection } from '@/components/marketing/cta-section'
import { display } from '@/components/marketing/theme'
import { PRICING_POINTS, PRICING_STEPS } from '@/lib/marketing/content'

export const metadata: Metadata = {
  title: 'Tarifs',
  description:
    'Cup Generator se paie à l’usage : un montant par équipe inscrite, sans abonnement ni frais fixes. Vous ne payez que si votre tournoi a lieu.',
  alternates: { canonical: '/tarifs' },
}

export default function TarifsPage() {
  return (
    <MarketingShell>
      <section className="mx-auto max-w-3xl px-4 pb-12 pt-20 text-center sm:px-6 lg:pt-24">
        <span className="text-sm font-medium text-primary">Tarifs</span>
        <h1 style={display} className="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
          Un tarif simple : vous payez par équipe
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Pas d’abonnement, pas de frais d’installation. Vous réglez un petit montant par équipe
          inscrite, et seulement si votre tournoi a bien lieu.
        </p>
      </section>

      {/* Reassurance points */}
      <section className="mx-auto max-w-5xl px-4 pb-4 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {PRICING_POINTS.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.08} className="rounded-2xl border border-border bg-card p-6">
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Check className="size-5" />
              </span>
              <h2 style={display} className="mt-4 text-lg font-medium">
                {p.title}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <Reveal className="rounded-3xl border border-border bg-secondary/50 p-8 sm:p-12">
          <h2 style={display} className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Comment ça marche
          </h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-3">
            {PRICING_STEPS.map((s, i) => (
              <div key={s.title}>
                <span style={display} className="text-3xl font-medium tabular-nums text-primary/60">
                  0{i + 1}
                </span>
                <h3 style={display} className="mt-3 text-lg font-medium">
                  {s.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm leading-relaxed text-muted-foreground">
            Le montant exact par équipe dépend de votre volume. Contactez-nous pour une estimation
            adaptée à votre tournoi : c’est sans engagement.
          </p>
        </Reveal>
      </section>

      <CtaSection
        title="Combien pour votre tournoi ?"
        subtitle="Dites-nous le sport et le nombre d’équipes, on vous donne une estimation claire."
      />
    </MarketingShell>
  )
}
