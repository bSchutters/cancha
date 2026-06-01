import { NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import { getPayloadClient } from '@/lib/payload'
import { listPublicTournaments } from '@/lib/tournament/public-view'

export async function GET() {
  try {
    const getCached = unstable_cache(
      async () => {
        const payload = await getPayloadClient()
        return listPublicTournaments(payload)
      },
      ['tournament-list'],
      { tags: ['tournaments'], revalidate: 60 },
    )
    const data = await getCached()
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Tournament list error:', error)
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'Erreur interne' } }, { status: 500 })
  }
}
