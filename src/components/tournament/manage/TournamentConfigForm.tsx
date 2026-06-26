'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, AlertTriangle } from 'lucide-react'
import { NumberStepper } from '@/components/tournament/NumberStepper'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { uploadMedia, validateImageFile } from '@/lib/tournament/upload-media'
import { estimateFeasibility } from '@/lib/tournament/feasibility'
import type { RankingDepth } from '@/lib/tournament/bracket'
import type { ManageTournament } from '@/lib/tournament/manage-view'
import { useT } from '@/i18n/use-t'
import type { Translate } from '@/i18n'
import { LOCALES, LOCALE_LABELS, DEFAULT_LOCALE, type Locale } from '@/i18n/config'
import { ALL_SPORTS, DEFAULT_SPORT, type SportId } from '@/lib/sport'

/** Returns the first config inconsistency message, or null if the form is valid. */
function validateConfig(s: FormState, t: Translate): string | null {
  if (!s.name.trim()) return t('product.cfg.err.nameRequired')
  // A cleared number input becomes NaN; catch it here with a clear message
  // instead of letting the server reject it generically.
  const numbers: Array<[number, string]> = [
    [s.num_groups, t('product.cfg.vlabel.numGroups')],
    [s.group_size, t('product.cfg.vlabel.groupSize')],
    [s.qualifiers_per_group, t('product.cfg.vlabel.qualifiers')],
    [s.num_courts, t('product.cfg.vlabel.numCourts')],
    [s.match_duration_min, t('product.cfg.vlabel.matchDuration')],
    [s.gap_between_matches_min, t('product.cfg.vlabel.gap')],
  ]
  for (const [value, label] of numbers) {
    if (!Number.isFinite(value)) return t('product.cfg.err.mustBeNumber').replace('{label}', label)
  }
  if (s.num_groups < 1) return t('product.cfg.err.minGroups')
  if (s.group_size < 2) return t('product.cfg.err.minGroupSize')
  if (s.qualifiers_per_group < 1) return t('product.cfg.err.minQualifiers')
  if (s.qualifiers_per_group > s.group_size) return t('product.cfg.err.qualifiersExceed')
  if (s.num_groups % 2 !== 0) return t('product.cfg.err.groupsEven')
  if (s.match_duration_min < 1) return t('product.cfg.err.matchDuration')
  if (s.multi_court && s.num_courts < 1) return t('product.cfg.err.minCourts')
  return null
}

type FormState = {
  name: string
  edition_date: string
  description: string
  manage_locale: Locale
  public_locale: Locale
  sport: SportId
  num_groups: number
  group_size: number
  qualifiers_per_group: number
  ranking_depth: 'full' | 'top_k' | 'qualifiers_only'
  ranking_top_k: number
  multi_court: boolean
  num_courts: number
  court_assignment: 'fixed' | 'random'
  start_time: string
  match_duration_min: number
  finals_match_duration_min: number
  gap_between_matches_min: number
  meal_break_start: string
  meal_break_duration_min: number
  finals_start_time: string
  global_offset_min: number
  payment_iban: string
  payment_amount: number | ''
  payment_communication: string
  venue_name: string
  venue_address: string
  venue_maps_url: string
  practical_info: string
  venue_map: number | null
  referee_assignment: 'manual' | 'random'
  dev_mode: boolean
}

function initialState(t?: ManageTournament): FormState {
  return {
    name: t?.name ?? '',
    edition_date: t?.editionDate ? t.editionDate.slice(0, 10) : '',
    description: t?.description ?? '',
    manage_locale: t?.manageLocale ?? DEFAULT_LOCALE,
    public_locale: t?.publicLocale ?? DEFAULT_LOCALE,
    sport: t?.sport ?? DEFAULT_SPORT,
    num_groups: t?.format.numGroups ?? 4,
    group_size: t?.format.groupSize ?? 4,
    qualifiers_per_group: t?.format.qualifiersPerGroup ?? 2,
    ranking_depth: t?.format.rankingDepth ?? 'full',
    ranking_top_k: t?.format.rankingTopK ?? 8,
    multi_court: t?.courts.multiCourt ?? true,
    num_courts: t?.courts.numCourts ?? 4,
    court_assignment: (t?.courts.assignment as 'fixed' | 'random') ?? 'fixed',
    start_time: t?.schedule.startTime ?? '09:00',
    match_duration_min: t?.schedule.matchDurationMin ?? 15,
    finals_match_duration_min: t?.schedule.finalsMatchDurationMin ?? 0,
    gap_between_matches_min: t?.schedule.gapBetweenMatchesMin ?? 5,
    meal_break_start: t?.schedule.mealBreakStart ?? '',
    meal_break_duration_min: t?.schedule.mealBreakDurationMin ?? 0,
    finals_start_time: t?.schedule.finalsStartTime ?? '',
    global_offset_min: t?.schedule.globalOffsetMin ?? 0,
    payment_iban: t?.payment.iban ?? '',
    payment_amount: t?.payment.amount ?? '',
    payment_communication: t?.payment.communication ?? '',
    venue_name: t?.venue.name ?? '',
    venue_address: t?.venue.address ?? '',
    venue_maps_url: t?.venue.mapsUrl ?? '',
    practical_info: t?.venue.info ?? '',
    venue_map: t?.venue.mapId ?? null,
    referee_assignment: t?.refereeAssignment ?? 'manual',
    dev_mode: t?.devMode ?? false,
  }
}

