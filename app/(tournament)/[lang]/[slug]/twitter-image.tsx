// Twitter card image: Next maps opengraph-image only to og:image, not
// twitter:image. Reuse the same generated card so summary_large_image cards
// carry an explicit twitter:image instead of relying on the og:image fallback.
export { default, size, contentType, alt } from './opengraph-image'

export const dynamic = 'force-dynamic'
