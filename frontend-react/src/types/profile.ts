import type { Article } from '@/types/article'

export interface ProfileStats {
  publishedArticles: number
  draftArticles: number
  totalLikes: number
  totalComments: number
}

export interface ProfileHighlights {
  tags: string[]
  recentArticleCount: number
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
}


