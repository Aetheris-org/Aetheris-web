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
  Clock,
  FileEdit,
  Flame,
  Globe,
  Mail,
  MessageSquare,
  NotebookPen,
  PenSquare,
  Settings,
  Star,
  Trophy,
  Users,
  MapPin,
  Heart,
  Eye,
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
import { getUserProfile } from '@/api/profile-graphql'
import { followUser, unfollowUser, checkFollowStatus } from '@/api/follow-graphql'
import type { UserProfile } from '@/types/profile'
import { logger } from '@/lib/logger'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
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
import { useTranslation } from '@/hooks/useTranslation'
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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Award className="h-4 w-4 text-primary" />
          {t('profile.level', { level })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t('profile.progress')}</span>
            <span className="font-medium">{xpProgress}%</span>
          </div>
          <Progress value={xpProgress} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{xpCurrent} / {xpRequired} {t('profile.xp')}</span>
            <span>{t('profile.xpRemaining', { xp: Math.max(xpRequired - xpCurrent, 0) })}</span>
          </div>
        </div>

        {streak > 0 && (
          <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
            <Flame className="h-4 w-4 text-orange-500" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">{t('profile.activityStreak')}</p>
              <p className="text-sm font-semibold">{t('profile.streakDays', { count: streak })}</p>
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
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="h-4 w-4 text-primary" />
          {t('profile.achievements')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {unlocked.map((achievement) => (
          <div
            key={achievement.id}
            className="flex items-center gap-3 rounded-lg border bg-muted/50 p-3"
          >
            <Trophy className="h-4 w-4 text-primary flex-shrink-0" />
            <p className="text-sm font-medium flex-1">{achievement.title}</p>
          </div>
        ))}
        {achievements.filter((a) => a.unlocked).length > 3 && (
          <p className="text-xs text-muted-foreground text-center pt-2">
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
        <CardContent className="py-12 text-center">
          <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">{t('profile.noComments')}</p>
      </CardContent>
    </Card>
  )
}

  return (
        <div className="space-y-4">
      {comments.map((comment) => (
        <Card key={comment.id} className="hover:border-primary/40 transition-colors">
          <CardContent className="p-5">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
          <button
                  onClick={() => onArticleClick(comment.article.id)}
                  className="text-left group"
                >
                  <p className="text-sm font-semibold text-primary group-hover:underline">
                    {comment.article.title}
                  </p>
          </button>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(comment.createdAt).toLocaleDateString('ru-RU', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
        </div>
              <p className="text-sm text-foreground leading-relaxed line-clamp-3">{comment.text}</p>
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
    <div className="grid gap-4 sm:grid-cols-2">
      {bookmarks.map((bookmark) => (
        <Card
          key={bookmark.id}
          className="hover:border-primary/40 transition-colors cursor-pointer"
          onClick={() => onArticleClick(bookmark.article.id)}
        >
          <CardContent className="p-5">
              <div className="space-y-2">
              <p className="text-sm font-semibold line-clamp-2">{bookmark.article.title}</p>
              {bookmark.article.excerpt && (
                <p className="text-xs text-muted-foreground line-clamp-2">{bookmark.article.excerpt}</p>
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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="h-4 w-4 text-primary" />
          {t('profile.audienceInsights')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{insight.metric}</span>
              <div className="flex items-center gap-2">
                {insight.trend === 'up' && (
                  <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                )}
                {insight.trend === 'down' && (
                  <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                )}
                <span
                  className={cn(
                    'text-xs font-medium',
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
            <p className="text-lg font-bold">{insight.value.toLocaleString('ru-RU')}</p>
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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Layers className="h-4 w-4 text-primary" />
          {t('profile.contentMix')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {mix.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <Badge variant="outline" className="text-xs">
                #{item.tag}
              </Badge>
              <span className="text-muted-foreground text-xs">
                {t('profile.articlesCount', { count: item.count, percentage: item.percentage })}
              </span>
                  </div>
            <Progress value={item.percentage} className="h-2" />
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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-4 w-4 text-primary" />
          {t('profile.recentActivity')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activities.slice(0, 5).map((activity) => (
          <div key={activity.id} className="flex items-start gap-3 rounded-lg border bg-muted/50 p-3">
            <div className="mt-0.5 text-muted-foreground">{getIcon(activity.icon)}</div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium">{activity.title}</p>
              <p className="text-xs text-muted-foreground">
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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="h-4 w-4 text-primary" />
          {t('profile.creatorGoals')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.map((goal) => {
          const progressPercent = Math.min(100, Math.round((goal.progress / goal.target) * 100))
            return (
            <div key={goal.id} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                  {goal.completed && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                  <span className="font-medium">{goal.title}</span>
            </div>
                <span className="text-muted-foreground text-xs">
                  {goal.progress} / {goal.target}
                </span>
            </div>
              <Progress value={progressPercent} className="h-2" />
              <p className="text-xs text-muted-foreground">{goal.description}</p>
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
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Zap className="h-4 w-4 text-primary" />
          {t('profile.quickActions')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((action) => (
                    <Button
            key={action.id}
            variant={action.variant}
            className="w-full justify-start gap-2"
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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Layers className="h-4 w-4 text-primary" />
          {t('profile.pinnedCollections')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {collections.map((collection) => (
        <Card
            key={collection.id}
            className="cursor-pointer hover:border-primary/40 transition-colors"
            onClick={() => onNavigate(collection.href)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-semibold">{collection.title}</p>
                  <p className="text-xs text-muted-foreground">{collection.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {t('profile.articlesCountShort', { count: collection.articleCount })}
                  </p>
        </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground mt-1" />
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
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [copied, setCopied] = useState(false)

  const routeProfileId = id ? Number(id) : undefined
  const profileId = !Number.isNaN(routeProfileId ?? NaN) ? routeProfileId : currentUser?.id

  useEffect(() => {
    if (!routeProfileId && currentUser?.id) {
      navigate(`/profile/${currentUser.id}`, { replace: true })
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
  const isOwnProfile = profile?.user.id === currentUser?.id

  // Проверяем статус подписки
  const { data: followStatus } = useQuery({
    queryKey: ['follow-status', profileId, currentUser?.id],
    queryFn: () => {
      if (!currentUser?.id || !profileId || isOwnProfile) return null
      return checkFollowStatus(profileId, currentUser.id)
    },
    enabled: !!currentUser?.id && !!profileId && !isOwnProfile,
  })

  const followMutation = useMutation({
    mutationFn: () => followUser(profileId!),
    onSuccess: () => {
      toast({
        title: t('profile.followed') || 'Подписка оформлена',
        description: t('profile.followedDescription') || 'Вы подписались на этого пользователя',
      })
      // Обновляем статус подписки
      queryClient.invalidateQueries({ queryKey: ['follow-status', profileId, currentUser?.id] })
    },
    onError: (error: any) => {
      logger.error('Failed to follow user:', error)
      toast({
        title: t('common.error') || 'Ошибка',
        description: error?.response?.data?.error?.message || t('profile.followError') || 'Не удалось подписаться',
        variant: 'destructive',
      })
    },
  })

  const unfollowMutation = useMutation({
    mutationFn: () => {
      if (!followStatus?.id) throw new Error('Follow ID not found')
      return unfollowUser(followStatus.id)
    },
    onSuccess: () => {
      toast({
        title: t('profile.unfollowed') || 'Отписка оформлена',
        description: t('profile.unfollowedDescription') || 'Вы отписались от этого пользователя',
      })
      // Обновляем статус подписки
      queryClient.invalidateQueries({ queryKey: ['follow-status', profileId, currentUser?.id] })
    },
    onError: (error: any) => {
      logger.error('Failed to unfollow user:', error)
      toast({
        title: t('common.error') || 'Ошибка',
        description: error?.response?.data?.error?.message || t('profile.unfollowError') || 'Не удалось отписаться',
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
      title: t('profile.shareTitle', { username: profile?.user.username || '' }),
      text: t('profile.shareText', { username: profile?.user.username || '' }),
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
  const quickActions = isOwnProfile ? mockQuickActions : []
  const pinnedCollections = isOwnProfile ? mockPinnedCollections : []

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('ru-RU', {
      month: 'long',
      year: 'numeric',
    })

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
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2">
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
                <Button variant="outline" onClick={() => navigate(-1)}>
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

  const publishedArticles = profile.articles.filter((a) => a.status === 'published')

  return (
    <div className="min-h-screen app-surface">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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

      <div className="container py-4 sm:py-6">
        {/* Шапка профиля */}
        <Card className="mb-4 sm:mb-6 overflow-hidden border-border/60 bg-card shadow-sm">
          <div className="relative w-full overflow-hidden">
            {profile.user.coverImageUrl ? (
              <div className="relative aspect-[4/1] w-full sm:aspect-[4/1]">
                <img
                  src={profile.user.coverImageUrl}
                    alt={`${profile.user.username} cover`}
                    className="h-full w-full object-cover"
                  />
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20" />
                </div>
              ) : (
              <div className="relative aspect-[3/1] w-full sm:aspect-[4/1] bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
                <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/15" />
                </div>
              )}
          </div>
        </Card>

        {/* Основная панель профиля */}
        <Card className="mb-4 sm:mb-6 border-border/60 bg-card shadow-sm">
          <CardContent className="p-4 sm:p-6">
            {/* Мобильный лайаут: аватар сверху по центру */}
            <div className="flex flex-col items-center gap-5 sm:hidden">
              {/* Аватар */}
                      {profile.user.avatarUrl ? (
                        <img
                          src={profile.user.avatarUrl}
                          alt={profile.user.username}
                  className="h-24 w-24 rounded-full border-2 object-cover shadow-lg"
                  style={{ borderColor: 'hsl(var(--border))' }}
                        />
                      ) : (
                <div
                  className="flex h-24 w-24 items-center justify-center rounded-full border-2 bg-primary/15 text-3xl font-semibold text-primary shadow-lg"
                  style={{ borderColor: 'hsl(var(--border))' }}
                >
                          {profile.user.username.charAt(0).toUpperCase()}
                        </div>
                      )}

              {/* Имя и бейджи с дропдауном */}
              <div className="flex flex-col items-center gap-3 w-full px-2">
                <div className="flex items-center justify-between gap-2 w-full relative">
                  <div className="flex flex-wrap items-center justify-center gap-2 flex-1 min-w-0">
                    <h1 className="text-2xl font-bold tracking-tight">{profile.user.username}</h1>
                    <Badge variant="default" className="gap-1 shrink-0">
                      <Trophy className="h-3 w-3" />
                      {t('profile.levelBadge', { level })}
                        </Badge>
                      </div>
                  {/* Дропдаун меню */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 absolute right-0">
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
                <Badge variant="secondary" className="text-xs">
                  {t('profile.memberSince', { date: formatDate(profile.user.memberSince) })}
                </Badge>
                {profile.user.bio && (
                  <p className="text-sm text-muted-foreground text-center break-words leading-relaxed">
                          {profile.user.bio}
                        </p>
                )}
                      </div>

              {/* Статистика - горизонтальная строка без подписей */}
              <div className="flex flex-wrap items-center justify-center gap-3 text-sm w-full px-4 py-2">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <NotebookPen className="h-4 w-4 shrink-0" />
                  <span className="font-semibold text-foreground">{profile.stats.publishedArticles}</span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Heart className="h-4 w-4 shrink-0" />
                  <span className="font-semibold text-foreground">{profile.stats.totalLikes}</span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  <span className="font-semibold text-foreground">{profile.stats.totalComments}</span>
                </div>
                  </div>

              {/* Теги */}
              {profile.highlights.tags.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 w-full px-4">
                  {profile.highlights.tags.slice(0, 5).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                  {profile.highlights.tags.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{profile.highlights.tags.length - 5}
                    </Badge>
                  )}
                </div>
              )}

              {/* Кнопки действий */}
              <div className="flex flex-col gap-2.5 w-full pt-4 border-t mt-2">
                    <Button
                      variant="outline"
                  size="default"
                      onClick={() => navigate('/')}
                  className="gap-2 w-full"
                    >
                      <ArrowLeft className="h-4 w-4" />
                  {t('profile.openArticles')}
                    </Button>
                {isOwnProfile ? (
                    <Button
                    size="default"
                    variant="default"
                    className="gap-2 w-full"
                    onClick={() => navigate('/settings/profile', { state: { from: location.pathname } })}
                  >
                          <Settings className="h-4 w-4" />
                    {t('profile.settings')}
                  </Button>
                ) : (
                  <Button
                    size="default"
                    variant={followStatus ? 'outline' : 'default'}
                    className="gap-2 w-full"
                    onClick={() => {
                      if (followStatus) {
                        unfollowMutation.mutate()
                      } else {
                        followMutation.mutate()
                      }
                    }}
                    disabled={followMutation.isPending || unfollowMutation.isPending}
                  >
                    {followStatus ? (
                      <>
                        <UserMinus className="h-4 w-4" />
                        {t('profile.unfollow') || 'Отписаться'}
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4" />
                        {t('profile.follow') || 'Подписаться'}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Десктопный лайаут: аватар слева, информация в центре, кнопки справа */}
            <div className="hidden sm:flex sm:flex-row sm:items-start sm:gap-6 md:gap-8">
              {/* Аватар */}
              <div className="flex-shrink-0">
                {profile.user.avatarUrl ? (
                  <img
                    src={profile.user.avatarUrl}
                    alt={profile.user.username}
                    className="h-28 w-28 rounded-full border-2 object-cover shadow-lg md:h-32 md:w-32"
                    style={{ borderColor: 'hsl(var(--border))' }}
                  />
                ) : (
                  <div
                    className="flex h-28 w-28 items-center justify-center rounded-full border-2 bg-primary/15 text-3xl font-semibold text-primary shadow-lg md:h-32 md:w-32 md:text-4xl"
                    style={{ borderColor: 'hsl(var(--border))' }}
                  >
                    {profile.user.username.charAt(0).toUpperCase()}
                  </div>
                )}
                  </div>

              {/* Основная информация */}
              <div className="flex flex-1 flex-col gap-4 min-w-0">
                {/* Верхняя строка: имя и бейджи */}
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <h1 className="text-2xl font-bold tracking-tight md:text-3xl truncate">{profile.user.username}</h1>
                    <Badge variant="default" className="gap-1 shrink-0">
                      <Trophy className="h-3 w-3" />
                      {t('profile.levelBadge', { level })}
                    </Badge>
                  </div>
                  <Badge variant="secondary" className="text-xs w-fit">
                    Участник с {formatDate(profile.user.memberSince)}
                  </Badge>
                  {profile.user.bio && (
                    <p className="text-sm text-muted-foreground max-w-2xl">{profile.user.bio}</p>
                  )}
                </div>

                {/* Статистика */}
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <NotebookPen className="h-4 w-4 shrink-0" />
                    <span className="font-medium">{profile.stats.publishedArticles}</span>
                    <span className="text-muted-foreground/70">{t('profile.articlesCount')}</span>
                </div>
                  <Separator orientation="vertical" className="h-4" />
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Heart className="h-4 w-4 shrink-0" />
                    <span className="font-medium">{profile.stats.totalLikes}</span>
                    <span className="text-muted-foreground/70">{t('profile.likesCount')}</span>
                  </div>
                  <Separator orientation="vertical" className="h-4" />
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MessageSquare className="h-4 w-4 shrink-0" />
                    <span className="font-medium">{profile.stats.totalComments}</span>
                    <span className="text-muted-foreground/70">{t('profile.commentsCount')}</span>
                  </div>
                </div>

                {/* Теги */}
                {profile.highlights.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                    {profile.highlights.tags.slice(0, 5).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                    {profile.highlights.tags.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{profile.highlights.tags.length - 5}
                      </Badge>
                    )}
                        </div>
                      )}
                    </div>

              {/* Правая колонка: дропдаун сверху, кнопки внизу */}
              <div className="flex flex-col items-end justify-between gap-4 shrink-0 self-stretch">
                {/* Дропдаун меню - справа сверху */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Дополнительные действия</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={handleShareProfile}>
                      <Share2 className="mr-2 h-4 w-4" />
                      Поделиться профилем
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleCopyProfileLink}>
                      {copied ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Ссылка скопирована
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Копировать ссылку
                        </>
                      )}
                    </DropdownMenuItem>
                    {!isOwnProfile && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleReport} className="text-destructive focus:text-destructive">
                          <Flag className="mr-2 h-4 w-4" />
                          Пожаловаться
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Кнопки действий - справа внизу */}
                <div className="flex flex-row gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/')}
                    className="gap-2 whitespace-nowrap"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {t('profile.openArticles')}
                  </Button>
                  {isOwnProfile ? (
                    <Button
                      size="sm"
                      variant="default"
                      className="gap-2 whitespace-nowrap"
                      onClick={() => navigate('/settings/profile', { state: { from: location.pathname } })}
                    >
                      <Settings className="h-4 w-4" />
                      {t('profile.settings')}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant={followStatus ? 'outline' : 'default'}
                      className="gap-2 whitespace-nowrap"
                      onClick={() => {
                        if (followStatus) {
                          unfollowMutation.mutate()
                        } else {
                          followMutation.mutate()
                        }
                      }}
                      disabled={followMutation.isPending || unfollowMutation.isPending}
                    >
                      {followStatus ? (
                        <>
                          <UserMinus className="h-4 w-4" />
                          {t('profile.unfollow') || 'Отписаться'}
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4" />
                          {t('profile.follow') || 'Подписаться'}
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
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* Боковая панель - скрывается на мобильных, показывается внизу */}
          <aside className="hidden lg:block space-y-4">
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
          <section className="min-w-0 space-y-6">
            {/* Дополнительные блоки для своего профиля */}
            {isOwnProfile && (
              <div className="grid gap-4 sm:grid-cols-2">
                {audienceInsights.length > 0 && (
                  <AudienceInsightsCard insights={audienceInsights} />
                )}
                {contentMix.length > 0 && <ContentMixCard mix={contentMix} />}
              </div>
            )}

            {isOwnProfile && activityFeed.length > 0 && (
              <ActivityFeedCard activities={activityFeed} />
            )}

                <Tabs defaultValue="articles" className="w-full">
              <TabsList className="grid w-full grid-cols-3 overflow-x-auto">
                    <TabsTrigger value="articles" className="gap-2">
                      <NotebookPen className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('profile.articlesTab')}</span>
                  <span className="sm:hidden">{t('profile.articlesTabShort')}</span>
                  {publishedArticles.length > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                        {publishedArticles.length}
                      </Badge>
                  )}
                    </TabsTrigger>
                    <TabsTrigger value="comments" className="gap-2">
                      <MessageSquare className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('profile.commentsTab')}</span>
                  <span className="sm:hidden">{t('profile.commentsTabShort')}</span>
                  {comments.length > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {comments.length}
                      </Badge>
                  )}
                    </TabsTrigger>
                    <TabsTrigger value="bookmarks" className="gap-2">
                      <Bookmark className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('profile.bookmarksTab')}</span>
                  <span className="sm:hidden">{t('profile.bookmarksTabShort')}</span>
                  {bookmarks.length > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                        {bookmarks.length}
                      </Badge>
                  )}
                    </TabsTrigger>
                  </TabsList>

              <TabsContent value="articles" className="mt-6">
                    {publishedArticles.length === 0 ? (
                      <Card className="border-dashed">
                    <CardContent className="py-12 text-center">
                      <NotebookPen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">
                        {isOwnProfile ? t('profile.noArticlesOwn') : t('profile.noArticlesOther')}
                      </p>
                      {isOwnProfile && (
                        <Button
                          className="mt-4 gap-2"
                          onClick={() => navigate('/create')}
                        >
                          <PenSquare className="h-4 w-4" />
                          {t('profile.createArticle')}
                        </Button>
                      )}
                        </CardContent>
                      </Card>
                    ) : (
                  <div className="space-y-4">
                    {publishedArticles.map((article) => (
                        <ArticleCard
                          key={article.id}
                          article={article}
                          onArticleClick={(articleId) => navigate(`/article/${articleId}`)}
                          onTagClick={(tag) => navigate(`/?tag=${encodeURIComponent(tag)}`)}
                        />
                    ))}
                  </div>
                    )}
                  </TabsContent>

                  <TabsContent value="comments" className="mt-6">
                <CommentsTab
                  comments={comments}
                  onArticleClick={(articleId) => navigate(`/article/${articleId}`)}
                />
                  </TabsContent>

                  <TabsContent value="bookmarks" className="mt-6">
                <BookmarksTab
                  bookmarks={bookmarks}
                  onArticleClick={(articleId) => navigate(`/article/${articleId}`)}
                />
                  </TabsContent>
                </Tabs>

            {/* Мобильная боковая панель - показывается после вкладок на маленьких экранах */}
            <div className="lg:hidden space-y-4">
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
