import type { Metadata } from 'next'
import { Check } from 'lucide-react'
import { MarketingShell } from '@/components/marketing/shell'
import { Reveal } from '@/components/marketing/motion'
import { CtaSection } from '@/components/marketing/cta-section'
import { display } from '@/components/marketing/theme'
import { COMPARISON, COMPARISON_INTRO } from '@/lib/marketing/content'

export const metadata: Metadata = {
  title: 'Cancha vs Excel et outils génériques',
  description:
    'Comparatif : gérer un tournoi sur Excel et papier, avec un outil générique ou avec Cancha. Inscriptions, tirage, planning, scores et affichage.',
  alternates: { canonical: '/comparatif' },
}

export default function ComparatifPage() {
  return (
    <MarketingShell>
      <section className="mx-auto max-w-3xl px-4 pb-10 pt-20 text-center sm:px-6 lg:pt-24">
        <span className="text-sm font-medium text-primary">Comparatif</span>
        <h1 style={display} className="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
          Excel, outil générique ou Cancha ?
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">{COMPARISON_INTRO}</p>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-8 sm:px-6">
        <Reveal className="overflow-x-auto rounded-3xl border border-border bg-card">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="p-4 font-medium text-muted-foreground">Tâche</th>
                <th className="p-4 font-medium text-muted-foreground">Excel / papier</th>
                <th className="p-4 font-medium text-muted-foreground">Outil générique</th>
                <th className="p-4 font-medium text-primary">Cancha</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row) => (
                <tr key={row.criterion} className="border-b border-border last:border-b-0">
                  <td className="p-4 font-medium text-foreground">{row.criterion}</td>
                  <td className="p-4 text-muted-foreground">{row.excel}</td>
                  <td className="p-4 text-muted-foreground">{row.generic}</td>
                  <td className="bg-primary/[0.04] p-4">
                    <span className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span className="font-medium text-foreground">{row.cancha}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      </section>

      <CtaSection title="Prêt à passer à un vrai outil de tournoi ?" />
    </MarketingShell>
  )
}
