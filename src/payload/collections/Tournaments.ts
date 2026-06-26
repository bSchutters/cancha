import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrManager, isAdminField } from '../access'
import { revalidateAfterChangeDynamic, revalidateAfterDeleteDynamic } from '../hooks/revalidateCache'
import { LOCALES, LOCALE_LABELS, DEFAULT_LOCALE } from '@/i18n/config'
import { ALL_SPORTS, DEFAULT_SPORT } from '@/lib/sport'

const tournamentTags = (doc: Record<string, unknown>) => ['tournaments', `tournament-${doc.slug}`]

// Slugs become the first path segment under a tenant host (asturiana.cancha.be/{slug}).
// A slug equal to a locale code (fr/nl/en) would collide with the localized routes,
// so those values are reserved.
const RESERVED_SLUGS = new Set<string>(LOCALES)

const LOCALE_OPTIONS = LOCALES.map((l) => ({ label: LOCALE_LABELS[l], value: l }))
const SPORT_OPTIONS = ALL_SPORTS.map((s) => ({ label: s.label, value: s.id }))

export const TOURNAMENT_STATUSES = [
  { label: 'Brouillon', value: 'draft' },
  { label: 'Inscriptions ouvertes', value: 'registration' },
  { label: 'Inscriptions fermées', value: 'registration_closed' },
  { label: 'Tirage effectué', value: 'draw_done' },
  { label: 'En cours', value: 'live' },
  { label: 'Terminé', value: 'finished' },
  { label: 'Archivé', value: 'archived' },
] as const

