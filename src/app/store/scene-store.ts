import { create, type StoreApi, type UseBoundStore } from 'zustand'
import type { ProjectSlug } from '../../shared/config/site'
import type { ScenePerformanceMode } from '../../scenes/core/types'

interface ProjectSceneState {
  chapterId: string
  overlayVisible: boolean
  sceneReady: boolean
  performanceMode: ScenePerformanceMode
  setChapter: (chapterId: string) => void
  setOverlayVisible: (overlayVisible: boolean) => void
  setSceneReady: (sceneReady: boolean) => void
  setPerformanceMode: (mode: ScenePerformanceMode) => void
}

type ProjectSceneStore = UseBoundStore<StoreApi<ProjectSceneState>>

const sceneStoreMap = new Map<ProjectSlug, ProjectSceneStore>()

function createSceneStore() {
  return create<ProjectSceneState>((set) => ({
    chapterId: 'overview',
    overlayVisible: true,
    sceneReady: false,
    performanceMode: 'default',
    setChapter: (chapterId) => set({ chapterId }),
    setOverlayVisible: (overlayVisible) => set({ overlayVisible }),
    setSceneReady: (sceneReady) => set({ sceneReady }),
    setPerformanceMode: (performanceMode) => set({ performanceMode }),
  }))
}

export function createProjectSceneStore(slug: ProjectSlug) {
  const cachedStore = sceneStoreMap.get(slug)

  if (cachedStore) {
    return cachedStore
  }

  const createdStore = createSceneStore()
  sceneStoreMap.set(slug, createdStore)
  return createdStore
}
