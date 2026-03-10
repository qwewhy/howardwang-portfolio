import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { getBrowserStorage } from './persist-storage'
import { siteConfig, type ThemeId } from '../../shared/config/site'

interface ThemeState {
  themeId: ThemeId
  setTheme: (themeId: ThemeId) => void
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      themeId: siteConfig.defaultTheme,
      setTheme: (themeId) => set({ themeId }),
      toggleTheme: () =>
        set({
          themeId: get().themeId === 'dark' ? 'light' : 'dark',
        }),
    }),
    {
      name: 'hw-portfolio-theme',
      storage: createJSONStorage(getBrowserStorage),
    },
  ),
)

