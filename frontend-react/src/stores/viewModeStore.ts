import { create } from 'zustand'

type ViewMode = 'default' | 'line' | 'square'

interface ViewModeState {
  mode: ViewMode
  setMode: (mode: ViewMode) => void
}

const STORAGE_KEY = 'aetheris:view-mode'

function loadInitialMode(): ViewMode {
  if (typeof window === 'undefined') return 'default'
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === 'default' || stored === 'line' || stored === 'square') {
    return stored
  }
  return 'default'
}

export const useViewModeStore = create<ViewModeState>((set) => ({
  mode: loadInitialMode(),
  setMode: (mode) => {
    set({ mode })
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, mode)
    }
  },
}))