export const Tournaments: CollectionConfig = {
  slug: 'tournaments',
  labels: { singular: 'Tournoi', plural: 'Tournois' },
  admin: {
    group: 'Tournois',
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'status', 'edition_date'],
  },
  access: {
    read: () => true,
    create: isAdminOrManager,
    update: isAdminOrManager,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [
      async ({ data, req, originalDoc }) => {
        // A single tournament can be "live" at a time.
        if (data?.status === 'live') {
          await req.payload.update({
            collection: 'tournaments',
            where: {
              and: [
                { status: { equals: 'live' } },
                ...(originalDoc?.id ? [{ id: { not_equals: originalDoc.id } }] : []),
              ],
            },
            data: { status: 'finished' },
          })
        }
        return data
      },
    ],
    afterChange: [revalidateAfterChangeDynamic(tournamentTags)],
    afterDelete: [revalidateAfterDeleteDynamic(tournamentTags)],
  },
  fields: [
    {
      name: 'actions',
      type: 'ui',
      admin: {
        components: {
          Field: '@/payload/components/TournamentActions',
        },
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Nom du tournoi',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Slug (URL)',
      admin: { description: 'Identifiant d’URL : cup.udasturiana.be/{slug}' },
      validate: (value: unknown) =>
        typeof value === 'string' && RESERVED_SLUGS.has(value)
          ? `« ${value} » est réservé (code de langue). Choisissez un autre slug.`
          : true,
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            const source = (value || data?.name || '') as string
            return source
              .toString()
              .toLowerCase()
              .normalize('NFD')
              .replace(/[̀-ͯ]/g, '')
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-+|-+$/g, '')
          },
        ],
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [...TOURNAMENT_STATUSES],
      label: 'Statut',
    },
    {
      name: 'edition_date',
      type: 'date',
      label: 'Date du tournoi',
    },
    {
      name: 'draw_revealed',
      type: 'checkbox',
      defaultValue: false,
      label: 'Poules dévoilées au public',
      admin: {
        description:
          'Tant que décoché, les poules restent masquées sur la page publique après le tirage (le temps de l’animation TV). Se gère depuis la console.',
      },
    },
    {
      name: 'visual',
      type: 'upload',
      relationTo: 'media',
      label: 'Affiche / visuel',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
    },
    {
      type: 'collapsible',
      label: 'Format',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'sport',
          type: 'select',
          defaultValue: DEFAULT_SPORT,
          options: SPORT_OPTIONS,
          label: 'Sport',
          // Chosen at creation, then locked: changing the sport on an existing
          // tournament would rewrite its scoring rules. Managers can set it on
          // create but not update it; only a super-admin can fix it afterwards.
          access: { update: isAdminField },
          admin: { description: 'Détermine les règles de score et de classement. Défini à la création.' },
        },
        {
          name: 'num_groups',
          type: 'number',
          required: true,
          defaultValue: 4,
          min: 1,
          label: 'Nombre de poules',
        },
        {
          name: 'group_size',
          type: 'number',
          required: true,
          defaultValue: 4,
          min: 2,
          label: 'Équipes par poule (cible)',
        },
        {
          name: 'qualifiers_per_group',
          type: 'number',
          required: true,
          defaultValue: 2,
          min: 1,
          max: 4,
          label: 'Qualifiés par poule (phase finale)',
        },
        {
          name: 'ranking_depth',
          type: 'select',
          defaultValue: 'full',
          options: [
            { label: 'Classer toutes les équipes', value: 'full' },
            { label: 'Classer seulement le top N', value: 'top_k' },
            { label: 'Seulement les qualifiés', value: 'qualifiers_only' },
          ],
          label: 'Profondeur du classement final',
        },
        {
          name: 'ranking_top_k',
          type: 'number',
          defaultValue: 8,
          min: 1,
          label: 'Top N à classer exactement',
          admin: { condition: (data) => data?.ranking_depth === 'top_k' },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Langues',
      admin: {
        initCollapsed: true,
        description: 'Langue par défaut du backoffice et du site public POUR CE TOURNOI (réglable aussi dans l’onglet Configuration).',
      },
      fields: [
        {
          name: 'manage_locale',
          type: 'select',
          label: 'Langue du backoffice',
          defaultValue: DEFAULT_LOCALE,
          options: LOCALE_OPTIONS,
          admin: { description: 'Langue dans laquelle ce tournoi s’ouvre en gestion (/manage).' },
        },
        {
          name: 'public_locale',
          type: 'select',
          label: 'Langue du site public',
          defaultValue: DEFAULT_LOCALE,
          options: LOCALE_OPTIONS,
          admin: { description: 'Langue par défaut des pages publiques de ce tournoi.' },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Terrains',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'multi_court',
          type: 'checkbox',
          defaultValue: true,
          label: 'Plusieurs terrains',
        },
        {
          name: 'num_courts',
          type: 'number',
          defaultValue: 4,
          min: 1,
          label: 'Nombre de terrains',
          admin: { condition: (data) => Boolean(data?.multi_court) },
        },
        {
          name: 'court_assignment',
          type: 'select',
          defaultValue: 'fixed',
          options: [
            { label: 'Poule fixée sur un terrain', value: 'fixed' },
            { label: 'Aléatoire', value: 'random' },
          ],
          label: 'Affectation poule ↔ terrain',
          admin: { condition: (data) => Boolean(data?.multi_court) },
        },
      ],
    },
    {
      name: 'referee_assignment',
      type: 'select',
      defaultValue: 'manual',
      options: [
        { label: 'Manuelle', value: 'manual' },
        { label: 'Aléatoire (auto à la génération)', value: 'random' },
      ],
      label: 'Affectation des arbitres',
      admin: { description: 'En mode aléatoire, les arbitres sont affectés à la génération du calendrier. L’affectation reste modifiable par match.' },
    },
    {
      type: 'collapsible',
      label: 'Calendrier',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'start_time',
          type: 'text',
          defaultValue: '09:00',
          label: 'Heure de début (HH:MM)',
        },
        {
          name: 'match_duration_min',
          type: 'number',
          defaultValue: 15,
          min: 1,
          label: 'Durée d’un match (min)',
        },
        {
          name: 'finals_match_duration_min',
          type: 'number',
          min: 0,
          label: 'Durée d’un match en phase finale (min, optionnel)',
          admin: { description: 'Laisser vide pour utiliser la même durée que les poules.' },
        },
        {
          name: 'gap_between_matches_min',
          type: 'number',
          defaultValue: 5,
          min: 0,
          label: 'Temps entre matchs (min)',
        },
        {
          name: 'finals_start_time',
          type: 'text',
          label: 'Heure de reprise - phase finale (HH:MM, optionnel)',
          admin: {
            description:
              'Heure des quarts après la pause déjeuner. Laisser vide pour enchaîner directement après les poules.',
          },
        },
        {
          name: 'meal_break_start',
          type: 'text',
          label: 'Début pause repas (HH:MM, optionnel)',
        },
        {
          name: 'meal_break_duration_min',
          type: 'number',
          defaultValue: 0,
          min: 0,
          label: 'Durée pause repas (min)',
        },
        {
          name: 'global_offset_min',
          type: 'number',
          defaultValue: 0,
          label: 'Décalage horaire global (min, affichage)',
          admin: { description: 'Décale toutes les heures affichées (retard). N’affecte pas la saisie.' },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Paiement',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'payment_iban',
          type: 'text',
          label: 'IBAN',
        },
        {
          name: 'payment_amount',
          type: 'number',
          label: 'Montant des frais (€)',
        },
        {
          name: 'payment_communication',
          type: 'text',
          label: 'Communication',
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Lieu & infos pratiques',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'venue_name',
          type: 'text',
          label: 'Nom du complexe',
        },
        {
          name: 'venue_address',
          type: 'textarea',
          label: 'Adresse',
        },
        {
          name: 'venue_maps_url',
          type: 'text',
          label: 'Lien itinéraire (Google Maps)',
          admin: { description: 'Affiche un bouton « Itinéraire » sur la page publique.' },
        },
        {
          name: 'venue_map',
          type: 'upload',
          relationTo: 'media',
          label: 'Plan du complexe',
        },
        {
          name: 'practical_info',
          type: 'textarea',
          label: 'Infos pratiques',
          admin: { description: 'Parking, buvette, vestiaires… Affiché dans l’onglet Infos.' },
        },
      ],
    },
    {
      name: 'tv_screens',
      type: 'array',
      label: 'Écrans TV',
      admin: {
        description: 'Chaque écran/TV de la salle et les vues qu’il affiche (rotation si plusieurs vues).',
      },
      fields: [
        { name: 'name', type: 'text', label: 'Nom de l’écran' },
        {
          name: 'views',
          type: 'select',
          hasMany: true,
          label: 'Vues affichées',
          options: [
            { label: 'Prochains matchs', value: 'prochains' },
            { label: 'Programme', value: 'programme' },
            { label: 'Classements', value: 'classements' },
            { label: 'Arbre', value: 'arbre' },
          ],
        },
      ],
    },
    {
      name: 'dev_mode',
      type: 'checkbox',
      defaultValue: false,
      label: 'Mode développeur (centre de contrôle de test)',
      admin: { description: 'Active un panneau de test dans la console (seed d’équipes, scores aléatoires, simulation). À désactiver en production.' },
    },
    {
      name: 'fairplay_winner_team',
      type: 'relationship',
      relationTo: 'tournament-teams',
      label: 'Vainqueur du trophée fair-play',
      admin: {
        description: 'Renseigné à la fin du tournoi (annonce). Reste privé pendant le tournoi.',
        condition: (data) => data?.status === 'finished' || data?.status === 'archived',
      },
    },
  ],
}
