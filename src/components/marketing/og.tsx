import { ImageResponse } from 'next/og'

export const ogSize = { width: 1200, height: 630 }
export const ogContentType = 'image/png'

// Branded Open Graph card (cream paper + ink-blue accent), inline styles only.
export function renderOgImage({ eyebrow, title }: { eyebrow: string; title: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#FAF9F5',
          padding: 80,
          fontFamily: 'Georgia, serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 34, fontWeight: 600, color: '#1A1A18' }}>
          Cancha
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 28, color: '#35527D', marginBottom: 18 }}>{eyebrow}</div>
          <div style={{ fontSize: 64, fontWeight: 600, color: '#1A1A18', lineHeight: 1.1, maxWidth: 980 }}>
            {title}
          </div>
        </div>
        <div style={{ display: 'flex', fontSize: 26, color: '#5F5B54' }}>
          La plateforme de gestion de tournois sportifs
        </div>
      </div>
    ),
    { ...ogSize },
  )
}
