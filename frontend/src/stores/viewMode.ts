import { defineStore } from 'pinia'

export type ArticlesViewMode = 'default' | 'line' | 'square'

const STORAGE_KEY = 'articles:viewMode'

function loadInitialMode(): ArticlesViewMode {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === 'default' || raw === 'line' || raw === 'square') return raw
  } catch {}
  return 'default'
}

export const useViewModeStore = defineStore('viewMode', {
  state: () => ({
    mode: loadInitialMode() as ArticlesViewMode,
  }),
  actions: {
    setMode(mode: ArticlesViewMode) {
      this.mode = mode
      try { localStorage.setItem(STORAGE_KEY, mode) } catch {}
    },
    toggleNext() {
      const order: ArticlesViewMode[] = ['default', 'line', 'square']
      const next = order[(order.indexOf(this.mode) + 1) % order.length]
      this.setMode(next)
    },
  },
})


