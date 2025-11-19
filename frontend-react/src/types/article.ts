export interface Author {
  id: number
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
    id: number
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

