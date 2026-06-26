import { SPORTS } from '@/lib/marketing/content'
import { renderOgImage, ogSize, ogContentType } from '@/components/marketing/og'

export const size = ogSize
export const contentType = ogContentType
export const alt = 'Cancha'

export default async function Image({ params }: { params: Promise<{ sport: string }> }) {
  const { sport } = await params
  const c = SPORTS.find((s) => s.slug === sport)
  return renderOgImage({
    eyebrow: c?.eyebrow ?? 'Gestion de tournois',
    title: c?.h1 ?? 'Cancha',
  })
}
