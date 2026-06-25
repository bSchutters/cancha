import Link from 'next/link'
import { ClientForm } from '@/components/console/client-form'
import { createClient } from '../actions'

export const dynamic = 'force-dynamic'

export default async function NewClientPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const str = (k: string) => (typeof sp[k] === 'string' ? (sp[k] as string) : undefined)
  // Pre-fill from a lead when converting (org name + manager email).
  const initial = { name: str('name'), email: str('email'), leadId: str('lead') }
  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/console/clients" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
        ← Clients
      </Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">Nouveau client</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Crée l’organisation et le compte organisateur en une fois.
      </p>
      <div className="mt-6">
        <ClientForm action={createClient} initial={initial} />
      </div>
    </div>
  )
}
