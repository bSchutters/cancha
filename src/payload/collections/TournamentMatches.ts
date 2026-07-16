import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrManager } from '../access'
import { revalidateAfterChangeDynamic, revalidateAfterDeleteDynamic } from '../hooks/revalidateCache'
import { setTenantFromTournament } from '../hooks/tenantFromTournament'

const matchTags = (doc: Record<string, unknown>) => {
  const t = doc.tournament as { slug?: string } | string | undefined
  const slug = typeof t === 'object' && t ? t.slug : undefined
  return slug ? ['tournaments', `tournament-${slug}`] : ['tournaments']
}

const idOf = (rel: unknown): number | string | undefined => {
  if (rel == null) return undefined
  if (typeof rel === 'object') return (rel as { id?: number | string }).id
  return rel as number | string
}

export const TournamentMatches: CollectionConfig = {
  slug: 'tournament-matches',
  labels: { singular: 'Match (tournoi)', plural: 'Matchs (tournoi)' },
  admin: {
    group: 'Tournois',
    useAsTitle: 'id',
    defaultColumns: ['tournament', 'phase', 'group_label', 'round', 'court', 'scheduled_time', 'status'],
  },
  access: {
    read: () => true,
    create: isAdminOrManager,
    update: isAdminOrManager,
    delete: isAdmin,
  },
  hooks: {
    beforeValidate: [setTenantFromTournament],
    beforeChange: [
      ({ data, req }) => {
        // Stamp traceability + auto-finish when both scores are present.
        const hasScores =
          typeof data?.score_home === 'number' && typeof data?.score_away === 'number'
        if (hasScores) {
          data.status = 'finished'
          data.entered_by = req.user?.id ?? data.entered_by
          data.entered_at = new Date().toISOString()
          // Derive the penalty winner from the shootout score (knockout draws).
          if (
            data.phase !== 'group' &&
            data.score_home === data.score_away &&
            typeof data.penalty_home === 'number' &&
            typeof data.penalty_away === 'number' &&
            data.penalty_home !== data.penalty_away
          ) {
            data.penalty_winner = data.penalty_home > data.penalty_away ? 'home' : 'away'
          }
        }
        return data
      },
    ],
    afterChange: [
      revalidateAfterChangeDynamic(matchTags),
      // Propagate winner/loser onwards (knockout bracket + placement bracket).
      async ({ doc, req }) => {
        if (doc.phase === 'group' || doc.status !== 'finished') return doc
        if (typeof doc.score_home !== 'number' || typeof doc.score_away !== 'number') return doc

        let winner: number | string | undefined
        let loser: number | string | undefined
        if (doc.score_home > doc.score_away) {
          winner = idOf(doc.home_team)
          loser = idOf(doc.away_team)
        } else if (doc.score_away > doc.score_home) {
          winner = idOf(doc.away_team)
          loser = idOf(doc.home_team)
        } else if (doc.penalty_winner === 'home') {
          winner = idOf(doc.home_team)
          loser = idOf(doc.away_team)
        } else if (doc.penalty_winner === 'away') {
          winner = idOf(doc.away_team)
          loser = idOf(doc.home_team)
        }

        const nextMatchId = idOf(doc.next_match)
        if (winner && nextMatchId && doc.next_slot) {
          await req.payload.update({
            collection: 'tournament-matches',
            id: nextMatchId,
            data: { [doc.next_slot === 'home' ? 'home_team' : 'away_team']: winner },
          })
        }
        const loserMatchId = idOf(doc.loser_next_match)
        if (loser && loserMatchId && doc.loser_next_slot) {
          await req.payload.update({
            collection: 'tournament-matches',
            id: loserMatchId,
            data: { [doc.loser_next_slot === 'home' ? 'home_team' : 'away_team']: loser },
          })
        }
        return doc
      },
    ],
    afterDelete: [revalidateAfterDeleteDynamic(matchTags)],
  },
  fields: [
    {
      name: 'tournament',
      type: 'relationship',
      relationTo: 'tournaments',
      required: true,
      label: 'Tournoi',
    },
    {
      name: 'phase',
      type: 'select',
      required: true,
      defaultValue: 'group',
      options: [
        { label: 'Poule', value: 'group' },
        { label: 'Élimination directe', value: 'knockout' },
        { label: 'Classement', value: 'classification' },
      ],
      label: 'Phase',
    },
    {
      name: 'group_label',
      type: 'text',
      label: 'Poule',
      admin: { condition: (data) => data?.phase === 'group' },
    },
    {
      name: 'round',
      type: 'number',
      label: 'Round',
    },
    {
      name: 'bracket_label',
      type: 'text',
      label: 'Tour (8e, Quart, Demi, Finale…)',
      admin: { condition: (data) => data?.phase !== 'group' },
    },
    {
      name: 'scheduled_time',
      type: 'text',
      label: 'Heure (HH:MM)',
      admin: { description: 'Calculée à la génération. Le décalage global est appliqué à l’affichage.' },
    },
    {
      name: 'court',
      type: 'number',
      label: 'Terrain',
    },
    {
      name: 'home_team',
      type: 'relationship',
      relationTo: 'tournament-teams',
      label: 'Équipe domicile',
    },
    {
      name: 'away_team',
      type: 'relationship',
      relationTo: 'tournament-teams',
      label: 'Équipe extérieur',
    },
    {
      name: 'home_source_match',
      type: 'relationship',
      relationTo: 'tournament-matches',
      label: 'Source domicile (vainqueur de…)',
      admin: { condition: (data) => data?.phase !== 'group' },
    },
    {
      name: 'away_source_match',
      type: 'relationship',
      relationTo: 'tournament-matches',
      label: 'Source extérieur (vainqueur de…)',
      admin: { condition: (data) => data?.phase !== 'group' },
    },
    {
      name: 'next_match',
      type: 'relationship',
      relationTo: 'tournament-matches',
      label: 'Match suivant (arbre)',
      admin: { condition: (data) => data?.phase !== 'group' },
    },
    {
      name: 'next_slot',
      type: 'select',
      options: [
        { label: 'Domicile', value: 'home' },
        { label: 'Extérieur', value: 'away' },
      ],
      label: 'Place dans le match suivant',
      admin: { condition: (data) => data?.phase !== 'group' },
    },
    {
      name: 'loser_next_match',
      type: 'relationship',
      relationTo: 'tournament-matches',
      label: 'Match du perdant (petite finale)',
      admin: { condition: (data) => data?.phase !== 'group' },
    },
    {
      name: 'loser_next_slot',
      type: 'select',
      options: [
        { label: 'Domicile', value: 'home' },
        { label: 'Extérieur', value: 'away' },
      ],
      label: 'Place du perdant dans le match suivant',
      admin: { condition: (data) => data?.phase !== 'group' },
    },
    {
      name: 'score_home',
      type: 'number',
      label: 'Score domicile',
    },
    {
      name: 'score_away',
      type: 'number',
      label: 'Score extérieur',
    },
    {
      name: 'set_scores',
      type: 'array',
      label: 'Scores par set',
      labels: { singular: 'Set', plural: 'Sets' },
      admin: {
        description:
          'Détail des jeux par set (sports en sets, ex. padel). Le score du match = nombre de sets gagnés.',
      },
      fields: [
        { name: 'home', type: 'number', label: 'Jeux domicile' },
        { name: 'away', type: 'number', label: 'Jeux extérieur' },
      ],
    },
    {
      name: 'penalty_home',
      type: 'number',
      label: 'Tirs au but - domicile',
      admin: { condition: (data) => data?.phase !== 'group' },
    },
    {
      name: 'penalty_away',
      type: 'number',
      label: 'Tirs au but - extérieur',
      admin: { condition: (data) => data?.phase !== 'group' },
    },
    {
      name: 'penalty_winner',
      type: 'select',
      options: [
        { label: 'Domicile', value: 'home' },
        { label: 'Extérieur', value: 'away' },
      ],
      label: 'Vainqueur aux tirs au but (dérivé)',
      admin: { condition: (data) => data?.phase !== 'group', readOnly: true },
    },
    {
      name: 'fairplay_winner',
      type: 'select',
      defaultValue: 'none',
      options: [
        { label: 'Domicile', value: 'home' },
        { label: 'Extérieur', value: 'away' },
        { label: 'Aucune (0-0)', value: 'none' },
      ],
      label: 'Point fair-play attribué à',
    },
    {
      name: 'referee',
      type: 'relationship',
      relationTo: 'tournament-referees',
      label: 'Arbitre',
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'scheduled',
      options: [
        { label: 'Prévu', value: 'scheduled' },
        { label: 'Terminé', value: 'finished' },
      ],
      label: 'Statut',
    },
    {
      name: 'entered_by',
      type: 'relationship',
      relationTo: 'users',
      label: 'Saisi par',
      admin: { readOnly: true },
    },
    {
      name: 'entered_at',
      type: 'date',
      label: 'Saisi le',
      admin: { readOnly: true },
    },
  ],
}
