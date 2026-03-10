import { create } from 'zustand'

interface HomeVisualState {
  activeDimension: string
  setActiveDimension: (dimension: string) => void
}

export const useHomeVisualStore = create<HomeVisualState>((set) => ({
  activeDimension: 'spatial-web',
  setActiveDimension: (activeDimension) => set({ activeDimension }),
}))

