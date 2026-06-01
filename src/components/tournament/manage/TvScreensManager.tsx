'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Plus, Trash2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { Id } from '@/lib/tournament/types'

interface Screen {
  name: string
  views: string[]
}

const PANELS: { value: string; label: string }[] = [
  { value: 'prochains', label: 'Prochains matchs' },
  { value: 'programme', label: 'Programme' },
  { value: 'classements', label: 'Classements' },
  { value: 'arbre', label: 'Arbre' },
]

/**
 * TV screen manager: add/remove the room's TVs and pick which views each one
 * shows (rotation if several). Each screen opens a /tv?vues=… URL to cast.
 */
export function TvScreensManager({
  tournamentId,
  slug,
  initial,
}: {
  tournamentId: Id
  slug: string
  initial: Screen[]
}) {
  const [screens, setScreens] = useState<Screen[]>(initial)
  const [busy, setBusy] = useState(false)

  const persist = async (next: Screen[]) => {
    setScreens(next)
    setBusy(true)
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tv_screens: next.map((s) => ({ name: s.name, views: s.views })) }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        toast.error(body?.errors?.[0]?.message ?? 'Erreur lors de l’enregistrement')
      }
    } catch {
      toast.error('Erreur réseau')
    } finally {
      setBusy(false)
    }
  }

  const addScreen = () =>
    persist([...screens, { name: `TV ${screens.length + 1}`, views: ['programme'] }])
  const removeScreen = (i: number) => persist(screens.filter((_, idx) => idx !== i))
  const toggleView = (i: number, view: string) =>
    persist(
      screens.map((s, idx) =>
        idx === i
          ? { ...s, views: s.views.includes(view) ? s.views.filter((v) => v !== view) : [...s.views, view] }
          : s,
      ),
    )
  const renameLocal = (i: number, name: string) =>
    setScreens(screens.map((s, idx) => (idx === i ? { ...s, name } : s)))

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end">
        <Button size="sm" variant="secondary" disabled={busy} onClick={addScreen}>
          <Plus className="mr-1 h-4 w-4" /> Ajouter une TV
        </Button>
      </div>

      {screens.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          Aucun écran. Ajoute une TV et choisis les vues à afficher (rotation si tu en coches plusieurs).
        </p>
      ) : (
        <div className="space-y-2">
          {screens.map((s, i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-3">
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  value={s.name}
                  onChange={(e) => renameLocal(i, e.target.value)}
                  onBlur={() => persist(screens)}
                  placeholder={`TV ${i + 1}`}
                  className="h-8 w-40"
                />
                <div className="flex flex-wrap gap-1">
                  {PANELS.map((p) => {
                    const on = s.views.includes(p.value)
                    return (
                      <button
                        key={p.value}
                        type="button"
                        disabled={busy}
                        onClick={() => toggleView(i, p.value)}
                        className={cn(
                          'rounded-full border px-2.5 py-1 text-xs transition-colors',
                          on
                            ? 'border-primary bg-primary/20 text-primary'
                            : 'border-border text-muted-foreground hover:text-foreground',
                        )}
                      >
                        {p.label}
                      </button>
                    )
                  })}
                </div>
                <div className="ml-auto flex items-center gap-1">
                  <Button
                    asChild
                    size="sm"
                    variant="secondary"
                    disabled={s.views.length === 0}
                    title={s.views.length === 0 ? 'Choisis au moins une vue' : undefined}
                  >
                    <Link href={`/${slug}/tv?vues=${s.views.join(',')}`} target="_blank">
                      <ExternalLink className="mr-1 h-4 w-4" /> Ouvrir
                    </Link>
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={busy}
                    onClick={() => removeScreen(i)}
                    title="Supprimer cette TV"
                    className="text-red-700 dark:text-red-300 hover:bg-red-500/10 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
