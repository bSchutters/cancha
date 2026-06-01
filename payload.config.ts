import { buildConfig } from 'payload'
import { fr } from '@payloadcms/translations/languages/fr'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

import { Users } from '@/payload/collections/Users'
import { Media } from '@/payload/collections/Media'
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
      titleSuffix: ' | Cup Generator',
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
  }),
  sharp,
  plugins: [
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
