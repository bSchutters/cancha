'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { RotateCcw, Pencil, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { NumberStepper } from '@/components/tournament/NumberStepper'
import { ConfirmDialog } from '@/components/tournament/manage/ConfirmDialog'
import { useT } from '@/i18n/use-t'
import { getSportProfile, DEFAULT_SPORT, type SportId } from '@/lib/sport'
import { localizeBracketLabel, localizeFeederName } from '@/lib/tournament/bracket-label'
import type { ManageMatch, ManageReferee } from '@/lib/tournament/manage-view'

type Fairplay = 'home' | 'away' | 'none'

function IconBtn({
  title,
  onClick,
  disabled,
  tone,
  children,
}: {
  title: string
  onClick: () => void
  disabled: boolean
  tone: 'danger' | 'edit' | 'save'
  children: React.ReactNode
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'rounded-md border disabled:opacity-25',
        tone === 'danger' && 'border-red-500/40 text-red-700 dark:text-red-300 hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-300',
        tone === 'edit' && 'border-border bg-muted text-foreground hover:bg-accent hover:text-accent-foreground',
        tone === 'save' &&
          'border-emerald-400/40 bg-emerald-400/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-400/20 hover:text-emerald-700 dark:hover:text-emerald-300',
      )}
    >
      {children}
    </Button>
  )
}

