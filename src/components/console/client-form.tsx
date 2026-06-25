'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type CreateClientState = { error?: string }

// Readable strong password (no ambiguous chars) for the initial hand-off.
function genPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  const arr = new Uint32Array(16)
  crypto.getRandomValues(arr)
  return Array.from(arr, (n) => chars[n % chars.length]).join('')
}

const fieldClass =
  'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40'
const labelClass = 'mb-1.5 block text-sm font-medium text-foreground'

function slugify(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

type Action = (prev: CreateClientState, formData: FormData) => Promise<CreateClientState>

type Initial = { name?: string; email?: string; leadId?: string }

export function ClientForm({ action, initial }: { action: Action; initial?: Initial }) {
  const [state, formAction, pending] = useActionState(action, {})
  const [name, setName] = useState(initial?.name ?? '')
  const [slug, setSlug] = useState(initial?.name ? slugify(initial.name) : '')
  const [slugTouched, setSlugTouched] = useState(false)
  // Lazy init generates once per mount. Server and client produce different
  // random values, so the input is marked suppressHydrationWarning.
  const [password, setPassword] = useState(genPassword)

  return (
    <form action={formAction} className="max-w-xl space-y-6">
      {initial?.leadId && <input type="hidden" name="leadId" value={initial.leadId} />}
      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-sm font-medium">Organisation</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="cf-name" className={labelClass}>
              Nom de l’organisation
            </label>
            <input
              id="cf-name"
              name="name"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (!slugTouched) setSlug(slugify(e.target.value))
              }}
              className={fieldClass}
              placeholder="UD Asturiana"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="cf-slug" className={labelClass}>
                Slug
              </label>
              <input
                id="cf-slug"
                name="slug"
                required
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true)
                  setSlug(slugify(e.target.value))
                }}
                className={fieldClass}
                placeholder="ud-asturiana"
              />
            </div>
            <div>
              <label htmlFor="cf-subdomain" className={labelClass}>
                Sous-domaine <span className="text-muted-foreground">(facultatif)</span>
              </label>
              <input
                id="cf-subdomain"
                name="subdomain"
                className={fieldClass}
                placeholder="asturiana"
                pattern="[a-z0-9-]*"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Thème par défaut « Papier (Cancha) » — le client pourra le personnaliser dans son espace.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-sm font-medium">Compte organisateur</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="cf-email" className={labelClass}>
              Email
            </label>
            <input
              id="cf-email"
              name="email"
              type="email"
              required
              defaultValue={initial?.email ?? ''}
              autoComplete="off"
              className={fieldClass}
              placeholder="organisateur@club.be"
            />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="cf-password" className="text-sm font-medium text-foreground">
                Mot de passe initial
              </label>
              <button
                type="button"
                onClick={() => setPassword(genPassword())}
                className="text-xs text-primary hover:underline"
              >
                Régénérer
              </button>
            </div>
            <input
              id="cf-password"
              name="password"
              type="text"
              required
              minLength={12}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="off"
              suppressHydrationWarning
              className={cn(fieldClass, 'font-mono')}
              placeholder="12 caractères minimum"
            />
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          À communiquer au client ; il pourra le changer ensuite.
        </p>
      </section>

      {state.error && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? 'Création…' : 'Créer le client'}
        </Button>
        <Button asChild variant="ghost">
          <Link href="/console/clients">Annuler</Link>
        </Button>
      </div>
    </form>
  )
}
