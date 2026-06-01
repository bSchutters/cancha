import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrManager } from '../access'
import { revalidateAfterChangeDynamic, revalidateAfterDeleteDynamic } from '../hooks/revalidateCache'

const sponsorTags = (doc: Record<string, unknown>) => {
  const t = doc.tournament as { slug?: string } | string | undefined
  const slug = typeof t === 'object' && t ? t.slug : undefined
  return slug ? ['tournaments', `tournament-${slug}`] : ['tournaments']
}

export const TournamentSponsors: CollectionConfig = {
  slug: 'tournament-sponsors',
  labels: { singular: 'Sponsor (tournoi)', plural: 'Sponsors (tournoi)' },
  admin: {
    group: 'Tournois',
    useAsTitle: 'name',
    defaultColumns: ['name', 'tournament'],
  },
  access: {
    read: () => true,
    create: isAdminOrManager,
    update: isAdminOrManager,
    delete: isAdmin,
  },
  hooks: {
    afterChange: [revalidateAfterChangeDynamic(sponsorTags)],
    afterDelete: [revalidateAfterDeleteDynamic(sponsorTags)],
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
      label: 'Nom',
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      label: 'Logo',
    },
    {
      name: 'url',
      type: 'text',
      label: 'Site web (optionnel)',
    },
  ],
}
