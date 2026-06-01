'use client'

import { useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ImagePlus, Loader2, Check, CircleDashed, Search, Download, ArrowUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { ConfirmDialog } from './ConfirmDialog'
import { uploadMedia, validateImageFile } from '@/lib/tournament/upload-media'
import type { Id } from '@/lib/tournament/types'
import type { ManageTeam } from '@/lib/tournament/manage-view'

type SortKey = 'name' | 'payment' | 'status'
const STATUS_RANK: Record<string, number> = { pending: 0, confirmed: 1, waitlist: 2, rejected: 3 }
const STATUS_LABEL: Record<string, string> = {
  confirmed: 'Confirmée',
  pending: 'En attente',
  waitlist: 'Liste d’attente',
  rejected: 'Refusée',
}

/** Escapes a CSV cell (wraps in quotes, doubles inner quotes). */
function csvCell(v: string): string {
  return `"${v.replace(/"/g, '""')}"`
}

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

function TeamLogo({ team, onUpload }: { team: ManageTeam; onUpload: (file: File) => void }) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      title="Changer le logo"
      onClick={() => ref.current?.click()}
      className="relative shrink-0 overflow-hidden rounded-md border border-border bg-card text-muted-foreground hover:border-border hover:bg-muted/50"
    >
      {team.logoUrl ? (
        <Image src={team.logoUrl} alt="" fill sizes="36px" unoptimized className="object-contain p-0.5" />
      ) : (
        <ImagePlus className="h-4 w-4" />
      )}
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onUpload(f)
          if (ref.current) ref.current.value = ''
        }}
      />
    </Button>
  )
}

/** Clickable, sortable column header. */
function SortHead({ label, active, asc, onClick }: { label: string; active: boolean; asc: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex cursor-pointer items-center gap-1 hover:text-foreground',
        active ? 'text-foreground' : 'text-muted-foreground',
      )}
    >
      {label}
      <ArrowUpDown className={cn('h-3 w-3', active ? (asc ? 'text-primary' : 'text-primary rotate-180') : 'opacity-40')} />
    </button>
  )
}

type Draft = { name: string; email: string; phone: string }
const emptyDraft: Draft = { name: '', email: '', phone: '' }

