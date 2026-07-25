import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrManager, isAdminOrManagerField } from '../access'
import { setTenantFromTournament } from '../hooks/tenantFromTournament'

export const TournamentReferees: CollectionConfig = {
  slug: 'tournament-referees',
  labels: { singular: 'Arbitre (tournoi)', plural: 'Arbitres (tournoi)' },
  admin: {
    group: 'Tournois',
    useAsTitle: 'name',
    defaultColumns: ['name', 'contact', 'tournament'],
  },
  access: {
    read: () => true,
    create: isAdminOrManager,
    update: isAdminOrManager,
    delete: isAdmin,
  },
  hooks: {
    beforeValidate: [setTenantFromTournament],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Nom',
    },
    {
      name: 'contact',
      type: 'text',
      label: 'Contact (tel / email)',
      // Personal data: the public pages only ever show a referee's name.
      access: { read: isAdminOrManagerField },
    },
    {
      name: 'tournament',
      type: 'relationship',
      relationTo: 'tournaments',
      label: 'Tournoi (optionnel)',
      admin: { description: 'Laisser vide pour une liste réutilisable d’une édition à l’autre.' },
    },
  ],
}
