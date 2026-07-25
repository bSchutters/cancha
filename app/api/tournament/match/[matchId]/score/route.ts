import type { NextRequest } from 'next/server'
import { enterScore, clearScore } from '@/lib/tournament/orchestrator'
import { requireMatchManager, runAction, unauthorized } from '@/lib/tournament/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest, { params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params
  // Scoped to the match's organization: entering a score is the most damaging
  // cross-tenant write (it rewrites standings and propagates through the bracket).
  const auth = await requireMatchManager(request, matchId)
  if (!auth) return unauthorized()
  const body = await request.json()
  if (body?.clear) {
    return runAction(() => clearScore(auth.payload, auth.matchId))
  }
  const setScores = Array.isArray(body.setScores)
    ? body.setScores.map((s: { home: unknown; away: unknown }) => ({ home: Number(s.home), away: Number(s.away) }))
    : undefined
  // Values stay raw here (Number() of junk yields NaN): enterScore validates them,
  // so every caller gets the same guarantee, not just this route.
  return runAction(() =>
    enterScore(auth.payload, auth.matchId, {
      scoreHome: Number(body.scoreHome),
      scoreAway: Number(body.scoreAway),
      fairplayWinner: body.fairplayWinner,
      penaltyHome: body.penaltyHome != null ? Number(body.penaltyHome) : null,
      penaltyAway: body.penaltyAway != null ? Number(body.penaltyAway) : null,
      setScores,
    }),
  )
}
