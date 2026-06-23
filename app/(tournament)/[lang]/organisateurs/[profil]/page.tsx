import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MarketingShell } from '@/components/marketing/shell'
import { MiniLanding } from '@/components/marketing/mini-landing'
import { Breadcrumbs } from '@/components/marketing/structured-data'
import { getRequestBaseUrl } from '@/lib/tournament/seo'
import { PROFILES } from '@/lib/marketing/content'

export function generateStaticParams() {
  return PROFILES.map((p) => ({ profil: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ profil: string }>
}): Promise<Metadata> {
  const { profil } = await params
  const c = PROFILES.find((p) => p.slug === profil)
  if (!c) return {}
  return { title: c.eyebrow, description: c.intro, alternates: { canonical: `/organisateurs/${c.slug}` } }
}

export default async function ProfilePage({ params }: { params: Promise<{ profil: string }> }) {
  const { profil } = await params
  const c = PROFILES.find((p) => p.slug === profil)
  if (!c) notFound()
  const base = await getRequestBaseUrl()
  return (
    <MarketingShell>
      <Breadcrumbs baseUrl={base} items={[{ name: 'Accueil', href: '/' }, { name: c.name }]} />
      <MiniLanding eyebrow={c.eyebrow} h1={c.h1} intro={c.intro} bullets={c.bullets} />
    </MarketingShell>
  )
}
