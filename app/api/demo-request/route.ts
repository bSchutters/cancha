import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { z } from 'zod'

// Demo-request lead form (apex landing). Sends a qualified lead to OWNER_EMAIL
// via Resend, reusing the same transactional-email env as registrations.
const schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(160),
  organization: z.string().trim().max(160).optional().default(''),
  sport: z.string().trim().max(80).optional().default(''),
  teams: z.string().trim().max(40).optional().default(''),
  message: z.string().trim().max(2000).optional().default(''),
})

export async function POST(req: Request) {
  let data: z.infer<typeof schema>
  try {
    data = schema.parse(await req.json())
  } catch {
    return NextResponse.json({ error: 'invalid' }, { status: 400 })
  }

  const to = process.env.OWNER_EMAIL
  const from = process.env.RESEND_FROM_EMAIL
  const key = process.env.RESEND_API_KEY
  if (!to || !from || !key) {
    return NextResponse.json({ error: 'email_not_configured' }, { status: 500 })
  }

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
      from: `Cup Generator <${from}>`,
      to,
      replyTo: data.email,
      subject: `Demande de démo - ${data.name}${data.organization ? ` (${data.organization})` : ''}`,
      text: lines.join('\n'),
    })
  } catch {
    return NextResponse.json({ error: 'send_failed' }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
