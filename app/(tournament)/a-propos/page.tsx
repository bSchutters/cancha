import type { Metadata } from 'next'
import { MarketingShell } from '@/components/marketing/shell'
import { Reveal } from '@/components/marketing/motion'
import { CtaSection } from '@/components/marketing/cta-section'
import { display } from '@/components/marketing/theme'

export const metadata: Metadata = {
  title: 'À propos',
  description:
    'Cup Generator est né de l’organisation de vrais tournois. Notre mission : rendre la gestion de tournois sportifs simple, fiable et professionnelle.',
  alternates: { canonical: '/a-propos' },
}

const PARAGRAPHS = [
  'Cup Generator n’est pas né dans un tableur, mais sur le terrain. L’outil a d’abord servi à gérer les tournois d’un club, avec leurs vraies contraintes : des dizaines d’équipes, plusieurs terrains, un tirage à annoncer en salle et des classements à tenir à jour en direct.',
  'À force de l’utiliser, une évidence est apparue : ce dont un club a besoin, n’importe quel organisateur en a besoin aussi. Nous avons donc détaché l’outil pour en faire une plateforme à part entière, ouverte à tous les sports et à tous les formats.',
  'Notre conviction est simple : organiser un tournoi devrait être un plaisir, pas une corvée logistique. La technique doit s’effacer pour laisser place au sport, à l’ambiance et aux équipes.',
]

export default function AProposPage() {
  return (
    <MarketingShell>
      <section className="mx-auto max-w-3xl px-4 pb-12 pt-20 sm:px-6 lg:pt-24">
        <span className="text-sm font-medium text-primary">À propos</span>
        <h1 style={display} className="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
          Né sur le terrain, pas dans un tableur
        </h1>
        <div className="mt-8 space-y-6">
          {PARAGRAPHS.map((p, i) => (
            <Reveal key={i} delay={i * 0.06}>
              <p className="text-lg leading-relaxed text-muted-foreground">{p}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <CtaSection title="Envie d’en discuter ?" subtitle="Parlez-nous de votre tournoi, on vous montre comment Cup Generator peut aider." />
    </MarketingShell>
  )
}
