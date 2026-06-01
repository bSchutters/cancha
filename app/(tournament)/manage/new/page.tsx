import Link from 'next/link'
import { getSessionUser, isOwner } from '@/lib/tournament/session'
import { TournamentConfigForm } from '@/components/tournament/manage/TournamentConfigForm'

export const dynamic = 'force-dynamic'

export default async function NewTournamentPage() {
  const owner = isOwner(await getSessionUser())
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/manage" className="text-sm text-muted-foreground hover:text-foreground">
        ← Tournois
      </Link>
      <h1 className="mt-4 mb-8 text-3xl font-bold">Nouveau tournoi</h1>
      <TournamentConfigForm isOwner={owner} />
    </main>
  )
}
