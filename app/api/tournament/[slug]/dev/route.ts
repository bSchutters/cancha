import { NextResponse, type NextRequest } from 'next/server'
import { devSeedTeams, devRandomScores, devSimulate } from '@/lib/tournament/orchestrator'
import { requireOwner, runAction, unauthorized } from '@/lib/tournament/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  // Dev tools are reserved to the tool owner (OWNER_EMAIL), beyond the per-tournament flag.
  const auth = await requireOwner(request)
  if (!auth) return unauthorized()
  const { slug } = await params
  const body = await request.json().catch(() => ({}))
  const action = body?.action as string

  switch (action) {
    case 'seed-teams':
      return runAction(() => devSeedTeams(auth.payload, slug))
    case 'random-group-scores':
      return runAction(() => devRandomScores(auth.payload, slug, ['group']))
    case 'random-knockout-scores':
      return runAction(() => devRandomScores(auth.payload, slug, ['knockout', 'classification']))
    case 'simulate':
      return runAction(() => devSimulate(auth.payload, slug))
    default:
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Action inconnue' } }, { status: 400 })
  }
}
