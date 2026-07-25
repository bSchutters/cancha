'use client'

import { useState } from 'react'
import { ArrowRight, KeyRound, RotateCcw } from 'lucide-react'
import { LocaleLink } from '@/components/locale-link'
import { Button } from '@/components/ui/button'
import { useT } from '@/i18n/use-t'
import { display } from './theme'

/**
 * Entry point to the REAL application, next to the simulated preview above it.
 *
 * Two doors, because they answer different questions: the showcase tournament
 * shows what the public sees at the end of a real event, while the credentials
 * let a visitor actually drive the organizer console. The reset button matters
 * more than it looks — a public playground is left half-played by whoever came
 * before, and without it the demo degrades to junk after the first visitor.
 */
export function LiveDemo({
  showcaseSlug,
  playgroundName,
  email,
  password,
}: {
  showcaseSlug: string
  playgroundName: string
  email: string
  password: string
}) {
  const t = useT()
  const [resetting, setResetting] = useState(false)
  const [done, setDone] = useState<'ok' | 'error' | null>(null)

  const reset = async () => {
    setResetting(true)
    setDone(null)
    try {
      const res = await fetch('/api/demo/reset', { method: 'POST' })
      setDone(res.ok ? 'ok' : 'error')
      if (res.ok) window.location.reload()
    } catch {
      setDone('error')
    } finally {
      setResetting(false)
    }
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <div className="rounded-3xl border border-primary/15 bg-primary/[0.06] p-8 sm:p-12">
        <div className="text-center">
          <span className="text-sm font-semibold text-primary">{t('livedemo.eyebrow')}</span>
          <h2 style={display} className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            {t('livedemo.title')}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">{t('livedemo.subcopy')}</p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {/* Door 1: what the public sees. */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 style={display} className="text-lg font-medium">
              {t('livedemo.public.title')}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t('livedemo.public.desc')}</p>
            <LocaleLink
              href={`/${showcaseSlug}`}
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              {t('livedemo.public.cta')} <ArrowRight className="size-4" />
            </LocaleLink>
          </div>

          {/* Door 2: the organizer console, with working credentials. */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 style={display} className="text-lg font-medium">
              {t('livedemo.console.title')}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t('livedemo.console.desc')}</p>
            <dl className="mt-4 space-y-1 rounded-xl bg-muted/40 p-3 text-sm">
              <div className="flex items-center gap-2">
                <KeyRound className="size-3.5 shrink-0 text-muted-foreground" />
                <dt className="sr-only">{t('livedemo.console.email')}</dt>
                <dd className="font-mono text-xs">{email}</dd>
              </div>
              <div className="flex items-center gap-2 pl-[1.375rem]">
                <dt className="sr-only">{t('livedemo.console.password')}</dt>
                <dd className="font-mono text-xs">{password}</dd>
              </div>
            </dl>
            <LocaleLink
              href="/login"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              {t('livedemo.console.cta')} <ArrowRight className="size-4" />
            </LocaleLink>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center gap-2 text-center">
          <p className="text-sm text-muted-foreground">
            {t('livedemo.playground').replace('{name}', playgroundName)}
          </p>
          <Button
            variant="outline"
            onClick={reset}
            disabled={resetting}
            className="gap-2 rounded-md text-sm font-semibold"
          >
            <RotateCcw className={resetting ? 'size-4 animate-spin' : 'size-4'} />
            {resetting ? t('livedemo.reset.loading') : t('livedemo.reset.cta')}
          </Button>
          {done === 'error' && <p className="text-sm text-destructive">{t('livedemo.reset.error')}</p>}
        </div>
      </div>
    </section>
  )
}
