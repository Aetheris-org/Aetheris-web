import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Article } from '@/types/article'

export interface ReadingListItem extends Article {
  savedAt: string
}

interface ReadingListState {
  items: ReadingListItem[]
  add: (article: Article) => void
  remove: (articleId: number) => void
  toggle: (article: Article) => void
  clear: () => void
}

export const useReadingListStore = create<ReadingListState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (article) => {
        const exists = get().items.some((item) => item.id === article.id)
        if (exists) return

        const savedAt = new Date().toISOString()
        set((state) => ({
          items: [
            {
              ...article,
              savedAt,
            },
            ...state.items,
          ],
        }))
      },
      remove: (articleId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== articleId),
        }))
      },
      toggle: (article) => {
        const exists = get().items.some((item) => item.id === article.id)
        if (exists) {
          get().remove(article.id)
        } else {
          get().add(article)
        }
      },
      clear: () => set({ items: [] }),
    }),
    {
      name: 'reading-list',
      version: 1,
      partialize: (state) => ({
        items: state.items,
      }),
    }
  )
)

export const selectReadingListItems = (state: ReadingListState) => state.items
export const selectIsSaved =
  (articleId: number) => (state: ReadingListState) =>
    state.items.some((item) => item.id === articleId)
export const selectReadingListCount = (state: ReadingListState) => state.items.length


