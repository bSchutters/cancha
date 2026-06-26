import { buildConfig } from 'payload'
import { fr } from '@payloadcms/translations/languages/fr'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant'
import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

import { isSuperAdmin } from '@/payload/access'
import { Users } from '@/payload/collections/Users'
import { Media } from '@/payload/collections/Media'
import { Organizations } from '@/payload/collections/Organizations'
import { Leads } from '@/payload/collections/Leads'
import { Tournaments } from '@/payload/collections/Tournaments'
import { TournamentTeams } from '@/payload/collections/TournamentTeams'
import { TournamentMatches } from '@/payload/collections/TournamentMatches'
import { TournamentReferees } from '@/payload/collections/TournamentReferees'
import { TournamentSponsors } from '@/payload/collections/TournamentSponsors'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' | Cancha',
    },
    components: {
      beforeNavLinks: ['@/payload/components/DashboardLink'],
      afterNavLinks: ['@/payload/components/BackToSite'],
    },
    theme: 'dark',
  },
  collections: [
    Users,
    Media,
    Organizations,
    Leads,
    Tournaments,
    TournamentTeams,
    TournamentMatches,
    TournamentReferees,
    TournamentSponsors,
  ],
  i18n: {
    supportedLanguages: { fr },
    fallbackLanguage: 'fr',
  },
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET ?? (() => { throw new Error('PAYLOAD_SECRET env var is required') })(),
  typescript: {
    outputFile: path.resolve(dirname, 'src/payload/payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
    // Versioned migrations instead of auto-push. `push` is auto-disabled in
    // production anyway; turning it off in dev too means every schema change
    // goes through a reviewed migration file (run `pnpm migrate`).
    push: false,
    migrationDir: path.resolve(dirname, 'src/migrations'),
  }),
  sharp,
  plugins: [
    // Per-organization data isolation. Adds a `tenant` field to each listed
    // collection and a `tenants` membership array to users. Super-admins
    // (role 'admin') bypass tenant scoping and manage every organization.
    multiTenantPlugin({
      tenantsSlug: 'organizations',
      // debug: makes the `tenant` field visible on each document form so the
      // organization can be assigned/verified directly (useful while building).
      debug: true,
      tenantField: { label: 'Organisation' },
      i18n: {
        translations: {
          fr: {
            'assign-tenant-button-label': 'Affecter une organisation',
            'assign-tenant-modal-title': 'Affecter « {{title}} »',
            'field-assignedTenant-label': 'Organisation affectée',
            'nav-tenantSelector-label': 'Filtrer par organisation',
          },
        },
      },
      userHasAccessToAllTenants: (user) => isSuperAdmin(user as { role?: string } | null),
      collections: {
        // media is intentionally NOT tenant-scoped: logos (org/team/sponsor) are a
        // shared pool, and uploads happen without a selected-tenant context
        // (public registration, super-admin) - requiring a tenant would break them.
        tournaments: {},
        'tournament-teams': {},
        'tournament-matches': {},
        'tournament-referees': {},
        'tournament-sponsors': {},
      },
    }),
    vercelBlobStorage({
      collections: {
        media: {
          prefix: 'media',
        },
      },
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
      enabled: !!process.env.BLOB_READ_WRITE_TOKEN,
    }),
  ],
})
