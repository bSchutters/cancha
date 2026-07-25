import type { NextRequest } from 'next/server'
import { runDraw } from '@/lib/tournament/orchestrator'
import { requireTournamentManager, runAction, unauthorized } from '@/lib/tournament/server'
import { withTournamentLock } from '@/lib/tournament/lock'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// `slug` here is the numeric tournament id passed by the admin actions component.
export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const auth = await requireTournamentManager(request, slug)
  if (!auth) return unauthorized()
  return runAction(() => withTournamentLock(auth.tournamentId, () => runDraw(auth.payload, auth.tournamentId)))
}
