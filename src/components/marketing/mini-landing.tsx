import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { display, focusRing } from './theme'
import { Reveal } from './motion'
import { CtaSection } from './cta-section'

/** Shared template for data-driven SEO pages (per sport, per organizer profile). */
export function MiniLanding({
  eyebrow,
  h1,
  intro,
  bullets,
}: {
  eyebrow: string
  h1: string
  intro: string
  bullets?: string[]
}) {
  return (
    <>
      <section className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-130 bg-[radial-gradient(55%_55%_at_50%_0%,rgba(53,82,125,0.07),transparent_70%)]"
        />
        <div className="mx-auto max-w-3xl px-4 pb-16 pt-20 text-center sm:px-6 lg:pt-24">
          <span className="text-sm font-medium text-primary">{eyebrow}</span>
          <h1
            style={display}
            className="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl"
          >
            {h1}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">{intro}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <Button asChild size="lg">
              <Link href="#contact">
                Demander une démo
                <ArrowRight />
              </Link>
            </Button>
            <Link
              href="/#features"
              className={cn(
                'inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-primary',
                focusRing,
              )}
            >
              Voir les fonctionnalités
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {bullets && bullets.length > 0 && (
        <section className="mx-auto max-w-4xl px-4 pb-8 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {bullets.map((b, i) => (
              <Reveal
                key={b}
                delay={i * 0.08}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Check className="size-5" />
                </span>
                <p className="mt-4 text-sm leading-relaxed text-foreground">{b}</p>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <CtaSection />
    </>
  )
}
