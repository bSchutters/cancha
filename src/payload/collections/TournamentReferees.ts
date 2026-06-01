import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrManager } from '../access'

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
