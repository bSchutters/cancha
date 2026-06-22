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
    .min(2, 'Le slug est trop court.')
    .max(60)
    .regex(/^[a-z0-9-]+$/, 'Slug : uniquement a-z, 0-9 et tirets.'),
  subdomain: z
    .string()
    .trim()
    .max(60)
    .regex(/^[a-z0-9-]*$/, 'Sous-domaine : uniquement a-z, 0-9 et tirets.')
    .optional()
    .default(''),
  email: z.string().trim().email('Email invalide.').max(160),
  password: z.string().min(8, 'Mot de passe : 8 caractères minimum.').max(200),
})

/**
 * One-screen client onboarding: create the organization, then a manager user
 * bound to it (tenant membership). If the user step fails, the orphan org is
 * removed so a retry is clean.
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
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Champs invalides.' }
  const { name, slug, subdomain, email, password } = parsed.data

  const payload = await getPayloadClient()

  let orgId: number | string
  try {
    const org = await payload.create({
      collection: 'organizations',
      data: { name, slug, ...(subdomain ? { subdomain } : {}) },
      overrideAccess: true,
    })
    orgId = org.id
  } catch (err) {
    console.error('[createClient] org create failed', err)
    return { error: 'Création de l’organisation impossible (slug ou sous-domaine déjà pris ?).' }
  }

  try {
    await payload.create({
      collection: 'users',
      data: { email, password, role: 'manager', tenants: [{ tenant: orgId }] },
      overrideAccess: true,
    })
  } catch (err) {
    console.error('[createClient] manager create failed, rolling back org', err)
    await payload.delete({ collection: 'organizations', id: orgId, overrideAccess: true }).catch(() => {})
    return { error: 'Création du compte manager impossible (email déjà utilisé ?).' }
  }

  revalidatePath('/console/clients')
  redirect('/console/clients')
}
