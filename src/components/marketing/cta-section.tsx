import { DemoForm } from '@/components/demo-form'
import { display } from './theme'
import { Reveal } from './motion'

/** Conversion block with the demo lead form. Reused at the bottom of every page. */
export function CtaSection({
  title = 'Prêt à organiser votre prochain tournoi ?',
  subtitle = 'Montrez-nous votre tournoi, on vous montre comment Cup Generator le gère de A à Z.',
}: {
  title?: string
  subtitle?: string
}) {
  return (
    <section id="contact" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <Reveal className="rounded-3xl border border-border bg-secondary/60 p-8 text-center sm:p-14">
        <h2 style={display} className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">{subtitle}</p>
        <div className="mt-10">
          <DemoForm />
        </div>
      </Reveal>
    </section>
  )
}
