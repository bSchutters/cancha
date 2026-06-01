'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ConfirmDialog } from './ConfirmDialog'
import type { Id } from '@/lib/tournament/types'
import type { ManageReferee } from '@/lib/tournament/manage-view'

type Draft = { name: string; contact: string }
const emptyDraft: Draft = { name: '', contact: '' }

export function RefereesClient({ tournamentId, referees }: { tournamentId: Id; referees: ManageReferee[] }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [editing, setEditing] = useState<ManageReferee | null>(null)
  const [editDraft, setEditDraft] = useState<Draft>(emptyDraft)
  const [confirmDelete, setConfirmDelete] = useState<ManageReferee | null>(null)

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft.name.trim()) return
    setBusy(true)
    try {
      const res = await fetch('/api/tournament-referees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: draft.name.trim(), contact: draft.contact.trim() || undefined, tournament: tournamentId }),
      })
      if (res.ok) {
        toast.success('Arbitre ajouté')
        setDraft(emptyDraft)
        setAdding(false)
        router.refresh()
      } else {
        toast.error('Erreur lors de l’ajout')
      }
    } finally {
      setBusy(false)
    }
  }

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editing) return
    setBusy(true)
    try {
      const res = await fetch(`/api/tournament-referees/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: editDraft.name.trim(), contact: editDraft.contact.trim() || null }),
      })
      if (res.ok) {
        toast.success('Arbitre modifié')
        setEditing(null)
        router.refresh()
      } else {
        toast.error('Erreur')
      }
    } finally {
      setBusy(false)
    }
  }

  const remove = async (id: Id) => {
    setBusy(true)
    try {
      const res = await fetch(`/api/tournament-referees/${id}`, { method: 'DELETE', credentials: 'include' })
      if (res.ok) {
        toast.success('Arbitre supprimé')
        router.refresh()
      } else {
        toast.error('Suppression impossible')
      }
    } finally {
      setBusy(false)
    }
  }

  const openEdit = (r: ManageReferee) => {
    setEditing(r)
    setEditDraft({ name: r.name, contact: r.contact ?? '' })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{referees.length} arbitre(s)</p>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            setAdding((v) => !v)
            setDraft(emptyDraft)
          }}
        >
          {adding ? 'Annuler' : '+ Ajouter un arbitre'}
        </Button>
      </div>

      {adding && (
        <form onSubmit={create} className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-3">
          <div className="space-y-1">
            <Label>Nom</Label>
            <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} required />
          </div>
          <div className="space-y-1">
            <Label>Contact (optionnel)</Label>
            <Input value={draft.contact} onChange={(e) => setDraft({ ...draft, contact: e.target.value })} />
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={busy} className="bg-primary font-bold text-primary-foreground hover:bg-primary/90">
              {busy && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
              Ajouter
            </Button>
          </div>
        </form>
      )}

      {referees.length === 0 ? (
        <p className="text-muted-foreground">Aucun arbitre. L’affectation aux matchs se fait sur l’écran Saisie scores.</p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {referees.map((r) => (
            <li key={String(r.id)} className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
              <div>
                <p className="font-medium">{r.name}</p>
                {r.contact && <p className="text-sm text-muted-foreground">{r.contact}</p>}
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="link"
                  onClick={() => openEdit(r)}
                  className="h-auto p-0 text-sm font-normal text-muted-foreground hover:text-foreground"
                >
                  Éditer
                </Button>
                <Button
                  variant="link"
                  onClick={() => setConfirmDelete(r)}
                  className="h-auto p-0 text-sm font-normal text-red-600 dark:text-red-400 hover:text-red-300"
                >
                  Suppr.
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-md">
          {editing && (
            <form onSubmit={saveEdit}>
              <DialogHeader>
                <DialogTitle>Modifier « {editing.name} »</DialogTitle>
              </DialogHeader>
              <div className="mt-4 space-y-3">
                <div className="space-y-1">
                  <Label>Nom</Label>
                  <Input value={editDraft.name} onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })} required />
                </div>
                <div className="space-y-1">
                  <Label>Contact</Label>
                  <Input value={editDraft.contact} onChange={(e) => setEditDraft({ ...editDraft, contact: e.target.value })} />
                </div>
              </div>
              <DialogFooter className="mt-5">
                <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={busy} className="bg-primary font-bold text-primary-foreground hover:bg-primary/90">
                  {busy && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                  Enregistrer
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!confirmDelete}
        title={confirmDelete ? `Supprimer « ${confirmDelete.name} » ?` : ''}
        description="Cet arbitre sera définitivement supprimé."
        confirmLabel="Supprimer"
        busy={busy}
        onConfirm={async () => {
          if (!confirmDelete) return
          await remove(confirmDelete.id)
          setConfirmDelete(null)
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  )
}
