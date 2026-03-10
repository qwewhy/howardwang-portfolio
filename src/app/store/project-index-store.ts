import { create } from 'zustand'
import type { ProjectSlug } from '../../shared/config/site'

interface ProjectIndexState {
  hoveredSlug: ProjectSlug | null
  prefetchedSlugs: ProjectSlug[]
  setHoveredSlug: (slug: ProjectSlug | null) => void
  markPrefetched: (slug: ProjectSlug) => void
}

export const useProjectIndexStore = create<ProjectIndexState>((set) => ({
  hoveredSlug: null,
  prefetchedSlugs: [],
  setHoveredSlug: (hoveredSlug) => set({ hoveredSlug }),
  markPrefetched: (slug) =>
    set((state) => ({
      prefetchedSlugs: state.prefetchedSlugs.includes(slug) ? state.prefetchedSlugs : [...state.prefetchedSlugs, slug],
    })),
}))

