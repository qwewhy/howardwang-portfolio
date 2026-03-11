import { create } from 'zustand'

interface PhysicsSkillsState {
  /** User preference: show physics or static layout */
  physicsMode: boolean
  togglePhysicsMode: () => void
}

export const usePhysicsSkillsStore = create<PhysicsSkillsState>((set) => ({
  physicsMode: true,
  togglePhysicsMode: () => set((s) => ({ physicsMode: !s.physicsMode })),
}))
