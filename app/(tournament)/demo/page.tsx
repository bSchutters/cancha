import type { Metadata } from 'next'
import { MarketingShell } from '@/components/marketing/shell'
import { DemoExplorer } from '@/components/marketing/demo-explorer'
import { CtaSection } from '@/components/marketing/cta-section'
import { display } from '@/components/marketing/theme'

export const metadata: Metadata = {
  title: 'Aperçu interactif',
  description:
    'Aperçu interactif de Cup Generator : lancez un tirage au sort animé, parcourez les poules, le calendrier et la phase finale, sur des données d’exemple.',
  alternates: { canonical: '/demo' },
}

export default function DemoPage() {
  return (
    <MarketingShell>
      <section className="mx-auto max-w-3xl px-4 pb-10 pt-20 text-center sm:px-6 lg:pt-24">
        <span className="text-sm font-medium text-primary">Aperçu interactif</span>
        <h1 style={display} className="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
          Les deux faces de votre tournoi
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Côté organisateur, votre poste de pilotage. Côté public, ce que voient les équipes en direct.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
        <DemoExplorer />
      </section>

      <CtaSection title="Envie de la même chose pour votre tournoi ?" />
    </MarketingShell>
  )
}
