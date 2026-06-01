import Link from 'next/link'
import { getPayloadClient } from '@/lib/payload'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

const STATUS_LABEL: Record<string, string> = {
  draft: 'Brouillon',
  registration: 'Inscriptions',
  registration_closed: 'Inscr. fermées',
  draw_done: 'Tirage fait',
  live: 'En cours',
  finished: 'Terminé',
  archived: 'Archivé',
}

export default async function ManageHomePage() {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'tournaments',
    sort: '-edition_date',
    limit: 200,
    depth: 0,
  })

  return (
    <main className="mx-auto max-w-screen-2xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tournois</h1>
        <Link href="/manage/new">
          <Button className="bg-spanish-accent-2 font-bold text-spanish-bg-dark hover:bg-spanish-accent-2-light">
            + Nouveau tournoi
          </Button>
        </Link>
      </div>

      {res.docs.length === 0 ? (
        <p className="mt-10 text-white/60">Aucun tournoi. Créez-en un pour commencer.</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {res.docs.map((doc) => {
            const t = doc as { id: number | string; name: string; slug: string; status: string }
            return (
              <Link
                key={String(t.id)}
                href={`/manage/${t.slug}`}
                className="block rounded-xl border border-white/10 bg-white/5 p-5 transition-colors hover:bg-white/10"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-bold">{t.name}</h2>
                  <Badge variant="secondary">{STATUS_LABEL[t.status] ?? t.status}</Badge>
                </div>
                <p className="mt-2 text-xs text-white/40">/{t.slug}</p>
              </Link>
            )
          })}
        </div>
      )}
    </main>
  )
}
