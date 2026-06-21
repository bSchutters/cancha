import type { Metadata } from 'next'
import { MarketingShell } from '@/components/marketing/shell'
import { display } from '@/components/marketing/theme'

export const metadata: Metadata = {
  title: 'Mentions légales',
  description: 'Mentions légales et politique de confidentialité de Cup Generator.',
  alternates: { canonical: '/mentions-legales' },
  robots: { index: false, follow: true },
}

// NOTE: placeholders to complete with real company details before launch
// (raison sociale, numéro d'entreprise/BCE, adresse, hébergeur, DPO/contact RGPD).
const SECTIONS = [
  {
    title: 'Éditeur du site',
    body: 'Cup Generator — [raison sociale], [forme juridique], [adresse], [numéro d’entreprise / BCE]. Contact : [email]. Responsable de la publication : [nom].',
  },
  {
    title: 'Hébergement',
    body: 'Le site est hébergé par [hébergeur], [adresse de l’hébergeur].',
  },
  {
    title: 'Données personnelles (RGPD)',
    body: 'Les informations transmises via le formulaire de demande de démo (nom, email, et données facultatives sur votre tournoi) sont utilisées uniquement pour répondre à votre demande. Elles ne sont ni revendues ni cédées à des tiers. Conformément au RGPD, vous disposez d’un droit d’accès, de rectification et de suppression de vos données : écrivez à [email].',
  },
  {
    title: 'Cookies',
    body: 'Le site marketing n’utilise pas de cookies de suivi publicitaire. Seuls des cookies strictement nécessaires au fonctionnement peuvent être déposés.',
  },
  {
    title: 'Propriété intellectuelle',
    body: 'L’ensemble des contenus (textes, visuels, marque Cup Generator) est protégé. Toute reproduction sans autorisation est interdite.',
  },
]

export default function MentionsLegalesPage() {
  return (
    <MarketingShell>
      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:py-24">
        <h1 style={display} className="text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
          Mentions légales
        </h1>
        <div className="mt-10 space-y-10">
          {SECTIONS.map((s) => (
            <div key={s.title}>
              <h2 style={display} className="text-xl font-medium">
                {s.title}
              </h2>
              <p className="mt-2 leading-relaxed text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>
    </MarketingShell>
  )
}
