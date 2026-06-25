import { getPayloadClient } from '@/lib/payload'
import { LeadsBoard } from '@/components/console/leads-board'
import { setLeadStatus, setLeadNotes } from './actions'

export const dynamic = 'force-dynamic'

export default async function LeadsPage() {
  const payload = await getPayloadClient()
  const LIMIT = 300
  const { docs, totalDocs } = await payload.find({
    collection: 'leads',
    sort: '-createdAt',
    limit: LIMIT,
    depth: 0,
    overrideAccess: true,
  })

  const leads = docs.map((d) => ({
    id: Number(d.id),
    name: d.name,
    email: d.email,
    organization: d.organization ?? '',
    sport: d.sport ?? '',
    teams: d.teams ?? '',
    message: d.message ?? '',
    notes: d.notes ?? '',
    status: d.status,
    createdAt: d.createdAt,
  }))

  return (
    <div className="mx-auto max-w-6xl">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Les demandes de démo, de la réception à la conversion.
          {totalDocs > 0 && <span className="ml-1">{totalDocs} au total.</span>}
          {totalDocs > LIMIT && (
            <span className="ml-1">Affichage des {LIMIT} plus récents.</span>
          )}
        </p>
      </header>
      <div className="mt-6">
        <LeadsBoard leads={leads} onSetStatus={setLeadStatus} onSaveNotes={setLeadNotes} />
      </div>
    </div>
  )
}
