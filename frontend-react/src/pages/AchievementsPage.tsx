import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/ThemeToggle'
import { AccountSheet } from '@/components/AccountSheet'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useGamificationStore,
  type GamificationAchievement,
} from '@/stores/gamificationStore'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/hooks/useTranslation'
import { DevelopmentBanner } from '@/components/DevelopmentBanner'
import {
  Award,
  CheckCircle2,
  Flame,
  Lock,
  Target,
  Trophy,
  Zap,
  PenSquare,
  Users,
  Calendar,
  Star,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
} from 'lucide-react'

/**
 * ACHIEVEMENTS PAGE - BACKEND INTEGRATION GUIDE
 * ==============================================
 *
 * This page currently uses mock data from the gamificationStore (Zustand).
 * To integrate with the Strapi backend, follow these steps:
 *
 * 1. CREATE STRAPI CONTENT TYPES:
 *    - Create an "achievement" content type in Strapi with fields:
 *      * id (UID, required)
 *      * title (Text, required)
 *      * description (Text, required)
 *      * category (Enumeration: 'level', 'streak', 'activity', 'milestone', 'social')
 *      * icon (Media, optional - for custom icons)
 *      * rarity (Enumeration: 'common', 'rare', 'epic', 'legendary')
 *      * xpReward (Number, optional)
 *      * requirement (JSON, optional - stores condition logic)
 *      * isActive (Boolean, default: true)
 *
 *    - Create an "user-achievement" content type (join table):
 *      * user (Relation: User, required)
 *      * achievement (Relation: Achievement, required)
 *      * unlockedAt (DateTime, required)
 *      * progress (Number, 0-100, for progress-based achievements)
 *
 * 2. CREATE API ENDPOINTS:
 *    In backend/strapi-backend/src/api/achievement/:
 *    - controllers/achievement.ts: GET /api/achievements (list all)
 *    - controllers/achievement.ts: GET /api/achievements/:id (single)
 *    - controllers/user-achievement.ts: GET /api/user-achievements/me (user's achievements)
 *    - controllers/user-achievement.ts: POST /api/user-achievements (unlock achievement)
 *
 * 3. UPDATE FRONTEND API LAYER:
 *    Create frontend-react/src/api/achievements.ts:
 *    ```typescript
 *    import { api } from './axios'
 *
 *    export interface Achievement {
 *      id: string
 *      title: string
 *      description: string
 *      category: 'level' | 'streak' | 'activity' | 'milestone' | 'social'
 *      rarity: 'common' | 'rare' | 'epic' | 'legendary'
 *      xpReward?: number
 *      requirement?: Record<string, unknown>
 *    }
 *
 *    export interface UserAchievement {
 *      id: string
 *      achievement: Achievement
 *      unlockedAt: string
 *      progress: number
 *    }
 *
 *    export async function getAchievements(): Promise<Achievement[]> {
 *      const { data } = await api.get('/api/achievements?populate=*')
 *      return data.data
 *    }
 *
 *    export async function getUserAchievements(): Promise<UserAchievement[]> {
 *      const { data } = await api.get('/api/user-achievements/me?populate=achievement')
 *      return data.data
 *    }
 *    ```
 *
 * 4. REPLACE MOCK DATA:
 *    - Remove the mockAchievements array below
 *    - Replace useGamificationStore with API calls using React Query:
 *    ```typescript
 *    const { data: achievements = [] } = useQuery({
 *      queryKey: ['achievements'],
 *      queryFn: getAchievements,
 *    })
 *
 *    const { data: userAchievements = [] } = useQuery({
 *      queryKey: ['user-achievements'],
 *      queryFn: getUserAchievements,
 *    })
 *    ```
 *
 * 5. UPDATE ACHIEVEMENT UNLOCKING:
 *    - When a user completes an action (publish article, reach level, etc.),
 *      call the backend to check and unlock achievements
 *    - Use webhooks or server-side logic in Strapi to auto-unlock achievements
 *      when conditions are met
 *
 * 6. ADD REAL-TIME UPDATES (optional):
 *    - Use Strapi's real-time features or polling to update achievements
 *      when they're unlocked
 *    - Show toast notifications when new achievements are unlocked
 *
 * 7. REMOVE THIS COMMENT BLOCK once integration is complete.
 */

