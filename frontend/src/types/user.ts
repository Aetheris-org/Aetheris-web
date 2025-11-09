/**
 * ТИПЫ ДЛЯ ПОЛЬЗОВАТЕЛЕЙ
 * TypeScript типы для работы с пользователями и аутентификацией
 *
 * Автор: pinicilin
 * Версия: 1.0
 * Дата создания: 18.09.2025
 */

// Основные типы пользователя
export interface User {
  id: number
  nickname: string
  email: string
  avatar?: string
  firstName?: string
  lastName?: string
  bio?: string
  website?: string
  location?: string
  birthDate?: string | Date

  // Социальные связи
  followersCount?: number
  followingCount?: number
  isFollowing?: boolean

  // Статистика
  articlesCount: number
  commentsCount: number
  likesReceived: number
  viewsReceived: number

  // Даты
  createdAt: string | Date
  updatedAt?: string | Date
  lastLoginAt?: string | Date
  lastSeenAt?: string | Date

  // Статус и роли
  status: 'active' | 'inactive' | 'banned' | 'pending'
  role: 'user' | 'moderator' | 'admin' | 'super_admin'
  isVerified: boolean

  // Настройки приватности
  isProfilePublic: boolean
  showEmail: boolean
  showLastSeen: boolean

  // Ранги и достижения
  rank?: UserRank
  badges?: UserBadge[]
  reputation: number
  level: number
  experience: number
}

// Публичная информация о пользователе (для карточек, комментариев и т.д.)
export interface PublicUser {
  id: number
  nickname: string
  avatar?: string
  role: string
  rank?: UserRank
  isVerified: boolean
  reputation: number
  level: number
  articlesCount: number
}

// Ранги пользователей
export interface UserRank {
  id: number
  name: string
  displayName: string
  color: string
  icon?: string
  minReputation: number
  permissions: string[]
}

// Бейджи/достижения
export interface UserBadge {
  id: number
  name: string
  displayName: string
  description: string
  icon: string
  color: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  earnedAt: string | Date
}

// Профиль пользователя (расширенная информация)
export interface UserProfile extends User {
  // Дополнительные поля для полного профиля
  socialLinks?: {
    github?: string
    twitter?: string
    linkedin?: string
    discord?: string
    telegram?: string
  }

  // Предпочтения
  preferences: UserPreferences

  // Статистика активности
  activityStats: UserActivityStats
}

// Настройки пользователя
export interface UserPreferences {
  theme: 'system' | 'light' | 'dark' | 'custom'
  language: string
  timezone: string

  // Уведомления
  notifications: {
    email: boolean
    push: boolean
    inApp: boolean

    // Типы уведомлений
    newFollower: boolean
    newComment: boolean
    newLike: boolean
    articleMentioned: boolean
    weeklyDigest: boolean
    securityAlerts: boolean
  }

  // Приватность
  privacy: {
    showEmail: boolean
    showLastSeen: boolean
    showOnlineStatus: boolean
    allowDirectMessages: boolean
    requireFollowToMessage: boolean
  }

  // Контент
  content: {
    defaultArticleVisibility: 'public' | 'followers' | 'private'
    allowComments: boolean
    moderateComments: boolean
    showReadingStats: boolean
  }
}

// Статистика активности
export interface UserActivityStats {
  // За текущий месяц
  monthlyStats: {
    articlesPublished: number
    commentsWritten: number
    likesGiven: number
    likesReceived: number
    profileViews: number
    articlesViews: number
  }

  // За все время
  totalStats: {
    articlesPublished: number
    commentsWritten: number
    likesGiven: number
    likesReceived: number
    profileViews: number
    articlesViews: number
    joinedDaysAgo: number
  }

  // Активность по дням (последние 30 дней)
  dailyActivity: {
    date: string
    articles: number
    comments: number
    likes: number
    views: number
  }[]
}

// Типы для аутентификации
export interface LoginCredentials {
  login: string // nickname или email
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

// Типы для обновления профиля
export interface UpdateProfileData {
  nickname?: string
  firstName?: string
  lastName?: string
  bio?: string
  website?: string
  location?: string
  birthDate?: string
  socialLinks?: {
    github?: string
    twitter?: string
    linkedin?: string
    discord?: string
    telegram?: string
  }
}

// Типы для изменения пароля
export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// Типы для восстановления пароля
export interface ForgotPasswordData {
  email: string
}

export interface ResetPasswordData {
  token: string
  password: string
  confirmPassword: string
}

// Типы для поиска пользователей
export interface UserSearchFilters {
  query?: string
  role?: string
  isVerified?: boolean
  minReputation?: number
  maxReputation?: number
  joinedAfter?: string | Date
  joinedBefore?: string | Date
  location?: string
  hasArticles?: boolean
}

export interface UserSearchResult {
  users: PublicUser[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// Типы для подписок
export interface FollowData {
  followerId: number
  followingId: number
  createdAt: string | Date
}

export interface FollowersResponse {
  followers: PublicUser[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface FollowingResponse {
  following: PublicUser[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// Типы для блокировки пользователей
export interface BlockedUser {
  id: number
  blockedUser: PublicUser
  reason?: string
  blockedAt: string | Date
}

// Типы для сессий
export interface UserSession {
  id: string
  deviceInfo: {
    browser: string
    os: string
    device: string
    ip: string
    location?: string
  }
  isCurrentSession: boolean
  createdAt: string | Date
  lastActivity: string | Date
  expiresAt: string | Date
}

// Типы для уведомлений
export interface Notification {
  id: number
  type: 'new_follower' | 'new_comment' | 'new_like' | 'article_mentioned' | 'system'
  title: string
  message: string
  data?: any
  isRead: boolean
  createdAt: string | Date

  // Связанные объекты
  fromUser?: PublicUser
  article?: {
    id: number
    title: string
    slug: string
  }
  comment?: {
    id: number
    content: string
  }
}

export interface NotificationsResponse {
  notifications: Notification[]
  total: number
  unreadCount: number
  page: number
  limit: number
  hasMore: boolean
}

// Типы для административных действий
export interface AdminUserActions {
  banUser: (userId: number, reason: string, duration?: number) => Promise<void>
  unbanUser: (userId: number) => Promise<void>
  verifyUser: (userId: number) => Promise<void>
  unverifyUser: (userId: number) => Promise<void>
  changeUserRole: (userId: number, role: User['role']) => Promise<void>
  deleteUser: (userId: number) => Promise<void>
}

// Типы для статистики пользователей (для админки)
export interface UserStats {
  totalUsers: number
  activeUsers: number
  newUsersToday: number
  newUsersThisWeek: number
  newUsersThisMonth: number
  bannedUsers: number
  verifiedUsers: number

  // Распределение по ролям
  roleDistribution: {
    role: string
    count: number
  }[]

  // Активность по дням
  dailyRegistrations: {
    date: string
    count: number
  }[]
}

// Экспорт всех типов для удобства
export type {
  User,
  PublicUser,
  UserProfile,
  UserPreferences,
  UserActivityStats,
  UserRank,
  UserBadge,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  UpdateProfileData,
  ChangePasswordData,
  ForgotPasswordData,
  ResetPasswordData,
  UserSearchFilters,
  UserSearchResult,
  FollowData,
  FollowersResponse,
  FollowingResponse,
  BlockedUser,
  UserSession,
  Notification,
  NotificationsResponse,
  AdminUserActions,
  UserStats
}
