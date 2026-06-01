import type { NextRequest } from 'next/server'
import { assignRefereesRandomly } from '@/lib/tournament/orchestrator'
import { requireManager, runAction, unauthorized } from '@/lib/tournament/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const auth = await requireManager(request)
  if (!auth) return unauthorized()
  const { slug } = await params
  return runAction(() => assignRefereesRandomly(auth.payload, slug))
}
