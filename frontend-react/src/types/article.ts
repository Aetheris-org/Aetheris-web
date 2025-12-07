export interface Author {
  id: number | string // Может быть UUID (string) или числовой ID
  username: string
}

export interface Article {
  // id - это строковое представление числового Strapi id (для роутов)
  id: string
  title: string
  content: string // HTML для обратной совместимости
  contentJSON?: any // Slate JSON для использования с TipTap
  excerpt?: string
  author: {
    id: number | string // Может быть UUID (string) или числовой ID
    uuid?: string // UUID для навигации к профилю
    username: string
    avatar?: string
  }
  tags: string[]
  createdAt: string
  updatedAt?: string
  status: 'draft' | 'published' | 'archived'
  likes?: number
  dislikes?: number
  commentsCount?: number
  userReaction?: 'like' | 'dislike' | null
  isBookmarked?: boolean
  previewImage?: string
  previewImageId?: number | null
  difficulty?: string
  author_id?: number
  views?: number
  publishedAt?: string
  category?: string
  language?: string
  readTimeMinutes?: number
  reactionsCount?: number
}

export interface ArticlesResponse {
  articles: Article[]
  total: number
}

export interface CreateArticleRequest {
  title: string
  content: string
  excerpt?: string
  tags: string[]
  status: string
  preview_image?: number | null
  difficulty?: string
}

export type ArticleDifficulty = 'beginner' | 'intermediate' | 'advanced'
export type ArticleSortOption = 'newest' | 'oldest' | 'popular'

