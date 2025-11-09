import { create } from 'zustand'

type ViewMode = 'default' | 'line' | 'square'

interface ViewModeState {
  mode: ViewMode
  setMode: (mode: ViewMode) => void
}

export const useViewModeStore = create<ViewModeState>((set) => ({
  mode: 'default',
  setMode: (mode) => set({ mode }),
}))

