'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Dices, CalendarClock, Trophy, RotateCcw, FlaskConical, Sparkles, Loader2, Users, ListChecks, Tv, Eye, EyeOff, Flag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { NumberStepper } from '@/components/tournament/NumberStepper'
import { ConfirmDialog } from './ConfirmDialog'
import { TvScreensManager } from './TvScreensManager'
import { useT } from '@/i18n/use-t'
import type { Translate } from '@/i18n'
import type { ManageTournament } from '@/lib/tournament/manage-view'

/**
 * Status is informative, not a category you pick: it is derived from the actual
 * progress (data present) and the explicit registration/finished/archived flags.
 */
function statusTag(t: ManageTournament, tr: Translate): { label: string; tone: string } {
  if (t.status === 'archived') return { label: tr('product.dashStatus.archived'), tone: 'bg-muted text-muted-foreground' }
  if (t.status === 'finished') return { label: tr('product.dashStatus.finished'), tone: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' }
  if (t.matches.some((m) => m.phase === 'knockout')) return { label: tr('product.dashStatus.finals'), tone: 'bg-primary/20 text-primary' }
  if (t.matches.some((m) => m.phase === 'group')) return { label: tr('product.dashStatus.live'), tone: 'bg-primary/20 text-primary' }
  if (t.groups.length > 0) return { label: tr('product.dashStatus.drawDone'), tone: 'bg-sky-500/15 text-sky-700 dark:text-sky-300' }
  if (t.status === 'registration_closed') return { label: tr('product.dashStatus.registrationClosed'), tone: 'bg-amber-500/15 text-amber-700 dark:text-amber-300' }
  if (t.status === 'registration') return { label: tr('product.dashStatus.registrationOpen'), tone: 'bg-amber-500/15 text-amber-700 dark:text-amber-300' }
  return { label: tr('product.dashStatus.draft'), tone: 'bg-muted text-muted-foreground' }
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}

export function DashboardClient({ initial, isOwner = false }: { initial: ManageTournament; isOwner?: boolean }) {
  const tr = useT()
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const [confirmFinish, setConfirmFinish] = useState(false)
  const [offset, setOffset] = useState(initial.schedule.globalOffsetMin)
  const [drawMode, setDrawMode] = useState<'auto' | 'manual'>('auto')
  const t = initial
  const tag = statusTag(t, tr)

  const capacity = t.format.numGroups * t.format.groupSize
  const isLeague = t.competitionFormat === 'league'
  const isSingleElim = t.competitionFormat === 'single_elim'
  const drawDone = t.groups.length > 0
  const scheduleDone = t.matches.some((m) => m.phase === 'group')
  const knockoutDone = t.matches.some((m) => m.phase === 'knockout')
  // Finishable once every match is played — for a league that's just the group
  // matches; otherwise the final phase must exist too.
  const allMatchesPlayed =
    t.matches.length > 0 && t.matches.every((m) => m.status === 'finished') && (isLeague || knockoutDone)

  // Dev control states (disable an action once it is complete).
  const seedTarget = t.format.numGroups * t.format.groupSize
  const seedDone = seedTarget > 0 && t.counts.confirmed >= seedTarget
  const groupMatches = t.matches.filter((m) => m.phase === 'group')
  const groupScoresDone = groupMatches.length > 0 && groupMatches.every((m) => m.status === 'finished')
  const finalsMatches = t.matches.filter((m) => m.phase !== 'group')
  const finalsScoresDone = finalsMatches.length > 0 && finalsMatches.every((m) => m.status === 'finished')

  const patchTournament = async (data: Record<string, unknown>, successMsg: string) => {
    setBusy('patch')
    try {
      const res = await fetch(`/api/tournaments/${t.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      })
      if (res.ok) {
        toast.success(successMsg)
        router.refresh()
      } else {
        const body = await res.json()
        toast.error(body?.errors?.[0]?.message ?? tr('product.toast.error'))
      }
    } finally {
      setBusy(null)
    }
  }

  const post = async (path: string, label: string, body?: unknown) => {
    // Use the action as the busy key for dev endpoints (so each button has its own loader).
    const key =
      body && typeof body === 'object' && 'action' in body ? String((body as { action: string }).action) : path
    setBusy(key)
    try {
      const res = await fetch(`/api/tournament/${t.id}/${path}`, {
        method: 'POST',
        credentials: 'include',
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(tr('product.dash.actionOk').replace('{label}', label))
        setConfirmReset(false)
        router.refresh()
      } else {
        toast.error(data?.error?.message ?? tr('product.dash.actionError').replace('{label}', label))
      }
    } catch {
      toast.error(tr('product.toast.network'))
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold">{t.name}</h1>
            <span className={cn('rounded-md px-3 py-1 text-xs font-semibold', tag.tone)}>{tag.label}</span>
          </div>
          <p className="text-sm text-muted-foreground">/{t.slug}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/${t.publicLocale}/${t.slug}/tv`} target="_blank" className="text-sm text-muted-foreground underline hover:text-foreground">
            {tr('product.dash.tvView')} ↗
          </Link>
          <Link href={`/${t.publicLocale}/${t.slug}`} target="_blank" className="text-sm text-muted-foreground underline hover:text-foreground">
            {tr('product.dash.publicPage')} ↗
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat
          label={
            t.counts.waitlist > 0
              ? tr('product.dash.registeredWaitlist').replace('{count}', String(t.counts.waitlist))
              : tr('product.dash.registered')
          }
          value={capacity > 0 ? `${t.counts.active} / ${capacity}` : t.counts.active}
        />
        <Stat label={tr('product.dash.confirmed')} value={t.counts.confirmed} />
        <Stat label={tr('product.dash.paid')} value={t.counts.paid} />
        <Stat label={tr('product.dash.matches')} value={t.matches.length} />
      </div>

      {/* Control zone */}
      <section className="rounded-xl border border-primary/30 bg-primary/5 p-5">
        <h2 className="mb-1 flex items-center gap-2 font-bold text-primary">{tr('product.dash.controlCenter')}</h2>
        <p className="mb-4 text-xs text-muted-foreground">{tr('product.dash.controlIntro')}</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {isSingleElim ? (
            <ControlButton
              icon={<Trophy className="h-5 w-5" />}
              label={tr('product.dash.genBracket')}
              done={knockoutDone}
              doneLabel={tr('product.dash.genBracketDone')}
              loading={busy === 'generate-bracket'}
              disabled={busy !== null || knockoutDone || t.counts.confirmed < 2}
              onClick={() => post('generate-bracket', tr('product.dash.lbl.genBracket'))}
            />
          ) : (
            <>
              <ControlButton
                icon={<Dices className="h-5 w-5" />}
                label={tr('product.dash.draw')}
                done={drawDone}
                doneLabel={tr('product.dash.drawDone')}
                loading={busy === 'draw'}
                disabled={busy !== null || drawDone}
                onClick={() => post('draw', tr('product.dash.lbl.draw'))}
              />
              <ControlButton
                icon={<CalendarClock className="h-5 w-5" />}
                label={tr('product.dash.schedule')}
                done={scheduleDone}
                doneLabel={tr('product.dash.scheduleDone')}
                loading={busy === 'generate-schedule'}
                disabled={busy !== null || !drawDone || scheduleDone}
                onClick={() => post('generate-schedule', tr('product.dash.lbl.schedule'))}
              />
              {!isLeague && (
                <ControlButton
                  icon={<Trophy className="h-5 w-5" />}
                  label={tr('product.dash.finals')}
                  done={knockoutDone}
                  doneLabel={tr('product.dash.finalsDone')}
                  loading={busy === 'generate-knockout'}
                  disabled={busy !== null || !scheduleDone || knockoutDone}
                  onClick={() => post('generate-knockout', tr('product.dash.lbl.finals'))}
                />
              )}
            </>
          )}
          <ControlButton
            icon={<Flag className="h-5 w-5" />}
            label={tr('product.dash.finish')}
            done={t.status === 'finished' || t.status === 'archived'}
            doneLabel={tr('product.dash.finishDone')}
            loading={busy === 'patch'}
            disabled={busy !== null || t.status === 'finished' || t.status === 'archived' || !allMatchesPlayed}
            title={allMatchesPlayed ? undefined : tr('product.dash.allMatchesNeeded')}
            onClick={() => setConfirmFinish(true)}
          />
          <Button
            variant="ghost"
            onClick={() => setConfirmReset(true)}
            disabled={busy !== null}
            className="h-auto flex-col items-start gap-2 rounded-lg border border-red-500/40 bg-red-500/5 p-4 text-left text-red-700 dark:text-red-300 hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-300"
          >
            <RotateCcw className="h-5 w-5" />
            <span className="text-sm font-semibold">{tr('product.dash.reset')}</span>
          </Button>
        </div>

        {/* Phase actions - status follows automatically; these are the explicit gates. */}
        {['draft', 'registration', 'registration_closed', 'finished', 'archived'].includes(t.status) && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
          {t.status === 'draft' && (
            <Button size="sm" variant="secondary" disabled={busy !== null}
              onClick={() => patchTournament({ status: 'registration' }, tr('product.dash.msg.regOpened'))}>
              {tr('product.dash.openReg')}
            </Button>
          )}
          {t.status === 'registration' && (
            <Button size="sm" variant="secondary" disabled={busy !== null}
              onClick={() => patchTournament({ status: 'registration_closed' }, tr('product.dash.msg.regClosed'))}>
              {tr('product.dash.closeReg')}
            </Button>
          )}
          {t.status === 'registration_closed' && (
            <Button size="sm" variant="secondary" disabled={busy !== null}
              onClick={() => patchTournament({ status: 'registration' }, tr('product.dash.msg.regReopened'))}>
              {tr('product.dash.reopenReg')}
            </Button>
          )}
          {t.status === 'finished' && (
            <>
              <Button size="sm" variant="secondary" disabled={busy !== null}
                onClick={() => patchTournament({ status: 'live' }, tr('product.dash.msg.reopened'))}>
                {tr('product.dash.reopen')}
              </Button>
              <Button size="sm" variant="ghost" disabled={busy !== null}
                onClick={() => patchTournament({ status: 'archived' }, tr('product.dash.msg.archived'))}>
                {tr('product.dash.archive')}
              </Button>
            </>
          )}
          {t.status === 'archived' && (
            <Button size="sm" variant="secondary" disabled={busy !== null}
              onClick={() => patchTournament({ status: 'finished' }, tr('product.dash.msg.unarchived'))}>
              {tr('product.dash.unarchive')}
            </Button>
          )}
        </div>
        )}

        {/* Live delay control - the field shows the total currently applied. */}
        <div className="mt-4 border-t border-border pt-4">
          <p className="mb-2 text-sm text-muted-foreground">
            {tr('product.dash.delayApplied')}{' '}
            <span className="font-semibold text-foreground">+{t.schedule.globalOffsetMin} min</span>
            <span className="text-muted-foreground"> {tr('product.dash.delayHint')}</span>
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {[5, 10, 15].map((d) => (
              <Button key={d} variant="secondary" disabled={busy !== null}
                onClick={() => setOffset((o) => Math.min(240, o + d))}>
                +{d}
              </Button>
            ))}
            <NumberStepper value={offset} onChange={setOffset} min={0} max={240} />
            <Button
              disabled={busy !== null || offset === t.schedule.globalOffsetMin}
              onClick={() => patchTournament({ global_offset_min: offset }, tr('product.dash.msg.delayApplied'))}
            >
              {tr('product.dash.apply')}
            </Button>
            {offset !== t.schedule.globalOffsetMin && (
              <span className="text-xs text-muted-foreground">
                {tr('product.dash.willBecome').replace('{offset}', String(offset))}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* TV broadcast & public display */}
      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-1 flex items-center gap-2 font-bold">
          <Tv className="h-4 w-4 text-primary" /> {tr('product.dash.broadcast')}
        </h2>
        <p className="mb-4 text-xs text-muted-foreground">{tr('product.dash.broadcastIntro')}</p>

        <TvScreensManager tournamentId={t.id} slug={t.slug} initial={t.tvScreens} />

        <div className="mt-6 flex flex-wrap items-end gap-x-10 gap-y-5 border-t border-border pt-5">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-muted-foreground">{tr('product.dash.drawTv')}</p>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-md border border-border bg-card p-0.5">
                {(['auto', 'manual'] as const).map((m) => (
                  <Button
                    key={m}
                    variant="ghost"
                    size="sm"
                    onClick={() => setDrawMode(m)}
                    className={cn(
                      'h-7 rounded-sm px-3 text-xs',
                      drawMode === m
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                  >
                    {m === 'auto' ? tr('product.dash.auto') : tr('product.dash.manual')}
                  </Button>
                ))}
              </div>
              <Button asChild size="sm" variant="secondary">
                <Link href={`/${t.publicLocale}/${t.slug}/tv/draw?mode=${drawMode}`} target="_blank">
                  {tr('product.dash.openDraw')} ↗
                </Link>
              </Button>
            </div>
          </div>

          {drawDone && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-muted-foreground">{tr('product.dash.poolsPublic')}</p>
              {!t.drawRevealed ? (
                <Button
                  size="sm"
                  className="gap-1 bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
                  disabled={busy !== null}
                  title={tr('product.dash.revealHint')}
                  onClick={() => patchTournament({ draw_revealed: true }, tr('product.dash.msg.poolsRevealed'))}
                >
                  <Eye className="h-4 w-4" /> {tr('product.dash.revealPools')}
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  className="gap-1"
                  disabled={busy !== null}
                  onClick={() => patchTournament({ draw_revealed: false }, tr('product.dash.msg.poolsHidden'))}
                >
                  <EyeOff className="h-4 w-4" /> {tr('product.dash.hidePools')}
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Dev control center - owner only */}
      {isOwner && t.devMode && (
        <section className="rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/5 p-5">
          <h2 className="mb-1 flex items-center gap-2 font-bold text-fuchsia-700 dark:text-fuchsia-300">
            <FlaskConical className="h-4 w-4" /> {tr('product.dash.devCenter')}
          </h2>
          <p className="mb-4 text-xs text-muted-foreground">{tr('product.dash.devIntro')}</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <DevButton
              icon={<Users className="h-5 w-5" />}
              label={tr('product.dash.seedTeams')}
              done={seedDone}
              doneLabel={tr('product.dash.seedDone')}
              loading={busy === 'seed-teams'}
              disabled={busy !== null || seedDone}
              onClick={() => post('dev', tr('product.dash.lbl.seed'), { action: 'seed-teams' })}
            />
            <DevButton
              icon={<Dices className="h-5 w-5" />}
              label={tr('product.dash.randomGroupScores')}
              done={groupScoresDone}
              doneLabel={tr('product.dash.groupsComplete')}
              loading={busy === 'random-group-scores'}
              disabled={busy !== null || groupMatches.length === 0 || groupScoresDone}
              onClick={() => post('dev', tr('product.dash.lbl.groupScores'), { action: 'random-group-scores' })}
            />
            <DevButton
              icon={<ListChecks className="h-5 w-5" />}
              label={tr('product.dash.randomFinalsScores')}
              done={finalsScoresDone}
              doneLabel={tr('product.dash.finalsComplete')}
              loading={busy === 'random-knockout-scores'}
              disabled={busy !== null || finalsMatches.length === 0 || finalsScoresDone}
              onClick={() => post('dev', tr('product.dash.lbl.finalsScores'), { action: 'random-knockout-scores' })}
            />
            <DevButton
              icon={<Sparkles className="h-5 w-5" />}
              label={tr('product.dash.simulateAll')}
              primary
              loading={busy === 'simulate'}
              disabled={busy !== null}
              onClick={() => post('dev', tr('product.dash.lbl.simulate'), { action: 'simulate' })}
            />
          </div>
        </section>
      )}

      <Dialog open={confirmReset} onOpenChange={(o) => !o && setConfirmReset(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{tr('product.dash.resetTitle').replace('{name}', t.name)}</DialogTitle>
            <DialogDescription>{tr('product.dash.resetDesc')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmReset(false)} disabled={busy === 'reset'}>
              {tr('product.action.cancel')}
            </Button>
            <Button
              className="bg-red-500 font-bold text-white hover:bg-red-600"
              onClick={() => post('reset', tr('product.dash.lbl.reset'))}
              disabled={busy === 'reset'}
            >
              {busy === 'reset' && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
              {tr('product.dash.reset')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmFinish}
        title={tr('product.dash.finishTitle').replace('{name}', t.name)}
        description={tr('product.dash.finishDesc')}
        confirmLabel={tr('product.dash.finish')}
        destructive={false}
        busy={busy === 'patch'}
        onConfirm={async () => {
          await patchTournament({ status: 'finished' }, tr('product.dash.msg.finished'))
          setConfirmFinish(false)
        }}
        onCancel={() => setConfirmFinish(false)}
      />
    </div>
  )
}

function DevButton({
  icon,
  label,
  loading,
  disabled,
  done = false,
  doneLabel,
  primary = false,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  loading: boolean
  disabled: boolean
  done?: boolean
  doneLabel?: string
  primary?: boolean
  onClick: () => void
}) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'h-auto flex-col items-start gap-2 whitespace-normal rounded-lg border p-4 text-left',
        done
          ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-400/15 hover:text-emerald-700 dark:hover:text-emerald-300'
          : primary
            ? 'border-fuchsia-400/60 bg-fuchsia-500/25 text-foreground hover:bg-fuchsia-500/35 hover:text-foreground'
            : 'border-border bg-card/60 text-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : icon}
      <span className="text-sm font-semibold">{done && doneLabel ? doneLabel : label}</span>
    </Button>
  )
}

function ControlButton({
  icon,
  label,
  done,
  doneLabel,
  loading,
  disabled,
  onClick,
  title,
}: {
  icon: React.ReactNode
  label: string
  done: boolean
  doneLabel: string
  loading: boolean
  disabled: boolean
  onClick: () => void
  title?: string
}) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'h-auto flex-col items-start gap-2 whitespace-normal rounded-lg border p-4 text-left',
        done
          ? 'border-emerald-400/30 bg-emerald-400/5 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-400/10 hover:text-emerald-700 dark:hover:text-emerald-300'
          : 'border-border bg-card hover:bg-muted hover:text-foreground',
      )}
    >
      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : icon}
      <span className="text-sm font-semibold">{done ? doneLabel : label}</span>
    </Button>
  )
}
