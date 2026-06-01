import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access'

/**
 * Tenant collection: one organization (TO) per row. Tournaments and their
 * teams/matches/sponsors/referees belong to an organization (tenant field added
 * by the multi-tenant plugin). Created by the platform super-admin (invite-only
 * onboarding for now). Branding + host fields are used in later phases.
 */
export const Organizations: CollectionConfig = {
  slug: 'organizations',
  labels: { singular: 'Organisation', plural: 'Organisations' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'subdomain', 'custom_domain'],
    group: 'Plateforme',
  },
  access: {
    // Public read: needed to resolve a tenant by host and to expose its branding.
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: "Nom de l'organisation",
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: 'Slug',
      admin: { description: 'Identifiant court, unique (a-z, 0-9, tirets).' },
    },
    {
      type: 'collapsible',
      label: 'Diffusion (hôtes)',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'subdomain',
          type: 'text',
          unique: true,
          index: true,
          label: 'Sous-domaine',
          admin: { description: 'ex. "asturiana" pour asturiana.cupgenerator.app' },
        },
        {
          name: 'custom_domain',
          type: 'text',
          unique: true,
          index: true,
          label: 'Domaine personnalisé',
          admin: { description: 'ex. cup.leurclub.be (vérification + TLS gérés plus tard).' },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Branding',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'logo',
          type: 'upload',
          relationTo: 'media',
          label: 'Logo',
        },
        {
          name: 'accent_color',
          type: 'text',
          label: "Couleur d'accent (hex)",
          admin: { description: 'ex. #fed164. Applique le thème de l\'organisation.' },
        },
      ],
    },
  ],
}
