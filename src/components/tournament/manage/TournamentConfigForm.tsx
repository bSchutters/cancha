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

/** Returns the first config inconsistency message, or null if the form is valid. */
function validateConfig(s: FormState): string | null {
  if (!s.name.trim()) return 'Le nom du tournoi est obligatoire.'
  // A cleared number input becomes NaN; catch it here with a clear message
  // instead of letting the server reject it generically.
  const numbers: Array<[number, string]> = [
    [s.num_groups, 'Nombre de poules'],
    [s.group_size, 'Équipes par poule'],
    [s.qualifiers_per_group, 'Qualifiés par poule'],
    [s.num_courts, 'Nombre de terrains'],
    [s.match_duration_min, 'Durée d’un match'],
    [s.gap_between_matches_min, 'Pause entre matchs'],
  ]
  for (const [value, label] of numbers) {
    if (!Number.isFinite(value)) return `Le champ « ${label} » doit être un nombre.`
  }
  if (s.num_groups < 1) return 'Il faut au moins 1 poule.'
  if (s.group_size < 2) return 'Une poule doit compter au moins 2 équipes.'
  if (s.qualifiers_per_group < 1) return 'Il faut au moins 1 qualifié par poule.'
  if (s.qualifiers_per_group > s.group_size) return 'Le nombre de qualifiés ne peut pas dépasser la taille de la poule.'
  if (s.num_groups % 2 !== 0) return 'Le nombre de poules doit être pair (croisement entre poules).'
  if (s.match_duration_min < 1) return 'La durée d’un match doit être supérieure à 0.'
  if (s.multi_court && s.num_courts < 1) return 'Avec plusieurs terrains, indiquez au moins 1 terrain.'
  return null
}

