import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MarketingShell } from '@/components/marketing/shell'
import { MiniLanding } from '@/components/marketing/mini-landing'
import { SPORTS } from '@/lib/marketing/content'

export function generateStaticParams() {
  return SPORTS.map((s) => ({ sport: s.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sport: string }>
}): Promise<Metadata> {
  const { sport } = await params
  const c = SPORTS.find((s) => s.slug === sport)
  if (!c) return {}
  return { title: c.eyebrow, description: c.intro, alternates: { canonical: `/sports/${c.slug}` } }
}

export default async function SportPage({ params }: { params: Promise<{ sport: string }> }) {
  const { sport } = await params
  const c = SPORTS.find((s) => s.slug === sport)
  if (!c) notFound()
  return (
    <MarketingShell>
      <MiniLanding eyebrow={c.eyebrow} h1={c.h1} intro={c.intro} />
    </MarketingShell>
  )
}
