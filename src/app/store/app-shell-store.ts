import { create } from 'zustand'

interface AppShellState {
  navigationOpen: boolean
  reducedMotion: boolean
  lowPerformanceMode: boolean
  isMobile: boolean
  setNavigationOpen: (open: boolean) => void
  setReducedMotion: (value: boolean) => void
  setLowPerformanceMode: (value: boolean) => void
  setIsMobile: (value: boolean) => void
}

export const useAppShellStore = create<AppShellState>((set) => ({
  navigationOpen: false,
  reducedMotion: false,
  lowPerformanceMode: false,
  isMobile: false,
  setNavigationOpen: (navigationOpen) => set({ navigationOpen }),
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
  setLowPerformanceMode: (lowPerformanceMode) => set({ lowPerformanceMode }),
  setIsMobile: (isMobile) => set({ isMobile }),
}))

