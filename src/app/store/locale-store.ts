import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { getBrowserStorage } from './persist-storage'
import { siteConfig, type Locale } from '../../shared/config/site'

interface LocaleState {
  currentLocale: Locale
  preferredLocale: Locale
  setCurrentLocale: (locale: Locale) => void
  setPreferredLocale: (locale: Locale) => void
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      currentLocale: siteConfig.defaultLocale,
      preferredLocale: siteConfig.defaultLocale,
      setCurrentLocale: (locale) => set({ currentLocale: locale }),
      setPreferredLocale: (locale) => set({ currentLocale: locale, preferredLocale: locale }),
    }),
    {
      name: 'hw-portfolio-locale',
      storage: createJSONStorage(getBrowserStorage),
      partialize: (state) => ({
        preferredLocale: state.preferredLocale,
      }),
    },
  ),
)

