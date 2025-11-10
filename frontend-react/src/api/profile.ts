import apiClient, { getTokenFromCookie } from '@/lib/axios'
import { getStrapiMediaUrl } from '@/lib/strapi'
import type { User } from '@/types/user'
import type { Article } from '@/types/article'
import type { UserProfile } from '@/types/profile'

interface BackendUser {
  id: number | string
  username: string
  email?: string | null
  bio?: string | null
  createdAt?: string
  created_at?: string
  avatar?: any
  coverImage?: any
}

export function adaptBackendUser(backendUser: BackendUser): User {
  const avatar = getStrapiMediaUrl(backendUser.avatar)
  const coverImage = getStrapiMediaUrl(backendUser.coverImage)

  return {
    id: typeof backendUser.id === 'string' ? Number(backendUser.id) : backendUser.id,
    nickname: backendUser.username,
    email: backendUser.email ?? '',
    avatar: avatar ?? undefined,
    coverImage: coverImage ?? undefined,
    bio: backendUser.bio ?? undefined,
    articlesCount: 0,
    commentsCount: 0,
    likesReceived: 0,
    viewsReceived: 0,
    createdAt: backendUser.createdAt || backendUser.created_at || new Date().toISOString(),
    status: 'active',
    role: 'user',
    isVerified: false,
    isProfilePublic: true,
    showEmail: false,
    showLastSeen: false,
    reputation: 0,
    level: 1,
    experience: 0,
  }
}

export async function getCurrentUser(): Promise<User> {
  const token = getTokenFromCookie()
  console.log('👤 getCurrentUser called, token present:', !!token)

  if (!token) {
    throw new Error('Access token is missing')
  }

  console.log('🔵 Getting current user from /api/users/me')
  try {
    const response = await apiClient.get<BackendUser>('/api/users/me', {
    timeout: 10000,
  })

    const backendUser = response.data

    if (!backendUser || !backendUser.id || !backendUser.username) {
    console.error('❌ No data in response:', response.data)
    throw new Error('Failed to load user profile')
  }

    console.log('✅ User data loaded:', backendUser.username)
    return adaptBackendUser(backendUser)
  } catch (error: any) {
    console.error(
      '❌ Failed to load current user:',
      error?.response?.status,
      error?.response?.data ?? error,
    )
    throw error
  }
}

interface BackendProfileResponse {
  data: {
    user: {
      id: number
      username: string
      bio?: string | null
      memberSince: string
      avatarUrl?: string | null
      coverImageUrl?: string | null
    }
    stats: {
      publishedArticles: number
      draftArticles: number
      totalLikes: number
      totalComments: number
    }
    highlights: {
      tags: string[]
      recentArticleCount: number
    }
    articles: Array<{
      id: number
      title: string
      content: string
      excerpt?: string | null
      tags: string[]
      author: {
        id: number
        username: string
        avatar?: string | null
      }
      difficulty?: string | null
      likes?: number | null
      dislikes?: number | null
      commentsCount?: number | null
      createdAt: string
      updatedAt?: string | null
      status?: string
      previewImage?: string | null
    }>
  }
}

function adaptProfileArticle(article: BackendProfileResponse['data']['articles'][number]): Article {
  return {
    id: article.id,
    title: article.title,
    content: article.content,
    excerpt: article.excerpt ?? undefined,
    tags: article.tags ?? [],
    author: {
      id: article.author.id,
      username: article.author.username,
      avatar: article.author.avatar ?? undefined,
    },
    difficulty: article.difficulty ?? undefined,
    likes: article.likes ?? undefined,
    dislikes: article.dislikes ?? undefined,
    commentsCount: article.commentsCount ?? undefined,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt ?? undefined,
    status: (article.status as Article['status']) || 'published',
    previewImage: article.previewImage ?? undefined,
  }
}

export async function getUserProfile(userId: number): Promise<UserProfile> {
  const response = await apiClient.get<BackendProfileResponse>(`/api/profile/${userId}`, {
    timeout: 15000,
  })

  const payload = response.data?.data
  if (!payload) {
    throw new Error('Profile data is missing')
  }

  const avatarUrl = getStrapiMediaUrl(payload.user.avatarUrl) || undefined
  const coverImageUrl = getStrapiMediaUrl(payload.user.coverImageUrl) || undefined

  const profile: UserProfile = {
    user: {
      id: payload.user.id,
      username: payload.user.username,
      bio: payload.user.bio ?? undefined,
      memberSince: payload.user.memberSince,
      avatarUrl,
      coverImageUrl,
    },
    stats: {
      publishedArticles: payload.stats.publishedArticles,
      draftArticles: payload.stats.draftArticles,
      totalLikes: payload.stats.totalLikes,
      totalComments: payload.stats.totalComments,
    },
    highlights: {
      tags: payload.highlights.tags,
      recentArticleCount: payload.highlights.recentArticleCount,
    },
    articles: payload.articles.map(adaptProfileArticle),
  }

  return profile
}

interface UploadResponseItem {
  id: number
  url?: string
}

export async function uploadProfileMedia(file: File): Promise<UploadResponseItem> {
  const formData = new FormData()
  formData.append('files', file)

  const response = await apiClient.post<UploadResponseItem[]>('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'X-Require-Auth': 'true',
    },
  })

  const [uploaded] = response.data ?? []
  if (!uploaded?.id) {
    throw new Error('Failed to upload media')
  }

  return uploaded
}

interface UpdateUserProfilePayload {
  username: string
  bio?: string | null
  avatarId?: number | null
  coverImageId?: number | null
}

export async function updateUserProfile(userId: number, payload: UpdateUserProfilePayload): Promise<User> {
  const response = await apiClient.put<BackendUser>(
    `/api/users/${userId}`,
    {
      username: payload.username,
      bio: payload.bio ?? null,
      avatar: payload.avatarId ?? null,
      coverImage: payload.coverImageId ?? null,
    },
    {
      headers: {
        'X-Require-Auth': 'true',
      },
    }
  )

  return adaptBackendUser(response.data)
}
