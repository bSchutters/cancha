import type { MetadataRoute } from 'next'
import { getRequestBaseUrl } from '@/lib/tournament/seo'

// Per-host so the Sitemap directive points at the current tenant's own sitemap.
export const dynamic = 'force-dynamic'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const base = await getRequestBaseUrl()
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Admin/console and data endpoints; `/*/tv` are big-screen display pages
      // that just mirror a tournament's public page (thin duplicates).
      disallow: ['/admin', '/manage', '/api/', '/*/tv'],
    },
    sitemap: `${base}/sitemap.xml`,
  }
}
