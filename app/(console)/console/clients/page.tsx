import Image from 'next/image'
import Link from 'next/link'
import { getPayloadClient } from '@/lib/payload'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

type TenantRef = number | string | { id: number | string } | null | undefined

function tenantId(ref: TenantRef): number | string | null {
  if (ref == null) return null
  return typeof ref === 'object' ? ref.id : ref
}

export default async function ClientsPage() {
  const payload = await getPayloadClient()
  const [orgsRes, tournamentsRes] = await Promise.all([
    payload.find({ collection: 'organizations', limit: 200, depth: 1, sort: 'name', overrideAccess: true }),
    payload.find({ collection: 'tournaments', limit: 1000, depth: 0, overrideAccess: true }),
  ])

  const counts = new Map<number | string, number>()
  for (const t of tournamentsRes.docs) {
    const id = tenantId((t as { tenant?: TenantRef }).tenant)
    if (id != null) counts.set(id, (counts.get(id) ?? 0) + 1)
  }

  const clients = orgsRes.docs.map((o) => {
    const logo = (o as { logo?: { url?: string | null } | string | null }).logo
    return {
      id: o.id,
      name: (o as { name?: string }).name ?? '—',
      slug: (o as { slug?: string }).slug ?? '',
      subdomain: (o as { subdomain?: string | null }).subdomain ?? '',
      logoUrl: logo && typeof logo === 'object' ? (logo.url ?? null) : null,
      count: counts.get(o.id) ?? 0,
    }
  })

  return (
    <div className="mx-auto max-w-5xl">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Clients</h1>
          <p className="mt-1 text-sm text-muted-foreground">{clients.length} organisation(s).</p>
        </div>
        <Button asChild>
          <Link href="/console/clients/new">Nouveau client</Link>
        </Button>
      </header>

      <div className="mt-6">
        {clients.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
            <p className="text-sm font-medium text-foreground">Aucun client pour l’instant.</p>
            <p className="mt-1 text-sm text-muted-foreground">Créez votre premier client pour démarrer.</p>
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {clients.map((c) => (
              <li key={c.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
                {c.logoUrl ? (
                  <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded">
                    <Image src={c.logoUrl} alt={c.name} fill sizes="40px" unoptimized className="object-contain" />
                  </span>
                ) : (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-primary/10 text-sm font-semibold text-primary">
                    {c.name.charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{c.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {c.subdomain ? `${c.subdomain}.cancha.be` : `/${c.slug}`}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                  {c.count} tournoi{c.count > 1 ? 's' : ''}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
