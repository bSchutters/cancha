import { NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import { getPayloadClient } from '@/lib/payload'
import { listPublicTournaments } from '@/lib/tournament/public-view'
import { resolveTenantId } from '@/lib/tournament/tenant'

export async function GET() {
  try {
    const payload = await getPayloadClient()
    // Resolve tenant from the host OUTSIDE the cache (headers() can't run inside
    // unstable_cache); pass it in + key the cache per tenant.
    const tenantId = await resolveTenantId(payload)
    const getCached = unstable_cache(
      async () => listPublicTournaments(payload, tenantId),
      ['tournament-list', String(tenantId ?? 'all')],
      { tags: ['tournaments'], revalidate: 60 },
    )
    const data = await getCached()
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Tournament list error:', error)
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'Erreur interne' } }, { status: 500 })
  }
}
