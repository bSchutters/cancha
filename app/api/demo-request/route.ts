import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { z } from 'zod'
import { getPayloadClient } from '@/lib/payload'

// Demo-request lead form (apex landing). Sends a qualified lead to OWNER_EMAIL
// via Resend, reusing the same transactional-email env as registrations.
const schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(160),
  organization: z.string().trim().max(160).optional().default(''),
  sport: z.string().trim().max(80).optional().default(''),
  teams: z.string().trim().max(40).optional().default(''),
  message: z.string().trim().max(2000).optional().default(''),
  // Honeypot: hidden in the UI, so any value means a bot filled it. Accept any
  // string here (don't reject) so the handler can return a silent fake success
  // instead of a 400 that signals the bot it was caught.
  website: z.string().max(200).optional().default(''),
})

// Best-effort, in-memory rate limit. On serverless this is per warm instance
// (not shared across instances) — durable limiting would need a shared store
// like Upstash — but it still blunts bursts from a single client.
const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 5
const hits = new Map<string, number[]>()

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  recent.push(now)
  if (recent.length) hits.set(ip, recent)
  else hits.delete(ip)
  return recent.length > MAX_PER_WINDOW
}

export async function POST(req: Request) {
  let data: z.infer<typeof schema>
  try {
    data = schema.parse(await req.json())
  } catch {
    return NextResponse.json({ error: 'invalid' }, { status: 400 })
  }

  // Honeypot tripped: pretend success and send nothing, so bots get no signal.
  // Checked BEFORE the rate limit so honeypot spam doesn't burn the budget of a
  // legitimate visitor sharing the same IP (NAT/proxy).
  if (data.website) {
    return NextResponse.json({ ok: true })
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (rateLimited(ip)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  }

  // 1) Persist the lead first — the primary capture path. The owner email below
  // is a best-effort notification on top, so a prospect isn't lost if it fails.
  let saved = false
  try {
    const payload = await getPayloadClient()
    await payload.create({
      collection: 'leads',
      data: {
        name: data.name,
        email: data.email,
        organization: data.organization,
        sport: data.sport,
        teams: data.teams,
        message: data.message,
        status: 'new',
        source: 'demo-request',
      },
      overrideAccess: true,
    })
    saved = true
  } catch (err) {
    // Don't fail the request yet (email may still notify), but make the outage
    // visible and log the payload so the lead is recoverable from server logs.
    console.error('[demo-request] lead persist failed', { email: data.email, err })
  }

  // 2) Best-effort email notification to the owner.
  let emailed = false
  const to = process.env.OWNER_EMAIL
  const from = process.env.RESEND_FROM_EMAIL
  const key = process.env.RESEND_API_KEY
  if (to && from && key) {
    const lines = [
      `Nom : ${data.name}`,
      `Email : ${data.email}`,
      data.organization && `Organisation : ${data.organization}`,
      data.sport && `Sport : ${data.sport}`,
      data.teams && `Nombre d’équipes : ${data.teams}`,
      data.message && `\nMessage :\n${data.message}`,
    ].filter(Boolean)
    try {
      const resend = new Resend(key)
      await resend.emails.send({
        from: `Cancha <${from}>`,
        to,
        replyTo: data.email,
        subject: `Demande de démo - ${data.name}${data.organization ? ` (${data.organization})` : ''}`,
        text: lines.join('\n'),
      })
      emailed = true
    } catch (err) {
      // The lead is already saved; the owner will see it in /console. Still log
      // so a silently-expired Resend key is noticed.
      console.error('[demo-request] owner email failed', err)
    }
  }

  // Only fail if the lead was neither stored nor announced — then the client
  // shows its contact-email fallback.
  if (!saved && !emailed) {
    return NextResponse.json({ error: 'unavailable' }, { status: 502 })
  }
  return NextResponse.json({ ok: true })
}
