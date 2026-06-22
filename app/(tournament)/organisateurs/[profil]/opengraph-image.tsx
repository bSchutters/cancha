import { PROFILES } from '@/lib/marketing/content'
import { renderOgImage, ogSize, ogContentType } from '@/components/marketing/og'

export const size = ogSize
export const contentType = ogContentType
export const alt = 'Cup Generator'

export default async function Image({ params }: { params: Promise<{ profil: string }> }) {
  const { profil } = await params
  const c = PROFILES.find((p) => p.slug === profil)
  return renderOgImage({
    eyebrow: c?.eyebrow ?? 'Gestion de tournois',
    title: c?.h1 ?? 'Cup Generator',
  })
}
