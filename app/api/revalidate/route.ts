import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'

/**
 * Manual cache purge for an external caller (a webhook, a deploy step).
 *
 * Nothing in the app uses it: writes purge their own tags in-process through the
 * hooks in src/payload/hooks/revalidateCache.ts. Left open it was a free DoS
 * lever — anyone could purge every tag in a loop and send all traffic straight to
 * the database — so it is DISABLED unless REVALIDATE_SECRET is set, and then
 * requires that secret as a bearer token.
 */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET?.trim()
  // Not configured: behave as if the route did not exist.
  if (!secret) return new NextResponse(null, { status: 404 })
  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { tags } = await request.json() as { tags?: string[] }

    if (!tags || !Array.isArray(tags)) {
      return NextResponse.json({ error: 'Missing tags array' }, { status: 400 })
    }

    for (const tag of tags) {
      // Next 16: 'max' profile purges the tag (replaces legacy single-arg call).
      revalidateTag(tag, 'max')
    }

    return NextResponse.json({ revalidated: tags })
  } catch (error) {
    console.error('Revalidation error:', error)
    return NextResponse.json({ error: 'Revalidation failed' }, { status: 500 })
  }
}
