/**
 * MOCK DATA FOR EXPLORE PAGE
 * 
 * ⚠️ ВАЖНО ДЛЯ BACKEND INTEGRATION:
 * 
 * Эти данные временные для разработки UI.
 * 
 * При интеграции с бэкендом:
 * 
 * 1. УДАЛИТЬ этот файл
 * 
 * 2. СОЗДАТЬ API endpoints:
 *    - GET /api/explore/duels - список активных дуэлей
 *    - POST /api/explore/duels - создать дуэль
 *    - POST /api/explore/duels/:id/accept - принять вызов
 *    - POST /api/explore/duels/:id/complete - завершить дуэль
 *    - GET /api/explore/clan-wars - войны кланов
 *    - POST /api/explore/clan-wars - начать войну
 *    - GET /api/explore/clans - список кланов
 *    - POST /api/explore/clans - создать клан
 *    - POST /api/explore/clans/:id/join - вступить в клан
 *    - GET /api/explore/leaderboards/:type/:period - лидерборды
 *    - GET /api/explore/events - список ивентов
 *    - POST /api/explore/events/:id/register - регистрация на ивент
 *    - GET /api/explore/achievements - достижения пользователя
 *    - GET /api/explore/stats/:userId - статистика пользователя
 * 
 * 3. НАСТРОИТЬ WebSocket для real-time:
 *    - Обновление счета в активных дуэлях
 *    - Уведомления о новых вызовах
 *    - Обновление лидербордов
 *    - Live статус войн кланов
 * 
 * 4. ДОБАВИТЬ в Strapi:
 *    - Content Type: duel-challenge
 *    - Content Type: clan
 *    - Content Type: clan-war
 *    - Content Type: event
 *    - Content Type: achievement
 *    - Content Type: user-stats
 *    - Relation: user -> clan (many-to-one)
 *    - Relation: duel -> participants (many-to-many)
 * 
 * 5. РЕАЛИЗОВАТЬ систему очков:
 *    - Защита от читинга (server-side validation)
 *    - Транзакции для обновления рейтингов
 *    - История изменений рейтинга
 *    - Rollback при обнаружении читинга
 * 
 * 6. КЕШИРОВАНИЕ:
 *    - Лидерборды обновлять каждые 5-10 минут
 *    - Статистика кланов - каждые 15 минут
 *    - Активные дуэли - real-time
 *    - События - каждые 30 минут
 */

import type {
  DuelChallenge,
  ClanWar,
  Clan,
  LeaderboardEntry,
  Event,
  Achievement,
  UserStats,
  Participant,
} from '@/types/explore'

// ============================================
// УЧАСТНИКИ (для примеров)
// ============================================

