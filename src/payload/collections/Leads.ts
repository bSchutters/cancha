import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/payload/access'

export const LEAD_STATUSES = [
  { label: 'Nouveau', value: 'new' },
  { label: 'Contacté', value: 'contacted' },
  { label: 'Converti', value: 'converted' },
  { label: 'Perdu', value: 'lost' },
] as const

/**
 * Inbound demo-request leads. Created (with overrideAccess) by the public
 * /api/demo-request route so a prospect is never lost even if the email fails;
 * managed by the super-admin in the custom /console backoffice. Global (not
 * tenant-scoped) — leads exist before any organization.
 */
export const Leads: CollectionConfig = {
  slug: 'leads',
  labels: { singular: 'Lead', plural: 'Leads' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'organization', 'status', 'createdAt'],
    group: 'Commercial',
  },
  access: {
    // Super-admin only. The public lead form writes via overrideAccess.
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'name', type: 'text', required: true, label: 'Nom' },
    { name: 'email', type: 'email', required: true },
    { name: 'organization', type: 'text', label: 'Organisation' },
    { name: 'sport', type: 'text' },
    { name: 'teams', type: 'text', label: 'Nombre d’équipes' },
    { name: 'message', type: 'textarea' },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      options: [...LEAD_STATUSES],
    },
    {
      name: 'source',
      type: 'text',
      defaultValue: 'demo-request',
      admin: { readOnly: true, description: 'D’où vient le lead.' },
    },
    { name: 'notes', type: 'textarea', label: 'Notes internes' },
  ],
  timestamps: true,
}
