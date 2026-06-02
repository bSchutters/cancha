import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { getCachedPublicTournament } from '@/lib/tournament/public-view'
import { resolveTenantId } from '@/lib/tournament/tenant'

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  try {
    const payload = await getPayloadClient()
    // Resolve the tenant from the host OUTSIDE the cache (headers() can't run
    // inside unstable_cache); the shared helper keys the cache per tenant.
    const tenantId = await resolveTenantId(payload)
    const data = await getCachedPublicTournament(payload, slug, tenantId)
    if (!data) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Tournoi introuvable' } }, { status: 404 })
    }
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Public tournament error:', error)
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'Erreur interne' } }, { status: 500 })
  }
}
