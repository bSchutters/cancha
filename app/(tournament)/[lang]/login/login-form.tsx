'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLocale } from '@/i18n/use-locale'
import { useT } from '@/i18n/use-t'
import { manageLandingLocale } from './actions'

export function LoginForm({ demo }: { demo: { email: string; password: string } | null }) {
  const router = useRouter()
  const locale = useLocale()
  const t = useT()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })
      if (res.ok) {
        // Open the backoffice in the org's configured manage language.
        const target = await manageLandingLocale().catch(() => locale)
        router.push(`/${target}/manage`)
        router.refresh()
      } else {
        setError(t('product.login.invalid'))
      }
    } catch {
      setError(t('product.login.networkError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-xl border border-border bg-card p-8"
      >
        <h1 className="text-2xl font-bold">
          Cancha
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('product.login.subtitle')}</p>

        <div className="mt-6 space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">{t('product.login.email')}</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">{t('product.login.password')}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary font-bold text-primary-foreground hover:bg-primary/90"
          >
            {loading && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
            {loading ? t('product.login.submitting') : t('product.login.submit')}
          </Button>
        </div>

        {/* The credentials are shown on the demo page, but a visitor who lands
            here has left them behind — so repeat them, and offer to fill them in
            rather than making anyone retype a password. */}
        {demo && (
          <div className="mt-6 rounded-lg border border-primary/15 bg-primary/[0.06] p-4">
            <p className="text-sm font-semibold">{t('product.login.demoTitle')}</p>
            <dl className="mt-2 space-y-0.5 font-mono text-xs text-muted-foreground">
              <dd>{demo.email}</dd>
              <dd>{demo.password}</dd>
            </dl>
            <Button
              type="button"
              variant="outline"
              className="mt-3 w-full text-sm font-semibold"
              onClick={() => {
                setEmail(demo.email)
                setPassword(demo.password)
                setError(null)
              }}
            >
              {t('product.login.demoFill')}
            </Button>
          </div>
        )}
      </form>
    </main>
  )
}
