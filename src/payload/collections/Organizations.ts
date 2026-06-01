import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access'
import { BASE_COLORS, BASE_COLOR_KEYS, RADIUS_PRESETS, RADIUS_KEYS, FONTS } from '@/lib/tournament/theme'

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
      ],
    },
    {
      type: 'collapsible',
      label: 'Apparence (thème)',
      admin: {
        initCollapsed: true,
        description: 'Presets shadcn appliqués aux pages publiques et TV. Éditables aussi dans /manage/apparence.',
      },
      fields: [
        {
          name: 'base_color',
          type: 'select',
          label: 'Couleur de base',
          defaultValue: 'neutral',
          options: BASE_COLOR_KEYS.map((k) => ({ label: BASE_COLORS[k].label, value: k })),
          admin: { description: 'Palette neutre (fonds, bordures, texte).' },
        },
        {
          name: 'accent_color',
          type: 'text',
          label: "Couleur d'accent (hex)",
          admin: { description: 'ex. #fed164. Définit la couleur principale (boutons, liens).' },
        },
        {
          name: 'radius',
          type: 'select',
          label: 'Arrondi',
          defaultValue: 'default',
          options: RADIUS_KEYS.map((k) => ({ label: RADIUS_PRESETS[k].label, value: k })),
        },
        {
          name: 'heading_font',
          type: 'select',
          label: 'Police des titres',
          options: FONTS.map((f) => ({ label: f.label, value: f.value })),
          admin: { description: 'Par défaut : police du site.' },
        },
        {
          name: 'body_font',
          type: 'select',
          label: 'Police du texte',
          options: FONTS.map((f) => ({ label: f.label, value: f.value })),
          admin: { description: 'Par défaut : police du site.' },
        },
      ],
    },
  ],
}
