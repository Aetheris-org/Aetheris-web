/**
 * GraphQL API для профилей пользователей
 */
import { query } from '@/lib/graphql'
import { logger } from '@/lib/logger'
import type { UserProfile } from '@/types/profile'
import type { Article } from '@/types/article'

interface GraphQLUserProfile {
  id: string
  username: string
  bio?: string | null
  avatar?: string | null
  coverImage?: string | null
  createdAt: string
  articles: Array<{
    id: string
    title: string
    excerpt?: string | null
    tags: string[]
    previewImage?: string | null
    difficulty?: string | null
    likes_count: number
    dislikes_count: number
    views: number
    publishedAt?: string | null
    createdAt: string
    updatedAt?: string | null
    comments: Array<{
      id: string
    }>
    author: {
      id: string
      username: string
      avatar?: string | null
    }
  }>
  comments: Array<{
    id: string
    text: string
    createdAt: string
    article: {
      id: string
      title: string
    }
  }>
  bookmarks: Array<{
    id: string
    createdAt: string
    article: {
      id: string
      title: string
      excerpt?: string | null
      previewImage?: string | null
    }
  }>
}

function transformUserProfile(raw: GraphQLUserProfile, currentUserId?: number): UserProfile {
  const publishedArticles = raw.articles.filter((a) => a.publishedAt !== null)

  // Подсчитываем общее количество лайков из всех статей пользователя
  const totalLikes = raw.articles.reduce((sum, article) => sum + (article.likes_count || 0), 0)

  // Получаем все уникальные теги из опубликованных статей
  const allTags = publishedArticles.flatMap((a) => a.tags || [])
  const tagCounts = allTags.reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Сортируем теги по частоте и берем топ-10
  const topTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([tag]) => tag)

  // Преобразуем статьи
  const articles: Article[] = raw.articles.map((article) => {
    const numericId = typeof article.id === 'number' ? article.id : Number.parseInt(article.id, 10) || 0

    return {
      id: String(numericId),
      title: article.title,
      content: '', // Не загружаем полный контент для списка статей
      excerpt: article.excerpt ?? undefined,
      tags: article.tags || [],
      author: {
        id: typeof article.author.id === 'number' ? article.author.id : Number.parseInt(article.author.id, 10) || 0,
        username: article.author.username,
        avatar: article.author.avatar ?? undefined,
      },
      difficulty: article.difficulty ?? undefined,
      likes: article.likes_count,
      dislikes: article.dislikes_count,
      commentsCount: article.comments.length,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt ?? undefined,
      status: article.publishedAt ? 'published' : 'draft',
      previewImage: article.previewImage ?? undefined,
    }
  })

  // Преобразуем комментарии
  const comments = raw.comments.map((comment) => ({
    id: String(comment.id),
    text: comment.text,
    createdAt: comment.createdAt,
    article: {
      id: String(comment.article.id),
      title: comment.article.title,
    },
  }))

  // Преобразуем закладки
  const bookmarks = raw.bookmarks.map((bookmark) => ({
    id: String(bookmark.id),
    createdAt: bookmark.createdAt,
    article: {
      id: String(bookmark.article.id),
      title: bookmark.article.title,
      excerpt: bookmark.article.excerpt ?? undefined,
      previewImage: bookmark.article.previewImage ?? undefined,
    },
  }))

  return {
    user: {
      id: typeof raw.id === 'number' ? raw.id : Number.parseInt(raw.id, 10) || 0,
      username: raw.username,
      bio: raw.bio ?? undefined,
      memberSince: raw.createdAt,
      avatarUrl: raw.avatar ?? undefined,
      coverImageUrl: raw.coverImage ?? undefined,
    },
    stats: {
      publishedArticles: publishedArticles.length,
      totalLikes,
      totalComments: raw.comments.length,
    },
    highlights: {
      tags: topTags,
      recentArticleCount: publishedArticles.length,
    },
    articles,
    comments,
    bookmarks,
  }
}

/**
 * Получить профиль пользователя по ID
 */
export async function getUserProfile(userId: number): Promise<UserProfile> {
  logger.debug(`[getUserProfile] Fetching profile for user ${userId}`)

  const profileQuery = `
    query GetUserProfile($id: ID!) {
      user(where: { id: $id }) {
        id
        username
        bio
        avatar
        coverImage
        createdAt
        articles {
          id
          title
          excerpt
          tags
          previewImage
          difficulty
          likes_count
          dislikes_count
          views
          publishedAt
          createdAt
          updatedAt
          comments {
            id
          }
          author {
            id
            username
            avatar
          }
        }
        comments(where: {}, orderBy: { createdAt: desc }, take: 50) {
          id
          text
          createdAt
          article {
            id
            title
          }
        }
        bookmarks(where: {}, orderBy: { createdAt: desc }, take: 50) {
          id
          createdAt
          article {
            id
            title
            excerpt
            previewImage
          }
        }
      }
    }
  `

  try {
    const data = await query<{ user: GraphQLUserProfile | null }>(profileQuery, {
      id: String(userId),
    })

    if (!data.user) {
      logger.warn(`[getUserProfile] User ${userId} not found`)
      throw new Error('User not found')
    }

    const profile = transformUserProfile(data.user)
    logger.debug(`[getUserProfile] Profile loaded for user ${userId}:`, {
      username: profile.user.username,
      articlesCount: profile.articles.length,
    })

    return profile
  } catch (error: any) {
    logger.error(`[getUserProfile] Failed to fetch profile for user ${userId}:`, error)
    throw error
  }
}

