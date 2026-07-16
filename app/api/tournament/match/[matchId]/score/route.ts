import type { NextRequest } from 'next/server'
import { enterScore, clearScore } from '@/lib/tournament/orchestrator'
import { requireManager, runAction, unauthorized } from '@/lib/tournament/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest, { params }: { params: Promise<{ matchId: string }> }) {
  const auth = await requireManager(request)
  if (!auth) return unauthorized()
  const { matchId } = await params
  const body = await request.json()
  if (body?.clear) {
    return runAction(() => clearScore(auth.payload, Number(matchId)))
  }
  const setScores = Array.isArray(body.setScores)
    ? body.setScores.map((s: { home: unknown; away: unknown }) => ({ home: Number(s.home), away: Number(s.away) }))
    : undefined
  return runAction(() =>
    enterScore(auth.payload, Number(matchId), {
      scoreHome: Number(body.scoreHome),
      scoreAway: Number(body.scoreAway),
      fairplayWinner: body.fairplayWinner,
      penaltyHome: body.penaltyHome != null ? Number(body.penaltyHome) : null,
      penaltyAway: body.penaltyAway != null ? Number(body.penaltyAway) : null,
      setScores,
    }),
  )
}
