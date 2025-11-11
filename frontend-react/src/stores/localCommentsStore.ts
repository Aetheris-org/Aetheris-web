import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * ⚠️ Local-only comment persistence.
 * See `docs/comments-integration-notes.md` for migration guidance.
 */
export interface LocalComment {
  id: string
  articleId: string
  text: string
  createdAt: string
  parentId?: string | null
  author: {
    id: number
    username: string
    avatar?: string
  }
}

interface LocalCommentsState {
  comments: Record<string, LocalComment[]>
  addComment: (comment: LocalComment) => void
  clearArticle: (articleId: string) => void
}

export const useLocalCommentsStore = create<LocalCommentsState>()(
  persist(
    (set) => ({
      comments: {},
      addComment: (comment) =>
        set((state) => {
          const key = comment.articleId
          const current = state.comments[key] ?? []
          return {
            comments: {
              ...state.comments,
              [key]: [comment, ...current],
            },
          }
        }),
      clearArticle: (articleId) =>
        set((state) => {
          const next = { ...state.comments }
          delete next[articleId]
          return { comments: next }
        }),
    }),
    {
      name: 'aetheris-local-comments',
      version: 2,
      migrate: (persistedState: any) => {
        if (!persistedState || typeof persistedState !== 'object') {
          return { comments: {} }
        }
        if (persistedState.version === 2) return persistedState

        const previousComments = persistedState.comments ?? {}
        const normalized: Record<string, LocalComment[]> = {}

        Object.entries(previousComments as Record<string, any[]>).forEach(([key, value]) => {
          const articleKey = String(key)
          if (!Array.isArray(value)) return
          normalized[articleKey] = value.map((comment) => ({
            id: String(comment.id ?? `legacy-${Date.now()}`),
            articleId: String(comment.articleId ?? articleKey),
            text: comment.text ?? '',
            createdAt: comment.createdAt ?? new Date().toISOString(),
            parentId: comment.parentId ?? null,
            author: {
              id: Number(comment.author?.id ?? 0),
              username:
                comment.author?.username ??
                comment.author?.nickname ??
                'You',
              avatar: comment.author?.avatar,
            },
          }))
        })

        return { comments: normalized }
      },
      // TODO (future devs): When replacing with real backend comments, remove this persist layer.
    }
  )
)

export const selectLocalComments = (articleId: string) => (state: LocalCommentsState) =>
  state.comments[articleId] ?? []


