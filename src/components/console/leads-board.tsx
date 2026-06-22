'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export type Lead = {
  id: number
  name: string
  email: string
  organization: string
  sport: string
  teams: string
  message: string
  notes: string
  status: string
  createdAt: string
}

const COLUMNS = [
  { value: 'new', label: 'Nouveau', dot: 'bg-primary' },
  { value: 'contacted', label: 'Contacté', dot: 'bg-amber-500' },
  { value: 'converted', label: 'Converti', dot: 'bg-emerald-500' },
  { value: 'lost', label: 'Perdu', dot: 'bg-muted-foreground/50' },
] as const

const KNOWN_STATUSES = new Set<string>(COLUMNS.map((c) => c.value))

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('fr-BE', { day: '2-digit', month: 'short' })
  } catch {
    return ''
  }
}

const fieldClass =
  'w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40'

export function LeadsBoard({
  leads,
  onSetStatus,
  onSaveNotes,
}: {
  leads: Lead[]
  onSetStatus: (id: number, status: string) => Promise<void>
  onSaveNotes: (id: number, notes: string) => Promise<void>
}) {
  if (leads.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
        <p className="text-sm font-medium text-foreground">Aucun lead pour l’instant.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Les demandes envoyées depuis le formulaire du site apparaîtront ici.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 lg:grid-cols-4">
      {COLUMNS.map((col) => {
        // Catch-all: a lead with an unexpected/missing status lands in "Nouveau"
        // rather than vanishing from every column.
        const items = leads.filter((l) =>
          col.value === 'new' ? l.status === 'new' || !KNOWN_STATUSES.has(l.status) : l.status === col.value,
        )
        return (
          <section key={col.value} className="rounded-2xl border border-border bg-card/40 p-3">
            <div className="mb-3 flex items-center justify-between px-1">
              <span className="flex items-center gap-2 text-sm font-medium">
                <span className={cn('size-2 rounded-full', col.dot)} />
                {col.label}
              </span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{items.length}</span>
            </div>
            <div className="flex flex-col gap-2">
              {items.map((lead) => (
                <LeadCard key={lead.id} lead={lead} onSetStatus={onSetStatus} onSaveNotes={onSaveNotes} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

function LeadCard({
  lead,
  onSetStatus,
  onSaveNotes,
}: {
  lead: Lead
  onSetStatus: (id: number, status: string) => Promise<void>
  onSaveNotes: (id: number, notes: string) => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [notes, setNotes] = useState(lead.notes)
  const [pending, start] = useTransition()
  const meta = [lead.sport, lead.teams].filter(Boolean).join(' · ')

  return (
    <div className={cn('rounded-xl border border-border bg-card p-3 shadow-sm', pending && 'opacity-60')}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{lead.name}</p>
          {lead.organization && <p className="truncate text-xs text-muted-foreground">{lead.organization}</p>}
        </div>
        <time className="shrink-0 text-[10px] text-muted-foreground">{fmtDate(lead.createdAt)}</time>
      </div>
      <a href={`mailto:${lead.email}`} className="mt-1 block truncate text-xs text-primary hover:underline">
        {lead.email}
      </a>
      {meta && <p className="mt-1 text-xs text-muted-foreground">{meta}</p>}

      <div className="mt-2.5 flex items-center gap-2">
        <select
          aria-label={`Statut – ${lead.name}`}
          value={lead.status}
          disabled={pending}
          onChange={(e) => {
            const value = e.target.value
            start(async () => {
              try {
                await onSetStatus(lead.id, value)
              } catch {
                toast.error('Impossible de changer le statut.')
              }
            })
          }}
          className={cn(fieldClass, 'cursor-pointer')}
        >
          {COLUMNS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="shrink-0 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          {open ? 'Masquer' : 'Détails'}
        </button>
      </div>

      {open && (
        <div className="mt-2.5 space-y-2 border-t border-border pt-2.5">
          {lead.message && (
            <p className="whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">{lead.message}</p>
          )}
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes internes…"
            rows={2}
            className={fieldClass}
          />
          <button
            type="button"
            disabled={pending || notes === lead.notes}
            onClick={() =>
              start(async () => {
                try {
                  await onSaveNotes(lead.id, notes)
                } catch {
                  toast.error('Impossible d’enregistrer la note.')
                }
              })
            }
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            Enregistrer la note
          </button>
        </div>
      )}
    </div>
  )
}