// Map achievement IDs to categories and rarity based on their type
const getAchievementMetadata = (id: GamificationAchievement['id']) => {
  // Level achievements
  if (id.startsWith('reach_level_')) {
    const level = parseInt(id.replace('reach_level_', ''), 10)
    let rarity: 'common' | 'rare' | 'epic' | 'legendary' = 'common'
    if (level >= 25) rarity = 'legendary'
    else if (level >= 15) rarity = 'epic'
    else if (level >= 10) rarity = 'rare'
    return {
      category: 'level' as const,
      rarity,
      xpReward: level * 25,
    }
  }
  // Streak achievements
  if (id.startsWith('streak_')) {
    const days = parseInt(id.replace('streak_', ''), 10)
    let rarity: 'common' | 'rare' | 'epic' | 'legendary' = 'common'
    if (days >= 100) rarity = 'legendary'
    else if (days >= 30) rarity = 'epic'
    else if (days >= 7) rarity = 'rare'
    return {
      category: 'streak' as const,
      rarity,
      xpReward: days * 10,
    }
  }
  // Publishing achievements
  if (id.startsWith('publish_')) {
    const match = id.match(/publish_(\d+)_articles/)
    if (match) {
      const count = parseInt(match[1], 10)
      let rarity: 'common' | 'rare' | 'epic' | 'legendary' = 'common'
      if (count >= 250) rarity = 'legendary'
      else if (count >= 100) rarity = 'epic'
      else if (count >= 25) rarity = 'rare'
      return {
        category: 'activity' as const,
        rarity,
        xpReward: count * 5,
      }
    }
    if (id === 'publish_first_article' || id === 'publish_5_articles') {
      return {
        category: 'activity' as const,
        rarity: 'common' as const,
        xpReward: id === 'publish_first_article' ? 50 : 25,
      }
    }
  }
  // Comment achievements
  if (id.startsWith('comment_')) {
    const match = id.match(/comment_(\d+)_times/)
    if (match) {
      const count = parseInt(match[1], 10)
      let rarity: 'common' | 'rare' | 'epic' | 'legendary' = 'common'
      if (count >= 250) rarity = 'legendary'
      else if (count >= 100) rarity = 'epic'
      else if (count >= 25) rarity = 'rare'
      return {
        category: 'social' as const,
        rarity,
        xpReward: count * 2,
      }
    }
    if (id === 'first_comment' || id === 'comment_5_times') {
      return {
        category: 'social' as const,
        rarity: 'common' as const,
        xpReward: id === 'first_comment' ? 10 : 10,
      }
    }
  }
  // Reaction achievements
  if (id.startsWith('receive_')) {
    const match = id.match(/receive_(\d+)_reactions/)
    if (match) {
      const count = parseInt(match[1], 10)
      let rarity: 'common' | 'rare' | 'epic' | 'legendary' = 'common'
      if (count >= 1000) rarity = 'legendary'
      else if (count >= 500) rarity = 'epic'
      else if (count >= 100) rarity = 'rare'
      return {
        category: 'social' as const,
        rarity,
        xpReward: count * 0.5,
      }
    }
    if (id === 'first_reaction' || id === 'receive_5_reactions' || id === 'receive_25_reactions') {
      return {
        category: 'social' as const,
        rarity: 'common' as const,
        xpReward: id === 'first_reaction' ? 5 : id === 'receive_5_reactions' ? 2.5 : 12.5,
      }
    }
  }
  // Share achievements
  if (id.startsWith('share_')) {
    const match = id.match(/share_(\d+)_articles/)
    if (match) {
      const count = parseInt(match[1], 10)
      let rarity: 'common' | 'rare' | 'epic' | 'legendary' = 'common'
      if (count >= 50) rarity = 'epic'
      else if (count >= 25) rarity = 'rare'
      return {
        category: 'social' as const,
        rarity,
        xpReward: count * 3,
      }
    }
    if (id === 'share_first_article' || id === 'share_5_articles') {
      return {
        category: 'social' as const,
        rarity: 'common' as const,
        xpReward: id === 'share_first_article' ? 15 : 15,
      }
    }
  }
  // Bookmark achievements
  if (id.startsWith('bookmark_')) {
    const match = id.match(/bookmark_(\d+)_articles/)
    if (match) {
      const count = parseInt(match[1], 10)
      let rarity: 'common' | 'rare' | 'epic' | 'legendary' = 'common'
      if (count >= 100) rarity = 'epic'
      else if (count >= 50) rarity = 'rare'
      return {
        category: 'activity' as const,
        rarity,
        xpReward: count * 2,
      }
    }
    if (id === 'first_bookmark' || id === 'bookmark_5_articles') {
      return {
        category: 'activity' as const,
        rarity: 'common' as const,
        xpReward: id === 'first_bookmark' ? 5 : 10,
      }
    }
  }
  // Profile achievements
  if (id === 'complete_profile' || id === 'update_avatar' || id === 'update_bio' || id === 'add_expertise_tags' || id === 'join_community') {
    return {
      category: 'milestone' as const,
      rarity: 'common' as const,
      xpReward: id === 'complete_profile' ? 50 : 25,
    }
  }
  // Special profile achievements
  if (id === 'early_adopter') {
    return {
      category: 'milestone' as const,
      rarity: 'epic' as const,
      xpReward: 200,
    }
  }
  // Milestone achievements
  if (id === 'complete_daily_set' || id === 'complete_weekly_set' || id === 'complete_monthly_set') {
    let rarity: 'common' | 'rare' | 'epic' | 'legendary' = 'rare'
    if (id === 'complete_monthly_set') rarity = 'epic'
    else if (id === 'complete_weekly_set') rarity = 'rare'
    return {
      category: 'milestone' as const,
      rarity,
      xpReward: id === 'complete_monthly_set' ? 500 : id === 'complete_weekly_set' ? 250 : 120,
    }
  }
  // Activity milestones
  if (id === 'first_week_active' || id === 'first_month_active' || id === 'first_year_active') {
    let rarity: 'common' | 'rare' | 'epic' | 'legendary' = 'common'
    if (id === 'first_year_active') rarity = 'epic'
    else if (id === 'first_month_active') rarity = 'rare'
    return {
      category: 'milestone' as const,
      rarity,
      xpReward: id === 'first_year_active' ? 500 : id === 'first_month_active' ? 100 : 25,
    }
  }
  // Reading achievements
  if (id.startsWith('read_')) {
    const match = id.match(/read_(\d+)_articles/)
    if (match) {
      const count = parseInt(match[1], 10)
      let rarity: 'common' | 'rare' | 'epic' | 'legendary' = 'common'
      if (count >= 500) rarity = 'epic'
      else if (count >= 100) rarity = 'rare'
      return {
        category: 'activity' as const,
        rarity,
        xpReward: count * 1,
      }
    }
  }
  // Social achievements - following
  if (id.startsWith('follow_')) {
    const match = id.match(/follow_(\d+)_users/)
    if (match) {
      const count = parseInt(match[1], 10)
      return {
        category: 'social' as const,
        rarity: 'common' as const,
        xpReward: count * 2,
      }
    }
    if (id === 'follow_first_user') {
      return {
        category: 'social' as const,
        rarity: 'common' as const,
        xpReward: 5,
      }
    }
  }
  // Social achievements - followers
  if (id.startsWith('get_')) {
    const match = id.match(/get_(\d+)_followers/)
    if (match) {
      const count = parseInt(match[1], 10)
      let rarity: 'common' | 'rare' | 'epic' | 'legendary' = 'common'
      if (count >= 1000) rarity = 'legendary'
      else if (count >= 500) rarity = 'epic'
      else if (count >= 100) rarity = 'rare'
      return {
        category: 'social' as const,
        rarity,
        xpReward: count * 3,
      }
    }
  }
  // Special achievements
  if (id === 'article_trending' || id === 'article_featured' || id === 'article_editor_choice') {
    let rarity: 'common' | 'rare' | 'epic' | 'legendary' = 'rare'
    if (id === 'article_editor_choice') rarity = 'epic'
    else if (id === 'article_featured') rarity = 'rare'
    return {
      category: 'milestone' as const,
      rarity,
      xpReward: id === 'article_editor_choice' ? 500 : id === 'article_featured' ? 300 : 200,
    }
  }
  if (id === 'community_helper' || id === 'mentor' || id === 'ambassador') {
    let rarity: 'common' | 'rare' | 'epic' | 'legendary' = 'epic'
    if (id === 'ambassador') rarity = 'legendary'
    else if (id === 'mentor') rarity = 'epic'
    return {
      category: 'milestone' as const,
      rarity,
      xpReward: id === 'ambassador' ? 1000 : id === 'mentor' ? 500 : 300,
    }
  }
  // Default for unknown achievements
  return {
    category: 'activity' as const,
    rarity: 'common' as const,
    xpReward: 50,
  }
}

