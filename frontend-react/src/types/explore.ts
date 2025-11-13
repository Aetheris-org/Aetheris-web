/**
 * EXPLORE TYPES
 * 
 * Типы данных для раздела Explore - дуэли, кланы, лидерборды, ивенты
 * 
 * BACKEND INTEGRATION NOTES:
 * - Все типы должны соответствовать схемам в БД
 * - Real-time updates для дуэлей и войн кланов (WebSocket)
 * - Кеширование лидербордов (обновление каждые 5-10 минут)
 * - Система очков и рейтингов должна быть защищена от читинга
 * - Ивенты должны поддерживать динамическую загрузку компонентов
 */

// ============================================
// ДУЭЛИ И СОРЕВНОВАНИЯ
// ============================================

export type DuelStatus = 'pending' | 'active' | 'completed' | 'cancelled'
export type DuelType = '1v1' | 'team' | 'clan-war'

export interface Participant {
  id: string
  name: string
  avatar?: string
  level: number
  rating: number
  clan?: {
    id: string
    name: string
    tag: string
    logo?: string
  }
}

export interface DuelChallenge {
  id: string
  type: DuelType
  status: DuelStatus
  
  challenger: Participant
  opponent?: Participant
  
  // Для командных дуэлей
  challengerTeam?: Participant[]
  opponentTeam?: Participant[]
  
  // Условия дуэли
  category: string // 'coding', 'design', 'quiz', 'speed-coding', etc.
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  timeLimit?: number // в минутах
  pointsAtStake: number
  
  // Результаты
  challengerScore?: number
  opponentScore?: number
  winner?: string // participant id
  
  createdAt: string
  startedAt?: string
  completedAt?: string
  expiresAt?: string
}

export interface ClanWar {
  id: string
  status: DuelStatus
  
  clan1: {
    id: string
    name: string
    tag: string
    logo?: string
    members: Participant[]
    score: number
  }
  
  clan2: {
    id: string
    name: string
    tag: string
    logo?: string
    members: Participant[]
    score: number
  }
  
  // Условия войны
  format: 'best-of-3' | 'best-of-5' | 'tournament' | 'points-race'
  category: string
  duration: number // в часах
  
  // Прогресс
  rounds: Array<{
    id: string
    roundNumber: number
    status: 'pending' | 'active' | 'completed'
    clan1Score: number
    clan2Score: number
    winner?: string
  }>
  
  totalPointsAtStake: number
  winner?: string
  
  createdAt: string
  startedAt?: string
  completedAt?: string
}

// ============================================
// КЛАНЫ
// ============================================

export interface Clan {
  id: string
  name: string
  tag: string // [TAG]
  logo?: string
  banner?: string
  
  description: string
  motto?: string
  
  // Статистика
  level: number
  rating: number
  rank: number
  totalMembers: number
  maxMembers: number
  
  // Достижения
  wins: number
  losses: number
  draws: number
  totalPoints: number
  
  // Активность
  activeMembers: number
  weeklyActivity: number // процент активности
  
  // Требования для вступления
  requirements: {
    minLevel: number
    minRating: number
    applicationRequired: boolean
  }
  
  // Лидеры клана
  leader: Participant
  officers: Participant[]
  
  createdAt: string
  
  // Специализация клана
  specialization?: string[] // ['frontend', 'backend', 'design', etc.]
}

// ============================================
// ЛИДЕРБОРДЫ
// ============================================

export type LeaderboardType = 'users' | 'clans' | 'duels' | 'clan-wars'
export type LeaderboardPeriod = 'all-time' | 'monthly' | 'weekly' | 'daily'

export interface LeaderboardEntry {
  rank: number
  previousRank?: number
  
  // Для пользователей
  user?: {
    id: string
    name: string
    avatar?: string
    level: number
    clan?: {
      name: string
      tag: string
    }
  }
  
  // Для кланов
  clan?: Clan
  
  // Статистика
  rating: number
  points: number
  wins: number
  losses: number
  winRate: number
  
