'use client'

import { useState } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CONTACT_EMAIL } from '@/lib/marketing/content'

type Status = 'idle' | 'submitting' | 'success' | 'error'

const fieldClass =
  'w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40'
const labelClass = 'mb-1.5 block text-sm font-medium text-foreground'

/** Lead form for the apex landing. Posts to /api/demo-request (Resend -> owner). */
export function DemoForm() {
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
        <p className="mt-4 text-lg font-medium text-foreground">Demande envoyée, merci !</p>
        <p className="mt-1 text-sm text-muted-foreground">
          On revient vers vous sous 24 à 48h pour organiser votre démo.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-xl text-left">
      {/* Honeypot: off-screen + hidden from AT and tab order; only bots fill it. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="df-website">Laissez ce champ vide</label>
        <input id="df-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="df-name" className={labelClass}>
            Nom
          </label>
          <input id="df-name" name="name" required autoComplete="name" className={fieldClass} placeholder="Votre nom" />
        </div>
        <div>
          <label htmlFor="df-email" className={labelClass}>
            Email
          </label>
          <input
            id="df-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={fieldClass}
            placeholder="vous@exemple.be"
          />
        </div>
        <div>
          <label htmlFor="df-org" className={labelClass}>
            Organisation <span className="text-muted-foreground">(facultatif)</span>
          </label>
          <input id="df-org" name="organization" className={fieldClass} placeholder="Club, comité, école…" />
        </div>
        <div>
          <label htmlFor="df-sport" className={labelClass}>
            Sport <span className="text-muted-foreground">(facultatif)</span>
          </label>
          <input id="df-sport" name="sport" className={fieldClass} placeholder="Foot, padel, volley…" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="df-teams" className={labelClass}>
            Nombre d’équipes estimé <span className="text-muted-foreground">(facultatif)</span>
          </label>
          <select id="df-teams" name="teams" defaultValue="" className={fieldClass}>
            <option value="">Je ne sais pas encore</option>
            <option value="Jusqu’à 8">Jusqu’à 8</option>
            <option value="8 à 16">8 à 16</option>
            <option value="16 à 32">16 à 32</option>
            <option value="Plus de 32">Plus de 32</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="df-message" className={labelClass}>
            Message <span className="text-muted-foreground">(facultatif)</span>
          </label>
          <textarea
            id="df-message"
            name="message"
            rows={3}
            className={fieldClass}
            placeholder="Parlez-nous de votre tournoi : date, format, lieu…"
          />
        </div>
      </div>

      {status === 'error' && (
        <p className="mt-4 text-sm text-destructive" role="alert">
          Une erreur est survenue. Réessayez, ou écrivez-nous à{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="underline">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      )}

      <div className="mt-6 flex flex-col items-center gap-3">
        <Button type="submit" size="lg" disabled={status === 'submitting'} className="w-full sm:w-auto">
          {status === 'submitting' ? (
            'Envoi…'
          ) : (
            <>
              Demander une démo
              <ArrowRight />
            </>
          )}
        </Button>
        <p className="text-sm text-muted-foreground">
          Démo gratuite et sans engagement · réponse sous 24 à 48h.
        </p>
      </div>
    </form>
  )
}
