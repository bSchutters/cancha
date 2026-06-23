import Link from 'next/link'
import type { Translate } from '@/i18n'
import { Button } from '@/components/ui/button'
import { display } from './theme'
import { Reveal } from './motion'
import { TESTIMONIALS } from '@/lib/marketing/content'

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

/**
 * Testimonials when we have real ones; until then, an honest "founding
 * organizers" offer (no fabricated reviews).
 */
export function Testimonials({ t }: { t: Translate }) {
  if (TESTIMONIALS.length === 0) {
    return (
      <section className="border-y border-border bg-secondary/50">
        <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
          <Reveal>
            <span className="text-sm font-medium text-primary">{t('home.testimonials.empty.eyebrow')}</span>
            <h2 style={display} className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              {t('home.testimonials.empty.title')}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
              {t('home.testimonials.empty.subcopy')}
            </p>
            <div className="mt-8">
              <Button asChild size="lg">
                <Link href="#contact">{t('home.testimonials.empty.cta')}</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    )
  }

  return (
    <section className="border-y border-border bg-secondary/50">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-medium text-primary">{t('home.testimonials.filled.eyebrow')}</span>
          <h2 style={display} className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            {t('home.testimonials.filled.title')}
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08} className="flex flex-col rounded-2xl border border-border bg-card p-6">
              <p className="flex-1 text-foreground">“{t.quote}”</p>
              <div className="mt-6 flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {initials(t.name)}
                </span>
                <div className="text-sm">
                  <div className="font-medium text-foreground">{t.name}</div>
                  <div className="text-muted-foreground">
                    {t.role}, {t.org}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