type AchievementCategory = 'all' | 'level' | 'streak' | 'activity' | 'milestone' | 'social'
type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary'

// Format XP to keep it under 4 characters
function formatXP(xp: number): string {
  if (xp < 1000) {
    return xp.toString()
  }
  if (xp < 10000) {
    const k = (xp / 1000).toFixed(1)
    return k.endsWith('.0') ? `${k.slice(0, -2)}K` : `${k}K`
  }
  if (xp < 1000000) {
    const k = Math.round(xp / 1000)
    return `${k}K`
  }
  const m = (xp / 1000000).toFixed(1)
  return m.endsWith('.0') ? `${m.slice(0, -2)}M` : `${m}M`
}

const categoryIcons = {
  level: Target,
  streak: Flame,
  activity: PenSquare,
  milestone: Trophy,
  social: Users,
}

// Rarity visual styles - using different visual indicators instead of just colors
const rarityStyles = {
  common: {
    container: 'bg-muted/30 border border-border/60',
    badge: 'bg-muted/60 text-muted-foreground border border-border/60',
    filledStars: 1,
    borderStyle: '',
  },
  rare: {
    container: 'bg-secondary/20 border-2 border-secondary/60',
    badge: 'bg-secondary/50 text-secondary-foreground border border-secondary/60',
    filledStars: 2,
    borderStyle: '',
  },
  epic: {
    container: 'bg-primary/10 border-2 border-primary/50 relative overflow-hidden',
    badge: 'bg-primary/30 text-primary border border-primary/50',
    filledStars: 3,
    borderStyle: '',
    effect: 'before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary/5 before:to-transparent before:pointer-events-none',
  },
  legendary: {
    container: 'bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border-2 border-primary/60 relative overflow-hidden shadow-lg shadow-primary/20',
    badge: 'bg-gradient-to-r from-primary/40 to-primary/30 text-primary border border-primary/60 shadow-sm',
    filledStars: 4,
    borderStyle: '',
    effect: 'before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary/10 before:via-transparent before:to-primary/5 before:pointer-events-none before:animate-legendary-shimmer after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.1),transparent_70%)] after:pointer-events-none',
  },
}

