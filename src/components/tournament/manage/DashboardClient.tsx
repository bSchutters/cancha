'use client'

import { useState } from 'react'
import { LocaleLink } from '@/components/locale-link'
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
import type { ManageTournament } from '@/lib/tournament/manage-view'

/**
 * Status is informative, not a category you pick: it is derived from the actual
 * progress (data present) and the explicit registration/finished/archived flags.
 */
function statusTag(t: ManageTournament): { label: string; tone: string } {
  if (t.status === 'archived') return { label: 'Archivé', tone: 'bg-muted text-muted-foreground' }
  if (t.status === 'finished') return { label: 'Terminé', tone: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' }
  if (t.matches.some((m) => m.phase === 'knockout')) return { label: 'Phase finale', tone: 'bg-primary/20 text-primary' }
  if (t.matches.some((m) => m.phase === 'group')) return { label: 'En cours', tone: 'bg-primary/20 text-primary' }
  if (t.groups.length > 0) return { label: 'Tirage effectué', tone: 'bg-sky-500/15 text-sky-700 dark:text-sky-300' }
  if (t.status === 'registration_closed') return { label: 'Inscriptions fermées', tone: 'bg-amber-500/15 text-amber-700 dark:text-amber-300' }
  if (t.status === 'registration') return { label: 'Inscriptions ouvertes', tone: 'bg-amber-500/15 text-amber-700 dark:text-amber-300' }
  return { label: 'Brouillon', tone: 'bg-muted text-muted-foreground' }
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
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const [confirmFinish, setConfirmFinish] = useState(false)
  const [offset, setOffset] = useState(initial.schedule.globalOffsetMin)
  const [drawMode, setDrawMode] = useState<'auto' | 'manual'>('auto')
  const t = initial
  const tag = statusTag(t)

  const capacity = t.format.numGroups * t.format.groupSize
  const drawDone = t.groups.length > 0
  const scheduleDone = t.matches.some((m) => m.phase === 'group')
  const knockoutDone = t.matches.some((m) => m.phase === 'knockout')
  // The tournament can only be finished once the final phase exists and every match is played.
  const allMatchesPlayed = knockoutDone && t.matches.every((m) => m.status === 'finished')

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
        toast.error(body?.errors?.[0]?.message ?? 'Erreur')
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
        toast.success(`${label} : OK`)
        setConfirmReset(false)
        router.refresh()
      } else {
        toast.error(data?.error?.message ?? `${label} : erreur`)
      }
    } catch {
      toast.error('Erreur réseau')
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
          <LocaleLink href={`/${t.slug}/tv`} target="_blank" className="text-sm text-muted-foreground underline hover:text-foreground">
            Vue TV ↗
          </LocaleLink>
          <LocaleLink href={`/${t.slug}`} target="_blank" className="text-sm text-muted-foreground underline hover:text-foreground">
            Page publique ↗
          </LocaleLink>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat
          label={t.counts.waitlist > 0 ? `Inscrites (+${t.counts.waitlist} en attente)` : 'Inscrites'}
          value={capacity > 0 ? `${t.counts.active} / ${capacity}` : t.counts.active}
        />
        <Stat label="Confirmées" value={t.counts.confirmed} />
        <Stat label="Payées" value={t.counts.paid} />
        <Stat label="Matchs" value={t.matches.length} />
      </div>

      {/* Control zone */}
      <section className="rounded-xl border border-primary/30 bg-primary/5 p-5">
        <h2 className="mb-1 flex items-center gap-2 font-bold text-primary">Centre de contrôle</h2>
        <p className="mb-4 text-xs text-muted-foreground">
          Déroulez le tournoi étape par étape. Chaque étape se verrouille une fois faite - réinitialisez pour
          recommencer.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <ControlButton
            icon={<Dices className="h-5 w-5" />}
            label="Tirage des poules"
            done={drawDone}
            doneLabel="Tirage fait"
            loading={busy === 'draw'}
            disabled={busy !== null || drawDone}
            onClick={() => post('draw', 'Tirage')}
          />
          <ControlButton
            icon={<CalendarClock className="h-5 w-5" />}
            label="Générer le calendrier"
            done={scheduleDone}
            doneLabel="Calendrier généré"
            loading={busy === 'generate-schedule'}
            disabled={busy !== null || !drawDone || scheduleDone}
            onClick={() => post('generate-schedule', 'Calendrier')}
          />
          <ControlButton
            icon={<Trophy className="h-5 w-5" />}
            label="Phase finale"
            done={knockoutDone}
            doneLabel="Arbre généré"
            loading={busy === 'generate-knockout'}
            disabled={busy !== null || !scheduleDone || knockoutDone}
            onClick={() => post('generate-knockout', 'Phase finale')}
          />
          <ControlButton
            icon={<Flag className="h-5 w-5" />}
            label="Terminer le tournoi"
            done={t.status === 'finished' || t.status === 'archived'}
            doneLabel="Tournoi terminé"
            loading={busy === 'patch'}
            disabled={busy !== null || t.status === 'finished' || t.status === 'archived' || !allMatchesPlayed}
            title={allMatchesPlayed ? undefined : 'Tous les matchs doivent être joués'}
            onClick={() => setConfirmFinish(true)}
          />
          <Button
            variant="ghost"
            onClick={() => setConfirmReset(true)}
            disabled={busy !== null}
            className="h-auto flex-col items-start gap-2 rounded-lg border border-red-500/40 bg-red-500/5 p-4 text-left text-red-700 dark:text-red-300 hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-300"
          >
            <RotateCcw className="h-5 w-5" />
            <span className="text-sm font-semibold">Réinitialiser</span>
          </Button>
        </div>

        {/* Phase actions - status follows automatically; these are the explicit gates. */}
        {['draft', 'registration', 'registration_closed', 'finished', 'archived'].includes(t.status) && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
          {t.status === 'draft' && (
            <Button size="sm" variant="secondary" disabled={busy !== null}
              onClick={() => patchTournament({ status: 'registration' }, 'Inscriptions ouvertes')}>
              Ouvrir les inscriptions
            </Button>
          )}
          {t.status === 'registration' && (
            <Button size="sm" variant="secondary" disabled={busy !== null}
              onClick={() => patchTournament({ status: 'registration_closed' }, 'Inscriptions fermées')}>
              Fermer les inscriptions
            </Button>
          )}
          {t.status === 'registration_closed' && (
            <Button size="sm" variant="secondary" disabled={busy !== null}
              onClick={() => patchTournament({ status: 'registration' }, 'Inscriptions rouvertes')}>
              Rouvrir les inscriptions
            </Button>
          )}
          {t.status === 'finished' && (
            <>
              <Button size="sm" variant="secondary" disabled={busy !== null}
                onClick={() => patchTournament({ status: 'live' }, 'Tournoi rouvert')}>
                Rouvrir le tournoi
              </Button>
              <Button size="sm" variant="ghost" disabled={busy !== null}
                onClick={() => patchTournament({ status: 'archived' }, 'Tournoi archivé')}>
                Archiver
              </Button>
            </>
          )}
          {t.status === 'archived' && (
            <Button size="sm" variant="secondary" disabled={busy !== null}
              onClick={() => patchTournament({ status: 'finished' }, 'Tournoi désarchivé')}>
              Désarchiver
            </Button>
          )}
        </div>
        )}

        {/* Live delay control - the field shows the total currently applied. */}
        <div className="mt-4 border-t border-border pt-4">
          <p className="mb-2 text-sm text-muted-foreground">
            Retard total appliqué : <span className="font-semibold text-foreground">+{t.schedule.globalOffsetMin} min</span>
            <span className="text-muted-foreground"> - décale toutes les heures affichées (TV + public). N’affecte pas la saisie.</span>
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
              onClick={() => patchTournament({ global_offset_min: offset }, 'Retard appliqué')}
            >
              Appliquer
            </Button>
            {offset !== t.schedule.globalOffsetMin && (
              <span className="text-xs text-muted-foreground">→ deviendra +{offset} min</span>
            )}
          </div>
        </div>
      </section>

      {/* TV broadcast & public display */}
      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-1 flex items-center gap-2 font-bold">
          <Tv className="h-4 w-4 text-primary" /> Diffusion TV & affichage public
        </h2>
        <p className="mb-4 text-xs text-muted-foreground">
          Gère les écrans/TV de la salle et choisis les vues affichées sur chacun ; plus le tirage animé et le
          dévoilement des poules au public.
        </p>

        <TvScreensManager tournamentId={t.id} slug={t.slug} initial={t.tvScreens} />

        <div className="mt-6 flex flex-wrap items-end gap-x-10 gap-y-5 border-t border-border pt-5">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-muted-foreground">Tirage au sort (TV)</p>
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
                    {m === 'auto' ? 'Auto' : 'Manuel'}
                  </Button>
                ))}
              </div>
              <Button asChild size="sm" variant="secondary">
                <LocaleLink href={`/${t.slug}/tv/draw?mode=${drawMode}`} target="_blank">
                  Ouvrir le tirage ↗
                </LocaleLink>
              </Button>
            </div>
          </div>

          {drawDone && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-muted-foreground">Poules sur la page publique</p>
              {!t.drawRevealed ? (
                <Button
                  size="sm"
                  className="gap-1 bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
                  disabled={busy !== null}
                  title="Affiche les poules sur la page publique (après l’animation TV)"
                  onClick={() => patchTournament({ draw_revealed: true }, 'Poules dévoilées')}
                >
                  <Eye className="h-4 w-4" /> Dévoiler les poules
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  className="gap-1"
                  disabled={busy !== null}
                  onClick={() => patchTournament({ draw_revealed: false }, 'Poules masquées')}
                >
                  <EyeOff className="h-4 w-4" /> Masquer les poules
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
            <FlaskConical className="h-4 w-4" /> Centre de contrôle dev
          </h2>
          <p className="mb-4 text-xs text-muted-foreground">
            Outils de test (mode développeur). À désactiver en production via la configuration.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <DevButton
              icon={<Users className="h-5 w-5" />}
              label="Seed équipes test"
              done={seedDone}
              doneLabel="Équipes seedées"
              loading={busy === 'seed-teams'}
              disabled={busy !== null || seedDone}
              onClick={() => post('dev', 'Seed équipes', { action: 'seed-teams' })}
            />
            <DevButton
              icon={<Dices className="h-5 w-5" />}
              label="Scores poules aléatoires"
              done={groupScoresDone}
              doneLabel="Poules complètes"
              loading={busy === 'random-group-scores'}
              disabled={busy !== null || groupMatches.length === 0 || groupScoresDone}
              onClick={() => post('dev', 'Scores poules', { action: 'random-group-scores' })}
            />
            <DevButton
              icon={<ListChecks className="h-5 w-5" />}
              label="Scores phase finale aléatoires"
              done={finalsScoresDone}
              doneLabel="Phase finale complète"
              loading={busy === 'random-knockout-scores'}
              disabled={busy !== null || finalsMatches.length === 0 || finalsScoresDone}
              onClick={() => post('dev', 'Scores phase finale', { action: 'random-knockout-scores' })}
            />
            <DevButton
              icon={<Sparkles className="h-5 w-5" />}
              label="Simuler tout le tournoi"
              primary
              loading={busy === 'simulate'}
              disabled={busy !== null}
              onClick={() => post('dev', 'Simulation complète', { action: 'simulate' })}
            />
          </div>
        </section>
      )}

      <Dialog open={confirmReset} onOpenChange={(o) => !o && setConfirmReset(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Réinitialiser « {t.name} » ?</DialogTitle>
            <DialogDescription>
              Tous les matchs seront supprimés, les poules effacées et le statut repassé à « Inscriptions ».
              Cette action est irréversible. Les équipes inscrites sont conservées.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmReset(false)} disabled={busy === 'reset'}>
              Annuler
            </Button>
            <Button
              className="bg-red-500 font-bold text-white hover:bg-red-600"
              onClick={() => post('reset', 'Réinitialisation')}
              disabled={busy === 'reset'}
            >
              {busy === 'reset' && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
              Réinitialiser
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmFinish}
        title={`Terminer « ${t.name} » ?`}
        description="Le tournoi sera marqué comme terminé et les résultats verrouillés. Vous pourrez le rouvrir si besoin."
        confirmLabel="Terminer le tournoi"
        destructive={false}
        busy={busy === 'patch'}
        onConfirm={async () => {
          await patchTournament({ status: 'finished' }, 'Tournoi terminé')
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
