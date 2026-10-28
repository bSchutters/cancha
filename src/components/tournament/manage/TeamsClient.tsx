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
import { csvCell } from '@/lib/csv'
import { runBulk, type BulkOutcome } from '@/lib/tournament/bulk'
import { useT } from '@/i18n/use-t'
import type { Translate } from '@/i18n'
import type { Id } from '@/lib/tournament/types'
import type { ManageTeam } from '@/lib/tournament/manage-view'

type SortKey = 'name' | 'payment' | 'status'
const STATUS_RANK: Record<string, number> = { pending: 0, confirmed: 1, waitlist: 2, rejected: 3 }
const regStatusLabel = (status: string, t: Translate) => t(`product.teams.status.${status}`)

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
  const t = useT()
  const ref = useRef<HTMLInputElement>(null)
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      title={t('product.teams.changeLogo')}
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
  const t = useT()
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

  // Bulk actions only ever touch rows the organizer can see: a selection made
  // before changing the search or the status filter must not delete hidden teams.
  const selectedIds = useMemo(
    () => view.filter((team) => selected.has(String(team.id))).map((team) => String(team.id)),
    [view, selected],
  )
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

  // Keep the failed rows selected so the organizer can retry just those.
  const reportBulk = (outcome: BulkOutcome, successMsg: string) => {
    setSelected(new Set(outcome.failed))
    if (outcome.failed.length === 0) {
      toast.success(successMsg)
      return
    }
    toast.error(
      t('product.teams.bulkFailed')
        .replace('{failed}', String(outcome.failed.length))
        .replace('{total}', String(outcome.ok.length + outcome.failed.length)),
    )
  }

  const bulkPatch = async (data: Record<string, unknown>, msg: string) => {
    if (selectedIds.length === 0) return
    setBusy('bulk')
    try {
      const outcome = await runBulk(selectedIds, (id) =>
        fetch(`/api/tournament-teams/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data),
        }),
      )
      reportBulk(outcome, msg)
      router.refresh()
    } finally {
      setBusy(null)
    }
  }

  const bulkDelete = async () => {
    if (selectedIds.length === 0) return
    setBusy('bulk')
    try {
      const outcome = await runBulk(selectedIds, (id) =>
        fetch(`/api/tournament-teams/${id}`, { method: 'DELETE', credentials: 'include' }),
      )
      reportBulk(outcome, t('product.teams.bulkDeleted').replace('{count}', String(outcome.ok.length)))
      setConfirmBulkDelete(false)
      router.refresh()
    } finally {
      setBusy(null)
    }
  }

  const exportCsv = () => {
    const header = [
      t('product.teams.col.team'),
      t('product.poolLabel'),
      t('product.field.email'),
      t('product.field.phone'),
      t('product.teams.col.registration'),
      t('product.teams.col.payment'),
    ]
    const rows = view.map((team) =>
      [
        team.name,
        team.groupLabel ?? '',
        team.email,
        team.phone,
        regStatusLabel(team.registrationStatus, t),
        team.paymentStatus === 'paid' ? t('product.teams.paid') : t('product.teams.unpaid'),
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
          toast.error(t('product.sponsors.uploadFailed'))
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
        toast.success(t('product.teams.added'))
        setDraft(emptyDraft)
        setAddFile(null)
        setAdding(false)
        router.refresh()
      } else {
        toast.error(t('product.toast.addError'))
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
          toast.error(t('product.sponsors.uploadFailed'))
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
        toast.success(t('product.teams.updated'))
        setEditing(null)
        setEditFile(null)
        router.refresh()
      } else {
        toast.error(t('product.toast.error'))
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
        toast.success(t('product.teams.deleted'))
        router.refresh()
      } else {
        toast.error(t('product.toast.deleteFailed'))
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
        toast.error(t('product.teams.updateError'))
      }
    } catch {
      toast.error(t('product.toast.network'))
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
        toast.success(t('product.teams.logoUpdated'))
        router.refresh()
      } else {
        toast.error(t('product.toast.error'))
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
          {adding ? t('product.action.cancel') : t('product.teams.add')}
        </Button>
      </div>

      {adding && (
        <form onSubmit={createTeam} className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1">
            <Label>{t('product.field.name')}</Label>
            <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} required />
          </div>
          <div className="space-y-1">
            <Label>{t('product.field.email')}</Label>
            <Input value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label>{t('product.field.phone')}</Label>
            <Input value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label>{t('product.teams.logoOptional')}</Label>
            <Input type="file" accept="image/*" onChange={(e) => pickImage(e.target.files?.[0], setAddFile)} />
          </div>
          <div className="lg:col-span-4">
            <Button
              type="submit"
              disabled={busy === 'add'}
              className="bg-primary font-bold text-primary-foreground hover:bg-primary/90"
            >
              {busy === 'add' && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
              {t('product.teams.addSubmit')}
            </Button>
          </div>
        </form>
      )}

      {teams.length === 0 ? (
        <p className="text-muted-foreground">{t('product.teams.emptyAll')}</p>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[14rem] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('product.teams.searchPlaceholder')}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger size="sm" className="w-auto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('product.teams.filter.all')}</SelectItem>
                <SelectItem value="pending">{t('product.teams.status.pending')}</SelectItem>
                <SelectItem value="confirmed">{t('product.teams.status.confirmed')}</SelectItem>
                <SelectItem value="waitlist">{t('product.teams.status.waitlist')}</SelectItem>
                <SelectItem value="rejected">{t('product.teams.filter.rejected')}</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" variant="ghost" onClick={exportCsv} className="gap-1 text-muted-foreground hover:text-foreground">
              <Download className="h-4 w-4" /> CSV
            </Button>
          </div>

          {selectedIds.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 p-2">
              <span className="px-1 text-sm font-semibold text-primary">
                {t('product.teams.selectedCount').replace('{count}', String(selectedIds.length))}
              </span>
              <Button size="sm" variant="secondary" disabled={busy !== null}
                onClick={() => bulkPatch({ registration_status: 'confirmed' }, t('product.teams.bulk.confirmed'))}>
                {t('product.teams.confirm')}
              </Button>
              <Button size="sm" variant="secondary" disabled={busy !== null}
                onClick={() => bulkPatch({ registration_status: 'rejected' }, t('product.teams.bulk.rejected'))}>
                {t('product.teams.reject')}
              </Button>
              <Button size="sm" variant="secondary" disabled={busy !== null}
                onClick={() => bulkPatch({ payment_status: 'paid' }, t('product.teams.bulk.paid'))}>
                {t('product.teams.markPaid')}
              </Button>
              <Button size="sm" variant="secondary" disabled={busy !== null}
                onClick={() => bulkPatch({ payment_status: 'unpaid' }, t('product.teams.bulk.unpaid'))}>
                {t('product.teams.unpaid')}
              </Button>
              <Button size="sm" variant="ghost" disabled={busy !== null}
                onClick={() => setConfirmBulkDelete(true)}
                className="text-red-700 dark:text-red-300 hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-300">
                {t('product.action.delete')}
              </Button>
              {busy === 'bulk' && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}
                className="ml-auto text-muted-foreground hover:text-foreground">
                {t('product.action.cancel')}
              </Button>
            </div>
          )}

          {view.length === 0 ? (
            <p className="text-muted-foreground">{t('product.teams.noMatch')}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">
                    <Checkbox
                      checked={allVisibleSelected}
                      onChange={toggleAllVisible}
                      aria-label={t('product.teams.selectAll')}
                    />
                  </TableHead>
                  <TableHead>
                    <SortHead label={t('product.teams.col.team')} active={sortKey === 'name'} asc={sortAsc} onClick={() => toggleSort('name')} />
                  </TableHead>
                  <TableHead>{t('product.teams.col.contact')}</TableHead>
                  <TableHead>
                    <SortHead label={t('product.teams.col.payment')} active={sortKey === 'payment'} asc={sortAsc} onClick={() => toggleSort('payment')} />
                  </TableHead>
                  <TableHead>
                    <SortHead label={t('product.teams.col.registration')} active={sortKey === 'status'} asc={sortAsc} onClick={() => toggleSort('status')} />
                  </TableHead>
                  <TableHead className="text-right">{t('product.teams.col.actions')}</TableHead>
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
                  aria-label={t('product.teams.selectOne').replace('{name}', team.name)}
                />
              </TableCell>
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  <TeamLogo team={team} onUpload={(f) => uploadLogo(team.id, f)} />
                  <span>
                    {team.name}
                    {team.groupLabel && <span className="ml-2 text-xs text-muted-foreground">{t('product.poolLabel')} {team.groupLabel}</span>}
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
                  title={t('product.teams.togglePayment')}
                  onClick={() =>
                    patchTeam(team.id, { payment_status: team.paymentStatus === 'paid' ? 'unpaid' : 'paid' })
                  }
                  className={cn(
                    'h-auto gap-1 rounded-md px-2.5 py-1 text-xs font-medium',
                    team.paymentStatus === 'paid'
                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/30 hover:text-emerald-700 dark:hover:text-emerald-300'
                      : 'bg-amber-500/20 text-amber-700 dark:text-amber-300 hover:bg-amber-500/30 hover:text-amber-700 dark:hover:text-amber-300',
                  )}
                >
                  {team.paymentStatus === 'paid' ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <CircleDashed className="h-3.5 w-3.5" />
                  )}
                  {team.paymentStatus === 'paid' ? t('product.teams.paid') : t('product.teams.unpaid')}
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
                  {regStatusLabel(team.registrationStatus, t)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex flex-wrap justify-end gap-3">
                  {team.registrationStatus === 'confirmed' ? (
                    <Button
                      variant="link"
                      disabled={isBusy}
                      onClick={() => patchTeam(team.id, { registration_status: 'pending' })}
                      className="h-auto p-0 text-sm font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300"
                    >
                      {t('product.teams.toPending')}
                    </Button>
                  ) : (
                    <Button
                      variant="link"
                      disabled={isBusy}
                      onClick={() => patchTeam(team.id, { registration_status: 'confirmed' })}
                      className="h-auto p-0 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
                    >
                      {t('product.teams.confirm')}
                    </Button>
                  )}
                  {team.registrationStatus !== 'rejected' && (
                    <Button
                      variant="link"
                      disabled={isBusy}
                      onClick={() => patchTeam(team.id, { registration_status: 'rejected' })}
                      className="h-auto p-0 text-sm font-normal text-muted-foreground hover:text-foreground"
                    >
                      {t('product.teams.reject')}
                    </Button>
                  )}
                  <Button
                    variant="link"
                    disabled={isBusy}
                    onClick={() => openEdit(team)}
                    className="h-auto p-0 text-sm font-normal text-muted-foreground hover:text-foreground"
                  >
                    {t('product.action.edit')}
                  </Button>
                  <Button
                    variant="link"
                    disabled={isBusy}
                    onClick={() => setConfirmDelete(team)}
                    className="h-auto p-0 text-sm font-normal text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                  >
                    {t('product.action.deleteShort')}
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
                <DialogTitle>{t('product.editTitle').replace('{name}', editing.name)}</DialogTitle>
              </DialogHeader>
              <div className="mt-4 space-y-3">
                <div className="space-y-1">
                  <Label>{t('product.field.name')}</Label>
                  <Input value={editDraft.name} onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })} required />
                </div>
                <div className="space-y-1">
                  <Label>{t('product.field.email')}</Label>
                  <Input value={editDraft.email} onChange={(e) => setEditDraft({ ...editDraft, email: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>{t('product.field.phone')}</Label>
                  <Input value={editDraft.phone} onChange={(e) => setEditDraft({ ...editDraft, phone: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>{t('product.sponsors.replaceLogo')}</Label>
                  <Input type="file" accept="image/*" onChange={(e) => pickImage(e.target.files?.[0], setEditFile)} />
                </div>
              </div>
              <DialogFooter className="mt-5">
                <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
                  {t('product.action.cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={busy === String(editing.id)}
                  className="bg-primary font-bold text-primary-foreground hover:bg-primary/90"
                >
                  {busy === String(editing.id) && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                  {t('product.action.save')}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!confirmDelete}
        title={confirmDelete ? t('product.confirmDeleteTitle').replace('{name}', confirmDelete.name) : ''}
        description={t('product.teams.confirmDeleteDesc')}
        confirmLabel={t('product.action.delete')}
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
        title={t('product.teams.bulkDeleteTitle').replace('{count}', String(selectedIds.length))}
        description={t('product.teams.bulkDeleteDesc')}
        confirmLabel={t('product.action.delete')}
        busy={busy === 'bulk'}
        onConfirm={bulkDelete}
        onCancel={() => setConfirmBulkDelete(false)}
      />
    </div>
  )
}