type FormState = {
  name: string
  edition_date: string
  description: string
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
    const configError = validateConfig(s)
    if (configError) {
      toast.error(configError)
      return
    }
    setSaving(true)
    let venueMapId = s.venue_map
    if (mapFile) {
      venueMapId = await uploadMedia(mapFile, 'plan du complexe')
      if (venueMapId == null) {
        toast.error('Échec de l’upload du plan')
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
        toast.success(initial ? 'Tournoi mis à jour' : 'Tournoi créé')
        router.push(`/manage/${slug}`)
        router.refresh()
      } else {
        const msg =
          data?.errors?.[0]?.data?.errors?.[0]?.message ??
          data?.errors?.[0]?.message ??
          data?.message ??
          'Erreur lors de l’enregistrement'
        toast.error(msg)
      }
    } catch {
      toast.error('Erreur réseau')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="text-xl font-bold">Général</h2>
        <div className="space-y-1">
          <Label>Nom du tournoi</Label>
          <Input value={s.name} onChange={(e) => set('name', e.target.value)} required />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>Date</Label>
            <Input type="date" value={s.edition_date} onChange={(e) => set('edition_date', e.target.value)} />
          </div>
        </div>
        <div className="space-y-1">
          <Label>Description</Label>
          <Textarea value={s.description} onChange={(e) => set('description', e.target.value)} />
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="text-xl font-bold">Format</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Num label="Nombre de poules (pair)" value={s.num_groups} onChange={(n) => set('num_groups', n)} max={16} />
          <Num label="Équipes par poule" value={s.group_size} onChange={(n) => set('group_size', n)} max={12} />
          <Num label="Qualifiés / poule" value={s.qualifiers_per_group} onChange={(n) => set('qualifiers_per_group', n)} max={4} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>Classement final</Label>
            <Select value={s.ranking_depth} onValueChange={(v) => set('ranking_depth', v as FormState['ranking_depth'])}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Classer toutes les équipes</SelectItem>
                <SelectItem value="top_k">Classer seulement le top N</SelectItem>
                <SelectItem value="qualifiers_only">Seulement les qualifiés</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              « Tout classer » donne une place exacte à chaque équipe (plus de matchs de placement).
            </p>
          </div>
          {s.ranking_depth === 'top_k' && (
            <Num label="Top N à classer" value={s.ranking_top_k} onChange={(n) => set('ranking_top_k', n)} max={64} />
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
              <span>{est.teams} équipes</span>
              <span>·</span>
              <span>{est.totalMatches} matchs ({est.groupMatches} poules + {est.finalsMatches} finales)</span>
              {est.endTime && (
                <>
                  <span>·</span>
                  <span className={tooLate ? 'font-bold' : ''}>fin estimée ~{est.endTime}</span>
                </>
              )}
            </p>
            {tooLate && (
              <p className="mt-1 text-xs">
                Journée très longue : ajoutez des terrains, réduisez la profondeur de classement, ou avancez l’heure de début.
              </p>
            )}
          </div>
        )}
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="text-xl font-bold">Terrains</h2>
        <div className="max-w-sm">
          <Switch label="Plusieurs terrains" checked={s.multi_court} onChange={(v) => set('multi_court', v)} />
        </div>
        {s.multi_court && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Num label="Nombre de terrains" value={s.num_courts} onChange={(n) => set('num_courts', n)} />
            <div className="space-y-1">
              <Label>Affectation poule ↔ terrain</Label>
              <Select
                value={s.court_assignment}
                onValueChange={(v) => set('court_assignment', v as 'fixed' | 'random')}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Poule fixée sur un terrain</SelectItem>
                  <SelectItem value="random">Aléatoire</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </section>

      <section className="space-y-5 rounded-xl border border-border bg-card p-5">
        <h2 className="text-xl font-bold">Calendrier</h2>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-muted-foreground">Durées des matchs</p>
          <div className="grid items-end gap-x-4 gap-y-5 sm:grid-cols-3">
            <Num label="Durée match (min)" value={s.match_duration_min} onChange={(n) => set('match_duration_min', n)} max={120} />
            <Num label="Durée match - phase finale (min)" value={s.finals_match_duration_min} onChange={(n) => set('finals_match_duration_min', n)} max={120} />
            <Num label="Inter-match (min)" value={s.gap_between_matches_min} onChange={(n) => set('gap_between_matches_min', n)} max={60} />
          </div>
        </div>

        <div className="space-y-3 border-t border-border pt-4">
          <p className="text-sm font-semibold text-muted-foreground">Horaires</p>
          <div className="grid items-start gap-x-4 gap-y-5 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Heure de début</Label>
              <Input type="time" value={s.start_time} onChange={(e) => set('start_time', e.target.value)} />
              <p className="text-xs text-muted-foreground">Coup d’envoi du 1er match de poule.</p>
            </div>
            <div className="space-y-1">
              <Label>Reprise phase finale (déjeuner)</Label>
              <Input type="time" value={s.finals_start_time} onChange={(e) => set('finals_start_time', e.target.value)} />
              <p className="text-xs text-muted-foreground">
                Heure des quarts après la pause déjeuner (ex. 13:30). Vide = enchaîne directement après les poules.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="text-xl font-bold">Paiement</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <Label>IBAN</Label>
            <Input value={s.payment_iban} onChange={(e) => set('payment_iban', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Montant (€)</Label>
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
            <Label>Communication</Label>
            <Input
              value={s.payment_communication}
              onChange={(e) => set('payment_communication', e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="text-xl font-bold">Lieu & infos pratiques</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>Nom du complexe</Label>
            <Input value={s.venue_name} onChange={(e) => set('venue_name', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Lien itinéraire (Google Maps)</Label>
            <Input
              type="url"
              placeholder="https://maps.google.com/..."
              value={s.venue_maps_url}
              onChange={(e) => set('venue_maps_url', e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label>Adresse</Label>
          <Textarea value={s.venue_address} onChange={(e) => set('venue_address', e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Plan du complexe</Label>
          <div className="flex items-center gap-4">
            {(mapFile || initial?.venue.mapUrl) && (
              <span className="relative h-20 w-28 shrink-0 overflow-hidden rounded-md border border-border bg-card">
                <Image
                  src={mapFile ? URL.createObjectURL(mapFile) : (initial?.venue.mapUrl as string)}
                  alt="Plan"
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
          <Label>Infos pratiques</Label>
          <Textarea
            placeholder="Parking, buvette, vestiaires…"
            value={s.practical_info}
            onChange={(e) => set('practical_info', e.target.value)}
          />
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="text-xl font-bold">Arbitres & options</h2>
        <div className="space-y-1">
          <Label>Affectation des arbitres</Label>
          <Select
            value={s.referee_assignment}
            onValueChange={(v) => set('referee_assignment', v as 'manual' | 'random')}
          >
            <SelectTrigger className="w-full sm:w-72">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manual">Manuelle</SelectItem>
              <SelectItem value="random">Aléatoire (auto à la génération)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Reste modifiable par match dans la saisie des scores.</p>
        </div>
        {isOwner && (
          <div className="max-w-md">
            <Switch
              label="Mode développeur"
              description="Centre de contrôle de test (seed, scores aléatoires, simulation). Réservé au propriétaire."
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
        {initial ? 'Enregistrer' : 'Créer le tournoi'}
      </Button>
    </form>
  )
}
