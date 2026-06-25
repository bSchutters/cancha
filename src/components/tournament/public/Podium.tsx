'use client'

import Image from 'next/image'
import { Trophy, Medal, Award } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useT } from '@/i18n/use-t'
import { localizeFinalNote } from '@/lib/tournament/bracket-label'
import type { PublicTournament } from '@/lib/tournament/public-view'

function Logo({ url, size, alt = '' }: { url: string | null; size: number; alt?: string }) {
  if (!url) return null
  return (
    <span className="relative shrink-0" style={{ height: size, width: size }}>
      <Image src={url} alt={alt} fill sizes={`${size}px`} unoptimized className="object-contain" />
    </span>
  )
}

type PodiumEntry = PublicTournament['finalRanking'][number]

function Step({
  entry,
  height,
  medal,
  ring,
}: {
  entry?: PodiumEntry
  height: string
  medal: React.ReactNode
  ring: string
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-end gap-2">
      {entry && (
        <>
          <Logo url={entry.logoUrl} size={44} alt={entry.teamName} />
          <span className="max-w-full truncate px-1 text-center text-sm font-bold">{entry.teamName}</span>
        </>
      )}
      <div className={cn('flex w-full items-start justify-center rounded-t-lg border-t-2 pt-2', height, ring)}>
        {medal}
      </div>
    </div>
  )
}

export function Podium({ data }: { data: PublicTournament }) {
  const t = useT()
  const top3 = data.finalRanking.slice(0, 3)
  const rest = data.finalRanking.slice(3)
  if (top3.length === 0) return null

  const champion = top3.find((e) => e.position === 1)
  const second = top3.find((e) => e.position === 2)
  const third = top3.find((e) => e.position === 3)

  return (
    <section className="rounded-lg border border-border bg-gradient-to-b from-foreground/[0.06] to-transparent p-5">
      <h2 className="mb-5 flex items-center justify-center gap-2 text-xl font-bold">
        <Trophy className="h-5 w-5 text-amber-700 dark:text-amber-300" /> {t('product.podium.title')}
      </h2>
      <div className="mx-auto flex max-w-md items-end gap-2">
        <Step
          entry={second}
          height="h-20"
          medal={<Medal className="h-6 w-6 text-zinc-500 dark:text-zinc-300" />}
          ring="border-zinc-400/50 bg-zinc-400/10"
        />
        <Step
          entry={champion}
          height="h-28"
          medal={<Trophy className="h-7 w-7 text-amber-700 dark:text-amber-300" />}
          ring="border-amber-300/60 bg-amber-300/15"
        />
        <Step
          entry={third}
          height="h-16"
          medal={<Medal className="h-6 w-6 text-orange-700 dark:text-orange-300" />}
          ring="border-orange-400/50 bg-orange-400/10"
        />
      </div>

      {data.fairplayWinnerName && (
        <div className="mt-5 rounded-xl border border-primary/30 bg-primary/10 p-4 text-center">
          <p className="flex items-center justify-center gap-1 text-xs uppercase tracking-wide text-muted-foreground">
            <Award className="h-3.5 w-3.5 text-primary" /> {t('product.podium.fairplayTrophy')}
          </p>
          <p className="mt-1 text-lg font-bold text-primary">{data.fairplayWinnerName}</p>
        </div>
      )}

      {rest.length > 0 && (
        <details className="mt-5">
          <summary className="cursor-pointer text-center text-sm text-muted-foreground hover:text-foreground">
            {t('product.podium.fullRanking')}
          </summary>
          <ol className="mt-3 space-y-1">
            {data.finalRanking.map((e) => (
              <li key={String(e.teamId)} className="flex items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-sm odd:bg-foreground/[0.03]">
                <span className="flex min-w-0 items-center gap-2">
                  <span className="w-8 shrink-0 text-muted-foreground">{e.positionLabel}</span>
                  <Logo url={e.logoUrl} size={18} />
                  <span className="truncate font-medium">{e.teamName}</span>
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">{localizeFinalNote(e.note, t)}</span>
              </li>
            ))}
          </ol>
        </details>
      )}
    </section>
  )
}
