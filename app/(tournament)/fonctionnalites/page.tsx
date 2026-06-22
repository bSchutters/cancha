import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { MarketingShell } from '@/components/marketing/shell'
import { Reveal } from '@/components/marketing/motion'
import { CtaSection } from '@/components/marketing/cta-section'
import { display, focusRing } from '@/components/marketing/theme'
import { HeroBracket } from '@/components/marketing/hero-bracket'
import { TvDisplayDemo } from '@/components/marketing/tv-display'
import {
  DelayDemo,
  DrawDemo,
  FairplayDemo,
  LiveScoresDemo,
  PublicPageDemo,
  RefereeDemo,
  RegistrationDemo,
  ScheduleDemo,
  SponsorsDemo,
} from '@/components/marketing/feature-demos'

export const metadata: Metadata = {
  title: 'Fonctionnalités : tout ce que fait Cup Generator',
  description:
    'Inscriptions en ligne, tirage au sort, calendrier multi-terrains, arbitres, scores et classements en direct, phase finale, affichage TV et page publique : découvrez en images toutes les fonctionnalités de Cup Generator.',
  alternates: { canonical: '/fonctionnalites' },
}

type Spotlight = {
  eyebrow: string
  title: string
  desc: string
  benefit: string
  visual: React.ReactNode
}

const SPOTLIGHTS: Spotlight[] = [
  {
    eyebrow: 'Inscriptions',
    title: 'Les équipes s’inscrivent, vous validez',
    desc: 'Un formulaire dédié par tournoi et une liste centralisée. Vous suivez la capacité, confirmez les équipes et marquez les paiements en un clic.',
    benefit: 'Fini la double saisie et les relances : chacun s’inscrit en ligne, vous gardez la main.',
    visual: <RegistrationDemo />,
  },
  {
    eyebrow: 'Tirage au sort',
    title: 'Des poules constituées automatiquement',
    desc: 'Les poules se forment toutes seules selon votre format, équilibrées et prêtes à être projetées sur grand écran le jour J.',
    benefit: 'Un tirage équitable et transparent, sans tableur ni boules de loto.',
    visual: <DrawDemo />,
  },
  {
    eyebrow: 'Calendrier',
    title: 'Tous vos terrains, un seul planning',
    desc: 'Le calendrier complet se génère et se répartit automatiquement sur l’ensemble de vos terrains, horaires inclus.',
    benefit: 'Aucun trou, aucun conflit de terrain, zéro heure passée à assembler un planning à la main.',
    visual: <ScheduleDemo />,
  },
  {
    eyebrow: 'Arbitres',
    title: 'Chaque terrain sait qui siffle',
    desc: 'Affectez vos arbitres à la main ou laissez la plateforme les répartir aléatoirement dès la génération du calendrier.',
    benefit: 'Plus de liste papier ni de discussion au dernier moment devant chaque terrain.',
    visual: <RefereeDemo />,
  },
  {
    eyebrow: 'En direct',
    title: 'Saisissez un score, le classement suit',
    desc: 'La saisie se fait par terrain ; classements, points et qualifiés se recalculent en temps réel, sans la moindre formule.',
    benefit: 'Plus d’erreurs de calcul : tout le monde voit la même chose, à la seconde près.',
    visual: <LiveScoresDemo />,
  },
  {
    eyebrow: 'Imprévus',
    title: 'Un retard ne fait pas dérailler la journée',
    desc: 'Un match déborde ? Indiquez le retard et les horaires suivants se recalent en un clic sur tous les terrains concernés.',
    benefit: 'Vous absorbez l’imprévu sans tout reprendre, et le public garde des horaires justes.',
    visual: <DelayDemo />,
  },
  {
    eyebrow: 'Phase finale',
    title: 'L’arbre se construit tout seul',
    desc: 'Dès la fin des poules, l’arbre, les barrages et le classement final se montent à partir des résultats. Plus qu’à jouer.',
    benefit: 'La phase finale se génère sans que vous y touchiez, même en cas d’égalité.',
    visual: (
      <div className="rounded-3xl border border-border bg-card p-6 shadow-[0_24px_60px_-32px_rgba(26,26,24,0.22)]">
        <span style={display} className="font-medium">
          Arbre de la phase finale
        </span>
        <div className="mt-5">
          <HeroBracket />
        </div>
      </div>
    ),
  },
  {
    eyebrow: 'Esprit sportif',
    title: 'Le fair-play a son propre classement',
    desc: 'Les cartons sont suivis match après match et donnent un classement fair-play, en parallèle des résultats sportifs.',
    benefit: 'Vous récompensez l’esprit d’équipe autant que la victoire, idéal chez les jeunes.',
    visual: <FairplayDemo />,
  },
  {
    eyebrow: 'Sur place',
    title: 'Un grand écran qui anime votre salle',
    desc: 'Le mode TV fait défiler prochains matchs, scores et classements en continu, sans personne pour le tenir à jour.',
    benefit: 'L’ambiance d’un vrai événement, sans tableau blanc ni feuille scotchée au mur.',
    visual: <TvDisplayDemo />,
  },
  {
    eyebrow: 'Page publique',
    title: 'Une page par tournoi, suivie depuis le téléphone',
    desc: 'Chaque tournoi a sa page : équipes, calendrier et résultats en ligne, accessibles à tous en temps réel.',
    benefit: 'Joueurs, familles et public suivent tout seuls, vous répondez à moins de questions.',
    visual: <PublicPageDemo />,
  },
  {
    eyebrow: 'Votre marque',
    title: 'Vos couleurs, vos sponsors, partout',
    desc: 'Affichez votre logo, vos couleurs et vos sponsors sur la page publique comme sur l’écran TV.',
    benefit: 'Une visibilité concrète à offrir à vos sponsors, et un tournoi qui porte vraiment vos couleurs.',
    visual: <SponsorsDemo />,
  },
]

