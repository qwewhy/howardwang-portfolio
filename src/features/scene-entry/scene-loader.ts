import type { ProjectSlug } from '../../shared/config/site'

export async function loadSceneModule(slug: ProjectSlug) {
  switch (slug) {
    case 'dynagraphai':
      return import('../../scenes/dynagraphai/adapter')
    case 'chemviz3d':
      return import('../../scenes/chemviz3d/adapter')
    case 'virtual-coach':
      return import('../../scenes/virtual-coach/adapter')
  }
}

