/**
 * ProfilePage - Полнофункциональная страница профиля пользователя
 * 
 * СТРУКТУРА:
 * - Основная информация (аватар, имя, био, статистика)
 * - Боковая панель: уровень, достижения, быстрые действия, цели создателя, закрепленные коллекции
 * - Основная секция: аналитика аудитории, распределение контента, лента активности
 * - Вкладки: Статьи, Комментарии, Закладки
 * 
 * ВОССТАНОВЛЕННЫЕ БЛОКИ (только для своего профиля):
 * - Audience Insights (Аналитика аудитории): метрики просмотров, читателей, времени чтения
 * - Content Mix (Распределение контента): распределение статей по тегам
 * - Activity Feed (Лента активности): последние действия пользователя
 * - Creator Goals (Цели создателя): прогресс по целям (статьи, подписчики, уровень)
 * - Quick Actions (Быстрые действия): быстрый доступ к созданию статей, настройкам, черновикам
 * - Pinned Collections (Закрепленные коллекции): закрепленные коллекции статей
 * 
 * МОК-ДАННЫЕ:
 * Страница использует мок-данные из @/data/mockProfileData.tsx
 * Все восстановленные блоки отображаются только для своего профиля (isOwnProfile === true)
 * 
 * ИНСТРУКЦИИ ПО ИНТЕГРАЦИИ:
 * См. PROFILE_INTEGRATION_GUIDE.md в корне проекта или комментарии в mockProfileData.tsx
 */

import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Award,
  Bookmark,
  FileEdit,
  Flame,
  MessageSquare,
  NotebookPen,
  PenSquare,
  Settings,
  Trophy,
  Users,
  Heart,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Target,
  Zap,
  Layers,
  Activity,
  CheckCircle2,
  ChevronRight,
  MoreVertical,
  Share2,
  Flag,
  Copy,
  Check,
  UserPlus,
  UserMinus,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { getUserProfile } from '@/api/profile'
import { followUser, unfollowUser, checkFollowStatus } from '@/api/follow'
import { logger } from '@/lib/logger'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ThemeToggle } from '@/components/ThemeToggle'
import { AccountSheet } from '@/components/AccountSheet'
import { ArticleCard } from '@/components/ArticleCard'
import { useGamificationStore } from '@/stores/gamificationStore'
import { shallow } from 'zustand/shallow'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/components/ui/use-toast'
import { RateLimitError } from '@/lib/errors'
import { useTranslation } from '@/hooks/useTranslation'
import { getRoleByUuid, ROLE_BY_UUID } from '@/config/admins'
import { normalizeR2Url } from '@/lib/r2-url-helper'
import {
  mockAudienceInsights,
  mockContentMix,
  mockActivityFeed,
  mockCreatorGoals,
  mockQuickActions,
  mockPinnedCollections,
  type MockAudienceInsight,
  type MockContentMix,
  type MockActivityItem,
  type MockCreatorGoal,
  type MockQuickAction,
  type MockPinnedCollection,
} from '@/data/mockProfileData'

// Скелетон загрузки
function ProfileSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <Card className="overflow-hidden">
        <div className="h-32 bg-muted" />
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className="h-20 w-20 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-6 w-48 bg-muted rounded" />
              <div className="h-4 w-32 bg-muted rounded" />
        </div>
              </div>
        </CardContent>
      </Card>
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-4">
          <Card className="h-64 bg-muted" />
          <Card className="h-48 bg-muted" />
            </div>
        <Card className="h-96 bg-muted" />
            </div>
          </div>
  )
}