export default function FonctionnalitesPage() {
  return (
    <MarketingShell>
      <section className="mx-auto max-w-3xl px-4 pb-6 pt-20 text-center sm:px-6 lg:pt-24">
        <span className="text-sm font-medium text-primary">Fonctionnalités</span>
        <h1 style={display} className="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
          Tout ce que fait Cup Generator, en images
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          De la première inscription au dernier coup de sifflet, voici concrètement ce que la
          plateforme fait à votre place, étape par étape.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          <Button asChild size="lg">
            <Link href="/#contact">
              Demander une démo
              <ArrowRight />
            </Link>
          </Button>
          <Link
            href="/demo"
            className={cn(
              'inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-primary',
              focusRing,
            )}
          >
            Essayer l’aperçu interactif
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {SPOTLIGHTS.map((s, i) => {
          const flip = i % 2 === 1
          return (
            <section
              key={s.title}
              className="grid items-center gap-10 border-t border-border py-16 lg:grid-cols-2 lg:gap-16 lg:py-24"
            >
              <Reveal className={cn(flip && 'lg:order-2')}>
                <span className="text-sm font-medium text-primary">{s.eyebrow}</span>
                <h2
                  style={display}
                  className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl"
                >
                  {s.title}
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{s.desc}</p>
                <p className="mt-5 flex items-start gap-2.5 text-base leading-relaxed">
                  <ArrowRight className="mt-1 size-4 shrink-0 text-primary" />
                  <span className="font-medium text-foreground">{s.benefit}</span>
                </p>
              </Reveal>

              <Reveal delay={0.1} y={24} className={cn(flip && 'lg:order-1')}>
                {s.visual}
              </Reveal>
            </section>
          )
        })}
      </div>

      <CtaSection title="Envie de voir tout ça sur votre prochain tournoi ?" />
    </MarketingShell>
  )
}
