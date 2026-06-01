import type { NextRequest } from 'next/server'
import { runDraw } from '@/lib/tournament/orchestrator'
import { requireManager, runAction, unauthorized } from '@/lib/tournament/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// `slug` here is the numeric tournament id passed by the admin actions component.
export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const auth = await requireManager(request)
  if (!auth) return unauthorized()
  const { slug } = await params
  return runAction(() => runDraw(auth.payload, Number(slug)))
}
