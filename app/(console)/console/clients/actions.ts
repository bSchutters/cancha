'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getPayloadClient } from '@/lib/payload'
import { getSessionUser, isSuperAdmin } from '@/lib/tournament/session'

export type CreateClientState = { error?: string }

const schema = z.object({
  name: z.string().trim().min(1, 'Le nom est requis.').max(120),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, 'Le slug est trop court.')
    .max(60)
    .regex(/^[a-z0-9-]+$/, 'Slug : uniquement a-z, 0-9 et tirets.'),
  subdomain: z
    .string()
    .trim()
    .toLowerCase()
    .max(60)
    .regex(/^[a-z0-9-]*$/, 'Sous-domaine : uniquement a-z, 0-9 et tirets.')
    .optional()
    .default(''),
  email: z.string().trim().toLowerCase().email('Email invalide.').max(160),
  password: z.string().min(12, 'Mot de passe : 12 caractères minimum.').max(200),
  default_manage_locale: z.enum(['fr', 'nl', 'en']).default('fr'),
  default_public_locale: z.enum(['fr', 'nl', 'en']).default('fr'),
})

/**
 * One-screen client onboarding: create the organization, then a manager user
 * bound to it (tenant membership). Friendly uniqueness pre-checks give precise
 * errors; the DB unique indexes stay the real guard against races. If the user
 * step fails, the org is rolled back — and if that rollback ALSO fails, the
 * admin is told an orphan org remains (rather than a silent wedge).
 */
export async function createClient(
  _prev: CreateClientState,
  formData: FormData,
): Promise<CreateClientState> {
  const user = await getSessionUser()
  if (!isSuperAdmin(user)) return { error: 'Non autorisé.' }

  const parsed = schema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    subdomain: formData.get('subdomain') ?? '',
    email: formData.get('email'),
    password: formData.get('password'),
    default_manage_locale: formData.get('default_manage_locale') ?? 'fr',
    default_public_locale: formData.get('default_public_locale') ?? 'fr',
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Champs invalides.' }
  const { name, slug, subdomain, email, password, default_manage_locale, default_public_locale } = parsed.data

  const payload = await getPayloadClient()

  // If converting from a lead, validate it up front and refuse double-conversion
  // (a stale link / double-submit must not spawn a second org+user).
  const rawLeadId = formData.get('leadId')
  let leadIdNum: number | null = null
  if (typeof rawLeadId === 'string' && rawLeadId !== '') {
    if (/^\d+$/.test(rawLeadId)) {
      leadIdNum = Number(rawLeadId)
      const lead = await payload
        .findByID({ collection: 'leads', id: leadIdNum, depth: 0, overrideAccess: true })
        .catch(() => null)
      if (lead && (lead as { status?: string }).status === 'converted') {
        return { error: 'Ce lead a déjà été converti en client.' }
      }
    } else {
      console.warn('[createClient] ignoring malformed leadId:', rawLeadId)
    }
  }

  const slugTaken = await payload.find({
    collection: 'organizations',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  if (slugTaken.totalDocs > 0) return { error: 'Ce slug est déjà pris.' }

  if (subdomain) {
    const subTaken = await payload.find({
      collection: 'organizations',
      where: { subdomain: { equals: subdomain } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    if (subTaken.totalDocs > 0) return { error: 'Ce sous-domaine est déjà pris.' }
  }

  const emailTaken = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  if (emailTaken.totalDocs > 0) return { error: 'Un compte existe déjà avec cet email.' }

  let orgId: number | string
  try {
    // Empty subdomain is omitted on purpose: '' would collide on the unique
    // index (only one row could ever be blank). Omitting stores NULL.
    const org = await payload.create({
      collection: 'organizations',
      data: { name, slug, default_manage_locale, default_public_locale, ...(subdomain ? { subdomain } : {}) },
      overrideAccess: true,
    })
    orgId = org.id
  } catch (err) {
    console.error('[createClient] org create failed:', err instanceof Error ? err.message : err)
    return { error: 'Création de l’organisation impossible. Réessayez.' }
  }

  try {
    await payload.create({
      collection: 'users',
      data: { email, password, role: 'manager', tenants: [{ tenant: orgId }] },
      overrideAccess: true,
    })
  } catch (err) {
    console.error('[createClient] manager create failed:', err instanceof Error ? err.message : err)
    try {
      await payload.delete({ collection: 'organizations', id: orgId, overrideAccess: true })
    } catch (delErr) {
      console.error(
        '[createClient] ROLLBACK FAILED — orphan org',
        orgId,
        delErr instanceof Error ? delErr.message : delErr,
      )
      return {
        error: `Le compte n’a pas pu être créé et l’organisation « ${slug} » est restée en base. Supprimez-la dans l’admin Payload ou réessayez avec un autre slug.`,
      }
    }
    return { error: 'Création du compte organisateur impossible. Réessayez.' }
  }

  // If this client was created from a lead, mark that lead converted (non-fatal).
  if (leadIdNum !== null) {
    try {
      await payload.update({
        collection: 'leads',
        id: leadIdNum,
        data: { status: 'converted' },
        overrideAccess: true,
      })
    } catch (err) {
      console.error('[createClient] lead convert mark failed:', err instanceof Error ? err.message : err)
    }
    revalidatePath('/console/leads')
  }

  revalidatePath('/console')
  revalidatePath('/console/clients')
  redirect('/console/clients')
}