export function TeamsClient({ tournamentId, teams }: { tournamentId: Id; teams: ManageTeam[] }) {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [addFile, setAddFile] = useState<File | null>(null)
  const [editing, setEditing] = useState<ManageTeam | null>(null)
  const [editDraft, setEditDraft] = useState<Draft>(emptyDraft)
  const [editFile, setEditFile] = useState<File | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<ManageTeam | null>(null)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortKey, setSortKey] = useState<SortKey>('status')
  const [sortAsc, setSortAsc] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false)

  const view = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = teams.filter((t) => {
      if (statusFilter !== 'all' && t.registrationStatus !== statusFilter) return false
      if (!q) return true
      return (
        t.name.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        t.phone.toLowerCase().includes(q)
      )
    })
    const dir = sortAsc ? 1 : -1
    return [...filtered].sort((a, b) => {
      if (sortKey === 'name') return dir * a.name.localeCompare(b.name)
      if (sortKey === 'payment') return dir * a.paymentStatus.localeCompare(b.paymentStatus)
      return dir * ((STATUS_RANK[a.registrationStatus] ?? 9) - (STATUS_RANK[b.registrationStatus] ?? 9))
    })
  }, [teams, query, statusFilter, sortKey, sortAsc])


  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((v) => !v)
    else {
      setSortKey(key)
      setSortAsc(true)
    }
  }

  const selectedIds = useMemo(() => [...selected], [selected])
  const allVisibleSelected = view.length > 0 && view.every((t) => selected.has(String(t.id)))
  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  const toggleAllVisible = () =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (view.every((t) => next.has(String(t.id)))) view.forEach((t) => next.delete(String(t.id)))
      else view.forEach((t) => next.add(String(t.id)))
      return next
    })

  const bulkPatch = async (data: Record<string, unknown>, msg: string) => {
    if (selectedIds.length === 0) return
    setBusy('bulk')
    try {
      for (const id of selectedIds) {
        await fetch(`/api/tournament-teams/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data),
        })
      }
      toast.success(msg)
      setSelected(new Set())
      router.refresh()
    } finally {
      setBusy(null)
    }
  }

  const bulkDelete = async () => {
    if (selectedIds.length === 0) return
    setBusy('bulk')
    try {
      for (const id of selectedIds) {
        await fetch(`/api/tournament-teams/${id}`, { method: 'DELETE', credentials: 'include' })
      }
      toast.success(`${selectedIds.length} équipe(s) supprimée(s)`)
      setSelected(new Set())
      setConfirmBulkDelete(false)
      router.refresh()
    } finally {
      setBusy(null)
    }
  }

  const exportCsv = () => {
    const header = ['Équipe', 'Poule', 'Email', 'Téléphone', 'Inscription', 'Paiement']
    const rows = view.map((t) =>
      [
        t.name,
        t.groupLabel ?? '',
        t.email,
        t.phone,
        STATUS_LABEL[t.registrationStatus] ?? t.registrationStatus,
        t.paymentStatus === 'paid' ? 'Payé' : 'Non payé',
      ]
        .map((c) => csvCell(String(c)))
        .join(','),
    )
    const csv = [header.map(csvCell).join(','), ...rows].join('\r\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'equipes.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const createTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft.name.trim()) return
    setBusy('add')
    try {
      let logoId: number | null = null
      if (addFile) {
        logoId = await uploadMedia(addFile)
        if (logoId == null) {
          toast.error('Échec de l’upload du logo')
          return
        }
      }
      const res = await fetch('/api/tournament-teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          tournament: tournamentId,
          name: draft.name.trim(),
          representative_email: draft.email.trim() || 'n/a@n-a.be',
          representative_phone: draft.phone.trim() || 'n/a',
          logo: logoId ?? undefined,
          registration_status: 'confirmed',
          payment_status: 'paid',
        }),
      })
      if (res.ok) {
        toast.success('Équipe ajoutée')
        setDraft(emptyDraft)
        setAddFile(null)
        setAdding(false)
        router.refresh()
      } else {
        toast.error('Erreur lors de l’ajout')
      }
    } finally {
      setBusy(null)
    }
  }

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editing) return
    setBusy(String(editing.id))
    try {
      const data: Record<string, unknown> = {
        name: editDraft.name.trim(),
        representative_email: editDraft.email.trim(),
        representative_phone: editDraft.phone.trim(),
      }
      if (editFile) {
        const logoId = await uploadMedia(editFile)
        if (logoId == null) {
          toast.error('Échec de l’upload du logo')
          return
        }
        data.logo = logoId
      }
      const res = await fetch(`/api/tournament-teams/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      })
      if (res.ok) {
        toast.success('Équipe modifiée')
        setEditing(null)
        setEditFile(null)
        router.refresh()
      } else {
        toast.error('Erreur')
      }
    } finally {
      setBusy(null)
    }
  }

  const deleteTeam = async (id: ManageTeam['id']) => {
    setBusy(String(id))
    try {
      const res = await fetch(`/api/tournament-teams/${id}`, { method: 'DELETE', credentials: 'include' })
      if (res.ok) {
        toast.success('Équipe supprimée')
        router.refresh()
      } else {
        toast.error('Suppression impossible')
      }
    } finally {
      setBusy(null)
    }
  }

  const openEdit = (team: ManageTeam) => {
    setEditing(team)
    setEditDraft({ name: team.name, email: team.email, phone: team.phone })
  }

  const patchTeam = async (id: ManageTeam['id'], data: Record<string, unknown>) => {
    setBusy(String(id))
    try {
      const res = await fetch(`/api/tournament-teams/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      })
      if (res.ok) {
        router.refresh()
      } else {
        toast.error('Erreur lors de la mise à jour')
      }
    } catch {
      toast.error('Erreur réseau')
    } finally {
      setBusy(null)
    }
  }

  const uploadLogo = async (id: ManageTeam['id'], file: File) => {
    const err = validateImageFile(file)
    if (err) {
      toast.error(err)
      return
    }
    setBusy(String(id))
    try {
      const logoId = await uploadMedia(file)
      if (logoId == null) {
        toast.error('Échec de l’upload du logo')
        return
      }
      const res = await fetch(`/api/tournament-teams/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ logo: logoId }),
      })
      if (res.ok) {
        toast.success('Logo mis à jour')
        router.refresh()
      } else {
        toast.error('Erreur')
      }
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            setAdding((v) => !v)
            setDraft(emptyDraft)
          }}
        >
          {adding ? 'Annuler' : '+ Ajouter une équipe'}
        </Button>
      </div>

      {adding && (
        <form onSubmit={createTeam} className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1">
            <Label>Nom</Label>
            <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} required />
          </div>
          <div className="space-y-1">
            <Label>Email</Label>
            <Input value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label>Téléphone</Label>
            <Input value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label>Logo (optionnel)</Label>
            <Input type="file" accept="image/*" onChange={(e) => pickImage(e.target.files?.[0], setAddFile)} />
          </div>
          <div className="lg:col-span-4">
            <Button
              type="submit"
              disabled={busy === 'add'}
              className="bg-primary font-bold text-primary-foreground hover:bg-primary/90"
            >
              {busy === 'add' && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
              Ajouter l’équipe
            </Button>
          </div>
        </form>
      )}

      {teams.length === 0 ? (
        <p className="text-muted-foreground">Aucune inscription pour le moment.</p>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[14rem] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher (nom, email, téléphone)…"
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger size="sm" className="w-auto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="confirmed">Confirmées</SelectItem>
                <SelectItem value="waitlist">Liste d’attente</SelectItem>
                <SelectItem value="rejected">Refusées</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" variant="ghost" onClick={exportCsv} className="gap-1 text-muted-foreground hover:text-foreground">
              <Download className="h-4 w-4" /> CSV
            </Button>
          </div>

          {selected.size > 0 && (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 p-2">
              <span className="px-1 text-sm font-semibold text-primary">
                {selected.size} sélectionnée(s)
              </span>
              <Button size="sm" variant="secondary" disabled={busy !== null}
                onClick={() => bulkPatch({ registration_status: 'confirmed' }, 'Équipes confirmées')}>
                Confirmer
              </Button>
              <Button size="sm" variant="secondary" disabled={busy !== null}
                onClick={() => bulkPatch({ registration_status: 'rejected' }, 'Équipes refusées')}>
                Refuser
              </Button>
              <Button size="sm" variant="secondary" disabled={busy !== null}
                onClick={() => bulkPatch({ payment_status: 'paid' }, 'Marquées payées')}>
                Marquer payé
              </Button>
              <Button size="sm" variant="secondary" disabled={busy !== null}
                onClick={() => bulkPatch({ payment_status: 'unpaid' }, 'Marquées non payées')}>
                Non payé
              </Button>
              <Button size="sm" variant="ghost" disabled={busy !== null}
                onClick={() => setConfirmBulkDelete(true)}
                className="text-red-700 dark:text-red-300 hover:bg-red-500/10 hover:text-red-300">
                Supprimer
              </Button>
              {busy === 'bulk' && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}
                className="ml-auto text-muted-foreground hover:text-foreground">
                Annuler
              </Button>
            </div>
          )}

          {view.length === 0 ? (
            <p className="text-muted-foreground">Aucune équipe ne correspond à la recherche.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">
                    <Checkbox
                      checked={allVisibleSelected}
                      onChange={toggleAllVisible}
                      aria-label="Tout sélectionner"
                    />
                  </TableHead>
                  <TableHead>
                    <SortHead label="Équipe" active={sortKey === 'name'} asc={sortAsc} onClick={() => toggleSort('name')} />
                  </TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>
                    <SortHead label="Paiement" active={sortKey === 'payment'} asc={sortAsc} onClick={() => toggleSort('payment')} />
                  </TableHead>
                  <TableHead>
                    <SortHead label="Inscription" active={sortKey === 'status'} asc={sortAsc} onClick={() => toggleSort('status')} />
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
        {view.map((team) => {
          const isBusy = busy === String(team.id)
          return (
            <TableRow key={String(team.id)} data-state={selected.has(String(team.id)) ? 'selected' : undefined}>
              <TableCell>
                <Checkbox
                  checked={selected.has(String(team.id))}
                  onChange={() => toggleOne(String(team.id))}
                  aria-label={`Sélectionner ${team.name}`}
                />
              </TableCell>
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  <TeamLogo team={team} onUpload={(f) => uploadLogo(team.id, f)} />
                  <span>
                    {team.name}
                    {team.groupLabel && <span className="ml-2 text-xs text-muted-foreground">Poule {team.groupLabel}</span>}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                <div>{team.email}</div>
                <div>{team.phone}</div>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  disabled={isBusy}
                  title="Basculer le statut de paiement"
                  onClick={() =>
                    patchTeam(team.id, { payment_status: team.paymentStatus === 'paid' ? 'unpaid' : 'paid' })
                  }
                  className={cn(
                    'h-auto gap-1 rounded-md px-2.5 py-1 text-xs font-medium',
                    team.paymentStatus === 'paid'
                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/30 hover:text-emerald-300'
                      : 'bg-amber-500/20 text-amber-700 dark:text-amber-300 hover:bg-amber-500/30 hover:text-amber-300',
                  )}
                >
                  {team.paymentStatus === 'paid' ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <CircleDashed className="h-3.5 w-3.5" />
                  )}
                  {team.paymentStatus === 'paid' ? 'Payé' : 'Non payé'}
                </Button>
              </TableCell>
              <TableCell>
                <Badge
                  className={
                    team.registrationStatus === 'confirmed'
                      ? 'border-transparent bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                      : team.registrationStatus === 'rejected'
                        ? 'border-transparent bg-red-500/20 text-red-700 dark:text-red-300'
                        : team.registrationStatus === 'waitlist'
                          ? 'border-transparent bg-sky-500/20 text-sky-700 dark:text-sky-300'
                          : 'border-transparent bg-amber-500/20 text-amber-700 dark:text-amber-300'
                  }
                >
                  {team.registrationStatus === 'confirmed'
                    ? 'Confirmée'
                    : team.registrationStatus === 'rejected'
                      ? 'Refusée'
                      : team.registrationStatus === 'waitlist'
                        ? 'Liste d’attente'
                        : 'En attente'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex flex-wrap justify-end gap-3">
                  {team.registrationStatus === 'confirmed' ? (
                    <Button
                      variant="link"
                      disabled={isBusy}
                      onClick={() => patchTeam(team.id, { registration_status: 'pending' })}
                      className="h-auto p-0 text-sm font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-300"
                    >
                      En attente
                    </Button>
                  ) : (
                    <Button
                      variant="link"
                      disabled={isBusy}
                      onClick={() => patchTeam(team.id, { registration_status: 'confirmed' })}
                      className="h-auto p-0 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-300"
                    >
                      Confirmer
                    </Button>
                  )}
                  {team.registrationStatus !== 'rejected' && (
                    <Button
                      variant="link"
                      disabled={isBusy}
                      onClick={() => patchTeam(team.id, { registration_status: 'rejected' })}
                      className="h-auto p-0 text-sm font-normal text-muted-foreground hover:text-foreground"
                    >
                      Refuser
                    </Button>
                  )}
                  <Button
                    variant="link"
                    disabled={isBusy}
                    onClick={() => openEdit(team)}
                    className="h-auto p-0 text-sm font-normal text-muted-foreground hover:text-foreground"
                  >
                    Éditer
                  </Button>
                  <Button
                    variant="link"
                    disabled={isBusy}
                    onClick={() => setConfirmDelete(team)}
                    className="h-auto p-0 text-sm font-normal text-red-600 dark:text-red-400 hover:text-red-300"
                  >
                    Suppr.
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )
        })}
              </TableBody>
            </Table>
          )}
        </>
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
                  <Label>Email</Label>
                  <Input value={editDraft.email} onChange={(e) => setEditDraft({ ...editDraft, email: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Téléphone</Label>
                  <Input value={editDraft.phone} onChange={(e) => setEditDraft({ ...editDraft, phone: e.target.value })} />
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
                <Button
                  type="submit"
                  disabled={busy === String(editing.id)}
                  className="bg-primary font-bold text-primary-foreground hover:bg-primary/90"
                >
                  {busy === String(editing.id) && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
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
        description="Cette action est irréversible. L’équipe et ses données seront définitivement supprimées."
        confirmLabel="Supprimer"
        busy={!!confirmDelete && busy === String(confirmDelete.id)}
        onConfirm={async () => {
          if (!confirmDelete) return
          await deleteTeam(confirmDelete.id)
          setConfirmDelete(null)
        }}
        onCancel={() => setConfirmDelete(null)}
      />

      <ConfirmDialog
        open={confirmBulkDelete}
        title={`Supprimer ${selected.size} équipe(s) ?`}
        description="Cette action est irréversible. Les équipes sélectionnées et leurs données seront définitivement supprimées."
        confirmLabel="Supprimer"
        busy={busy === 'bulk'}
        onConfirm={bulkDelete}
        onCancel={() => setConfirmBulkDelete(false)}
      />
    </div>
  )
}
