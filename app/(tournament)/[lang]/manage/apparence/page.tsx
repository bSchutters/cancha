import { redirect } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'
import { getSessionUser, isManager, isSuperAdmin } from '@/lib/tournament/session'
import { resolveManageOrgId } from '@/lib/tournament/tenant'
import { normalizeTheme } from '@/lib/tournament/theme'
import { AppearanceForm } from '@/components/tournament/manage/AppearanceForm'

export const dynamic = 'force-dynamic'

export default async function AppearancePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const user = await getSessionUser()
  if (!isManager(user)) redirect(`/${lang}/login`)

  const payload = await getPayloadClient()
  const orgId = await resolveManageOrgId(payload, user)

  // Ambiguous: a super-admin with several orgs themes each one from /admin.
  if (orgId == null) {
    return (
      <main className="mx-auto max-w-screen-2xl px-4 py-10">
        <h1 className="text-3xl font-bold">Apparence</h1>
        <p className="mt-4 max-w-prose text-muted-foreground">
          {isSuperAdmin(user)
            ? 'Plusieurs organisations existent et votre compte n’est rattaché à aucune en particulier. Modifiez le thème de chaque organisation depuis /admin → Organisations → Apparence.'
            : "Aucune organisation n'est associée à votre compte."}
        </p>
      </main>
    )
  }

  const org = (await payload.findByID({
    collection: 'organizations',
    id: orgId,
    depth: 1,
    overrideAccess: true,
  })) as {
    name?: string
    base_color?: string | null
    accent_color?: string | null
    radius?: string | null
    heading_font?: string | null
    body_font?: string | null
    logo?: { url?: string } | string | null
  }

  const theme = normalizeTheme(org)
  const logoUrl = org.logo && typeof org.logo === 'object' ? (org.logo.url ?? null) : null

  return (
    <main className="mx-auto max-w-screen-2xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Apparence</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Thème de <span className="font-medium text-foreground">{org.name}</span> - appliqué aux pages
          publiques et aux écrans TV.
        </p>
      </div>
      <AppearanceForm initial={theme} orgId={orgId} initialLogoUrl={logoUrl} />
    </main>
  )
}
