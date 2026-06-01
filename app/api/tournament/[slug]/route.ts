import { NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import { getPayloadClient } from '@/lib/payload'
import { buildPublicTournament } from '@/lib/tournament/public-view'

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  try {
    const getCached = unstable_cache(
      async () => {
        const payload = await getPayloadClient()
        return buildPublicTournament(payload, slug)
      },
      ['tournament', slug],
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