const mockParticipants: Participant[] = [
  {
    id: '1',
    name: 'CodeMaster',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CodeMaster',
    level: 42,
    rating: 2850,
    clan: { id: 'c1', name: 'Elite Coders', tag: 'ELITE', logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=ELITE' },
  },
  {
    id: '2',
    name: 'DesignNinja',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DesignNinja',
    level: 38,
    rating: 2650,
    clan: { id: 'c2', name: 'Pixel Warriors', tag: 'PIXEL', logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=PIXEL' },
  },
  {
    id: '3',
    name: 'AlgoWizard',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AlgoWizard',
    level: 45,
    rating: 2920,
    clan: { id: 'c1', name: 'Elite Coders', tag: 'ELITE', logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=ELITE' },
  },
  {
    id: '4',
    name: 'ReactQueen',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ReactQueen',
    level: 40,
    rating: 2780,
    clan: { id: 'c3', name: 'Frontend Legion', tag: 'FRONT', logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=FRONT' },
  },
  {
    id: '5',
    name: 'BackendBoss',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BackendBoss',
    level: 43,
    rating: 2870,
  },
  {
    id: '6',
    name: 'UIGenius',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=UIGenius',
    level: 36,
    rating: 2580,
    clan: { id: 'c2', name: 'Pixel Warriors', tag: 'PIXEL', logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=PIXEL' },
  },
]

// ============================================
// ДУЭЛИ
// ============================================

export const mockDuels: DuelChallenge[] = [
  {
    id: 'd1',
    type: '1v1',
    status: 'active',
    challenger: mockParticipants[0],
    opponent: mockParticipants[1],
    category: 'Speed Coding',
    difficulty: 'hard',
    timeLimit: 30,
    pointsAtStake: 50,
    challengerScore: 450,
    opponentScore: 380,
    createdAt: '2025-11-13T10:00:00Z',
    startedAt: '2025-11-13T10:05:00Z',
    expiresAt: '2025-11-13T10:35:00Z',
  },
  {
    id: 'd2',
    type: '1v1',
    status: 'pending',
    challenger: mockParticipants[2],
    category: 'Algorithm Challenge',
    difficulty: 'expert',
    timeLimit: 60,
    pointsAtStake: 100,
    createdAt: '2025-11-13T09:30:00Z',
    expiresAt: '2025-11-13T11:30:00Z',
  },
  {
    id: 'd3',
    type: 'team',
    status: 'active',
    challenger: mockParticipants[3],
    opponent: mockParticipants[4],
    challengerTeam: [mockParticipants[3], mockParticipants[5]],
    opponentTeam: [mockParticipants[4], mockParticipants[0]],
    category: 'UI/UX Design Battle',
    difficulty: 'medium',
    timeLimit: 45,
    pointsAtStake: 75,
    challengerScore: 320,
    opponentScore: 340,
    createdAt: '2025-11-13T09:00:00Z',
    startedAt: '2025-11-13T09:10:00Z',
    expiresAt: '2025-11-13T09:55:00Z',
  },
  {
    id: 'd4',
    type: '1v1',
    status: 'completed',
    challenger: mockParticipants[1],
    opponent: mockParticipants[5],
    category: 'CSS Showdown',
    difficulty: 'easy',
    timeLimit: 20,
    pointsAtStake: 25,
    challengerScore: 280,
    opponentScore: 250,
    winner: '2',
    createdAt: '2025-11-13T08:00:00Z',
    startedAt: '2025-11-13T08:05:00Z',
    completedAt: '2025-11-13T08:25:00Z',
  },
]

// ============================================
// ВОЙНЫ КЛАНОВ
// ============================================

export const mockClanWars: ClanWar[] = [
  {
    id: 'cw1',
    status: 'active',
    clan1: {
      id: 'c1',
      name: 'Elite Coders',
      tag: 'ELITE',
      logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=ELITE',
      members: [mockParticipants[0], mockParticipants[2]],
      score: 450,
    },
    clan2: {
      id: 'c2',
      name: 'Pixel Warriors',
      tag: 'PIXEL',
      logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=PIXEL',
      members: [mockParticipants[1], mockParticipants[5]],
      score: 420,
    },
    format: 'best-of-5',
    category: 'Full-Stack Challenge',
    duration: 48,
    rounds: [
      { id: 'r1', roundNumber: 1, status: 'completed', clan1Score: 100, clan2Score: 80, winner: 'c1' },
      { id: 'r2', roundNumber: 2, status: 'completed', clan1Score: 90, clan2Score: 95, winner: 'c2' },
      { id: 'r3', roundNumber: 3, status: 'active', clan1Score: 75, clan2Score: 70 },
      { id: 'r4', roundNumber: 4, status: 'pending', clan1Score: 0, clan2Score: 0 },
      { id: 'r5', roundNumber: 5, status: 'pending', clan1Score: 0, clan2Score: 0 },
    ],
    totalPointsAtStake: 500,
    createdAt: '2025-11-12T10:00:00Z',
    startedAt: '2025-11-12T10:30:00Z',
  },
  {
    id: 'cw2',
    status: 'pending',
    clan1: {
      id: 'c3',
      name: 'Frontend Legion',
      tag: 'FRONT',
      logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=FRONT',
      members: [mockParticipants[3]],
      score: 0,
    },
    clan2: {
      id: 'c1',
      name: 'Elite Coders',
      tag: 'ELITE',
      logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=ELITE',
      members: [mockParticipants[0], mockParticipants[2]],
      score: 0,
    },
    format: 'best-of-3',
    category: 'React Mastery',
    duration: 24,
    rounds: [
      { id: 'r1', roundNumber: 1, status: 'pending', clan1Score: 0, clan2Score: 0 },
      { id: 'r2', roundNumber: 2, status: 'pending', clan1Score: 0, clan2Score: 0 },
      { id: 'r3', roundNumber: 3, status: 'pending', clan1Score: 0, clan2Score: 0 },
    ],
    totalPointsAtStake: 300,
    createdAt: '2025-11-13T08:00:00Z',
  },
]

// ============================================
// КЛАНЫ
// ============================================

export const mockClans: Clan[] = [
  {
    id: 'c1',
    name: 'Elite Coders',
    tag: 'ELITE',
    logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=ELITE',
    banner: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=300&fit=crop',
    description: 'Top-tier developers pushing the boundaries of code excellence. We compete in the highest leagues and mentor the next generation.',
    motto: 'Code. Compete. Conquer.',
    level: 25,
    rating: 3450,
    rank: 1,
    totalMembers: 48,
    maxMembers: 50,
    wins: 127,
    losses: 23,
    draws: 8,
    totalPoints: 45890,
    activeMembers: 42,
    weeklyActivity: 87,
    requirements: {
      minLevel: 30,
      minRating: 2000,
      applicationRequired: true,
    },
    leader: mockParticipants[0],
    officers: [mockParticipants[2]],
    createdAt: '2024-01-15T00:00:00Z',
    specialization: ['Full-Stack', 'Algorithms', 'System Design'],
  },
  {
    id: 'c2',
    name: 'Pixel Warriors',
    tag: 'PIXEL',
    logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=PIXEL',
    banner: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&h=300&fit=crop',
    description: 'Design-focused clan specializing in UI/UX and visual excellence. We create beautiful, functional interfaces.',
    motto: 'Design with Purpose',
    level: 22,
    rating: 3280,
    rank: 2,
    totalMembers: 35,
    maxMembers: 40,
    wins: 98,
    losses: 31,
    draws: 5,
    totalPoints: 38920,
    activeMembers: 30,
    weeklyActivity: 82,
    requirements: {
      minLevel: 25,
      minRating: 1800,
      applicationRequired: true,
    },
    leader: mockParticipants[1],
    officers: [mockParticipants[5]],
    createdAt: '2024-03-20T00:00:00Z',
    specialization: ['UI/UX', 'Design Systems', 'Animation'],
  },
  {
    id: 'c3',
    name: 'Frontend Legion',
    tag: 'FRONT',
    logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=FRONT',
    banner: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=300&fit=crop',
    description: 'Masters of modern frontend technologies. React, Vue, Angular - we do it all.',
    motto: 'Frontend First',
    level: 20,
    rating: 3100,
    rank: 3,
    totalMembers: 42,
    maxMembers: 50,
    wins: 85,
    losses: 28,
    draws: 7,
    totalPoints: 35670,
    activeMembers: 38,
    weeklyActivity: 79,
    requirements: {
      minLevel: 20,
      minRating: 1500,
      applicationRequired: false,
    },
    leader: mockParticipants[3],
    officers: [],
    createdAt: '2024-05-10T00:00:00Z',
    specialization: ['React', 'Vue', 'TypeScript'],
  },
  {
    id: 'c4',
    name: 'Backend Battalion',
    tag: 'BACK',
    logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=BACK',
    description: 'Server-side specialists. APIs, databases, and scalable architectures.',
    motto: 'Power Behind the Scenes',
    level: 19,
    rating: 2950,
    rank: 4,
    totalMembers: 28,
    maxMembers: 35,
    wins: 72,
    losses: 25,
    draws: 3,
    totalPoints: 31240,
    activeMembers: 24,
    weeklyActivity: 75,
    requirements: {
      minLevel: 18,
      minRating: 1400,
      applicationRequired: false,
    },
    leader: mockParticipants[4],
    officers: [],
    createdAt: '2024-06-01T00:00:00Z',
    specialization: ['Node.js', 'Python', 'Databases'],
  },
]

// ============================================
// ЛИДЕРБОРДЫ
// ============================================

export const mockLeaderboards: Record<string, LeaderboardEntry[]> = {
  users: [
    {
      rank: 1,
      previousRank: 1,
      user: {
        id: '3',
        name: 'AlgoWizard',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AlgoWizard',
        level: 45,
        clan: { name: 'Elite Coders', tag: 'ELITE' },
      },
      rating: 2920,
      points: 58900,
      wins: 342,
      losses: 45,
      winRate: 88.4,
      gamesPlayed: 387,
      lastActive: '2025-11-13T09:45:00Z',
      badges: [
        { id: 'b1', name: 'Grand Master', icon: '👑', rarity: 'legendary' },
        { id: 'b2', name: '100 Win Streak', icon: '🔥', rarity: 'epic' },
      ],
    },
    {
      rank: 2,
      previousRank: 3,
      user: {
        id: '5',
        name: 'BackendBoss',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BackendBoss',
        level: 43,
      },
      rating: 2870,
      points: 54320,
      wins: 298,
      losses: 52,
      winRate: 85.1,
      gamesPlayed: 350,
      lastActive: '2025-11-13T10:20:00Z',
      badges: [
        { id: 'b3', name: 'API Master', icon: '⚡', rarity: 'rare' },
      ],
    },
    {
      rank: 3,
      previousRank: 2,
      user: {
        id: '1',
        name: 'CodeMaster',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CodeMaster',
        level: 42,
        clan: { name: 'Elite Coders', tag: 'ELITE' },
      },
      rating: 2850,
      points: 52180,
      wins: 285,
      losses: 48,
      winRate: 85.6,
      gamesPlayed: 333,
      lastActive: '2025-11-13T10:05:00Z',
    },
    {
      rank: 4,
      user: {
        id: '4',
        name: 'ReactQueen',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ReactQueen',
        level: 40,
        clan: { name: 'Frontend Legion', tag: 'FRONT' },
      },
      rating: 2780,
      points: 48950,
      wins: 267,
      losses: 55,
      winRate: 82.9,
      gamesPlayed: 322,
      lastActive: '2025-11-13T09:30:00Z',
    },
    {
      rank: 5,
      previousRank: 6,
      user: {
        id: '2',
        name: 'DesignNinja',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DesignNinja',
        level: 38,
        clan: { name: 'Pixel Warriors', tag: 'PIXEL' },
      },
      rating: 2650,
      points: 44720,
      wins: 245,
      losses: 62,
      winRate: 79.8,
      gamesPlayed: 307,
      lastActive: '2025-11-13T10:10:00Z',
    },
  ],
  clans: mockClans.map((clan, index) => ({
    rank: index + 1,
    previousRank: index + 1,
    clan,
    rating: clan.rating,
    points: clan.totalPoints,
    wins: clan.wins,
    losses: clan.losses,
    winRate: (clan.wins / (clan.wins + clan.losses)) * 100,
    gamesPlayed: clan.wins + clan.losses + clan.draws,
    lastActive: '2025-11-13T10:00:00Z',
  })),
}

// ============================================
// ИВЕНТЫ
// ============================================

export const mockEvents: Event[] = [
  {
    id: 'e1',
    type: 'tournament',
    status: 'active',
    title: 'Winter Code Championship 2025',
    description: 'The biggest coding tournament of the year! Compete in multiple rounds of algorithmic challenges, win amazing prizes, and prove you\'re the best coder in the community.',
    shortDescription: 'Epic coding tournament with $10,000 prize pool',
    banner: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=400&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop',
    organizer: {
      id: 'admin1',
      name: 'Aetheris Team',
      avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Aetheris',
      type: 'admin',
    },
    startDate: '2025-11-10T00:00:00Z',
    endDate: '2025-11-20T23:59:59Z',
    registrationDeadline: '2025-11-15T23:59:59Z',
    participants: 487,
    maxParticipants: 500,
    prizes: [
      { place: 1, title: 'Grand Prize', description: '$5,000 + Trophy + Exclusive Badge', value: '$5,000' },
      { place: 2, title: 'Second Place', description: '$3,000 + Medal', value: '$3,000' },
      { place: 3, title: 'Third Place', description: '$2,000 + Medal', value: '$2,000' },
    ],
    requirements: {
      minLevel: 15,
      minRating: 1000,
    },
    category: 'Algorithms',
    tags: ['competitive', 'algorithms', 'prize-pool', 'tournament'],
    viewsCount: 8934,
    registrationsCount: 487,
    createdAt: '2025-10-01T00:00:00Z',
    updatedAt: '2025-11-13T10:00:00Z',
  },
  {
    id: 'e2',
    type: 'hackathon',
    status: 'upcoming',
    title: 'AI Innovation Hackathon',
    description: 'Build the next generation of AI-powered applications! 48-hour hackathon focused on practical AI implementations. Team up with other developers and create something amazing.',
    shortDescription: '48-hour AI hackathon with mentorship',
    banner: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=400&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop',
    organizer: {
      id: 'sponsor1',
      name: 'TechCorp AI',
      avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=TechCorp',
      type: 'sponsor',
    },
    startDate: '2025-11-25T18:00:00Z',
    endDate: '2025-11-27T18:00:00Z',
    registrationDeadline: '2025-11-24T23:59:59Z',
    participants: 156,
    maxParticipants: 200,
    minParticipants: 50,
    prizes: [
      { place: 1, title: 'Best AI Solution', description: 'MacBook Pro + $2,000', value: '$4,000' },
      { place: 2, title: 'Most Innovative', description: 'iPad Pro + $1,000', value: '$2,000' },
      { place: 3, title: 'Best UX', description: '$1,000', value: '$1,000' },
    ],
    requirements: {
      minLevel: 10,
    },
    category: 'AI/ML',
    tags: ['hackathon', 'ai', 'machine-learning', 'team-event'],
    viewsCount: 5621,
    registrationsCount: 156,
    createdAt: '2025-10-15T00:00:00Z',
    updatedAt: '2025-11-12T15:30:00Z',
  },
  {
    id: 'e3',
    type: 'challenge',
    status: 'active',
    title: 'CSS Art Challenge',
    description: 'Create stunning visual art using only CSS! No images allowed. Show off your CSS mastery and creativity.',
    shortDescription: 'Pure CSS art competition',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
    organizer: {
      id: 'user123',
      name: 'DesignMaster',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DesignMaster',
      type: 'community',
    },
    startDate: '2025-11-12T00:00:00Z',
    endDate: '2025-11-19T23:59:59Z',
    participants: 234,
    prizes: [
      { place: 1, title: 'CSS Wizard', description: 'Exclusive badge + 500 points' },
      { place: 2, title: 'CSS Artist', description: 'Special badge + 300 points' },
      { place: 3, title: 'CSS Creator', description: 'Badge + 200 points' },
    ],
    category: 'Design',
    tags: ['css', 'design', 'creative', 'community'],
    viewsCount: 3842,
    registrationsCount: 234,
    createdAt: '2025-11-05T00:00:00Z',
    updatedAt: '2025-11-13T08:00:00Z',
  },
  {
    id: 'e4',
    type: 'contest',
    status: 'completed',
    title: 'Speed Coding Marathon',
    description: 'How fast can you code? Solve 20 problems in 2 hours. Speed and accuracy both matter!',
    shortDescription: 'Fast-paced coding competition',
    organizer: {
      id: 'admin1',
      name: 'Aetheris Team',
      avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Aetheris',
      type: 'admin',
    },
    startDate: '2025-11-05T14:00:00Z',
    endDate: '2025-11-05T16:00:00Z',
    participants: 892,
    prizes: [
      { place: 1, title: 'Speed Demon', description: '1000 points + Badge' },
      { place: 2, title: 'Quick Coder', description: '750 points + Badge' },
      { place: 3, title: 'Fast Fingers', description: '500 points + Badge' },
    ],
    requirements: {
      minLevel: 5,
    },
    category: 'Speed Coding',
    tags: ['speed', 'competitive', 'completed'],
    viewsCount: 12450,
    registrationsCount: 892,
    createdAt: '2025-10-20T00:00:00Z',
    updatedAt: '2025-11-05T16:30:00Z',
  },
]

// ============================================
// ДОСТИЖЕНИЯ
// ============================================

export const mockAchievements: Achievement[] = [
  {
    id: 'a1',
    name: 'First Victory',
    description: 'Win your first duel',
    icon: '🏆',
    rarity: 'common',
    requirement: {
      type: 'wins',
      value: 1,
      description: 'Win 1 duel',
    },
    reward: {
      points: 10,
      badge: 'first-win',
    },
    progress: {
      current: 1,
      required: 1,
      percentage: 100,
    },
    unlockedAt: '2025-10-15T12:30:00Z',
  },
  {
    id: 'a2',
    name: 'Winning Streak',
    description: 'Win 10 duels in a row',
    icon: '🔥',
    rarity: 'rare',
    requirement: {
      type: 'streak',
      value: 10,
      description: 'Win 10 consecutive duels',
    },
    reward: {
      points: 100,
      badge: 'streak-10',
    },
    progress: {
      current: 7,
      required: 10,
      percentage: 70,
    },
  },
  {
    id: 'a3',
    name: 'Century Club',
    description: 'Win 100 duels',
    icon: '💯',
    rarity: 'epic',
    requirement: {
      type: 'wins',
      value: 100,
      description: 'Win 100 duels',
    },
    reward: {
      points: 500,
      title: 'Centurion',
      badge: 'century',
    },
    progress: {
      current: 67,
      required: 100,
      percentage: 67,
    },
  },
  {
    id: 'a4',
    name: 'Clan Warrior',
    description: 'Participate in 10 clan wars',
    icon: '⚔️',
    rarity: 'rare',
    requirement: {
      type: 'participation',
      value: 10,
      description: 'Join 10 clan wars',
    },
    reward: {
      points: 200,
      badge: 'clan-warrior',
    },
    progress: {
      current: 3,
      required: 10,
      percentage: 30,
    },
  },
  {
    id: 'a5',
    name: 'Grand Master',
    description: 'Reach rating 2500',
    icon: '👑',
    rarity: 'legendary',
    requirement: {
      type: 'points',
      value: 2500,
      description: 'Achieve 2500 rating',
    },
    reward: {
      points: 1000,
      title: 'Grand Master',
      badge: 'grand-master',
    },
    progress: {
      current: 2180,
      required: 2500,
      percentage: 87.2,
    },
  },
]

// ============================================
// СТАТИСТИКА ПОЛЬЗОВАТЕЛЯ (пример)
// ============================================

export const mockUserStats: UserStats = {
  userId: '1',
  level: 42,
  totalPoints: 52180,
  rating: 2850,
  rank: 3,
  duels: {
    total: 333,
    wins: 285,
    losses: 48,
    draws: 0,
    winRate: 85.6,
    currentStreak: 12,
    bestStreak: 47,
  },
  clan: {
    id: 'c1',
    name: 'Elite Coders',
    tag: 'ELITE',
    role: 'leader',
    joinedAt: '2024-01-15T00:00:00Z',
    contributedPoints: 15670,
  },
  events: {
    participated: 23,
    won: 5,
    topPlacements: 12,
  },
  achievements: mockAchievements.filter(a => a.unlockedAt),
  lastActive: '2025-11-13T10:05:00Z',
  joinedAt: '2024-01-10T00:00:00Z',
  totalPlaytime: 8940, // минут
}

