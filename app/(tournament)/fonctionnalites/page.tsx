import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Activity,
  ArrowRight,
  ClipboardList,
  Clock,
  Dices,
  Flag,
  Globe,
  Handshake,
  LayoutGrid,
  type LucideIcon,
  Megaphone,
  Trophy,
  Tv,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { MarketingShell } from '@/components/marketing/shell'
import { Reveal } from '@/components/marketing/motion'
import { CtaSection } from '@/components/marketing/cta-section'
import { display, focusRing } from '@/components/marketing/theme'
import { FEATURE_GROUPS, FEATURES_INTRO } from '@/lib/marketing/content'

export const metadata: Metadata = {
  title: 'Fonctionnalités : tout ce que fait Cup Generator',
  description:
    'Inscriptions en ligne, tirage au sort animé, calendrier multi-terrains, scores et classements en direct, phase finale, affichage TV et page publique : passez en revue toutes les fonctionnalités de Cup Generator.',
  alternates: { canonical: '/fonctionnalites' },
}

const ICONS: Record<string, LucideIcon> = {
  ClipboardList,
  Dices,
  LayoutGrid,
  Activity,
  Trophy,
  Clock,
  Flag,
  Handshake,
  Tv,
  Globe,
  Megaphone,
}

export default function FonctionnalitesPage() {
  return (
    <MarketingShell>
      <section className="mx-auto max-w-3xl px-4 pb-10 pt-20 text-center sm:px-6 lg:pt-24">
        <span className="text-sm font-medium text-primary">Fonctionnalités</span>
        <h1 style={display} className="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
          Tout ce qu’il faut pour gérer un tournoi, du premier formulaire au podium
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">{FEATURES_INTRO}</p>
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
            Voir un aperçu interactif
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {FEATURE_GROUPS.map((group, gi) => (
        <section
          key={group.id}
          className={cn('border-t border-border', gi % 2 === 1 && 'bg-secondary/50')}
        >
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
            <Reveal className="max-w-2xl">
              <div className="flex items-center gap-3">
                <span style={display} className="text-3xl font-medium tabular-nums text-primary/60">
                  0{gi + 1}
                </span>
                <span className="text-sm font-medium text-primary">{group.eyebrow}</span>
              </div>
              <h2
                style={display}
                className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl"
              >
                {group.title}
              </h2>
              <p className="mt-3 text-lg leading-relaxed text-muted-foreground">{group.intro}</p>
            </Reveal>

            <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.features.map((f, i) => {
                const Icon = ICONS[f.icon] ?? Activity
                return (
                  <Reveal
                    key={f.title}
                    delay={i * 0.06}
                    className="flex flex-col rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/30"
                  >
                    <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </span>
                    <h3 style={display} className="mt-5 text-lg font-medium">
                      {f.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                    <p className="mt-4 flex items-start gap-2 border-t border-border pt-4 text-sm leading-relaxed">
                      <ArrowRight className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span className="font-medium text-foreground">{f.benefit}</span>
                    </p>
                  </Reveal>
                )
              })}
            </div>
          </div>
        </section>
      ))}

      <CtaSection title="Envie de voir tout ça sur votre prochain tournoi ?" />
    </MarketingShell>
  )
}
