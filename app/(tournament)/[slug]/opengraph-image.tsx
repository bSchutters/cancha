import { ImageResponse } from 'next/og'
import { getPayloadClient } from '@/lib/payload'
import { resolveTenant } from '@/lib/tournament/tenant'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Aperçu du tournoi'
// Tenant + tournament are resolved per request (host headers + live data).
export const dynamic = 'force-dynamic'

type Doc = { name?: string; edition_date?: string }

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const payload = await getPayloadClient()
  const org = await resolveTenant(payload)

  // Light query: the card only needs the name + date, not the full public view.
  const res = await payload.find({
    collection: 'tournaments',
    where: org
      ? { and: [{ slug: { equals: slug } }, { tenant: { equals: org.id } }] }
      : { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  })
  const doc = res.docs[0] as Doc | undefined

  const title = doc?.name ?? 'Tournoi'
  const siteName = org?.name ?? 'Cup Generator'
  const accent = org?.accentColor ?? '#fed164'
  const dateLabel = doc?.edition_date
    ? new Date(doc.edition_date).toLocaleDateString('fr-BE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0b0b0c',
          color: '#ffffff',
          padding: '80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 34, fontWeight: 700, color: accent }}>
          {siteName}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 82, fontWeight: 800, lineHeight: 1.05 }}>
            {title}
          </div>
          {dateLabel && (
            <div style={{ display: 'flex', fontSize: 38, opacity: 0.8, marginTop: 16 }}>
              {dateLabel}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 28, opacity: 0.7 }}>
          <div
            style={{ width: 56, height: 8, background: accent, borderRadius: 4, marginRight: 16 }}
          />
          Futsal · résultats en direct
        </div>
      </div>
    ),
    size,
  )
}
