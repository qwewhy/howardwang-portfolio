import { preloadProjectRoute } from '../../app/router/page-loaders'
import { useProjectIndexStore } from '../../app/store/project-index-store'
import type { ProjectSlug } from '../../shared/config/site'

export async function prefetchProject(slug: ProjectSlug) {
  const { prefetchedSlugs, markPrefetched } = useProjectIndexStore.getState()

  if (prefetchedSlugs.includes(slug)) {
    return
  }

  await preloadProjectRoute(slug)
  markPrefetched(slug)
}

