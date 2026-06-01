/** Client-side helpers for uploading images to the Payload media collection. */

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024 // 5 MB

/** Returns an error message if the file is not a valid image, otherwise null. */
export function validateImageFile(file: File): string | null {
  if (!file.type.startsWith('image/')) return 'Le fichier doit être une image.'
  if (file.size > MAX_IMAGE_BYTES) {
    return `Image trop lourde (max ${Math.round(MAX_IMAGE_BYTES / 1024 / 1024)} Mo).`
  }
  return null
}

/** Uploads a file to /api/media and returns the created media id (or null on failure). */
export async function uploadMedia(file: File, alt = 'logo'): Promise<number | null> {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('alt', alt)
  const up = await fetch('/api/media', { method: 'POST', credentials: 'include', body: fd })
  const body = await up.json().catch(() => null)
  return up.ok ? (body?.doc?.id ?? null) : null
}
