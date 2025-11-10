export interface User {
  id: number
  nickname: string
  email: string
  avatar?: string
  coverImage?: string
  firstName?: string
  lastName?: string
  bio?: string
  website?: string
  location?: string
  birthDate?: string | Date

  followersCount?: number
  followingCount?: number
  isFollowing?: boolean

  articlesCount: number
  commentsCount: number
  likesReceived: number
  viewsReceived: number

  createdAt: string | Date
  updatedAt?: string | Date
  lastLoginAt?: string | Date
  lastSeenAt?: string | Date

  status: 'active' | 'inactive' | 'banned' | 'pending'
  role: 'user' | 'moderator' | 'admin' | 'super_admin'
  isVerified: boolean

  isProfilePublic: boolean
  showEmail: boolean
  showLastSeen: boolean

  reputation: number
  level: number
  experience: number
}

export interface PublicUser {
  id: number
  nickname: string
  avatar?: string
  role: string
  isVerified: boolean
  reputation: number
  level: number
  articlesCount: number
}

export interface LoginCredentials {
  login: string
  password: string
  rememberMe?: boolean
}

export interface RegisterData {
  nickname: string
  email: string
  password: string
  confirmPassword: string
  agreeToTerms: boolean
  agreeToPrivacy: boolean
}

export interface AuthResponse {
  success: boolean
  user: User
  token: string
  refreshToken?: string
  expiresIn: number
  message?: string
}

