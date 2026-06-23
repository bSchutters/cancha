'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { LocaleLink } from '@/components/locale-link'
import Image from 'next/image'
import { Star, ChevronLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { PublicTournament } from '@/lib/tournament/public-view'
import { useTournamentLive } from './useTournamentLive'
import { GroupStandings } from './GroupStandings'
import { MatchesByRound, MatchesByLabel, MatchCard } from './MatchList'
import { Bracket } from './Bracket'
import { RegistrationForm } from './RegistrationForm'
import { useFollowedTeam } from './public/useFollowedTeam'
import { TeamPicker } from './public/TeamPicker'
import { MyTeamTab } from './public/MyTeamTab'
import { Podium } from './public/Podium'
import { InfoTab } from './public/InfoTab'

const STATUS_LABEL: Record<string, string> = {
  registration: 'Inscriptions ouvertes',
  registration_closed: 'Inscriptions fermées',
  draw_done: 'Poules constituées',
  live: 'En cours',
  finished: 'Terminé',
  archived: 'Archivé',
}

export function TournamentView({
  slug,
  initial,
  org,
}: {
  slug: string
  initial: PublicTournament
  org?: { name: string; logoUrl: string | null }
}) {
  const data = useTournamentLive(slug, initial)
  const searchParams = useSearchParams()
  const [followed, setFollowed] = useFollowedTeam(slug)
  const [pickerOpen, setPickerOpen] = useState(false)

  // Right after the draw, pools stay hidden from the public until revealed
  // (so the TV reveal ceremony isn't spoiled). Always shown once live/finished.
  const poolsRevealed = data.status !== 'draw_done' || data.drawRevealed
  const hasGroups = data.groups.length > 0 && poolsRevealed
  const hasKnockout = data.knockoutMatches.length > 0
  const hasGroupCalendar = data.groupMatches.length > 0
  const finalsCalendar = [...data.knockoutMatches, ...data.classificationMatches]
  const hasAnyCalendar = hasGroupCalendar || finalsCalendar.length > 0
  const isLanding = data.status === 'registration' || data.status === 'registration_closed'
  const finished = data.status === 'finished' || data.status === 'archived'
  const followedTeam = followed ? data.teams.find((t) => String(t.id) === followed) : undefined
  const hasInfo = Boolean(
    (data.venue && (data.venue.name || data.venue.address || data.venue.mapsUrl || data.venue.mapUrl || data.venue.info)) ||
      data.sponsors.length > 0,
  )

  const tabs = [
    ...(finished ? [{ key: 'results', label: 'Résultats' }] : []),
    ...(hasGroups ? [{ key: 'pools', label: 'Poules' }] : []),
    ...(hasKnockout ? [{ key: 'bracket', label: 'Arbre' }] : []),
    ...(hasAnyCalendar ? [{ key: 'calendar', label: 'Calendrier' }] : []),
    { key: 'teams', label: 'Équipes' },
    ...(hasInfo ? [{ key: 'info', label: 'Infos' }] : []),
    { key: 'mine', label: 'Mon équipe' },
  ]
  const [tab, setTab] = useState(() => searchParams.get('tab') ?? (finished ? 'results' : 'pools'))
  const activeTab = tabs.find((t) => t.key === tab) ? tab : tabs[0]?.key

  // Persist the active tab in the URL (shareable / restored on back) without a navigation.
  const selectTab = (key: string) => {
    setTab(key)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('tab', key)
      window.history.replaceState(null, '', url)
    }
  }

  const follow = (id: string | null) => {
    setFollowed(id)
    setPickerOpen(false)
    if (id) selectTab('mine')
  }

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16">
      {/* Sticky header (+ tabs) */}
      <div className="sticky top-0 z-30 -mx-4 border-b border-border bg-background/95 px-4 backdrop-blur">
        <div className="py-3">
          <LocaleLink href="/" className="mb-1 inline-flex items-center text-xs text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-3.5 w-3.5" /> Tous les tournois
          </LocaleLink>
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              {org?.logoUrl && (
                <span className="relative h-9 w-9 shrink-0 sm:h-10 sm:w-10">
                  <Image
                    src={org.logoUrl}
                    alt={org.name}
                    fill
                    sizes="40px"
                    unoptimized
                    className="object-contain"
                  />
                </span>
              )}
              <div className="min-w-0">
              <h1 className="truncate text-xl font-bold sm:text-2xl">{data.name}</h1>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                {data.status === 'live' && (
                  <span className="flex items-center gap-1 text-primary">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                    </span>
                    Direct
                  </span>
                )}
                <Badge variant="secondary">{STATUS_LABEL[data.status] ?? data.status}</Badge>
              </div>
              </div>
            </div>
            {/* Following a team only makes sense once there are matches to track,
                not during registration. */}
            {!isLanding && (
              <Button
                variant="ghost"
                onClick={() => (followedTeam ? selectTab('mine') : setPickerOpen(true))}
                className="h-auto shrink-0 rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/20 hover:text-primary dark:hover:bg-primary/20 dark:hover:text-primary"
              >
                {followedTeam ? (
                  <>
                    {followedTeam.logoUrl && (
                      <span className="relative h-5 w-5 shrink-0">
                        <Image src={followedTeam.logoUrl} alt={followedTeam.name} fill sizes="20px" unoptimized className="object-contain" />
                      </span>
                    )}
                    <span className="max-w-[6rem] truncate">{followedTeam.name}</span>
                  </>
                ) : (
                  <>
                    <Star className="h-4 w-4" /> <span className="hidden sm:inline">Suivre mon équipe</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {!isLanding && (
          <nav className="flex gap-1 overflow-x-auto pb-2">
            {tabs.map((t) => (
              <Button
                key={t.key}
                variant="ghost"
                onClick={() => selectTab(t.key)}
                className={cn(
                  'h-auto whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-normal',
                  activeTab === t.key
                    ? 'bg-primary font-semibold text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                )}
              >
                {t.label}
              </Button>
            ))}
          </nav>
        )}
      </div>

      {/* Registration landing */}
      {isLanding ? (
        <div className="mt-6 space-y-8">
          {data.description && <p className="text-muted-foreground">{data.description}</p>}
          <RegistrationForm
            slug={slug}
            payment={data.payment}
            closed={data.status === 'registration_closed'}
          />
          {data.teams.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-bold">Équipes inscrites ({data.teams.length})</h2>
              <TeamGrid teams={data.teams} />
            </section>
          )}
        </div>
      ) : (
        <div className="mt-6">
          {activeTab === 'results' && finished && <Podium data={data} />}

          {activeTab === 'mine' &&
            (followed ? (
              <MyTeamTab data={data} teamId={followed} poolsRevealed={poolsRevealed} onChange={() => setPickerOpen(true)} />
            ) : (
              <div className="rounded-xl border border-border bg-card p-8 text-center">
                <Star className="mx-auto mb-3 h-8 w-8 text-primary" />
                <p className="font-semibold">Suivez votre équipe</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Choisissez une équipe pour voir son prochain match, son classement et ses résultats en un coup d&apos;œil.
                </p>
                <Button
                  onClick={() => setPickerOpen(true)}
                  className="mt-4 rounded-md bg-primary text-sm font-bold text-primary-foreground hover:bg-primary/90"
                >
                  Choisir mon équipe
                </Button>
              </div>
            ))}

          {activeTab === 'pools' && hasGroups && (
            <GroupStandings groups={data.groups} qualifiersPerGroup={data.format.qualifiersPerGroup} />
          )}

          {activeTab === 'bracket' && hasKnockout && (
            <div className="space-y-8">
              <Bracket matches={data.knockoutMatches} />
              {data.classificationMatches.length > 0 && (
                <section>
                  <h3 className="mb-3 text-lg font-bold">Matchs de classement</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {data.classificationMatches.map((m) => (
                      <MatchCard key={String(m.id)} match={m} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

          {activeTab === 'calendar' &&
            (hasAnyCalendar ? (
              <div className="space-y-8">
                {hasGroupCalendar && <MatchesByRound matches={data.groupMatches} />}
                {finalsCalendar.length > 0 && <MatchesByLabel matches={finalsCalendar} />}
              </div>
            ) : (
              <p className="text-muted-foreground">Le calendrier sera publié prochainement.</p>
            ))}

          {activeTab === 'teams' && (
            <div>
              <p className="mb-3 text-sm text-muted-foreground">{data.teams.length} équipe(s) inscrite(s)</p>
              <TeamGrid teams={data.teams} />
            </div>
          )}

          {activeTab === 'info' && hasInfo && <InfoTab data={data} />}
        </div>
      )}

      {pickerOpen && (
        <TeamPicker teams={data.teams} current={followed} onSelect={follow} onClose={() => setPickerOpen(false)} />
      )}
    </main>
  )
}

function TeamGrid({
  teams,
  onPick,
}: {
  teams: PublicTournament['teams']
  onPick?: (id: string) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {teams.map((t) => {
        const inner = (
          <>
            {t.logoUrl && (
              <span className="relative h-6 w-6 shrink-0">
                <Image src={t.logoUrl} alt={t.name} fill sizes="24px" unoptimized className="object-contain" />
              </span>
            )}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm">{t.name}</span>
              {t.status === 'pending' && (
                <span className="text-[10px] font-medium text-amber-700 dark:text-amber-300/90">En attente de validation</span>
              )}
              {t.status === 'waitlist' && (
                <span className="text-[10px] font-medium text-sky-700 dark:text-sky-300/90">Liste d&apos;attente</span>
              )}
            </span>
          </>
        )
        return onPick ? (
          <Button
            key={String(t.id)}
            variant="ghost"
            onClick={() => onPick(String(t.id))}
            className="h-auto justify-start gap-2 rounded-lg border border-border bg-card p-2 text-left font-normal hover:bg-muted hover:text-foreground"
          >
            {inner}
          </Button>
        ) : (
          <div key={String(t.id)} className="flex items-center gap-2 rounded-lg border border-border bg-card p-2">
            {inner}
          </div>
        )
      })}
    </div>
  )
}