function MatchScoreCard({ match, referees, sport }: { match: ManageMatch; referees: ManageReferee[]; sport: SportId }) {
  const t = useT()
  const router = useRouter()
  const setBased = getSportProfile(sport).scoreLabel === 'sets'
  const [home, setHome] = useState<number | null>(match.scoreHome)
  const [away, setAway] = useState<number | null>(match.scoreAway)
  const [sets, setSets] = useState<{ home: number | null; away: number | null }[]>(() =>
    match.setScores.length ? match.setScores.map((s) => ({ home: s.home, away: s.away })) : [{ home: null, away: null }],
  )
  const [fairplay, setFairplay] = useState<Fairplay>(match.fairplayWinner)
  const [penHome, setPenHome] = useState<number | null>(match.penaltyHome)
  const [penAway, setPenAway] = useState<number | null>(match.penaltyAway)
  const [locked, setLocked] = useState<boolean>(match.status === 'finished')
  const [saving, setSaving] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  const isFinals = match.phase !== 'group' // knockout + classification
  // Set-based sports (padel…): the match score is the number of sets won.
  const validSets = sets.filter((s) => s.home != null && s.away != null && s.home !== s.away)
  const setsHome = validSets.filter((s) => (s.home as number) > (s.away as number)).length
  const setsAway = validSets.filter((s) => (s.away as number) > (s.home as number)).length
  const effHome = setBased ? setsHome : home
  const effAway = setBased ? setsAway : away
  const bothEntered = setBased ? validSets.length > 0 : home != null && away != null
  const isDraw = setBased ? effHome === effAway : bothEntered && home === away
  const needsPenalty = isFinals && isDraw && !setBased // no penalty shootout for set sports

  const updateSet = (i: number, side: 'home' | 'away', v: number | null) =>
    setSets((prev) => prev.map((s, idx) => (idx === i ? { ...s, [side]: v } : s)))
  const addSet = () => setSets((prev) => [...prev, { home: null, away: null }])
  const removeSet = (i: number) => setSets((prev) => prev.filter((_, idx) => idx !== i))

  const reset = async () => {
    setHome(null)
    setAway(null)
    setSets([{ home: null, away: null }])
    setFairplay('none')
    setPenHome(null)
    setPenAway(null)
    setLocked(false) // unlock so the score can be re-entered then saved
    // If the match was already saved, clear it on the server too.
    if (match.status === 'finished') {
      await fetch(`/api/tournament/match/${match.id}/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ clear: true }),
      }).catch(() => toast.error(t('product.scores.resetError')))
      router.refresh()
    }
  }

  const save = async () => {
    if (!bothEntered) {
      toast.error(t('product.scores.enterBoth'))
      return
    }
    if (setBased && effHome === effAway) {
      toast.error(t('product.scores.setsDecisive'))
      return
    }
    if (needsPenalty && (penHome == null || penAway == null || penHome === penAway)) {
      toast.error(t('product.scores.penaltyDecisive'))
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/tournament/match/${match.id}/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          scoreHome: effHome,
          scoreAway: effAway,
          setScores: setBased ? validSets : undefined,
          fairplayWinner: fairplay,
          penaltyHome: needsPenalty ? penHome : null,
          penaltyAway: needsPenalty ? penAway : null,
        }),
      })
      const body = await res.json()
      if (res.ok) {
        toast.success(t('product.scores.saved'))
        setLocked(true)
        router.refresh()
      } else {
        toast.error(body?.error?.message ?? t('product.toast.error'))
      }
    } finally {
      setSaving(false)
    }
  }

  const setReferee = async (refId: string) => {
    await fetch(`/api/tournament-matches/${match.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ referee: refId ? Number(refId) : null }),
    }).catch(() => toast.error(t('product.scores.refereeError')))
    router.refresh()
  }

  return (
    <div
      className={cn(
        'rounded-lg border p-4 transition-colors',
        locked ? 'border-border bg-muted/40' : 'border-border bg-card',
      )}
    >
      <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          {match.code && (
            <span className="rounded-sm bg-muted px-1.5 py-0.5 font-bold text-foreground">{match.code}</span>
          )}
          {match.scheduledTime ?? ''}
          {match.court != null ? ` · ${t('product.court')} ${match.court}` : ''}
        </span>
        <span>{match.groupLabel ? `${t('product.poolLabel')} ${match.groupLabel}` : match.bracketLabel}</span>
      </div>

      {setBased ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 text-sm font-medium">
            <span className={cn('min-w-0 truncate', !match.homeName && 'italic text-muted-foreground')}>
              {match.homeName ? localizeFeederName(match.homeName, t) : t('product.match.tbd')}
            </span>
            <span className={cn('min-w-0 truncate text-right', !match.awayName && 'italic text-muted-foreground')}>
              {match.awayName ? localizeFeederName(match.awayName, t) : t('product.match.tbd')}
            </span>
          </div>
          {sets.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-12 shrink-0 text-xs text-muted-foreground">
                {t('product.scores.set')} {i + 1}
              </span>
              <NumberStepper value={s.home} onChange={(v) => updateSet(i, 'home', v)} disabled={locked || !match.homeName} size="sm" />
              <span className="text-muted-foreground">-</span>
              <NumberStepper value={s.away} onChange={(v) => updateSet(i, 'away', v)} disabled={locked || !match.awayName} size="sm" />
              {!locked && sets.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSet(i)}
                  className="ml-auto text-lg leading-none text-muted-foreground hover:text-red-600"
                  aria-label={t('product.scores.removeSet')}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          {!locked && (
            <button type="button" onClick={addSet} className="text-xs font-medium text-primary hover:underline">
              + {t('product.scores.addSet')}
            </button>
          )}
          <p className="text-xs text-muted-foreground">
            {t('product.scores.setsWon')} : <span className="font-semibold text-foreground">{setsHome} - {setsAway}</span>
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className={cn('min-w-0 truncate', !match.homeName && 'italic text-muted-foreground')}>
              {match.homeName ? localizeFeederName(match.homeName, t) : t('product.match.tbd')}
            </span>
            <NumberStepper value={home} onChange={setHome} disabled={locked || !match.homeName} size="sm" />
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className={cn('min-w-0 truncate', !match.awayName && 'italic text-muted-foreground')}>
              {match.awayName ? localizeFeederName(match.awayName, t) : t('product.match.tbd')}
            </span>
            <NumberStepper value={away} onChange={setAway} disabled={locked || !match.awayName} size="sm" />
          </div>
        </div>
      )}

      {/* Fair-play - labelled with team names */}
      <div className="mt-3">
        <p className="mb-1 text-xs text-muted-foreground">{t('product.scores.fairplayPoint')}</p>
        <div className="flex gap-1">
          {(['home', 'none', 'away'] as Fairplay[]).map((v) => (
            <Button
              key={v}
              type="button"
              variant="ghost"
              disabled={locked}
              onClick={() => setFairplay(v)}
              className={cn(
                'h-auto flex-1 truncate rounded-md border px-2 py-1 text-xs font-normal',
                fairplay === v
                  ? 'border-primary bg-primary/15 text-foreground hover:bg-primary/15 hover:text-foreground'
                  : 'border-border text-muted-foreground hover:bg-transparent hover:text-foreground',
                locked && 'opacity-60',
              )}
            >
              {v === 'home'
                ? (match.homeName ?? t('product.scores.home'))
                : v === 'away'
                  ? (match.awayName ?? t('product.scores.away'))
                  : t('product.scores.none')}
            </Button>
          ))}
        </div>
      </div>

      {/* Penalty shootout score for KO draws */}
      {needsPenalty && (
        <div className="mt-3">
          <p className="mb-1 text-xs text-muted-foreground">{t('product.scores.penalties')}</p>
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-sm">{match.homeName}</span>
            <NumberStepper value={penHome} onChange={setPenHome} disabled={locked} size="sm" />
          </div>
          <div className="mt-1 flex items-center justify-between gap-2">
            <span className="truncate text-sm">{match.awayName}</span>
            <NumberStepper value={penAway} onChange={setPenAway} disabled={locked} size="sm" />
          </div>
        </div>
      )}

      {/* Referee select (fills) + action icons */}
      <div className="mt-4 flex items-center gap-2">
        <Select
          defaultValue={match.refereeId ? String(match.refereeId) : undefined}
          onValueChange={(v) => setReferee(v === '__none__' ? '' : v)}
          disabled={locked || saving}
        >
          <SelectTrigger size="sm" className="min-w-0 flex-1 text-xs">
            <SelectValue placeholder={t('product.scores.refereePlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">{t('product.results.none')}</SelectItem>
            {referees.map((r) => (
              <SelectItem key={String(r.id)} value={String(r.id)}>
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex shrink-0 items-center gap-2">
          <IconBtn
            title={t('product.scores.reset')}
            tone="danger"
            disabled={saving}
            onClick={() => (match.status === 'finished' ? setConfirmReset(true) : reset())}
          >
            <RotateCcw className="h-4 w-4" />
          </IconBtn>
          <IconBtn title={t('product.action.edit')} tone="edit" disabled={!locked} onClick={() => setLocked(false)}>
            <Pencil className="h-4 w-4" />
          </IconBtn>
          <IconBtn title={t('product.scores.validate')} tone="save" disabled={locked || saving} onClick={save}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          </IconBtn>
        </div>
      </div>

      <ConfirmDialog
        open={confirmReset}
        title={t('product.scores.confirmResetTitle')}
        description={t('product.scores.confirmResetDesc')}
        confirmLabel={t('product.scores.resetConfirm')}
        busy={saving}
        onConfirm={() => {
          setConfirmReset(false)
          reset()
        }}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  )
}

type Section = { key: string; title: string; matches: ManageMatch[]; time: string | null }

function isComplete(s: Section): boolean {
  return s.matches.length > 0 && s.matches.every((m) => m.status === 'finished')
}

function SectionBlock({ section, referees, sport }: { section: Section; referees: ManageReferee[]; sport: SportId }) {
  const done = section.matches.filter((m) => m.status === 'finished').length
  const total = section.matches.length
  const complete = done === total && total > 0
  return (
    <section className="mb-8">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
        {section.title}
        <span
          className={cn(
            'rounded-md px-2 py-0.5 text-xs font-semibold',
            complete ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-muted text-muted-foreground',
          )}
        >
          {done}/{total}
        </span>
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-4">
        {section.matches.map((m) => (
          <MatchScoreCard key={String(m.id)} match={m} referees={referees} sport={sport} />
        ))}
      </div>
    </section>
  )
}

/** Sort by scheduled time; completed sections sink to the very bottom. */
function orderSections(sections: Section[]): Section[] {
  return [...sections].sort(
    (a, b) =>
      (isComplete(a) ? 1 : 0) - (isComplete(b) ? 1 : 0) || (a.time ?? '99:99').localeCompare(b.time ?? '99:99'),
  )
}

export function ScoresClient({
  matches,
  referees,
  sport = DEFAULT_SPORT,
}: {
  matches: ManageMatch[]
  referees: ManageReferee[]
  sport?: SportId
}) {
  const t = useT()
  const [filter, setFilter] = useState<'all' | 'pending'>('all')
  const visible = filter === 'pending' ? matches.filter((m) => m.status !== 'finished') : matches

  const byRound = (ms: ManageMatch[]) => {
    const rounds = [...new Set(ms.map((m) => m.round ?? 0))].sort((a, b) => a - b)
    return rounds.map((r) => ({ round: r, matches: ms.filter((m) => (m.round ?? 0) === r) }))
  }

  const groupSections: Section[] = byRound(visible.filter((m) => m.phase === 'group')).map(({ round, matches }) => ({
    key: `g${round}`,
    title: `${t('product.round')} ${round}`,
    matches: matches.sort((a, b) => (a.court ?? 0) - (b.court ?? 0)),
    time: matches[0]?.scheduledTime ?? null,
  }))
  // Group knockout by bracket label so the Final and Petite finale are separate.
  const koByLabel = new Map<string, ManageMatch[]>()
  for (const m of visible.filter((mm) => mm.phase === 'knockout')) {
    const label = m.bracketLabel ?? `${t('product.bracketRound')} ${m.round}`
    koByLabel.set(label, [...(koByLabel.get(label) ?? []), m])
  }
  const koSections: Section[] = [...koByLabel.entries()].map(([label, ms]) => ({
    key: `k:${label}`,
    title: localizeBracketLabel(label, t),
    matches: ms,
    time: ms[0]?.scheduledTime ?? null,
  }))
  // Group the placement bracket by round; each card keeps its own place label
  // (e.g. "Places 9-10") shown in the card header.
  const clRounds = byRound(visible.filter((m) => m.phase === 'classification'))
  const clSections: Section[] = clRounds.map(({ round, matches }) => ({
    key: `c${round}`,
    title:
      clRounds.length > 1
        ? t('product.scores.placementsRound').replace('{round}', String(round))
        : t('product.scores.placements'),
    matches: matches.sort((a, b) => (a.court ?? 0) - (b.court ?? 0)),
    time: matches[0]?.scheduledTime ?? null,
  }))
  const allSections = orderSections([...groupSections, ...koSections, ...clSections])

  if (matches.length === 0) {
    return <p className="text-muted-foreground">{t('product.scores.noMatches')}</p>
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        <Badge variant={filter === 'all' ? 'default' : 'secondary'} className="cursor-pointer" onClick={() => setFilter('all')}>
          {t('product.scores.filterAll')}
        </Badge>
        <Badge variant={filter === 'pending' ? 'default' : 'secondary'} className="cursor-pointer" onClick={() => setFilter('pending')}>
          {t('product.scores.filterPending')}
        </Badge>
      </div>

      {allSections.map((s) => (
        <SectionBlock key={s.key} section={s} referees={referees} sport={sport} />
      ))}
    </div>
  )
}
