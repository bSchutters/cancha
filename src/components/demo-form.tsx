'use client'

import { useState } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CONTACT_EMAIL } from '@/lib/marketing/content'
import { useT } from '@/i18n/use-t'

type Status = 'idle' | 'submitting' | 'success' | 'error'

const fieldClass =
  'w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40'
const labelClass = 'mb-1.5 block text-sm font-medium text-foreground'

/** Lead form for the apex landing. Posts to /api/demo-request (Resend -> owner). */
export function DemoForm() {
  const t = useT()
  const [status, setStatus] = useState<Status>('idle')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const payload = Object.fromEntries(new FormData(form).entries())
    setStatus('submitting')
    try {
      const res = await fetch('/api/demo-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('request failed')
      form.reset()
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Check className="size-6" />
        </span>
        <p className="mt-4 text-lg font-medium text-foreground">{t('demoForm.success.title')}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t('demoForm.success.body')}</p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-xl text-left">
      {/* Honeypot: off-screen + hidden from AT and tab order; only bots fill it. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="df-website">{t('demoForm.honeypot')}</label>
        <input id="df-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="df-name" className={labelClass}>
            {t('demoForm.name.label')}
          </label>
          <input
            id="df-name"
            name="name"
            required
            autoComplete="name"
            className={fieldClass}
            placeholder={t('demoForm.name.placeholder')}
          />
        </div>
        <div>
          <label htmlFor="df-email" className={labelClass}>
            {t('demoForm.email.label')}
          </label>
          <input
            id="df-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={fieldClass}
            placeholder={t('demoForm.email.placeholder')}
          />
        </div>
        <div>
          <label htmlFor="df-org" className={labelClass}>
            {t('demoForm.org.label')} <span className="text-muted-foreground">{t('demoForm.optional')}</span>
          </label>
          <input
            id="df-org"
            name="organization"
            className={fieldClass}
            placeholder={t('demoForm.org.placeholder')}
          />
        </div>
        <div>
          <label htmlFor="df-sport" className={labelClass}>
            {t('demoForm.sport.label')} <span className="text-muted-foreground">{t('demoForm.optional')}</span>
          </label>
          <input id="df-sport" name="sport" className={fieldClass} placeholder={t('demoForm.sport.placeholder')} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="df-teams" className={labelClass}>
            {t('demoForm.teams.label')} <span className="text-muted-foreground">{t('demoForm.optional')}</span>
          </label>
          {/* Option values stay canonical (FR) so the owner's lead inbox is consistent across locales. */}
          <select id="df-teams" name="teams" defaultValue="" className={fieldClass}>
            <option value="">{t('demoForm.teams.unknown')}</option>
            <option value="Jusqu’à 8">{t('demoForm.teams.upto8')}</option>
            <option value="8 à 16">{t('demoForm.teams.r8to16')}</option>
            <option value="16 à 32">{t('demoForm.teams.r16to32')}</option>
            <option value="Plus de 32">{t('demoForm.teams.over32')}</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="df-message" className={labelClass}>
            {t('demoForm.message.label')} <span className="text-muted-foreground">{t('demoForm.optional')}</span>
          </label>
          <textarea
            id="df-message"
            name="message"
            rows={3}
            className={fieldClass}
            placeholder={t('demoForm.message.placeholder')}
          />
        </div>
      </div>

      {status === 'error' && (
        <p className="mt-4 text-sm text-destructive" role="alert">
          {t('demoForm.error')}{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="underline">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      )}

      <div className="mt-6 flex flex-col items-center gap-3">
        <Button type="submit" size="lg" disabled={status === 'submitting'} className="w-full sm:w-auto">
          {status === 'submitting' ? (
            t('demoForm.submitting')
          ) : (
            <>
              {t('demoForm.submit')}
              <ArrowRight />
            </>
          )}
        </Button>
        <p className="text-sm text-muted-foreground">{t('demoForm.disclaimer')}</p>
      </div>
    </form>
  )
}