  // Активность
  gamesPlayed: number
  lastActive: string
  
  // Награды
  badges?: Array<{
    id: string
    name: string
    icon: string
    rarity: 'common' | 'rare' | 'epic' | 'legendary'
  }>
}

export interface Leaderboard {
  type: LeaderboardType
  period: LeaderboardPeriod
  entries: LeaderboardEntry[]
  totalEntries: number
  lastUpdated: string
}

// ============================================
// ИВЕНТЫ
// ============================================

export type EventStatus = 'upcoming' | 'active' | 'completed'
export type EventType = 'tournament' | 'challenge' | 'hackathon' | 'contest' | 'community'

export interface Event {
  id: string
  type: EventType
  status: EventStatus
  
  title: string
  description: string
  shortDescription: string
  
  banner?: string
  thumbnail?: string
  
  // Организатор
  organizer: {
    id: string
    name: string
    avatar?: string
    type: 'admin' | 'community' | 'sponsor'
  }
  
  // Время
  startDate: string
  endDate: string
  registrationDeadline?: string
  
  // Участие
  participants: number
  maxParticipants?: number
  minParticipants?: number
  
  // Призы
  prizes?: Array<{
    place: number
    title: string
    description: string
    value?: string
  }>
  
  // Требования
  requirements?: {
    minLevel?: number
    minRating?: number
    clanOnly?: boolean
    inviteOnly?: boolean
  }
  
  // Категория и теги
  category: string
  tags: string[]
  
  // Кастомные данные для каждого типа ивента
  customData?: Record<string, any>
  
  // Статистика
  viewsCount: number
  registrationsCount: number
  
  createdAt: string
  updatedAt: string
}

export interface EventRegistration {
  id: string
  eventId: string
  userId: string
  teamId?: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  registeredAt: string
}

// ============================================
// ДОСТИЖЕНИЯ И НАГРАДЫ
// ============================================

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic'
  
  // Условия получения
  requirement: {
    type: 'wins' | 'points' | 'streak' | 'participation' | 'special'
    value: number
    description: string
  }
  
  // Награда
  reward: {
    points?: number
    title?: string
    badge?: string
  }
  
  // Прогресс (для текущего пользователя)
  progress?: {
    current: number
    required: number
    percentage: number
  }
  
  unlockedAt?: string
}

// ============================================
// СТАТИСТИКА ПОЛЬЗОВАТЕЛЯ
// ============================================

export interface UserStats {
  userId: string
  
  // Общая статистика
  level: number
  totalPoints: number
  rating: number
  rank: number
  
  // Дуэли
  duels: {
    total: number
    wins: number
    losses: number
    draws: number
    winRate: number
    currentStreak: number
    bestStreak: number
  }
  
  // Клан
  clan?: {
    id: string
    name: string
    tag: string
    role: 'leader' | 'officer' | 'member'
    joinedAt: string
    contributedPoints: number
  }
  
  // Ивенты
  events: {
    participated: number
    won: number
    topPlacements: number
  }
  
  // Достижения
  achievements: Achievement[]
  
  // Активность
  lastActive: string
  joinedAt: string
  totalPlaytime: number // в минутах
}

// ============================================
// ФИЛЬТРЫ
// ============================================

export interface ExploreFilters {
  // Дуэли
  duelType?: DuelType[]
  duelStatus?: DuelStatus[]
  duelCategory?: string[]
  duelDifficulty?: string[]
  
  // Кланы
  clanMinLevel?: number
  clanMaxLevel?: number
  clanMinMembers?: number
  clanSpecialization?: string[]
  clanAcceptingMembers?: boolean
  
  // Лидерборды
  leaderboardType?: LeaderboardType
  leaderboardPeriod?: LeaderboardPeriod
  
  // Ивенты
  eventType?: EventType[]
  eventStatus?: EventStatus[]
  eventCategory?: string[]
  
  // Общие
  search?: string
  sortBy?: string
}

