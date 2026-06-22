import Link from 'next/link'
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
export function Testimonials() {
  if (TESTIMONIALS.length === 0) {
    return (
      <section className="border-y border-border bg-secondary/50">
        <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
          <Reveal>
            <span className="text-sm font-medium text-primary">Lancement</span>
            <h2 style={display} className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Soyez parmi nos premiers organisateurs
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Cup Generator se lance. Les premiers clubs et comités qui l’adoptent bénéficient d’un
              accompagnement personnalisé pour leur premier tournoi et de conditions de lancement.
            </p>
            <div className="mt-8">
              <Button asChild size="lg">
                <Link href="#contact">Demander une démo</Link>
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
          <span className="text-sm font-medium text-primary">Ils organisent avec Cup Generator</span>
          <h2 style={display} className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Des organisateurs qui ont rangé le tableur
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
