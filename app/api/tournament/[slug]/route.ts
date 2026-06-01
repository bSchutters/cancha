import { NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import { getPayloadClient } from '@/lib/payload'
import { buildPublicTournament } from '@/lib/tournament/public-view'
import { resolveTenantId } from '@/lib/tournament/tenant'

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  try {
    const payload = await getPayloadClient()
    // Resolve the tenant from the host OUTSIDE the cache (headers() can't run
    // inside unstable_cache); feed it in as data + part of the cache key.
    const tenantId = await resolveTenantId(payload)
    const getCached = unstable_cache(
      async () => buildPublicTournament(payload, slug, tenantId),
      ['tournament', slug, String(tenantId ?? 'all')],
      { tags: [`tournament-${slug}`], revalidate: 30 },
    )
    const data = await getCached()
    if (!data) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Tournoi introuvable' } }, { status: 404 })
    }
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Public tournament error:', error)
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'Erreur interne' } }, { status: 500 })
  }
}
