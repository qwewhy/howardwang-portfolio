import { create } from 'zustand'

interface AboutInteractionsState {
  activeHabitId: string | null
  activeVariantId: string | null
  activeStatusId: string | null
  selectHabit: (habitId: string, variantId: string) => void
  selectVariant: (variantId: string) => void
  selectStatus: (statusId: string) => void
}

export const useAboutInteractionsStore = create<AboutInteractionsState>((set) => ({
  activeHabitId: null,
  activeVariantId: null,
  activeStatusId: null,
  selectHabit: (activeHabitId, activeVariantId) => set({ activeHabitId, activeVariantId }),
  selectVariant: (activeVariantId) => set({ activeVariantId }),
  selectStatus: (activeStatusId) => set({ activeStatusId }),
}))
