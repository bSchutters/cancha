import Link from 'next/link'
import { cn } from '@/lib/utils'
import { getPayloadClient } from '@/lib/payload'
import { LEAD_STATUS_LABEL } from '@/lib/leads-status'

export const dynamic = 'force-dynamic'

// Pre-event + live states (excludes draft / finished / archived).
const ACTIVE_TOURNAMENT_STATUSES = ['registration', 'registration_closed', 'draw_done', 'live']

function StatCard({ label, value, href }: { label: string; value: number; href?: string }) {
  const inner = (
    <>
      <p className="text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </>
  )
  const base = 'rounded-2xl border border-border bg-card p-5'
  return href ? (
    <Link href={href} className={cn(base, 'transition-colors hover:border-primary/30')}>
      {inner}
    </Link>
  ) : (
    <div className={base}>{inner}</div>
  )
}

export default async function ConsoleDashboard() {
  const payload = await getPayloadClient()
  const [newLeads, clients, activeTournaments, recent] = await Promise.all([
    payload.count({ collection: 'leads', where: { status: { equals: 'new' } }, overrideAccess: true }),
    payload.count({ collection: 'organizations', overrideAccess: true }),
    payload.count({
      collection: 'tournaments',
      where: { status: { in: ACTIVE_TOURNAMENT_STATUSES } },
      overrideAccess: true,
    }),
    payload.find({ collection: 'leads', sort: '-createdAt', limit: 5, depth: 0, overrideAccess: true }),
  ])

  const recentLeads = recent.docs.map((d) => ({
    id: d.id,
    name: (d as { name?: string }).name ?? '—',
    organization: (d as { organization?: string }).organization ?? '',
    status: (d as { status?: string }).status ?? 'new',
  }))

  return (
    <div className="mx-auto max-w-5xl">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Tableau de bord</h1>
        <p className="mt-1 text-sm text-muted-foreground">Vue d’ensemble de l’activité Cancha.</p>
      </header>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Leads à traiter" value={newLeads.totalDocs} href="/console/leads" />
        <StatCard label="Clients" value={clients.totalDocs} href="/console/clients" />
        <StatCard label="Tournois actifs" value={activeTournaments.totalDocs} />
      </div>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Derniers leads</h2>
          <Link href="/console/leads" className="text-xs text-primary hover:underline">
            Tout voir
          </Link>
        </div>
        <div className="mt-3 rounded-2xl border border-border bg-card">
          {recentLeads.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">Aucun lead pour l’instant.</p>
          ) : (
            <ul className="divide-y divide-border">
              {recentLeads.map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{l.name}</p>
                    {l.organization && <p className="truncate text-xs text-muted-foreground">{l.organization}</p>}
                  </div>
                  <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                    {LEAD_STATUS_LABEL[l.status] ?? l.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}
