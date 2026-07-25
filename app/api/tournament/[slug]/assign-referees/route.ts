import type { NextRequest } from 'next/server'
import { assignRefereesRandomly } from '@/lib/tournament/orchestrator'
import { requireTournamentManager, runAction, unauthorized } from '@/lib/tournament/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const auth = await requireTournamentManager(request, slug)
  if (!auth) return unauthorized()
  return runAction(() => assignRefereesRandomly(auth.payload, slug))
}
