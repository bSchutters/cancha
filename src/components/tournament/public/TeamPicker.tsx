'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useT } from '@/i18n/use-t'
import type { PublicTournament } from '@/lib/tournament/public-view'

export function TeamPicker({
  teams,
  current,
  onSelect,
  onClose,
}: {
  teams: PublicTournament['teams']
  current: string | null
  onSelect: (id: string | null) => void
  onClose: () => void
}) {
  const t = useT()
  const [q, setQ] = useState('')
  const filtered = teams
    .filter((team) => team.name.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="top-auto bottom-0 flex h-[80vh] max-w-md translate-y-0 flex-col gap-0 overflow-hidden rounded-t-2xl rounded-b-none border-border p-0 sm:top-1/2 sm:bottom-auto sm:h-[34rem] sm:-translate-y-1/2 sm:rounded-b-2xl">
        <DialogHeader className="border-b border-border p-4 text-left">
          <DialogTitle>{t('product.picker.title')}</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('product.picker.search')} />
        </div>
        <ul className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
          {current && (
            <li>
              <Button
                variant="ghost"
                onClick={() => onSelect(null)}
                className="mb-2 h-auto w-full justify-start rounded-lg px-3 py-2 text-left text-sm font-normal text-red-700 dark:text-red-300 hover:bg-muted/50 hover:text-red-700 dark:hover:text-red-300"
              >
                {t('product.picker.unfollow')}
              </Button>
            </li>
          )}
          {filtered.map((team) => (
            <li key={String(team.id)}>
              <Button
                variant="ghost"
                onClick={() => onSelect(String(team.id))}
                className={cn(
                  'h-auto w-full justify-start gap-3 rounded-lg px-3 py-2.5 text-left font-normal hover:bg-muted/50 hover:text-foreground',
                  current === String(team.id) && 'bg-primary/10',
                )}
              >
                {team.logoUrl && (
                  <span className="relative h-7 w-7 shrink-0">
                    <Image src={team.logoUrl} alt={team.name} fill sizes="28px" unoptimized className="object-contain" />
                  </span>
                )}
                <span className="font-medium">{team.name}</span>
              </Button>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-muted-foreground">{t('product.picker.empty')}</li>
          )}
        </ul>
      </DialogContent>
    </Dialog>
  )
}
