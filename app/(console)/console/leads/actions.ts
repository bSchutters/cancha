'use server'

import { revalidatePath } from 'next/cache'
import { getPayloadClient } from '@/lib/payload'
import { getSessionUser, isSuperAdmin } from '@/lib/tournament/session'

const STATUSES = ['new', 'contacted', 'converted', 'lost'] as const
type Status = (typeof STATUSES)[number]

async function assertSuperAdmin() {
  const user = await getSessionUser()
  if (!isSuperAdmin(user)) throw new Error('unauthorized')
}

export async function setLeadStatus(id: number, status: string) {
  await assertSuperAdmin()
  if (!STATUSES.includes(status as Status)) throw new Error('invalid status')
  const payload = await getPayloadClient()
  await payload.update({ collection: 'leads', id, data: { status: status as Status }, overrideAccess: true })
  revalidatePath('/console/leads')
}

export async function setLeadNotes(id: number, notes: string) {
  await assertSuperAdmin()
  const payload = await getPayloadClient()
  await payload.update({ collection: 'leads', id, data: { notes: notes.slice(0, 4000) }, overrideAccess: true })
  revalidatePath('/console/leads')
}
