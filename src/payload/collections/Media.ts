import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrManager } from '../access'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Media', plural: 'Medias' },
  upload: {
    mimeTypes: ['image/*'],
  },
  access: {
    read: () => true,
    create: isAdminOrManager,
    // Media is a shared pool, not tenant-scoped (see payload.config.ts), so any
    // organizer allowed to update would be allowed to update EVERY organization's
    // logos — including replacing the file. The app never edits a media in place:
    // a new logo is a new upload, then the owning document points at it.
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
    },
  ],
}
