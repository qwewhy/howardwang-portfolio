import type { StateStorage } from 'zustand/middleware'

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
}

export function getBrowserStorage(): StateStorage {
  return typeof window === 'undefined' ? noopStorage : window.localStorage
}

