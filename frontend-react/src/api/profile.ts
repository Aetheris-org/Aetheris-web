import apiClient, { getTokenFromCookie } from '@/lib/axios'
import { getStrapiMediaUrl } from '@/lib/strapi'
import type { User } from '@/types/user'

interface BackendUser {
  id: number
  username: string
  email?: string | null
  bio?: string | null
  createdAt?: string
  created_at?: string
  avatar?: any
}

export function adaptBackendUser(backendUser: BackendUser): User {
  const avatar = getStrapiMediaUrl(backendUser.avatar)

  return {
    id: backendUser.id,
    nickname: backendUser.username,
    email: backendUser.email ?? '',
    avatar: avatar ?? undefined,
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
  if (!token) {
    throw new Error('Access token is missing')
  }

  const response = await apiClient.get<BackendUser>('/api/users/me', {
    headers: {
      'X-Require-Auth': 'true',
    },
    params: {
      populate: {
        avatar: { fields: ['url'] },
      },
    },
  })

  if (!response.data) {
    throw new Error('Failed to load user profile')
  }

  return adaptBackendUser(response.data)
}