export default function AchievementsPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const {
    achievements: storeAchievements,
  } = useGamificationStore((state) => ({
    achievements: state.achievements,
  }))

  const [activeCategory, setActiveCategory] = useState<AchievementCategory>('all')
  const [sortBy, setSortBy] = useState<'default' | 'rarity-asc' | 'rarity-desc' | 'name' | 'unlocked'>('default')
  const [isHeroExpanded, setIsHeroExpanded] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('achievements-hero-expanded')
      return saved !== null ? saved === 'true' : true
    }
    return true
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('achievements-hero-expanded', String(isHeroExpanded))
    }
  }, [isHeroExpanded])

  // Transform store achievements with metadata
  const allAchievements = useMemo(() => {
    return storeAchievements.map((achievement) => {
      const metadata = getAchievementMetadata(achievement.id)
      return {
        ...achievement,
        ...metadata,
      }
    })
  }, [storeAchievements])

  const filteredAchievements = useMemo(() => {
    let filtered = activeCategory === 'all' 
      ? allAchievements 
      : allAchievements.filter((a) => a.category === activeCategory)

    // Sort achievements
    const rarityOrder = { common: 1, rare: 2, epic: 3, legendary: 4 }
    
    switch (sortBy) {
      case 'rarity-asc':
        filtered = [...filtered].sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity])
        break
      case 'rarity-desc':
        filtered = [...filtered].sort((a, b) => rarityOrder[b.rarity] - rarityOrder[a.rarity])
        break
      case 'name':
        filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'unlocked':
        filtered = [...filtered].sort((a, b) => {
          if (a.unlocked && !b.unlocked) return -1
          if (!a.unlocked && b.unlocked) return 1
          return 0
        })
        break
      default:
        // Keep original order
        break
    }

    return filtered
  }, [allAchievements, activeCategory, sortBy])

  const unlockedCount = allAchievements.filter((a) => a.unlocked).length
  const totalCount = allAchievements.length
  const completionRate = totalCount > 0 && unlockedCount > 0 
    ? Math.round((unlockedCount / totalCount) * 100) 
    : 0

  const achievementsByCategory = useMemo(() => {
    const grouped: Record<string, typeof allAchievements> = {}
    allAchievements.forEach((achievement) => {
      if (!grouped[achievement.category]) {
        grouped[achievement.category] = []
      }
      grouped[achievement.category].push(achievement)
    })
    return grouped
  }, [allAchievements])

  const stats = useMemo(() => {
    const byRarity = {
      common: {
        unlocked: allAchievements.filter((a) => a.rarity === 'common' && a.unlocked).length,
        total: allAchievements.filter((a) => a.rarity === 'common').length,
      },
      rare: {
        unlocked: allAchievements.filter((a) => a.rarity === 'rare' && a.unlocked).length,
        total: allAchievements.filter((a) => a.rarity === 'rare').length,
      },
      epic: {
        unlocked: allAchievements.filter((a) => a.rarity === 'epic' && a.unlocked).length,
        total: allAchievements.filter((a) => a.rarity === 'epic').length,
      },
      legendary: {
        unlocked: allAchievements.filter((a) => a.rarity === 'legendary' && a.unlocked).length,
        total: allAchievements.filter((a) => a.rarity === 'legendary').length,
      },
    }

    return {
      totalUnlocked: unlockedCount,
      totalAvailable: totalCount,
      completionRate,
      byRarity,
      recentUnlocks: allAchievements
        .filter((a) => a.unlocked && a.unlockedAt)
        .sort((a, b) => (b.unlockedAt ?? '').localeCompare(a.unlockedAt ?? ''))
        .slice(0, 3),
    }
  }, [allAchievements, unlockedCount, totalCount, completionRate])

  const { t } = useTranslation()

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="gap-1 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3 shrink-0"
              >
                <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{t('common.back')}</span>
              </Button>
              <Separator orientation="vertical" className="h-4 sm:h-6 hidden sm:block" />
              <h1 className="text-sm sm:text-lg font-semibold truncate">{t('achievements.pageTitle')}</h1>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <ThemeToggle />
              <AccountSheet />
            </div>
          </div>
        </header>
        <main className="container flex min-h-[60vh] items-center justify-center pb-12 sm:pb-16 pt-4 sm:pt-6 px-4 sm:px-6">
          <Card className="w-full max-w-md border-border/60">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">{t('auth.title')}</CardTitle>
              <CardDescription className="text-xs sm:text-sm">{t('achievements.title')}</CardDescription>
            </CardHeader>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('common.back')}
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <h1 className="text-lg font-semibold">{t('achievements.pageTitle')}</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <AccountSheet />
          </div>
        </div>
      </header>
      <DevelopmentBanner storageKey="achievements-dev-banner" />
      <main className="container space-y-4 sm:space-y-6 md:space-y-8 pb-12 sm:pb-16 pt-4 sm:pt-6 px-4 sm:px-6">
        <HeroSection
          stats={stats}
          isExpanded={isHeroExpanded}
          onToggle={() => setIsHeroExpanded(!isHeroExpanded)}
          t={t}
        />

        <div className="grid gap-4 sm:gap-6 md:gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="hidden lg:block space-y-4 sm:space-y-6">
            <CategoryFilters
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              achievementsByCategory={achievementsByCategory}
              t={t}
            />

            <RarityBreakdown stats={stats} t={t} />

            {stats.recentUnlocks.length > 0 && (
              <Card className="border-border/60 bg-background/90 shadow-sm">
                <CardHeader className="space-y-2 sm:space-y-3 px-4 sm:px-6 pt-4 sm:pt-6 pb-2 sm:pb-3">
                  <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base font-semibold">
                    <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                    {t('achievements.stats.recentUnlocks')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1.5 sm:space-y-2 px-4 sm:px-6 pb-4 sm:pb-6">
                  {stats.recentUnlocks.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="flex items-start justify-between gap-2 rounded-lg border border-border/50 bg-muted/10 p-2 sm:p-2.5"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs sm:text-sm font-medium text-foreground">{achievement.title}</p>
                        {achievement.unlockedAt && (
                          <p className="text-[10px] sm:text-xs text-muted-foreground">
                            {new Date(achievement.unlockedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-primary" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </aside>

          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div>
                <h2 className="text-base sm:text-lg md:text-xl font-semibold tracking-tight">{t('achievements.title')}</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {filteredAchievements.length} {filteredAchievements.length === 1 ? t('achievements.title').toLowerCase() : t('achievements.title').toLowerCase()}
                  {activeCategory !== 'all' && ` ${t('common.in')} ${activeCategory}`}
                </p>
              </div>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
                <SelectTrigger className="w-full sm:w-[180px] h-9 sm:h-10 border-border/60 bg-muted/20 hover:bg-muted/30 text-xs sm:text-sm">
                  <ArrowUpDown className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                  <SelectValue placeholder={t('achievements.filters.sortBy')} />
                </SelectTrigger>
                <SelectContent className="!bg-card border-border/60">
                  <SelectItem value="default">{t('achievements.filters.default')}</SelectItem>
                  <SelectItem value="rarity-asc">{t('achievements.filters.rarity')}: {t('common.lowToHigh')}</SelectItem>
                  <SelectItem value="rarity-desc">{t('achievements.filters.rarity')}: {t('common.highToLow')}</SelectItem>
                  <SelectItem value="name">{t('common.name')} (A-Z)</SelectItem>
                  <SelectItem value="unlocked">{t('achievements.unlocked')} {t('common.first')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <AchievementsGrid achievements={filteredAchievements} t={t} />
          </div>
        </div>
      </main>
    </div>
  )
}

interface HeroSectionProps {
  stats: {
    totalUnlocked: number
    totalAvailable: number
    completionRate: number
    byRarity: Record<string, { unlocked: number; total: number }>
    recentUnlocks: Array<{
      id: string
      title: string
      unlockedAt?: string
    }>
  }
  isExpanded: boolean
  onToggle: () => void
  t: (key: string) => string
}

function HeroSection({ stats, isExpanded, onToggle, t }: HeroSectionProps) {
  return (
    <section
      className={cn(
        'rounded-2xl sm:rounded-3xl border border-border/60 bg-muted/20 shadow-sm transition-all duration-300 overflow-hidden',
        isExpanded ? 'p-4 sm:p-6 md:p-10 max-h-[1000px]' : 'px-4 sm:px-6 py-2.5 sm:py-3 max-h-12 sm:max-h-14'
      )}
    >
      {isExpanded ? (
        <div className="space-y-4 sm:space-y-5 relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-7 w-7 sm:h-8 sm:w-8 rounded-full"
            onClick={onToggle}
            aria-label={t('achievements.hero.collapse')}
          >
            <ChevronUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
          <Badge variant="outline" className="w-fit rounded-full px-2.5 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs uppercase tracking-[0.3em]">
            {t('achievements.hero.badge')}
          </Badge>
          <div className="space-y-2 sm:space-y-3">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight tracking-tight">
              {t('achievements.hero.title')}
            </h1>
            <p className="max-w-2xl text-sm sm:text-base text-muted-foreground">
              {t('achievements.hero.description')}
            </p>
          </div>

          <Card className="border-border/60 bg-background/90 shadow-sm">
            <CardHeader className="space-y-1.5 sm:space-y-2 pb-2 sm:pb-3 p-4 sm:p-6">
              <CardDescription className="text-[10px] sm:text-xs uppercase tracking-wide">{t('achievements.stats.completionRate')}</CardDescription>
              <CardTitle className="text-2xl sm:text-3xl font-semibold">{stats.completionRate}%</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-4 sm:px-6 pb-4 sm:pb-6">
              <Progress value={stats.completionRate} className="h-1.5 sm:h-2" />
              <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-muted-foreground">
                {stats.totalUnlocked} {t('common.of')} {stats.totalAvailable} {t('achievements.title').toLowerCase()} {t('achievements.unlocked')}
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="flex items-center gap-2 sm:gap-3 w-full">
          <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-primary" />
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <span className="text-xs sm:text-sm font-semibold text-foreground">{stats.completionRate}%</span>
            <span className="text-[10px] sm:text-xs text-muted-foreground">{t('common.complete')}</span>
          </div>
          <Progress value={stats.completionRate} className="h-1.5 sm:h-2 flex-1 min-w-0" />
          <span className="text-[10px] sm:text-xs text-muted-foreground shrink-0 whitespace-nowrap">
            {stats.totalUnlocked}/{stats.totalAvailable}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 sm:h-7 sm:w-7 shrink-0 rounded-full -mr-1"
            onClick={onToggle}
            aria-label={t('achievements.hero.expand')}
          >
            <ChevronDown className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </Button>
        </div>
      )}
    </section>
  )
}

interface CategoryFiltersProps {
  activeCategory: AchievementCategory
  onCategoryChange: (category: AchievementCategory) => void
  achievementsByCategory: Record<string, Array<{ id: string; unlocked: boolean }>>
  t: (key: string) => string
}

function CategoryFilters({ activeCategory, onCategoryChange, achievementsByCategory, t }: CategoryFiltersProps) {
  const categories: Array<{ id: AchievementCategory; label: string; icon: typeof Target }> = [
    { id: 'all', label: t('achievements.filters.all'), icon: Trophy },
    { id: 'level', label: t('achievements.filters.level'), icon: Target },
    { id: 'streak', label: t('achievements.filters.streak'), icon: Flame },
    { id: 'activity', label: t('achievements.filters.activity'), icon: PenSquare },
    { id: 'milestone', label: t('achievements.filters.milestone'), icon: Award },
    { id: 'social', label: t('achievements.filters.social'), icon: Users },
  ]

  return (
    <Card className="border-border/60 bg-muted/20 shadow-sm">
      <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
        <CardTitle className="text-sm sm:text-base font-semibold">{t('common.categories')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 pt-0 px-4 sm:px-6 pb-4 sm:pb-6">
        {categories.map((category) => {
          const Icon = category.icon
          const count =
            category.id === 'all'
              ? Object.values(achievementsByCategory).flat().length
              : achievementsByCategory[category.id]?.length ?? 0
          const unlocked =
            category.id === 'all'
              ? Object.values(achievementsByCategory)
                  .flat()
                  .filter((a) => a.unlocked).length
              : achievementsByCategory[category.id]?.filter((a) => a.unlocked).length ?? 0

          return (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? 'secondary' : 'ghost'}
              className={cn(
                'w-full justify-start gap-1.5 sm:gap-2 h-8 sm:h-9 text-xs sm:text-sm',
                activeCategory === category.id && 'bg-primary/10 text-primary border-primary/20 shadow-sm'
              )}
              onClick={() => onCategoryChange(category.id)}
            >
              <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span className="flex-1 text-left truncate">{category.label}</span>
              <Badge
                variant="outline"
                className={cn(
                  'ml-auto rounded-full text-[10px] sm:text-xs border shrink-0',
                  activeCategory === category.id
                    ? 'bg-primary/10 text-primary border-primary/30'
                    : 'bg-muted/50 border-border/60'
                )}
              >
                {unlocked}/{count}
              </Badge>
            </Button>
          )
        })}
      </CardContent>
    </Card>
  )
}

interface RarityBreakdownProps {
  stats: {
    byRarity: Record<string, { unlocked: number; total: number }>
  }
  t: (key: string) => string
}

function RarityBreakdown({ stats, t }: RarityBreakdownProps) {
  const rarities: Array<{ id: AchievementRarity; label: string; style: typeof rarityStyles.common }> = [
    { id: 'common', label: t('achievements.rarity.common'), style: rarityStyles.common },
    { id: 'rare', label: t('achievements.rarity.rare'), style: rarityStyles.rare },
    { id: 'epic', label: t('achievements.rarity.epic'), style: rarityStyles.epic },
    { id: 'legendary', label: t('achievements.rarity.legendary'), style: rarityStyles.legendary },
  ]

  return (
    <Card className="border-border/60 bg-muted/20 shadow-sm">
      <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
        <CardTitle className="text-sm sm:text-base font-semibold">{t('achievements.breakdown.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5 sm:space-y-3 pt-0 px-4 sm:px-6 pb-4 sm:pb-6">
        {rarities.map((rarity) => {
          const rarityStats = stats.byRarity[rarity.id] ?? { unlocked: 0, total: 0 }
          const unlocked = rarityStats.unlocked
          const total = rarityStats.total
          const percentage = total > 0 ? (unlocked / total) * 100 : 0
          return (
            <div key={rarity.id} className="space-y-1 sm:space-y-1.5">
              <div className="flex items-center justify-between text-[10px] sm:text-xs">
                <div className="flex items-center gap-1 sm:gap-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-0.5 shrink-0">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'h-2.5 w-2.5 sm:h-3 sm:w-3 transition-colors',
                          i < rarity.style.filledStars
                            ? 'text-primary fill-primary'
                            : 'text-muted-foreground/30 fill-transparent'
                        )}
                      />
                    ))}
                  </div>
                  <span className="font-medium text-foreground truncate">{rarity.label}</span>
                </div>
                <span className="text-muted-foreground shrink-0 ml-1">{unlocked}/{total}</span>
              </div>
              <div className="h-1 sm:h-1.5 overflow-hidden rounded-full bg-muted/50">
                <div
                  className={cn('h-full transition-all', rarity.style.badge.split(' ')[0])}
                  style={{ width: `${Math.min(100, percentage)}%` }}
                />
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

interface AchievementsGridProps {
  achievements: Array<{
    id: string
    title: string
    description: string
    category: string
    rarity: AchievementRarity
    xpReward?: number
    unlocked: boolean
    unlockedAt?: string
  }>
  t: (key: string) => string
}

function AchievementsGrid({ achievements, t }: AchievementsGridProps) {
  if (achievements.length === 0) {
    return (
      <Card className="border-dashed border-border/60">
        <CardContent className="flex flex-col items-center justify-center gap-3 sm:gap-4 py-10 sm:py-12 text-center px-4 sm:px-6">
          <Trophy className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/50" />
          <div>
            <p className="text-sm sm:text-base font-medium text-foreground">{t('achievements.noAchievements')}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">{t('achievements.noAchievementsDescription')}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {achievements.map((achievement) => {
        const CategoryIcon = categoryIcons[achievement.category as keyof typeof categoryIcons] ?? Trophy
        const rarityStyle = rarityStyles[achievement.rarity]

        return (
          <Card
            key={achievement.id}
            className={cn(
              'group relative flex flex-col overflow-hidden transition-all hover:shadow-md',
              achievement.unlocked
                ? cn(rarityStyle.container, rarityStyle.borderStyle)
                : achievement.rarity === 'legendary'
                  ? 'bg-muted/30 border-2 border-primary/40 opacity-80'
                  : 'bg-muted/20 border border-border/60 opacity-75',
              achievement.unlocked && 'effect' in rarityStyle && rarityStyle.effect,
              achievement.rarity === 'legendary' && 'animate-legendary-glow'
            )}
          >
            <CardHeader className="space-y-2 sm:space-y-3 pb-2 sm:pb-3 p-4 sm:p-6">
              <div className="flex items-start justify-between gap-2 sm:gap-3">
                <div
                  className={cn(
                    'flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-lg sm:rounded-xl border-2 transition-colors',
                    achievement.unlocked
                      ? 'border-primary/50 bg-primary/10 text-primary'
                      : 'border-border/60 bg-muted text-muted-foreground'
                  )}
                >
                  {achievement.unlocked ? (
                    <CategoryIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                  ) : (
                    <Lock className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </div>
                {achievement.unlocked ? (
                  <Badge
                    variant="secondary"
                    className={cn(
                      'flex items-center gap-0.5 sm:gap-1 rounded-full px-2 sm:px-2.5 py-0.5 text-[9px] sm:text-[10px] uppercase tracking-wide shrink-0',
                      rarityStyle.badge
                    )}
                  >
                    <CheckCircle2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    {t('achievements.unlocked')}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="rounded-full text-[9px] sm:text-[10px] uppercase tracking-wide shrink-0">
                    {t('achievements.locked')}
                  </Badge>
                )}
              </div>
              <div className="space-y-0.5 sm:space-y-1">
                <CardTitle className="text-sm sm:text-base font-semibold leading-tight">
                  {achievement.title}
                </CardTitle>
                <CardDescription className="text-[10px] sm:text-xs leading-relaxed">{achievement.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="mt-auto space-y-2 sm:space-y-3 pt-0 p-4 sm:p-6">
              <div className="flex items-center justify-between gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
                <div className="flex items-center gap-1 sm:gap-1.5 min-w-0 flex-1">
                  <CategoryIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0 text-muted-foreground" />
                  <span className="text-muted-foreground capitalize shrink-0 hidden sm:inline">{achievement.category}</span>
                  <span className="text-muted-foreground shrink-0 hidden sm:inline">•</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      'rounded-full px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] flex items-center gap-0.5 sm:gap-1 border shrink-0',
                      achievement.unlocked ? rarityStyle.badge : 'bg-muted/50 text-muted-foreground border-border/60'
                    )}
                  >
                    {achievement.rarity}
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            'h-2 w-2 sm:h-2.5 sm:w-2.5 transition-colors shrink-0',
                            i < rarityStyle.filledStars
                              ? achievement.unlocked
                                ? 'text-primary fill-primary'
                                : 'text-muted-foreground fill-muted-foreground/40'
                              : 'text-muted-foreground/30 fill-transparent'
                          )}
                        />
                      ))}
                    </div>
                  </Badge>
                </div>
                {achievement.xpReward && (
                  <span className="flex items-center gap-0.5 sm:gap-1 font-medium text-foreground whitespace-nowrap shrink-0">
                    <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0 text-primary" />
                    +{formatXP(achievement.xpReward)} XP
                  </span>
                )}
              </div>
              {achievement.unlocked && achievement.unlockedAt && (
                <div className="flex items-center gap-1 sm:gap-1.5 rounded-lg border border-border/50 bg-muted/10 px-2 sm:px-2.5 py-1 sm:py-1.5 text-[10px] sm:text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span>{t('achievements.unlocked')} {new Date(achievement.unlockedAt).toLocaleDateString()}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}