// Компонент уровня и прогресса (упрощенный)
function LevelCard({
  level,
  xpProgress,
  xpCurrent,
  xpRequired,
  streak,
}: {
  level: number
  xpProgress: number
  xpCurrent: number
  xpRequired: number
  streak: number
}) {
  const { t } = useTranslation()
  return (
    <Card className="border-dashed border-muted-foreground/40 opacity-20 hover:opacity-100 transition-opacity">
      <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-3 sm:pt-6">
        <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
          <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
          {t('profile.level', { level })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6 pb-3 sm:pb-6">
        <div className="space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-muted-foreground">{t('profile.progress')}</span>
            <span className="font-medium">{xpProgress}%</span>
          </div>
          <Progress value={xpProgress} className="h-1.5 sm:h-2" />
          <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground">
            <span>{xpCurrent} / {xpRequired} {t('profile.xp')}</span>
            <span>{t('profile.xpRemaining', { xp: Math.max(xpRequired - xpCurrent, 0) })}</span>
          </div>
        </div>

        {streak > 0 && (
          <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-2 sm:p-3">
            <Flame className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] sm:text-xs text-muted-foreground">{t('profile.activityStreak')}</p>
              <p className="text-xs sm:text-sm font-semibold">{t('profile.streakDays', { count: streak })}</p>
          </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Упрощенные достижения (только 3 последних)
function AchievementsCard({ achievements }: { achievements: Array<{ id: string; title: string; unlocked: boolean }> }) {
  const { t } = useTranslation()
  const unlocked = achievements.filter((a) => a.unlocked).slice(0, 3)

  if (unlocked.length === 0) return null

  return (
    <Card>
      <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-3 sm:pt-6">
        <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
          <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
          {t('profile.achievements')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5 sm:space-y-2 px-4 sm:px-6 pb-3 sm:pb-6">
        {unlocked.map((achievement) => (
          <div
            key={achievement.id}
            className="flex items-center gap-2 sm:gap-3 rounded-lg border bg-muted/50 p-2 sm:p-3"
          >
            <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
            <p className="text-xs sm:text-sm font-medium flex-1 min-w-0 break-words">{achievement.title}</p>
          </div>
        ))}
        {achievements.filter((a) => a.unlocked).length > 3 && (
          <p className="text-[10px] sm:text-xs text-muted-foreground text-center pt-1 sm:pt-2">
            {t('profile.moreAchievements', { count: achievements.filter((a) => a.unlocked).length - 3 })}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

// Компонент комментариев
function CommentsTab({ comments, onArticleClick }: { comments: Array<{ id: string; text: string; createdAt: string; article: { id: string; title: string } }>; onArticleClick: (id: string) => void }) {
  const { t } = useTranslation()
  if (comments.length === 0) {
  return (
      <Card className="border-dashed">
        <CardContent className="py-8 sm:py-12 text-center px-4">
          <MessageSquare className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground mx-auto mb-2 sm:mb-3" />
          <p className="text-xs sm:text-sm text-muted-foreground">{t('profile.noComments')}</p>
      </CardContent>
    </Card>
  )
}

  return (
        <div className="space-y-3 sm:space-y-4">
      {comments.map((comment) => (
        <Card key={comment.id} className="hover:border-primary/40 transition-colors">
          <CardContent className="p-4 sm:p-4 md:p-5">
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-start justify-between gap-2 sm:gap-3">
          <button
                  onClick={() => onArticleClick(comment.article.id)}
                  className="text-left group flex-1 min-w-0"
                >
                  <p className="text-xs sm:text-sm font-semibold text-primary group-hover:underline break-words line-clamp-2">
                    {comment.article.title}
                  </p>
          </button>
                <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap shrink-0 ml-2">
                  {new Date(comment.createdAt).toLocaleDateString('ru-RU', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                    </div>
              <p className="text-xs sm:text-sm text-foreground leading-relaxed line-clamp-3 break-words">{comment.text}</p>
                  </div>
      </CardContent>
    </Card>
      ))}
    </div>
  )
}

// Компонент закладок
function BookmarksTab({
  bookmarks,
  onArticleClick,
}: {
  bookmarks: Array<{ id: string; createdAt: string; article: { id: string; title: string; excerpt?: string | null; previewImage?: string | null } }>
  onArticleClick: (id: string) => void
}) {
  const { t } = useTranslation()
  if (bookmarks.length === 0) {
  return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <Bookmark className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">{t('profile.noBookmarks')}</p>
        </CardContent>
      </Card>
  )
}

  return (
    <div className="grid gap-4 sm:gap-4 sm:grid-cols-2">
      {bookmarks.map((bookmark) => (
        <Card
          key={bookmark.id}
          className="hover:border-primary/40 transition-colors cursor-pointer"
          onClick={() => onArticleClick(bookmark.article.id)}
        >
          <CardContent className="p-4 sm:p-4 md:p-5">
              <div className="space-y-1.5 sm:space-y-2">
              <p className="text-xs sm:text-sm font-semibold line-clamp-2 break-words">{bookmark.article.title}</p>
              {bookmark.article.excerpt && (
                <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2 break-words">{bookmark.article.excerpt}</p>
              )}
        </div>
      </CardContent>
    </Card>
      ))}
    </div>
  )
}

// Компонент аналитики аудитории
function AudienceInsightsCard({ insights }: { insights: MockAudienceInsight[] }) {
  const { t } = useTranslation()
  if (insights.length === 0) return null

  return (
    <Card className="border-dashed border-muted-foreground/40 opacity-20 hover:opacity-100 transition-opacity">
      <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-3 sm:pt-6">
        <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
          <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
          {t('profile.audienceInsights')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6 pb-3 sm:pb-6">
        {insights.map((insight, index) => (
          <div key={index} className="space-y-1.5 sm:space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground truncate flex-1 min-w-0 pr-2">{insight.metric}</span>
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {insight.trend === 'up' && (
                  <TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-green-500" />
                )}
                {insight.trend === 'down' && (
                  <TrendingDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-red-500" />
                )}
                <span
                  className={cn(
                    'text-[10px] sm:text-xs font-medium',
                    insight.trend === 'up' && 'text-green-500',
                    insight.trend === 'down' && 'text-red-500',
                    insight.trend === 'stable' && 'text-muted-foreground'
                  )}
                >
                  {insight.change > 0 ? '+' : ''}
                  {insight.change}%
                </span>
                </div>
              </div>
            <p className="text-base sm:text-lg font-bold">{insight.value.toLocaleString('ru-RU')}</p>
          </div>
        ))}
            </CardContent>
          </Card>
  )
}

// Компонент распределения контента
function ContentMixCard({ mix }: { mix: MockContentMix[] }) {
  const { t } = useTranslation()
  if (mix.length === 0) return null

  return (
    <Card className="border-dashed border-muted-foreground/40 opacity-20 hover:opacity-100 transition-opacity">
      <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-3 sm:pt-6">
        <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
          <Layers className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
          {t('profile.contentMix')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5 sm:space-y-3 px-4 sm:px-6 pb-3 sm:pb-6">
        {mix.map((item, index) => (
          <div key={index} className="space-y-1.5 sm:space-y-2">
            <div className="flex items-center justify-between gap-2 text-xs sm:text-sm">
              <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 sm:px-2">
                #{item.tag}
              </Badge>
              <span className="text-muted-foreground text-[10px] sm:text-xs shrink-0">
                {t('profile.articlesCount', { count: item.count, percentage: item.percentage })}
              </span>
            </div>
            <Progress value={item.percentage} className="h-1.5 sm:h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// Компонент ленты активности
function ActivityFeedCard({ activities }: { activities: MockActivityItem[] }) {
  const { t } = useTranslation()
  if (activities.length === 0) return null

  const getIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      NotebookPen,
      MessageSquare,
      Heart,
      Bookmark,
    }
    const IconComponent = icons[iconName] || Activity
    return <IconComponent className="h-4 w-4" />
  }

  return (
    <Card className="border-dashed border-muted-foreground/40 opacity-20 hover:opacity-100 transition-opacity">
      <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-3 sm:pt-6">
        <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
          <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
          {t('profile.recentActivity')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 sm:space-y-3 px-4 sm:px-6 pb-3 sm:pb-6">
        {activities.slice(0, 5).map((activity) => (
          <div key={activity.id} className="flex items-start gap-2 sm:gap-3 rounded-lg border bg-muted/50 p-2 sm:p-3">
            <div className="mt-0.5 text-muted-foreground shrink-0">{getIcon(activity.icon)}</div>
            <div className="flex-1 space-y-0.5 sm:space-y-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium break-words">{activity.title}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                {new Date(activity.timestamp).toLocaleDateString('ru-RU', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              </div>
            </div>
        ))}
      </CardContent>
    </Card>
  )
}

// Компонент целей создателя
function CreatorGoalsCard({ goals }: { goals: MockCreatorGoal[] }) {
  const { t } = useTranslation()
  if (goals.length === 0) return null

  return (
    <Card className="border-dashed border-muted-foreground/40 opacity-20 hover:opacity-100 transition-opacity">
      <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-3 sm:pt-6">
        <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
          <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
          {t('profile.creatorGoals')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6 pb-3 sm:pb-6">
        {goals.map((goal) => {
          const progressPercent = Math.min(100, Math.round((goal.progress / goal.target) * 100))
            return (
            <div key={goal.id} className="space-y-1.5 sm:space-y-2">
              <div className="flex items-center justify-between gap-2 text-xs sm:text-sm">
                  <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                  {goal.completed && (
                    <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500 shrink-0" />
                  )}
                  <span className="font-medium truncate">{goal.title}</span>
            </div>
                <span className="text-muted-foreground text-[10px] sm:text-xs shrink-0">
                  {goal.progress} / {goal.target}
                </span>
                  </div>
              <Progress value={progressPercent} className="h-1.5 sm:h-2" />
              <p className="text-[10px] sm:text-xs text-muted-foreground break-words">{goal.description}</p>
                </div>
            )
          })}
      </CardContent>
    </Card>
  )
}

// Компонент быстрых действий
function QuickActionsCard({
  actions,
  onNavigate,
}: {
  actions: MockQuickAction[]
  onNavigate: (href: string) => void
}) {
  const { t } = useTranslation()
  if (actions.length === 0) return null

  const getIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      PenSquare,
      Settings,
      FileEdit,
    }
    const IconComponent = icons[iconName] || Zap
    return <IconComponent className="h-4 w-4" />
  }

  return (
    <Card>
      <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-3 sm:pt-6">
        <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
          <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
          {t('profile.quickActions')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5 sm:space-y-2 px-4 sm:px-6 pb-3 sm:pb-6">
        {actions.map((action) => (
                    <Button
            key={action.id}
            variant={action.variant}
                      size="sm"
            className="w-full justify-start gap-1.5 sm:gap-2 h-8 sm:h-9 text-xs sm:text-sm"
            onClick={() => onNavigate(action.href)}
          >
            {getIcon(action.icon)}
            {action.label}
                    </Button>
                  ))}
      </CardContent>
    </Card>
  )
}

// Компонент закрепленных коллекций
function PinnedCollectionsCard({
  collections,
  onNavigate,
}: {
  collections: MockPinnedCollection[]
  onNavigate: (href: string) => void
}) {
  const { t } = useTranslation()
  if (collections.length === 0) return null

  return (
    <Card className="border-dashed border-muted-foreground/40 opacity-20 hover:opacity-100 transition-opacity">
      <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-3 sm:pt-6">
        <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
          <Layers className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
          {t('profile.pinnedCollections')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 sm:space-y-3 px-4 sm:px-6 pb-3 sm:pb-6">
        {collections.map((collection) => (
        <Card
            key={collection.id}
            className="cursor-pointer hover:border-primary/40 transition-colors"
            onClick={() => onNavigate(collection.href)}
          >
            <CardContent className="p-4 sm:p-4">
              <div className="flex items-start justify-between gap-2 sm:gap-3">
                <div className="flex-1 space-y-0.5 sm:space-y-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold break-words">{collection.title}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2">{collection.description}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    {t('profile.articlesCountShort', { count: collection.articleCount })}
                  </p>
            </div>
                <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground mt-0.5 sm:mt-1 shrink-0" />
            </div>
          </CardContent>
        </Card>
      ))}
          </CardContent>
        </Card>
  )
}

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { user: currentUser } = useAuthStore()
  const { toast } = useToast()
  const { t, language } = useTranslation()

  // Helper функция для обработки RateLimitError
  const handleRateLimitError = (error: any) => {
    if (error instanceof RateLimitError) {
      const waitTime = error.waitTime
      if (waitTime > 0) {
        toast({
          title: t('common.rateLimitExceeded'),
          description:
            waitTime === 1
              ? t('common.waitOneSecond')
              : t('common.waitSeconds', { seconds: waitTime }),
          variant: 'destructive',
          dedupeKey: 'rate-limit', // Дедупликация для rate limit тостов
        })
      } else {
        toast({
          title: t('common.rateLimitExceeded'),
          description: t('common.waitAMoment'),
          variant: 'destructive',
          dedupeKey: 'rate-limit', // Дедупликация для rate limit тостов
        })
      }
      return true
    }
    return false
  }
  const queryClient = useQueryClient()
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'articles' | 'comments' | 'bookmarks'>('articles')
  const [avatarError, setAvatarError] = useState(false)
  const [coverError, setCoverError] = useState(false)

  const routeProfileId = id || undefined
  const profileId = routeProfileId || currentUser?.uuid

  useEffect(() => {
    if (!routeProfileId && currentUser?.uuid) {
      navigate(`/profile/${currentUser.uuid}`, { replace: true })
    }
  }, [routeProfileId, currentUser, navigate])

  const {
    data: profile,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['profile', profileId],
    queryFn: () => getUserProfile(profileId!),
    enabled: !!profileId,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
    gcTime: 0,
  })

  const { level, xpIntoLevel, xpForLevel, streakDays, achievements } = useGamificationStore(
    (state) => ({
      level: state.level,
      xpIntoLevel: state.xpIntoLevel,
      xpForLevel: state.xpForLevel,
      streakDays: state.streakDays,
      achievements: state.achievements,
    }),
    shallow
  )

  const xpProgressPercent = xpForLevel > 0 ? Math.min(100, Math.round((xpIntoLevel / xpForLevel) * 100)) : 0
  const isOwnProfile =
    profile?.user.uuid === currentUser?.uuid ||
    (!profile && profileId && currentUser?.uuid && profileId === currentUser.uuid)

  // Unified media/tag fallbacks
  const rawAvatar =
    profile?.user?.avatarUrl ||
    (profile?.user as any)?.avatar ||
    (profile?.user as any)?.avatar_url ||
    (profile?.user as any)?.photo_url ||
    currentUser?.avatar ||
    null
  const rawCover = isOwnProfile
    ? profile?.user?.coverImageUrl ||
    (profile?.user as any)?.coverImage ||
    (profile?.user as any)?.cover_image ||
    (profile?.user as any)?.cover_url ||
    (profile?.user as any)?.banner_url ||
    currentUser?.coverImage ||
    null
    : profile?.user?.coverImageUrl ||
      (profile?.user as any)?.coverImage ||
      (profile?.user as any)?.cover_image ||
      (profile?.user as any)?.cover_url ||
      (profile?.user as any)?.banner_url ||
      null

  // Нормализуем R2 URLs для правильного отображения
  const avatarSrc = avatarError ? null : normalizeR2Url(rawAvatar)
  const coverSrc = coverError ? null : normalizeR2Url(rawCover)
  const displayTag = profile?.user?.tag ?? (currentUser as any)?.tag ?? null
  const displayUsername = isOwnProfile
    ? currentUser?.nickname || (currentUser as any)?.username || currentUser?.email?.split('@')[0] || 'User'
    : profile?.user.username || t('profile.unknownNickname')

  useEffect(() => {
    setAvatarError(false)
    setCoverError(false)
  }, [profile?.user?.uuid, profile?.user?.avatarUrl, profile?.user?.coverImageUrl])

  // Проверяем статус подписки
  const { data: followStatus } = useQuery({
    queryKey: ['follow-status', profileId, currentUser?.uuid],
    queryFn: () => {
      if (!currentUser?.uuid || !profileId || isOwnProfile) return null
      return checkFollowStatus(profileId, currentUser.uuid)
    },
    enabled: !!currentUser?.uuid && !!profileId && !isOwnProfile,
  })

  const followMutation = useMutation({
    mutationFn: () => followUser(profileId!),
    onSuccess: () => {
      toast({
        title: t('profile.followed'),
        description: t('profile.followedDescription'),
      })
      // Обновляем статус подписки
      queryClient.invalidateQueries({ queryKey: ['follow-status', profileId, currentUser?.uuid] })
    },
    onError: (error: any) => {
      if (handleRateLimitError(error)) {
        return
      }
      logger.error('Failed to follow user:', error)
      toast({
        title: t('common.error'),
        description: error?.response?.data?.error?.message || t('profile.followError'),
        variant: 'destructive',
      })
    },
  })

  const unfollowMutation = useMutation({
    mutationFn: () => {
      if (!profileId) throw new Error('Profile ID not found')
      return unfollowUser(profileId)
    },
    onSuccess: () => {
      toast({
        title: t('profile.unfollowed'),
        description: t('profile.unfollowedDescription'),
      })
      // Обновляем статус подписки
      queryClient.invalidateQueries({ queryKey: ['follow-status', profileId, currentUser?.uuid] })
    },
    onError: (error: any) => {
      if (handleRateLimitError(error)) {
        return
      }
      logger.error('Failed to unfollow user:', error)
      toast({
        title: t('common.error'),
        description: error?.response?.data?.error?.message || t('profile.unfollowError'),
        variant: 'destructive',
      })
    },
  })

  // Функция для копирования ссылки на профиль
  const handleCopyProfileLink = async () => {
    const profileUrl = `${window.location.origin}/profile/${profileId}`
    try {
      await navigator.clipboard.writeText(profileUrl)
      setCopied(true)
      toast({
        title: t('profile.linkCopied'),
        description: t('profile.linkCopiedDescription'),
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({
        title: t('common.error'),
        description: t('profile.copyError'),
        variant: 'destructive',
      })
    }
  }

  // Функция для поделиться профилем
  const handleShareProfile = async () => {
    const profileUrl = `${window.location.origin}/profile/${profileId}`
    const shareData = {
      title: t('profile.shareTitle', { username: displayUsername }),
      text: t('profile.shareText', { username: displayUsername }),
      url: profileUrl,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        // Fallback: копируем ссылку
        await handleCopyProfileLink()
      }
    } catch (err) {
      // Пользователь отменил или произошла ошибка
      if ((err as Error).name !== 'AbortError') {
        await handleCopyProfileLink()
      }
    }
  }

  // Функция для жалобы
  const handleReport = () => {
    // TODO: Реализовать форму жалобы
    toast({
      title: t('profile.report'),
      description: t('profile.reportDescription'),
    })
  }

  // Используем реальные данные из профиля
  const comments = profile?.comments || []
  const bookmarks = profile?.bookmarks || []

  // Используем мок-данные для восстановленных блоков
  const audienceInsights = isOwnProfile ? mockAudienceInsights : []
  const contentMix = isOwnProfile ? mockContentMix : []
  const activityFeed = isOwnProfile ? mockActivityFeed : []
  const creatorGoals = isOwnProfile ? mockCreatorGoals : []
  const quickActions = isOwnProfile
    ? mockQuickActions.map((action) => {
        const key = `profile.quickActions.actions.${action.id}`
        const translated = t(key)
        const label = translated === key ? action.label : translated
        return { ...action, label }
      })
    : []
  const pinnedCollections = isOwnProfile ? mockPinnedCollections : []

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString(language === 'en' ? 'en-US' : 'ru-RU', {
      month: 'long',
      year: 'numeric',
    })

  const normalizeRole = (val?: string | null) => {
    if (typeof val !== 'string') return undefined
    const cleaned = val.trim()
    if (!cleaned) return undefined
    return cleaned.toLowerCase().replace(/[\s-]+/g, '_')
  }

  const rawRole =
    profile?.user.role ??
    (currentUser as any)?.role ??
    undefined

  const cleanId = (val?: string | null) => {
    if (!val) return ''
    try {
      return decodeURIComponent(val).split('?')[0].split('#')[0].trim()
    } catch {
      return val.split('?')[0].split('#')[0].trim()
    }
  }

  const normalizedUuid =
    cleanId(routeProfileId) ||
    cleanId(profileId) ||
    cleanId(profile?.user.uuid) ||
    cleanId(profile?.user.id?.toString()) ||
    cleanId((currentUser as any)?.uuid) ||
    ''

  const normalizedRawRole = normalizeRole(rawRole)
  const overrideRole = (() => {
    const cleaned = normalizedUuid.toLowerCase()
    // primary: mapping function
    const fromFn = getRoleByUuid(normalizedUuid) || getRoleByUuid(cleaned)
    if (fromFn) return normalizeRole(fromFn)
    // secondary: direct access to mapping
    const direct = ROLE_BY_UUID[normalizedUuid] || ROLE_BY_UUID[cleaned]
    if (direct) return normalizeRole(direct)
    // hard fallback: if UUID in mapping keys list (even if case differs) force owner
    const allKeys = Object.keys(ROLE_BY_UUID).map((k) => k.toLowerCase())
    if (allKeys.includes(cleaned)) return 'owner'
    // hardcoded UUID for owner (your account)
    if (cleaned === '018eeeb8-80d5-40c7-b8da-a9998d58679f') return 'owner'
    return undefined
  })()

  // Приоритет: override по UUID, затем роль из профиля (кроме "user")
  const roleValue =
    overrideRole ||
    (normalizedRawRole && normalizedRawRole !== 'user' ? normalizedRawRole : overrideRole || undefined)

  // TEMP fallback: force owner if visiting own profile and override present
  const effectiveRoleValue =
    overrideRole ||
    roleValue ||
    undefined
  const roleStyles: Record<string, { bg: string; label: string }> = {
    owner: { bg: 'bg-red-500', label: t('roles.owner') },
    admin: { bg: 'bg-yellow-400', label: t('roles.admin') },
    super_admin: { bg: 'bg-orange-500', label: t('roles.admin') },
    developer: { bg: 'bg-purple-500', label: t('roles.developer') },
    moderator: { bg: 'bg-sky-400', label: t('roles.moderator') },
    manager: { bg: 'bg-emerald-500', label: 'Manager' },
    editor: { bg: 'bg-amber-500', label: 'Editor' },
    writer: { bg: 'bg-pink-500', label: 'Writer' },
    designer: { bg: 'bg-indigo-500', label: 'Designer' },
    tester: { bg: 'bg-lime-500', label: 'Tester' },
    support: { bg: 'bg-cyan-500', label: 'Support' },
  }

  const resolveRoleStyle = (val?: string | null) => {
    if (!val) return null
    if (val === 'user') return null // не показываем бейдж для обычных пользователей
    if (roleStyles[val]) return roleStyles[val]
    // fallback для новых ролей: серый бейдж с исходным именем роли
    return { bg: 'bg-muted-foreground', label: val }
  }

  const activeRole = resolveRoleStyle(effectiveRoleValue)
  const showRoleBadge = Boolean(activeRole)

  useEffect(() => {
    // Лог в любом окружении: видно UUID, роль из БД и override
    // eslint-disable-next-line no-console
    console.debug('Profile role debug', {
      profileId,
      routeProfileId,
      ROLE_BY_UUID,
      rawRole,
      normalized: roleValue,
      activeRole: activeRole?.label,
      normalizedUuid,
      overrideRole: getRoleByUuid(normalizedUuid),
      overrideRoleComputed: overrideRole,
      effectiveRoleValue,
    })
  }, [profileId, routeProfileId, rawRole, roleValue, activeRole, normalizedUuid])

  if (!profileId && !isLoading) {
    return (
      <div className="min-h-screen app-surface">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
                {t('common.back')}
            </Button>
              <Separator orientation="vertical" className="h-6" />
              <h1 className="text-lg font-semibold">{t('profile.pageTitle')}</h1>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <AccountSheet />
            </div>
          </div>
        </header>
        <div className="container py-24 text-center">
          <Card className="mx-auto max-w-md border-dashed">
            <CardContent className="space-y-4 py-10">
              <Users className="mx-auto h-10 w-10 text-muted-foreground" />
              <CardTitle className="text-xl">{t('profile.profileNotFound')}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {t('profile.profileNotFoundDescription')}
              </p>
              <Button onClick={() => navigate('/')}>{t('common.back')}</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen app-surface">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/forum')} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                {t('common.back')}
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <h1 className="text-lg font-semibold">{t('profile.pageTitle')}</h1>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <AccountSheet />
            </div>
          </div>
        </header>
        <div className="container py-10">
          <ProfileSkeleton />
        </div>
      </div>
    )
  }

  if (isError || !profile) {
    return (
      <div className="min-h-screen app-surface">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
          <div className="container flex h-16 items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => navigate('/forum')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t('common.back')}
            </Button>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <AccountSheet />
            </div>
          </div>
        </header>
        <div className="container py-24 text-center">
          <Card className="mx-auto max-w-md border-dashed">
            <CardContent className="space-y-4 py-10">
              <Users className="mx-auto h-10 w-10 text-muted-foreground" />
              <CardTitle className="text-xl">{t('profile.loadingError')}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {t('profile.loadingErrorDescription')}
              </p>
              <div className="flex justify-center gap-2">
                <Button variant="outline" onClick={() => navigate('/forum')}>
                  {t('common.back')}
                </Button>
                <Button onClick={() => navigate('/')}>{t('common.back')}</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const normalizeId = (value: unknown) => (value === undefined || value === null ? '' : String(value).toLowerCase())
  const ownerId = normalizeId(profile?.user?.uuid)

  const displayedArticles = (profile.articles || []).filter((article) => {
    const authorId =
      normalizeId((article as any)?.author?.uuid) ||
      normalizeId((article as any)?.author?.id) ||
      normalizeId((article as any)?.author_id)

    if (!ownerId) return true // нет id владельца – не фильтруем
    if (!authorId) return true // нет id автора в статье – показываем, чтобы не потерять данные
    return authorId === ownerId
  })

  return (
    <div className="min-h-screen app-surface">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <Button variant="ghost" size="sm" onClick={() => navigate('/forum')} className="gap-1 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3 shrink-0">
              <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{t('common.back')}</span>
            </Button>
            <Separator orientation="vertical" className="h-4 sm:h-6 hidden sm:block" />
            <h1 className="text-sm sm:text-lg font-semibold truncate">{t('profile.pageTitle')}</h1>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <ThemeToggle />
            <AccountSheet />
          </div>
        </div>
      </header>

      <div className="container pt-4 sm:pt-6 pb-2 sm:pb-4 md:pb-6 px-4 sm:px-6">
        {/* Шапка профиля */}
        <Card className="mb-4 sm:mb-4 md:mb-6 overflow-hidden border-border/60 bg-card shadow-sm">
          <div className="relative w-full overflow-hidden">
            {coverSrc ? (
              <div className="relative aspect-[3/1] sm:aspect-[4/1] w-full">
                <img
                  src={coverSrc}
                  alt={`${displayUsername} cover`}
                  className="h-full w-full object-cover"
                  onError={() => setCoverError(true)}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20" />
                </div>
              ) : (
              <div className="relative aspect-[3/1] sm:aspect-[4/1] w-full bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
                <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/15" />
                </div>
              )}
          </div>
        </Card>

        {/* Основная панель профиля */}
        <Card className="mb-4 sm:mb-4 md:mb-6 border-border/60 bg-card shadow-sm">
          <CardContent className="p-4 sm:p-4 md:p-6">
            {/* Мобильный лайаут: улучшенный */}
            <div className="flex flex-col gap-3 sm:gap-5 sm:hidden">
              {/* Верхняя строка: аватар, имя, бейдж, меню */}
              <div className="flex items-start gap-3 w-full">
                {/* Аватар */}
                <div className="relative h-16 w-16 shrink-0">
                  {avatarSrc && (
                    <img
                      src={avatarSrc}
                      alt={displayUsername}
                      className="h-16 w-16 rounded-full border-2 object-cover shadow-md"
                      style={{ borderColor: 'hsl(var(--border))' }}
                      onError={() => setAvatarError(true)}
                    />
                  )}
                  <div
                    className={`${avatarSrc ? 'hidden' : 'flex'} absolute inset-0 items-center justify-center rounded-full border-2 bg-primary/15 text-2xl font-semibold text-primary shadow-md`}
                    style={{ borderColor: 'hsl(var(--border))' }}
                  >
                    {(displayUsername || 'U').charAt(0).toUpperCase()}
                  </div>
                {showRoleBadge && activeRole && (
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger>
                        <div
                          className={cn(
                            'absolute -bottom-2 -right-2 h-10 w-10 rounded-full ring-2 ring-background flex items-center justify-center text-white shadow-xl z-10',
                            activeRole.bg
                          )}
                        >
                          <Zap className="h-5 w-5" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>{activeRole.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                </div>

                {/* Имя, бейдж и меню */}
                <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <h1 className="text-lg font-bold tracking-tight truncate">{displayUsername}</h1>
                      {showRoleBadge && activeRole && (
                        <TooltipProvider delayDuration={0}>
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge
                                variant="default"
                                className="gap-1 h-6 px-2.5 py-0 text-xs shrink-0 ring-1 ring-background/60 shadow-sm"
                              >
                                <Zap className="h-3.5 w-3.5" />
                                <span className="truncate">{activeRole.label}</span>
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <p>{activeRole.label}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    <Badge variant="default" className="gap-1 shrink-0 text-[10px] px-2 py-0.5 h-5">
                        <Trophy className="h-3 w-3" />
                        <span>{level}</span>
                        </Badge>
                      </div>
                    {/* Дропдаун меню */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">{t('profile.additionalActions')}</span>
                        </Button>
                      </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={handleShareProfile}>
                        <Share2 className="mr-2 h-4 w-4" />
                        {t('profile.shareProfile')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleCopyProfileLink}>
                        {copied ? (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            {t('profile.linkCopied')}
                          </>
                        ) : (
                          <>
                            <Copy className="mr-2 h-4 w-4" />
                            {t('profile.copyLink')}
                            </>
                          )}
                      </DropdownMenuItem>
                      {!isOwnProfile && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={handleReport} className="text-destructive focus:text-destructive">
                            <Flag className="mr-2 h-4 w-4" />
                            {t('profile.report')}
                          </DropdownMenuItem>
                            </>
                          )}
                    </DropdownMenuContent>
                    </DropdownMenu>
                        </div>
                  {/* Дата регистрации */}
                  {displayTag && (
                    <p className="text-xs text-muted-foreground truncate">@{displayTag}</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-[10px] px-2 py-0.5 h-5 w-fit">
                      {t('profile.memberSince', { date: formatDate(profile.user.memberSince) })}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Статистика - улучшенная горизонтальная строка */}
              <div className="flex items-center justify-center gap-4 text-xs w-full px-2 py-2.5 border-y border-border/50">
                <div className="flex items-center gap-1.5">
                  <NotebookPen className="h-3.5 w-3.5 text-muted-foreground/70" />
                  <span className="font-semibold text-foreground">{profile.stats.publishedArticles}</span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-1.5">
                  <Heart className="h-3.5 w-3.5 text-muted-foreground/70" />
                  <span className="font-semibold text-foreground">{profile.stats.totalLikes}</span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-muted-foreground/70" />
                  <span className="font-semibold text-foreground">{profile.stats.totalComments}</span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-muted-foreground/70" />
                  <span className="font-semibold text-foreground">{profile.stats.followers ?? 0}</span>
                  <span className="text-muted-foreground text-[11px] sm:text-xs">
                    {t('profile.followersLabel')}
                  </span>
                </div>
              </div>

              {/* Био */}
              {profile.user.bio && (
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {profile.user.bio}
                </p>
              )}

              {/* Кнопки действий - улучшенные */}
              <div className="flex gap-2 w-full pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                  onClick={() => navigate('/forum')}
                  className="gap-1.5 flex-1 h-9 text-xs"
                    >
                  <ArrowLeft className="h-3.5 w-3.5" />
                        <span className="truncate">{t('profile.openArticles')}</span>
                    </Button>
                {isOwnProfile ? (
                    <Button
                      size="sm"
                    variant="default"
                    className="gap-1.5 flex-1 h-9 text-xs"
                    onClick={() => navigate('/settings/profile', { state: { from: location.pathname } })}
                  >
                    <Settings className="h-3.5 w-3.5" />
                    <span className="truncate">{t('profile.settings')}</span>
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant={followStatus ? 'outline' : 'default'}
                    className="gap-1.5 flex-1 h-9 text-xs"
                    onClick={() => {
                      if (isOwnProfile) return
                      if (followStatus) {
                        unfollowMutation.mutate()
                      } else {
                        followMutation.mutate()
                      }
                    }}
                    disabled={isOwnProfile || followMutation.isPending || unfollowMutation.isPending}
                  >
                    {followStatus ? (
                      <>
                        <UserMinus className="h-3.5 w-3.5" />
                        <span className="truncate">{t('profile.unsubscribe')}</span>
                        </>
                      ) : (
                        <>
                        <UserPlus className="h-3.5 w-3.5" />
                        <span className="truncate">{t('profile.subscribe')}</span>
                        </>
                      )}
                    </Button>
                )}
                  </div>
                </div>

            {/* Десктопный лайаут: аватар слева, информация в центре, кнопки справа */}
            <div className="hidden sm:flex sm:flex-row sm:items-start sm:gap-4 md:gap-6 lg:gap-8">
              {/* Аватар */}
              <div className="relative flex-shrink-0 h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32">
                {avatarSrc && (
                    <img
                      src={avatarSrc}
                      alt={displayUsername}
                      className="h-full w-full rounded-full border-2 object-cover shadow-lg"
                      style={{ borderColor: 'hsl(var(--border))' }}
                      onError={() => setAvatarError(true)}
                    />
                )}
                <div
                  className={`${avatarSrc ? 'hidden' : 'flex'} absolute inset-0 items-center justify-center rounded-full border-2 bg-primary/15 text-2xl sm:text-3xl font-semibold text-primary shadow-lg md:text-4xl`}
                  style={{ borderColor: 'hsl(var(--border))' }}
                >
                  {(displayUsername || 'U').charAt(0).toUpperCase()}
                </div>
                {showRoleBadge && activeRole && (
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger>
                        <div
                          className={cn(
                            'absolute -bottom-2 -right-2 h-11 w-11 rounded-full ring-2 ring-background flex items-center justify-center text-white shadow-xl z-10',
                            activeRole.bg
                          )}
                        >
                          <Zap className="h-5 w-5" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>{activeRole.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>

              {/* Основная информация */}
              <div className="flex flex-1 flex-col gap-3 sm:gap-4 min-w-0">
                {/* Верхняя строка: имя и бейджи */}
                <div className="flex flex-col gap-2 sm:gap-3">
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight truncate">
                        {displayUsername}
                      </h1>
                      {showRoleBadge && activeRole && (
                        <TooltipProvider delayDuration={0}>
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge variant="secondary" className="gap-1 h-6 px-2 py-0 text-xs shrink-0">
                                <Zap className="h-3.5 w-3.5" />
                                <span className="truncate">{activeRole.label}</span>
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <p>{activeRole.label}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    <Badge variant="default" className="gap-1 shrink-0 text-xs sm:text-sm">
                      <Trophy className="h-3 w-3" />
                      {t('profile.levelBadge', { level })}
                    </Badge>
                  </div>
                  {displayTag && (
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">@{displayTag}</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-[10px] sm:text-xs w-fit">
                      {t('profile.memberSince', { date: formatDate(profile.user.memberSince) })}
                    </Badge>
                  </div>
                  {profile.user.bio && (
                    <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl break-words">{profile.user.bio}</p>
                  )}
                </div>

                {/* Статистика */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground">
                    <NotebookPen className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                    <span className="font-medium">{profile.stats.publishedArticles}</span>
                    <span className="text-muted-foreground/70 hidden md:inline">{t('profile.articlesCount')}</span>
                </div>
                  <Separator orientation="vertical" className="h-3 sm:h-4" />
                  <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground">
                    <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                    <span className="font-medium">{profile.stats.totalLikes}</span>
                    <span className="text-muted-foreground/70 hidden md:inline">{t('profile.likesCount')}</span>
                  </div>
                  <Separator orientation="vertical" className="h-3 sm:h-4" />
                  <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground">
                    <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                    <span className="font-medium">{profile.stats.totalComments}</span>
                    <span className="text-muted-foreground/70 hidden md:inline">{t('profile.commentsCount')}</span>
                  </div>
                  <Separator orientation="vertical" className="h-3 sm:h-4" />
                  <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground">
                    <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                    <span className="font-medium">{profile.stats.followers ?? 0}</span>
                    <span className="text-muted-foreground/70 hidden md:inline">{t('profile.followersLabel')}</span>
                  </div>
                </div>

                    </div>

              {/* Правая колонка: дропдаун сверху, кнопки внизу */}
              <div className="flex flex-col items-end justify-between gap-3 sm:gap-4 shrink-0 self-stretch">
                {/* Дропдаун меню - справа сверху */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
                      <MoreVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="sr-only">{t('profile.additionalActions')}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={handleShareProfile}>
                      <Share2 className="mr-2 h-4 w-4" />
                      {t('profile.shareProfile')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleCopyProfileLink}>
                      {copied ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          {t('profile.linkCopied')}
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          {t('profile.copyLink')}
                        </>
                      )}
                    </DropdownMenuItem>
                    {!isOwnProfile && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleReport} className="text-destructive focus:text-destructive">
                          <Flag className="mr-2 h-4 w-4" />
                          {t('profile.report')}
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Кнопки действий - справа внизу */}
                <div className="flex flex-row gap-1.5 sm:gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/forum')}
                    className="gap-1.5 sm:gap-2 whitespace-nowrap h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3"
                  >
                    <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">{t('profile.openArticles')}</span>
                    <span className="sm:hidden">{t('profile.articlesTabShort')}</span>
                  </Button>
                  {isOwnProfile ? (
                    <Button
                      size="sm"
                      variant="default"
                      className="gap-1.5 sm:gap-2 whitespace-nowrap h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3"
                      onClick={() => navigate('/settings/profile', { state: { from: location.pathname } })}
                    >
                      <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">{t('profile.settings')}</span>
                      <span className="sm:hidden">{t('profile.settings')}</span>
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant={followStatus ? 'outline' : 'default'}
                      className="gap-1.5 sm:gap-2 whitespace-nowrap h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3"
                      onClick={() => {
                        if (isOwnProfile) return
                        if (followStatus) {
                          unfollowMutation.mutate()
                        } else {
                          followMutation.mutate()
                        }
                      }}
                      disabled={isOwnProfile || followMutation.isPending || unfollowMutation.isPending}
                    >
                      {followStatus ? (
                        <>
                          <UserMinus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">{t('profile.unsubscribe')}</span>
                          <span className="sm:hidden">-</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">{t('profile.subscribe')}</span>
                          <span className="sm:hidden">+</span>
                        </>
                      )}
                    </Button>
                      )}
                    </div>
              </div>
                    </div>
                  </CardContent>
                </Card>

        {/* Основной контент с вкладками */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr]">
          {/* Боковая панель - скрывается на мобильных, показывается внизу */}
          <aside className="hidden lg:block space-y-3 sm:space-y-4">
            <LevelCard
              level={level}
              xpProgress={xpProgressPercent}
              xpCurrent={xpIntoLevel}
              xpRequired={xpForLevel}
              streak={streakDays}
            />
            <AchievementsCard achievements={achievements} />
            {isOwnProfile && (
              <>
                <QuickActionsCard
                  actions={quickActions}
                  onNavigate={(href) => navigate(href)}
                />
                <CreatorGoalsCard goals={creatorGoals} />
              </>
            )}
            {pinnedCollections.length > 0 && (
              <PinnedCollectionsCard
                collections={pinnedCollections}
                onNavigate={(href) => navigate(href)}
              />
            )}
              </aside>

          {/* Вкладки с контентом */}
          <section className="min-w-0 space-y-4 sm:space-y-6">
            {/* Дополнительные блоки для своего профиля - только на десктопе */}
            {isOwnProfile && (
              <div className="hidden lg:grid gap-2.5 sm:gap-4 sm:grid-cols-2">
                {audienceInsights.length > 0 && (
                  <AudienceInsightsCard insights={audienceInsights} />
                )}
                {contentMix.length > 0 && <ContentMixCard mix={contentMix} />}
              </div>
            )}

            {isOwnProfile && activityFeed.length > 0 && (
              <div className="hidden lg:block">
                <ActivityFeedCard activities={activityFeed} />
              </div>
            )}

                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="w-full">
              {/* Вкладки для всех экранов */}
              <div className="w-full min-w-0 mb-4 sm:mb-6">
                <TabsList className="flex h-auto items-center justify-start rounded-lg bg-transparent p-0 w-full border-0 gap-1 sm:gap-2">
                    <TabsTrigger 
                      value="articles" 
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-muted data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-muted/80 gap-1 sm:gap-2 min-w-0 flex-1 sm:flex-initial"
                    >
                      <NotebookPen className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                      <span className="truncate min-w-0">{t('profile.articlesTab')}</span>
                      {displayedArticles.length > 0 && (
                        <Badge variant="secondary" className="ml-0.5 sm:ml-1 shrink-0 text-[10px] sm:text-xs px-1 sm:px-1.5 h-4 sm:h-5">
                          {displayedArticles.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger 
                      value="comments" 
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-muted data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-muted/80 gap-1 sm:gap-2 min-w-0 flex-1 sm:flex-initial"
                    >
                      <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                      <span className="truncate min-w-0">{t('profile.commentsTab')}</span>
                      {comments.length > 0 && (
                        <Badge variant="secondary" className="ml-0.5 sm:ml-1 shrink-0 text-[10px] sm:text-xs px-1 sm:px-1.5 h-4 sm:h-5">
                          {comments.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger 
                      value="bookmarks" 
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-muted data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-muted/80 gap-1 sm:gap-2 min-w-0 flex-1 sm:flex-initial"
                    >
                      <Bookmark className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                      <span className="truncate min-w-0">{t('profile.bookmarksTab')}</span>
                      {bookmarks.length > 0 && (
                        <Badge variant="secondary" className="ml-0.5 sm:ml-1 shrink-0 text-[10px] sm:text-xs px-1 sm:px-1.5 h-4 sm:h-5">
                          {bookmarks.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                  </TabsList>
              </div>

              <TabsContent value="articles" className="mt-0">
                    {displayedArticles.length === 0 ? (
                      <Card className="border-dashed">
                    <CardContent className="py-8 sm:py-12 text-center px-4">
                      <NotebookPen className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground mx-auto mb-2 sm:mb-3" />
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {isOwnProfile ? t('profile.noArticlesOwn') : t('profile.noArticlesOther')}
                      </p>
                      {isOwnProfile && (
                        <Button
                          className="mt-3 sm:mt-4 gap-1.5 sm:gap-2 h-8 sm:h-9 text-xs sm:text-sm"
                          onClick={() => navigate('/create')}
                        >
                          <PenSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          {t('profile.createArticle')}
                        </Button>
                      )}
                        </CardContent>
                      </Card>
                    ) : (
                  <div className="space-y-4 sm:space-y-4">
                    {displayedArticles.map((article) => (
                        <ArticleCard
                          key={article.id}
                          article={article}
                          onArticleClick={(articleId) => navigate(`/article/${articleId}`)}
                          onTagClick={(tag) => navigate(`/forum?tag=${encodeURIComponent(tag)}`)}
                        />
                    ))}
                  </div>
                    )}
                  </TabsContent>

                  <TabsContent value="comments" className="mt-0">
                <CommentsTab
                  comments={comments}
                  onArticleClick={(articleId) => navigate(`/article/${articleId}`)}
                />
                  </TabsContent>

                  <TabsContent value="bookmarks" className="mt-0">
                <BookmarksTab
                  bookmarks={bookmarks}
                  onArticleClick={(articleId) => navigate(`/article/${articleId}`)}
                />
                  </TabsContent>
                </Tabs>

            {/* Мобильная боковая панель - показывается после вкладок на маленьких экранах */}
            <div className="lg:hidden space-y-4 sm:space-y-4">
              <LevelCard
                level={level}
                xpProgress={xpProgressPercent}
                xpCurrent={xpIntoLevel}
                xpRequired={xpForLevel}
                streak={streakDays}
              />
              <AchievementsCard achievements={achievements} />
              {isOwnProfile && (
                <>
                  <QuickActionsCard
                    actions={quickActions}
                    onNavigate={(href) => navigate(href)}
                  />
                  <CreatorGoalsCard goals={creatorGoals} />
                  {audienceInsights.length > 0 && (
                    <AudienceInsightsCard insights={audienceInsights} />
                  )}
                  {contentMix.length > 0 && <ContentMixCard mix={contentMix} />}
                  {activityFeed.length > 0 && (
                    <ActivityFeedCard activities={activityFeed} />
                  )}
                </>
              )}
              {pinnedCollections.length > 0 && (
                <PinnedCollectionsCard
                  collections={pinnedCollections}
                  onNavigate={(href) => navigate(href)}
                />
              )}
            </div>
              </section>
            </div>
      </div>
    </div>
  )
}
