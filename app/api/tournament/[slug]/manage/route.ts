import { NextResponse, type NextRequest } from 'next/server'
import { buildManageTournament } from '@/lib/tournament/manage-view'
import { requireManager, unauthorized } from '@/lib/tournament/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const auth = await requireManager(request)
  if (!auth) return unauthorized()
  const { slug } = await params
  const data = await buildManageTournament(auth.payload, slug)
  if (!data) {
    return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Tournoi introuvable' } }, { status: 404 })
  }
  return NextResponse.json({ data })
}