function Num({
  label,
  value,
  onChange,
  max = 99,
}: {
  label: string
  value: number
  onChange: (n: number) => void
  max?: number
}) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <div>
        <NumberStepper value={value} onChange={onChange} min={0} max={max} />
      </div>
    </div>
  )
}

export function TournamentConfigForm({ initial, isOwner = false }: { initial?: ManageTournament; isOwner?: boolean }) {
  const router = useRouter()
  const t = useT()
  const [s, setS] = useState<FormState>(initialState(initial))
  const [saving, setSaving] = useState(false)
  const [mapFile, setMapFile] = useState<File | null>(null)
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setS((p) => ({ ...p, [key]: value }))

  // Live feasibility estimate of the chosen format (drives the warnings).
  const est = useMemo(() => {
    const depth: RankingDepth =
      s.ranking_depth === 'top_k' ? { topK: s.ranking_top_k } : s.ranking_depth
    try {
      return estimateFeasibility({
        numGroups: s.num_groups,
        groupSize: s.group_size,
        qualifiersPerGroup: s.qualifiers_per_group,
        numCourts: s.num_courts,
        multiCourt: s.multi_court,
        timeParams: {
          startTime: s.start_time || '09:00',
          matchDurationMin: Math.max(1, s.match_duration_min),
          gapBetweenMatchesMin: s.gap_between_matches_min,
        },
        finalsMatchDurationMin: s.finals_match_duration_min || null,
        finalsStartTime: s.finals_start_time || null,
        depth,
      })
    } catch {
      return null
    }
  }, [s])
  const tooLate = est?.endTime != null && est.endTime > '18:30'

  const onPickMap = (file: File | null | undefined) => {
    if (!file) return setMapFile(null)
    const err = validateImageFile(file)
    if (err) {
      toast.error(err)
      return setMapFile(null)
    }
    setMapFile(file)
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const configError = validateConfig(s, t)
    if (configError) {
      toast.error(configError)
      return
    }
    setSaving(true)
    let venueMapId = s.venue_map
    if (mapFile) {
      venueMapId = await uploadMedia(mapFile, 'plan du complexe')
      if (venueMapId == null) {
        toast.error(t('product.cfg.uploadMapFailed'))
        setSaving(false)
        return
      }
    }
    const body = {
      ...s,
      venue_map: venueMapId,
      // Empty date string is rejected by Postgres (timestamp column) - send null.
      edition_date: s.edition_date || null,
      payment_amount: s.payment_amount === '' ? null : Number(s.payment_amount),
      finals_start_time: s.finals_start_time || null,
      // Lunch is handled by the finals start time; the mid-schedule meal break is unused.
      meal_break_start: null,
      meal_break_duration_min: 0,
    }
    try {
      const res = await fetch(initial ? `/api/tournaments/${initial.id}` : '/api/tournaments', {
        method: initial ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (res.ok) {
        const slug = data?.doc?.slug ?? initial?.slug
        toast.success(initial ? t('product.cfg.updated') : t('product.cfg.created'))
        const target = `/${s.manage_locale}/manage/${slug}`
        // Land in the tournament's chosen backoffice language. When that crosses
        // the [lang] segment, a soft navigation would remount the themed layout
        // and make next-themes warn about its anti-flash <script> — so do a full
        // page load on a locale change, and a soft navigation otherwise.
        if (!window.location.pathname.startsWith(`/${s.manage_locale}/`)) {
          window.location.assign(target)
        } else {
          router.push(target)
          router.refresh()
        }
      } else {
        const msg =
          data?.errors?.[0]?.data?.errors?.[0]?.message ??
          data?.errors?.[0]?.message ??
          data?.message ??
          t('product.toast.saveError')
        toast.error(msg)
      }
    } catch {
      toast.error(t('product.toast.network'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="text-xl font-bold">{t('product.cfg.general')}</h2>
        <div className="space-y-1">
          <Label>{t('product.cfg.name')}</Label>
          <Input value={s.name} onChange={(e) => set('name', e.target.value)} required />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>{t('product.cfg.date')}</Label>
            <Input type="date" value={s.edition_date} onChange={(e) => set('edition_date', e.target.value)} />
          </div>
        </div>
        <div className="space-y-1">
          <Label>{t('product.cfg.description')}</Label>
          <Textarea value={s.description} onChange={(e) => set('description', e.target.value)} />
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="text-xl font-bold">{t('product.cfg.format')}</h2>
        <div className="space-y-1 sm:max-w-xs">
          <Label>{t('product.cfg.sport')}</Label>
          <Select value={s.sport} onValueChange={(v) => set('sport', v as SportId)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ALL_SPORTS.map((sp) => (
                <SelectItem key={sp.id} value={sp.id}>
                  {sp.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">{t('product.cfg.sportHint')}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Num label={t('product.cfg.numGroups')} value={s.num_groups} onChange={(n) => set('num_groups', n)} max={16} />
          <Num label={t('product.cfg.groupSize')} value={s.group_size} onChange={(n) => set('group_size', n)} max={12} />
          <Num label={t('product.cfg.qualifiers')} value={s.qualifiers_per_group} onChange={(n) => set('qualifiers_per_group', n)} max={4} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>{t('product.cfg.rankingDepth')}</Label>
            <Select value={s.ranking_depth} onValueChange={(v) => set('ranking_depth', v as FormState['ranking_depth'])}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">{t('product.cfg.rankFull')}</SelectItem>
                <SelectItem value="top_k">{t('product.cfg.rankTopK')}</SelectItem>
                <SelectItem value="qualifiers_only">{t('product.cfg.rankQualifiers')}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{t('product.cfg.rankingHint')}</p>
          </div>
          {s.ranking_depth === 'top_k' && (
            <Num label={t('product.cfg.rankTopKLabel')} value={s.ranking_top_k} onChange={(n) => set('ranking_top_k', n)} max={64} />
          )}
        </div>

        {est && (
          <div
            className={cn(
              'rounded-lg border p-3 text-sm',
              tooLate ? 'border-red-500/40 bg-red-500/10 text-red-800 dark:text-red-200' : 'border-border bg-card text-muted-foreground',
            )}
          >
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
              {tooLate && <AlertTriangle className="h-4 w-4 shrink-0 text-red-700 dark:text-red-300" />}
              <span>{t('product.cfg.estTeams').replace('{count}', String(est.teams))}</span>
              <span>·</span>
              <span>
                {t('product.cfg.estMatches')
                  .replace('{total}', String(est.totalMatches))
                  .replace('{group}', String(est.groupMatches))
                  .replace('{finals}', String(est.finalsMatches))}
              </span>
              {est.endTime && (
                <>
                  <span>·</span>
                  <span className={tooLate ? 'font-bold' : ''}>
                    {t('product.cfg.estEnd').replace('{time}', est.endTime)}
                  </span>
                </>
              )}
            </p>
            {tooLate && <p className="mt-1 text-xs">{t('product.cfg.estTooLate')}</p>}
          </div>
        )}
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="text-xl font-bold">{t('product.cfg.languages')}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>{t('product.settings.manageLocale')}</Label>
            <Select value={s.manage_locale} onValueChange={(v) => set('manage_locale', v as Locale)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOCALES.map((l) => (
                  <SelectItem key={l} value={l}>
                    {LOCALE_LABELS[l]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{t('product.settings.manageLocaleHint')}</p>
          </div>
          <div className="space-y-1">
            <Label>{t('product.settings.publicLocale')}</Label>
            <Select value={s.public_locale} onValueChange={(v) => set('public_locale', v as Locale)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOCALES.map((l) => (
                  <SelectItem key={l} value={l}>
                    {LOCALE_LABELS[l]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{t('product.settings.publicLocaleHint')}</p>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="text-xl font-bold">{t('product.cfg.courts')}</h2>
        <div className="max-w-sm">
          <Switch label={t('product.cfg.multiCourt')} checked={s.multi_court} onChange={(v) => set('multi_court', v)} />
        </div>
        {s.multi_court && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Num label={t('product.cfg.numCourts')} value={s.num_courts} onChange={(n) => set('num_courts', n)} />
            <div className="space-y-1">
              <Label>{t('product.cfg.courtAssignment')}</Label>
              <Select
                value={s.court_assignment}
                onValueChange={(v) => set('court_assignment', v as 'fixed' | 'random')}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">{t('product.cfg.courtFixed')}</SelectItem>
                  <SelectItem value="random">{t('product.cfg.random')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </section>

      <section className="space-y-5 rounded-xl border border-border bg-card p-5">
        <h2 className="text-xl font-bold">{t('product.cfg.schedule')}</h2>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-muted-foreground">{t('product.cfg.matchDurations')}</p>
          <div className="grid items-end gap-x-4 gap-y-5 sm:grid-cols-3">
            <Num label={t('product.cfg.matchDuration')} value={s.match_duration_min} onChange={(n) => set('match_duration_min', n)} max={120} />
            <Num label={t('product.cfg.finalsMatchDuration')} value={s.finals_match_duration_min} onChange={(n) => set('finals_match_duration_min', n)} max={120} />
            <Num label={t('product.cfg.gap')} value={s.gap_between_matches_min} onChange={(n) => set('gap_between_matches_min', n)} max={60} />
          </div>
        </div>

        <div className="space-y-3 border-t border-border pt-4">
          <p className="text-sm font-semibold text-muted-foreground">{t('product.cfg.times')}</p>
          <div className="grid items-start gap-x-4 gap-y-5 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>{t('product.cfg.startTime')}</Label>
              <Input type="time" value={s.start_time} onChange={(e) => set('start_time', e.target.value)} />
              <p className="text-xs text-muted-foreground">{t('product.cfg.startHint')}</p>
            </div>
            <div className="space-y-1">
              <Label>{t('product.cfg.finalsStart')}</Label>
              <Input type="time" value={s.finals_start_time} onChange={(e) => set('finals_start_time', e.target.value)} />
              <p className="text-xs text-muted-foreground">{t('product.cfg.finalsStartHint')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="text-xl font-bold">{t('product.cfg.payment')}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <Label>IBAN</Label>
            <Input value={s.payment_iban} onChange={(e) => set('payment_iban', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>{t('product.cfg.amount')}</Label>
            <Input
              type="number"
              min={0}
              value={s.payment_amount}
              onChange={(e) =>
                set('payment_amount', e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))
              }
            />
          </div>
          <div className="space-y-1">
            <Label>{t('product.cfg.communication')}</Label>
            <Input
              value={s.payment_communication}
              onChange={(e) => set('payment_communication', e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="text-xl font-bold">{t('product.cfg.venue')}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>{t('product.cfg.venueName')}</Label>
            <Input value={s.venue_name} onChange={(e) => set('venue_name', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>{t('product.cfg.mapsUrl')}</Label>
            <Input
              type="url"
              placeholder="https://maps.google.com/..."
              value={s.venue_maps_url}
              onChange={(e) => set('venue_maps_url', e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label>{t('product.cfg.address')}</Label>
          <Textarea value={s.venue_address} onChange={(e) => set('venue_address', e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>{t('product.cfg.venueMap')}</Label>
          <div className="flex items-center gap-4">
            {(mapFile || initial?.venue.mapUrl) && (
              <span className="relative h-20 w-28 shrink-0 overflow-hidden rounded-md border border-border bg-card">
                <Image
                  src={mapFile ? URL.createObjectURL(mapFile) : (initial?.venue.mapUrl as string)}
                  alt={t('product.cfg.mapAlt')}
                  fill
                  sizes="112px"
                  unoptimized
                  className="object-contain"
                />
              </span>
            )}
            <Input
              type="file"
              accept="image/*"
              className="max-w-xs"
              onChange={(e) => onPickMap(e.target.files?.[0])}
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label>{t('product.cfg.practicalInfo')}</Label>
          <Textarea
            placeholder={t('product.cfg.practicalPlaceholder')}
            value={s.practical_info}
            onChange={(e) => set('practical_info', e.target.value)}
          />
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="text-xl font-bold">{t('product.cfg.refereesOptions')}</h2>
        <div className="space-y-1">
          <Label>{t('product.cfg.refereeAssignment')}</Label>
          <Select
            value={s.referee_assignment}
            onValueChange={(v) => set('referee_assignment', v as 'manual' | 'random')}
          >
            <SelectTrigger className="w-full sm:w-72">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manual">{t('product.cfg.refereeManual')}</SelectItem>
              <SelectItem value="random">{t('product.cfg.refereeRandom')}</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">{t('product.cfg.refereeHint')}</p>
        </div>
        {isOwner && (
          <div className="max-w-md">
            <Switch
              label={t('product.cfg.devMode')}
              description={t('product.cfg.devModeDesc')}
              checked={s.dev_mode}
              onChange={(v) => set('dev_mode', v)}
            />
          </div>
        )}
      </section>

      <Button
        type="submit"
        disabled={saving}
        className="bg-primary font-bold text-primary-foreground hover:bg-primary/90"
      >
        {saving && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
        {initial ? t('product.action.save') : t('product.cfg.create')}
      </Button>
    </form>
  )
}
