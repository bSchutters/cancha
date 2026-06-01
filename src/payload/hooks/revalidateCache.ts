import { revalidateTag } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

function revalidateTags(tags: string[]) {
  for (const tag of tags) {
    // Next 16 requires a cache-life profile; 'max' purges the tag (the recommended
    // replacement for the legacy single-arg revalidateTag).
    revalidateTag(tag, 'max')
  }
}

export function revalidateAfterChange(tags: string[]): CollectionAfterChangeHook {
  return ({ doc }) => {
    revalidateTags(tags)
    return doc
  }
}

export function revalidateAfterDelete(tags: string[]): CollectionAfterDeleteHook {
  return ({ doc }) => {
    revalidateTags(tags)
    return doc
  }
}

// Dynamic variants: build the tags from the changed/deleted doc (e.g. per-slug tags).
export function revalidateAfterChangeDynamic(
  buildTags: (doc: Record<string, unknown>) => string[],
): CollectionAfterChangeHook {
  return ({ doc }) => {
    revalidateTags(buildTags(doc))
    return doc
  }
}

export function revalidateAfterDeleteDynamic(
  buildTags: (doc: Record<string, unknown>) => string[],
): CollectionAfterDeleteHook {
  return ({ doc }) => {
    revalidateTags(buildTags(doc))
    return doc
  }
}
