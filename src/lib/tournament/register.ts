import type { Payload } from 'payload'
import { z } from 'zod'
import { Resend } from 'resend'
import { TournamentError } from './orchestrator'

export const registrationSchema = z.object({
  teamName: z.string().trim().min(2, 'Nom d’équipe trop court').max(80),
  email: z.email('Email invalide'),
  phone: z.string().trim().min(6, 'Téléphone invalide').max(40),
  // Honeypot: must stay empty (bots fill it).
  website: z.string().optional(),
})

export type RegistrationInput = z.infer<typeof registrationSchema>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyDoc = Record<string, any>

export async function registerTeam(payload: Payload, slug: string, raw: unknown, logoId?: number | null) {
  const parsed = registrationSchema.safeParse(raw)
  if (!parsed.success) {
    throw new TournamentError('VALIDATION_ERROR', parsed.error.issues[0]?.message ?? 'Données invalides')
  }
  const input = parsed.data

  // Honeypot tripped → pretend success without creating anything.
  if (input.website && input.website.trim() !== '') {
    return { ok: true, skipped: true }
  }

  const res = await payload.find({
    collection: 'tournaments',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  })
  const tournament = res.docs[0] as AnyDoc | undefined
  if (!tournament) throw new TournamentError('NOT_FOUND', 'Tournoi introuvable')
  // Registration is open up to and including the "closed" phase: once full, new
  // teams join the waitlist. Beyond that (draw done, live…) it is truly over.
  if (tournament.status !== 'registration' && tournament.status !== 'registration_closed') {
    throw new TournamentError('REGISTRATION_CLOSED', 'Les inscriptions sont terminées')
  }

  // Capacity = number of groups × group size. The active roster (pending +
  // confirmed) counts toward the cap; once reached, extra teams go to waitlist.
  const capacity = (tournament.num_groups ?? 0) * (tournament.group_size ?? 0)

  // Unique team name within the tournament (case-insensitive).
  const existing = await payload.find({
    collection: 'tournament-teams',
    where: { tournament: { equals: tournament.id } },
    limit: 1000,
    depth: 0,
  })
  const taken = existing.docs.some(
    (t: AnyDoc) => t.name?.trim().toLowerCase() === input.teamName.toLowerCase(),
  )
  if (taken) {
    throw new TournamentError('DUPLICATE_TEAM_NAME', 'Ce nom d’équipe est déjà inscrit')
  }

  const activeCount = existing.docs.filter(
    (t: AnyDoc) => t.registration_status === 'pending' || t.registration_status === 'confirmed',
  ).length
  const waitlisted = capacity > 0 && activeCount >= capacity

  // The afterChange hook (registrationCapacity) auto-closes registration once the
  // roster is full, so we only need to set the right status here.
  await payload.create({
    collection: 'tournament-teams',
    overrideAccess: true,
    data: {
      tournament: tournament.id,
      name: input.teamName,
      representative_email: input.email,
      representative_phone: input.phone,
      logo: logoId ?? undefined,
      registration_status: waitlisted ? 'waitlist' : 'pending',
      payment_status: 'unpaid',
    },
  })

  await sendConfirmationEmail(payload, tournament, input, waitlisted).catch((err) => {
    console.error('Registration email failed (non-blocking):', err)
  })

  return { ok: true, waitlisted }
}

/**
 * Name of the organization running the tournament, for the email signature.
 * Falls back to the tournament name — never to another club's name.
 */
async function organizerName(payload: Payload, tournament: AnyDoc): Promise<string> {
  const tenant = tournament.tenant
  const id = tenant != null && typeof tenant === 'object' ? (tenant as { id?: unknown }).id : tenant
  if (id == null) return String(tournament.name ?? '')
  try {
    const org = await payload.findByID({ collection: 'organizations', id: id as number, depth: 0 })
    return String((org as AnyDoc)?.name ?? tournament.name ?? '')
  } catch {
    return String(tournament.name ?? '')
  }
}

async function sendConfirmationEmail(
  payload: Payload,
  tournament: AnyDoc,
  input: RegistrationInput,
  waitlisted: boolean,
) {
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) return
  const resend = new Resend(process.env.RESEND_API_KEY)
  // Multi-tenant: every club signs its own emails. This was hardcoded to a single
  // club, so every organization's registrants received mail from that club.
  const organizer = await organizerName(payload, tournament)

  const payment: string[] = []
  if (tournament.payment_amount) payment.push(`Montant : ${tournament.payment_amount} €`)
  if (tournament.payment_iban) payment.push(`IBAN : ${tournament.payment_iban}`)
  if (tournament.payment_communication) payment.push(`Communication : ${tournament.payment_communication}`)

  const paymentBlock = payment.length
    ? `\n\nPour valider votre inscription, merci d’effectuer le paiement :\n${payment.join('\n')}`
    : ''

  const body = waitlisted
    ? `Bonjour,\n\nLe tournoi ${tournament.name} est complet : l’équipe « ${input.teamName} » ` +
      `est inscrite sur la liste d’attente. Nous vous contacterons si une place se libère.\n\n` +
      `À très bientôt,\nL’équipe ${organizer}`
    : `Bonjour,\n\nNous avons bien reçu l’inscription de l’équipe « ${input.teamName} » ` +
      `au tournoi ${tournament.name}.\n\nVotre inscription est en attente de validation. ` +
      `Elle sera confirmée dès réception du paiement.${paymentBlock}\n\n` +
      `À très bientôt,\nL’équipe ${organizer}`

  await resend.emails.send({
    from: `${organizer} <${process.env.RESEND_FROM_EMAIL}>`,
    to: input.email,
    subject: waitlisted ? `Liste d’attente - ${tournament.name}` : `Inscription reçue - ${tournament.name}`,
    text: body,
  })
}
