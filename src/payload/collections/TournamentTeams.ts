import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrManager, isAdminOrManagerField } from '../access'
import { revalidateAfterChangeDynamic, revalidateAfterDeleteDynamic } from '../hooks/revalidateCache'
import { registrationCapacity } from '../hooks/registrationCapacity'
import { setTenantFromTournament } from '../hooks/tenantFromTournament'

// Revalidate the parent tournament's tag. `tournament` may be an id or a populated doc.
const teamTags = (doc: Record<string, unknown>) => {
  const t = doc.tournament as { slug?: string } | string | undefined
  const slug = typeof t === 'object' && t ? t.slug : undefined
  return slug ? ['tournaments', `tournament-${slug}`] : ['tournaments']
}

export const REGISTRATION_STATUSES = [
  { label: 'En attente', value: 'pending' },
  { label: 'Confirmée', value: 'confirmed' },
  { label: 'Liste d’attente', value: 'waitlist' },
  { label: 'Refusée', value: 'rejected' },
] as const

export const PAYMENT_STATUSES = [
  { label: 'Non payé', value: 'unpaid' },
  { label: 'Payé', value: 'paid' },
] as const

export const TournamentTeams: CollectionConfig = {
  slug: 'tournament-teams',
  labels: { singular: 'Équipe (tournoi)', plural: 'Équipes (tournoi)' },
  admin: {
    group: 'Tournois',
    useAsTitle: 'name',
    defaultColumns: ['name', 'tournament', 'registration_status', 'payment_status', 'group_label'],
  },
  access: {
    read: () => true,
    // Public registration goes through /api/tournament/[slug]/register (overrideAccess server-side).
    create: isAdminOrManager,
    update: isAdminOrManager,
    delete: isAdmin,
  },
  hooks: {
    beforeValidate: [setTenantFromTournament],
    afterChange: [registrationCapacity, revalidateAfterChangeDynamic(teamTags)],
    afterDelete: [revalidateAfterDeleteDynamic(teamTags)],
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
      name: 'name',
      type: 'text',
      required: true,
      label: 'Nom de l’équipe',
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      label: 'Logo',
    },
    {
      name: 'representative_email',
      type: 'email',
      required: true,
      label: 'Email du représentant',
      // Personal data: never served to anonymous REST callers (see isAdminOrManagerField).
      access: { read: isAdminOrManagerField },
    },
    {
      name: 'representative_phone',
      type: 'text',
      required: true,
      label: 'Téléphone du représentant',
      access: { read: isAdminOrManagerField },
    },
    {
      name: 'registration_status',
      type: 'select',
      defaultValue: 'pending',
      options: [...REGISTRATION_STATUSES],
      label: 'Statut d’inscription',
    },
    {
      name: 'payment_status',
      type: 'select',
      defaultValue: 'unpaid',
      options: [...PAYMENT_STATUSES],
      label: 'Statut du paiement',
    },
    {
      name: 'group_label',
      type: 'text',
      label: 'Poule (A, B, …)',
      admin: { description: 'Assignée automatiquement au tirage.', readOnly: false },
    },
  ],
}
