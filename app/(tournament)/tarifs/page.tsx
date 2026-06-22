import type { Metadata } from 'next'
import { Check, Sparkles, ShieldCheck } from 'lucide-react'
import { MarketingShell } from '@/components/marketing/shell'
import { Reveal } from '@/components/marketing/motion'
import { CtaSection } from '@/components/marketing/cta-section'
import { PriceEstimator } from '@/components/marketing/price-estimator'
import { display } from '@/components/marketing/theme'
import { PRICING_POINTS, PRICING_STEPS, PRICE_TIERS } from '@/lib/marketing/content'

export const metadata: Metadata = {
  title: 'Tarifs',
  description:
    'Cup Generator se paie par équipe inscrite, dégressif au volume : pas d’abonnement, pas de frais fixes, vous ne payez que si votre tournoi a lieu.',
  alternates: { canonical: '/tarifs' },
}

function tierLabel(t: { from: number; to: number | null }) {
  if (t.to == null) return `${t.from} équipes et +`
  return `${t.from} à ${t.to} équipes`
}

export default function TarifsPage() {
  return (
    <MarketingShell>
      <section className="mx-auto max-w-3xl px-4 pb-10 pt-20 text-center sm:px-6 lg:pt-24">
        <span className="text-sm font-medium text-primary">Tarifs</span>
        <h1 style={display} className="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
          Vous payez par équipe, c’est tout
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Pas d’abonnement, pas de frais d’installation. Un montant par équipe inscrite, dégressif
          au volume, et vous ne payez que si votre tournoi a bien lieu.
        </p>
      </section>

      {/* Interactive estimator */}
      <section className="mx-auto max-w-xl px-4 sm:px-6">
        <Reveal>
          <PriceEstimator />
        </Reveal>
      </section>

      {/* Degressive grid */}
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Reveal className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-5 py-3 text-sm font-medium text-muted-foreground">
            Tarif dégressif
          </div>
          {PRICE_TIERS.map((t) => (
            <div key={t.from} className="flex items-center justify-between border-b border-border px-5 py-3 text-sm last:border-b-0">
              <span className="font-medium">{tierLabel(t)}</span>
              <span style={display} className="font-semibold tabular-nums">
                {t.rate} € <span className="text-xs font-normal text-muted-foreground">/ équipe</span>
              </span>
            </div>
          ))}
        </Reveal>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {PRICING_POINTS.map((p) => (
            <div key={p.title} className="rounded-2xl border border-border bg-card p-5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Check className="size-4" />
              </span>
              <h2 style={display} className="mt-3 text-base font-medium">
                {p.title}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Launch offer */}
      <section className="mx-auto max-w-3xl px-4 pb-12 sm:px-6">
        <Reveal className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-primary/20 bg-primary/[0.06] p-6">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="size-5" />
            </span>
            <h3 style={display} className="mt-3 text-lg font-medium">
              Tarif Organisateur fondateur
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Les premiers organisateurs bénéficient de 30% de réduction, garantis à vie sur tous
              leurs tournois.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="size-5" />
            </span>
            <h3 style={display} className="mt-3 text-lg font-medium">
              Tournoi réussi ou remboursé
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Si votre tournoi ne se déroule pas comme prévu, on vous rembourse. Le risque est pour
              nous, pas pour vous.
            </p>
          </div>
        </Reveal>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-4 pb-8 sm:px-6">
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
        </Reveal>
      </section>

      <CtaSection
        title="Combien pour votre tournoi ?"
        subtitle="Dites-nous le sport et le nombre d’équipes, on confirme votre estimation, sans engagement."
      />
    </MarketingShell>
  )
}
