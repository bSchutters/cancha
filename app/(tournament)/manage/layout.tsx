import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSessionUser, isManager } from '@/lib/tournament/session'
import { LogoutButton } from '@/components/tournament/manage/LogoutButton'
import { ThemeToggle } from '@/components/theme-toggle'

export const dynamic = 'force-dynamic'

export default async function ManageLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser()
  if (!isManager(user)) redirect('/login')

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/10 bg-spanish-bg-dark/50">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-4 py-3">
          <Link href="/manage" className="font-bold">
            Cup <span className="text-spanish-accent-2">Generator</span>
          </Link>
          <div className="flex items-center gap-3 text-sm text-white/60">
            <Link href="/" className="hover:text-white">
              Voir le site public
            </Link>
            <span className="hidden sm:inline">{user?.email}</span>
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
      </header>
      {children}
    </div>
  )
}
