'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ConfirmDialog } from './ConfirmDialog'
import { uploadMedia, validateImageFile } from '@/lib/tournament/upload-media'
import type { Id } from '@/lib/tournament/types'
import type { ManageSponsor } from '@/lib/tournament/manage-view'

/** Validates an image file selection, surfacing a toast on rejection. */
function pickImage(file: File | null | undefined, onValid: (f: File | null) => void) {
  if (!file) return onValid(null)
  const err = validateImageFile(file)
  if (err) {
    toast.error(err)
    return onValid(null)
  }
  onValid(file)
}

/** Returns a normalized URL or null; rejects obviously invalid input. */
function normalizeUrl(raw: string): { url: string | null; error: string | null } {
  const v = raw.trim()
  if (!v) return { url: null, error: null }
  const withScheme = /^https?:\/\//i.test(v) ? v : `https://${v}`
  try {
    const u = new URL(withScheme)
    if (!u.hostname.includes('.')) return { url: null, error: 'URL invalide.' }
    return { url: u.toString(), error: null }
  } catch {
    return { url: null, error: 'URL invalide.' }
  }
}

type Draft = { name: string; url: string }
const emptyDraft: Draft = { name: '', url: '' }

export function SponsorsClient({ tournamentId, sponsors }: { tournamentId: Id; sponsors: ManageSponsor[] }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [file, setFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [editing, setEditing] = useState<ManageSponsor | null>(null)
  const [editDraft, setEditDraft] = useState<Draft>(emptyDraft)
  const [editFile, setEditFile] = useState<File | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<ManageSponsor | null>(null)

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft.name.trim()) return
    const { url, error } = normalizeUrl(draft.url)
    if (error) {
      toast.error(error)
      return
    }
    setBusy(true)
    try {
      let logoId: number | null = null
      if (file) {
        logoId = await uploadMedia(file)
        if (logoId == null) {
          toast.error('Échec de l’upload du logo')
          return
        }
      }
      const res = await fetch('/api/tournament-sponsors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tournament: tournamentId, name: draft.name.trim(), url: url ?? undefined, logo: logoId ?? undefined }),
      })
      if (res.ok) {
        toast.success('Sponsor ajouté')
        setDraft(emptyDraft)
        setFile(null)
        if (fileRef.current) fileRef.current.value = ''
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
    const { url, error } = normalizeUrl(editDraft.url)
    if (error) {
      toast.error(error)
      return
    }
    setBusy(true)
    try {
      const data: Record<string, unknown> = { name: editDraft.name.trim(), url }
      if (editFile) {
        const logoId = await uploadMedia(editFile)
        if (logoId == null) {
          toast.error('Échec de l’upload du logo')
          return
        }
        data.logo = logoId
      }
      const res = await fetch(`/api/tournament-sponsors/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      })
      if (res.ok) {
        toast.success('Sponsor modifié')
        setEditing(null)
        setEditFile(null)
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
      const res = await fetch(`/api/tournament-sponsors/${id}`, { method: 'DELETE', credentials: 'include' })
      if (res.ok) {
        toast.success('Sponsor supprimé')
        router.refresh()
      } else {
        toast.error('Suppression impossible')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/50">{sponsors.length} sponsor(s) · affichés en bandeau sur la TV</p>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            setAdding((v) => !v)
            setDraft(emptyDraft)
            setFile(null)
          }}
        >
          {adding ? 'Annuler' : '+ Ajouter un sponsor'}
        </Button>
      </div>

      {adding && (
        <form onSubmit={create} className="grid gap-3 rounded-xl border border-white/10 bg-white/5 p-4 sm:grid-cols-3">
          <div className="space-y-1">
            <Label>Nom</Label>
            <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} required />
          </div>
          <div className="space-y-1">
            <Label>Site web (optionnel)</Label>
            <Input value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} placeholder="https://…" />
          </div>
          <div className="space-y-1">
            <Label>Logo</Label>
            <Input ref={fileRef} type="file" accept="image/*" onChange={(e) => pickImage(e.target.files?.[0], setFile)} />
          </div>
          <div>
            <Button type="submit" disabled={busy} className="bg-spanish-accent-2 font-bold text-spanish-bg-dark hover:bg-spanish-accent-2-light">
              {busy && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
              Ajouter
            </Button>
          </div>
        </form>
      )}

      {sponsors.length === 0 ? (
        <p className="text-white/60">Aucun sponsor.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {sponsors.map((sp) => (
            <div key={String(sp.id)} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="flex min-w-0 items-center gap-3">
                {sp.logoUrl ? (
                  <div className="relative h-12 w-20 shrink-0">
                    <Image src={sp.logoUrl} alt={sp.name} fill sizes="80px" unoptimized className="object-contain" />
                  </div>
                ) : (
                  <span className="text-sm text-white/40">(pas de logo)</span>
                )}
                <span className="truncate font-medium">{sp.name}</span>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <Button
                  variant="link"
                  onClick={() => { setEditing(sp); setEditDraft({ name: sp.name, url: sp.url ?? '' }); setEditFile(null) }}
                  className="h-auto p-0 text-sm font-normal text-white/60 hover:text-white"
                >
                  Éditer
                </Button>
                <Button
                  variant="link"
                  onClick={() => setConfirmDelete(sp)}
                  className="h-auto p-0 text-sm font-normal text-red-400 hover:text-red-300"
                >
                  Suppr.
                </Button>
              </div>
            </div>
          ))}
        </div>
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
                  <Label>Site web</Label>
                  <Input value={editDraft.url} onChange={(e) => setEditDraft({ ...editDraft, url: e.target.value })} placeholder="https://…" />
                </div>
                <div className="space-y-1">
                  <Label>Remplacer le logo (optionnel)</Label>
                  <Input type="file" accept="image/*" onChange={(e) => pickImage(e.target.files?.[0], setEditFile)} />
                </div>
              </div>
              <DialogFooter className="mt-5">
                <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={busy} className="bg-spanish-accent-2 font-bold text-spanish-bg-dark hover:bg-spanish-accent-2-light">
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
        description="Ce sponsor sera définitivement supprimé."
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
