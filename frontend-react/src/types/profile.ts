import type { Article } from '@/types/article'

export interface ProfileStats {
  publishedArticles: number
  totalLikes: number
  totalComments: number
}

export interface ProfileHighlights {
  tags: string[]
  recentArticleCount: number
}

export interface ProfileComment {
  id: string
  text: string
  createdAt: string
  article: {
    id: string
    title: string
  }
}

export interface ProfileBookmark {
  id: string
  createdAt: string
  article: {
    id: string
    title: string
    excerpt?: string | null
    previewImage?: string | null
  }
}

export interface UserProfile {
  user: {
    id: number
    username: string
    bio?: string | null
    memberSince: string
    avatarUrl?: string | null
    coverImageUrl?: string | null
  }
  stats: ProfileStats
  highlights: ProfileHighlights
  articles: Article[]
  comments: ProfileComment[]
  bookmarks: ProfileBookmark[]
}


