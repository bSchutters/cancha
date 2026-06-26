'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useLocale } from '@/i18n/use-locale'
import { useT } from '@/i18n/use-t'

export function LogoutButton() {
  const router = useRouter()
  const locale = useLocale()
  const t = useT()
  const onLogout = async () => {
    await fetch('/api/users/logout', { method: 'POST', credentials: 'include' }).catch(() => {})
    router.push(`/${locale}/login`)
    router.refresh()
  }
  return (
    <Button
      variant="link"
      onClick={onLogout}
      className="h-auto p-0 text-sm font-normal text-muted-foreground hover:text-foreground"
    >
      {t('product.manage.logout')}
    </Button>
  )
}
