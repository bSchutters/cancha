'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function LogoutButton() {
  const router = useRouter()
  const onLogout = async () => {
    await fetch('/api/users/logout', { method: 'POST', credentials: 'include' }).catch(() => {})
    router.push('/login')
    router.refresh()
  }
  return (
    <Button
      variant="link"
      onClick={onLogout}
      className="h-auto p-0 text-sm font-normal text-white/50 hover:text-white"
    >
      Déconnexion
    </Button>
  )
}
