import { useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Bell,
  MessageCircle,
  Heart,
  Users,
  Check,
  FileText,
  Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/ThemeToggle'
import { AccountSheet } from '@/components/AccountSheet'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/hooks/useTranslation'
import type { NotificationCategory, NotificationType, Notification } from '@/types/notification'
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '@/api/notifications-graphql'
import { logger } from '@/lib/logger'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case 'comment':
    case 'comment_reply':
      return MessageCircle
    case 'article_like':
    case 'comment_like':
      return Heart
    case 'follow':
      return Users
    case 'article_published':
      return FileText
    default:
      return Bell
  }
}

function formatNotificationMessage(notification: Notification, t: (key: string, params?: Record<string, any>) => string): string {
  const actorName = notification.actor.username
  const threshold = notification.metadata?.threshold

  switch (notification.type) {
    case 'comment':
      return t('notifications.messages.comment', { actor: actorName }) || `${actorName} прокомментировал вашу статью`
    case 'comment_reply':
      return t('notifications.messages.commentReply', { actor: actorName }) || `${actorName} ответил на ваш комментарий`
    case 'follow':
      return t('notifications.messages.follow', { actor: actorName }) || `${actorName} подписался на вас`
    case 'article_published':
      return t('notifications.messages.articlePublished', { actor: actorName }) || `${actorName} опубликовал новую статью`
    case 'article_like':
      if (threshold === 1) {
        return t('notifications.messages.articleLikeFirst', { actor: actorName }) || `${actorName} лайкнул вашу статью`
      }
      return t('notifications.messages.articleLikeThreshold', { threshold }) || `Ваша статья набрала ${threshold} лайков`
    case 'comment_like':
      if (threshold === 1) {
        return t('notifications.messages.commentLikeFirst', { actor: actorName }) || `${actorName} лайкнул ваш комментарий`
      }
      return t('notifications.messages.commentLikeThreshold', { threshold }) || `Ваш комментарий набрал ${threshold} лайков`
    default:
      return t('notifications.messages.unknown') || 'Новое уведомление'
  }
}

function getNotificationCategory(createdAt: string): NotificationCategory {
  const now = new Date()
  const notificationDate = new Date(createdAt)
  const diffMs = now.getTime() - notificationDate.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)

  if (diffDays < 1) {
    return 'today'
  } else if (diffDays < 7) {
    return 'this-week'
  } else {
    return 'earlier'
  }
}

function getNotificationNavigationPath(notification: Notification): string {
  switch (notification.type) {
    case 'comment':
    case 'comment_reply':
      // Для комментариев переходим к конкретному комментарию
      if (notification.article?.id && notification.comment?.id) {
        return `/article/${notification.article.id}#comment-${notification.comment.id}`
      }
      if (notification.article?.id) {
        return `/article/${notification.article.id}`
      }
      return '/'
    case 'article_like':
    case 'article_published':
      if (notification.article?.id) {
        return `/article/${notification.article.id}`
      }
      return '/'
    case 'comment_like':
      // Для лайков комментариев переходим к конкретному комментарию
      if (notification.article?.id && notification.comment?.id) {
        return `/article/${notification.article.id}#comment-${notification.comment.id}`
      }
      if (notification.article?.id) {
        return `/article/${notification.article.id}`
      }
      return '/'
    case 'follow':
      if (notification.actor?.id) {
        return `/profile/${notification.actor.id}`
      }
      return '/'
    default:
      return '/'
  }
}

export default function NotificationsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getNotifications(0, 100),
    staleTime: 2 * 60 * 1000, // 2 минуты - данные считаются свежими, затем могут быть обновлены
    gcTime: 30 * 60 * 1000, // 30 минут - время хранения в кэше
    refetchOnMount: true, // Рефетчить при монтировании, если данные устарели
    refetchOnWindowFocus: true, // Рефетчить при фокусе окна, если данные устарели
    refetchOnReconnect: true, // Рефетчить при переподключении, если данные устарели
    refetchInterval: false, // Отключаем автоматический refetch по интервалу
  })

  // Fetch unread count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications', 'unreadCount'],
    queryFn: getUnreadCount,
    staleTime: 1 * 60 * 1000, // 1 минута - счетчик обновляется чаще, чем список уведомлений
    refetchOnMount: true, // Рефетчить при монтировании, если данные устарели
    refetchOnWindowFocus: true, // Рефетчить при фокусе окна, если данные устарели
    refetchOnReconnect: true, // Рефетчить при переподключении, если данные устарели
    refetchInterval: false, // Отключаем автоматический refetch по интервалу
  })

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: markAsRead,
    onMutate: async (notificationId) => {
      // Отменяем ВСЕ исходящие запросы, чтобы они не перезаписали оптимистичное обновление
      await queryClient.cancelQueries({ queryKey: ['notifications'] })
      await queryClient.cancelQueries({ queryKey: ['notifications', 'unreadCount'] })
      
      // Сохраняем предыдущее значение для отката
      const previousNotifications = queryClient.getQueryData<Notification[]>(['notifications'])
      const previousUnreadCount = queryClient.getQueryData<number>(['notifications', 'unreadCount'])
      
      // Оптимистично обновляем уведомление
      if (previousNotifications) {
        const readAt = new Date().toISOString()
        queryClient.setQueryData<Notification[]>(['notifications'], (old) =>
          old?.map((n) =>
            n.id === notificationId ? { ...n, isRead: true, readAt } : n
          )
        , {
          // Помечаем данные как свежие, чтобы предотвратить автоматический refetch
          updatedAt: Date.now(),
        })
      }
      
      // Оптимистично обновляем счетчик
      if (previousUnreadCount !== undefined) {
        queryClient.setQueryData<number>(['notifications', 'unreadCount'], (old) => {
          if (old === undefined) return 0
          return Math.max(0, old - 1)
        }, {
          updatedAt: Date.now(),
        })
      }
      
      return { previousNotifications, previousUnreadCount }
    },
    onError: (err, notificationId, context) => {
      logger.error('[NotificationsPage] markAsRead onError:', err)
      // Откатываем изменения при ошибке
      if (context?.previousNotifications) {
        queryClient.setQueryData(['notifications'], context.previousNotifications)
      }
      if (context?.previousUnreadCount !== undefined) {
        queryClient.setQueryData(['notifications', 'unreadCount'], context.previousUnreadCount)
      }
    },
    onSuccess: (updatedNotification, notificationId) => {
      logger.debug('[NotificationsPage] markAsRead onSuccess:', {
        notificationId,
        updatedNotification,
      })
      
      // Обновляем данные уведомления из ответа сервера
      // Это гарантирует, что данные синхронизированы с БД
      queryClient.setQueryData<Notification[]>(['notifications'], (old) => {
        if (!old) {
          logger.warn('[NotificationsPage] No old notifications data to update')
          return old
        }
        const updated = old.map((n) =>
          n.id === notificationId
            ? {
                ...n,
                isRead: updatedNotification.isRead,
                readAt: updatedNotification.readAt,
              }
            : n
        )
        logger.debug('[NotificationsPage] Updated notifications in cache:', {
          before: old.find((n) => n.id === notificationId),
          after: updated.find((n) => n.id === notificationId),
        })
        return updated
      }, {
        // Помечаем данные как свежие, чтобы предотвратить автоматический refetch
        updatedAt: Date.now(),
      })
      
      // Обновляем счетчик непрочитанных
      queryClient.setQueryData<number>(['notifications', 'unreadCount'], (old) => {
        if (old === undefined) return 0
        const newCount = Math.max(0, old - 1)
        logger.debug('[NotificationsPage] Updated unread count:', { old, new: newCount })
        return newCount
      }, {
        // Помечаем данные как свежие, чтобы предотвратить автоматический refetch
        updatedAt: Date.now(),
      })
    },
  })

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: markAllAsRead,
    onMutate: async () => {
      // Отменяем исходящие запросы
      await queryClient.cancelQueries({ queryKey: ['notifications'] })
      
      // Сохраняем предыдущее значение для отката
      const previousNotifications = queryClient.getQueryData<Notification[]>(['notifications'])
      
      // Оптимистично обновляем все уведомления
      if (previousNotifications) {
        const now = new Date().toISOString()
        queryClient.setQueryData<Notification[]>(['notifications'], (old) =>
          old?.map((n) => ({ ...n, isRead: true, readAt: now }))
        )
      }
      
      return { previousNotifications }
    },
    onError: (err, variables, context) => {
      // Откатываем изменения при ошибке
      if (context?.previousNotifications) {
        queryClient.setQueryData(['notifications'], context.previousNotifications)
      }
    },
    onSuccess: () => {
      // После пометки всех как прочитанных обновляем счетчик
      queryClient.setQueryData<number>(['notifications', 'unreadCount'], 0)
      // Оптимистичное обновление уже обновило все уведомления в списке
    },
  })

  const categoryLabels: Record<NotificationCategory, string> = {
    today: t('notifications.groups.today'),
    'this-week': t('notifications.groups.thisWeek'),
    earlier: t('notifications.groups.earlier'),
  }

  // Add computed fields to notifications
  const enrichedNotifications = useMemo(() => {
    return notifications.map((notification) => ({
      ...notification,
      message: formatNotificationMessage(notification, t),
      category: getNotificationCategory(notification.createdAt),
      isUnread: !notification.isRead,
    }))
  }, [notifications, t])

  const groupedNotifications = useMemo(() => {
    return enrichedNotifications.reduce<Record<NotificationCategory, Notification[]>>(
      (acc, notification) => {
        const category = notification.category || 'earlier'
        acc[category] = acc[category] || []
        acc[category].push(notification)
        return acc
      },
      {
        today: [],
        'this-week': [],
        earlier: [],
      }
    )
  }, [enrichedNotifications])

  const handleMarkRead = useCallback(
    (id: string) => {
      markAsReadMutation.mutate(id)
    },
    [markAsReadMutation]
  )

  const handleMarkAllAsRead = useCallback(() => {
    markAllAsReadMutation.mutate()
  }, [markAllAsReadMutation])

  if (isLoading) {
    return (
      <div className="min-h-screen app-surface">
        <div className="container py-8">
          <Card>
            <CardContent className="flex items-center justify-center py-16">
              <p className="text-muted-foreground">{t('common.loading') || 'Loading...'}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen app-surface">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="gap-1 sm:gap-2 shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{t('notifications.back')}</span>
            </Button>
            <Separator orientation="vertical" className="h-4 sm:h-6 hidden sm:block" />
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-semibold truncate">{t('notifications.title')}</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                {t('notifications.description')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="gap-1 sm:gap-2 text-xs sm:text-sm"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0 || markAllAsReadMutation.isPending}
            >
              <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{t('notifications.markAllAsRead')}</span>
            </Button>
            <ThemeToggle />
            <AccountSheet />
          </div>
        </div>
      </header>

      <main className="container py-4 sm:py-6 md:py-8 px-3 sm:px-4">
        <section className="space-y-4 sm:space-y-6">
          <Card className="border-border/70 bg-muted/30">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 gap-2 sm:gap-0">
              <div className="min-w-0 flex-1">
                <CardTitle className="text-sm sm:text-base font-semibold">{t('notifications.inboxOverview')}</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  {unreadCount > 0
                    ? t('notifications.unreadCount', { count: unreadCount })
                    : t('notifications.allCaughtUp')}
                </CardDescription>
              </div>
              <Badge variant={unreadCount > 0 ? 'default' : 'secondary'} className="rounded-md shrink-0">
                {unreadCount > 0 ? t('notifications.new', { count: unreadCount }) : t('notifications.zeroNew')}
              </Badge>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2 sm:gap-3 text-xs text-muted-foreground">
              <Badge variant="secondary" className="rounded-md px-2 sm:px-3 py-1 text-xs">
                {t('notifications.categories.comments')}
              </Badge>
              <Badge variant="secondary" className="rounded-md px-2 sm:px-3 py-1 text-xs">
                {t('notifications.categories.reactions')}
              </Badge>
              <Badge variant="secondary" className="rounded-md px-2 sm:px-3 py-1 text-xs">
                {t('notifications.categories.editorial')}
              </Badge>
              <Badge variant="secondary" className="rounded-md px-2 sm:px-3 py-1 text-xs">
                {t('notifications.categories.followers')}
              </Badge>
            </CardContent>
          </Card>

          {(['today', 'this-week', 'earlier'] as NotificationCategory[]).map((category) => {
            const notifications = groupedNotifications[category]
            if (!notifications || notifications.length === 0) {
              return null
            }

            return (
              <div key={category} className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    {categoryLabels[category]}
                  </h2>
                  <Separator className="flex-1" />
                </div>
                <div className="space-y-2 sm:space-y-3">
                  {notifications.map((notification) => (
                    <NotificationRow
                      key={notification.id}
                      notification={notification}
                      onMarkRead={handleMarkRead}
                    />
                  ))}
                </div>
              </div>
            )
          })}

          {enrichedNotifications.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Bell className="mb-4 h-10 w-10 text-muted-foreground" />
                <CardTitle className="text-lg">{t('notifications.noNotifications')}</CardTitle>
                <CardDescription className="mt-2 max-w-sm">
                  {t('notifications.noNotificationsDescription')}
                </CardDescription>
                <Button className="mt-6" onClick={() => navigate('/')}>
                  {t('notifications.browseArticles')}
                </Button>
              </CardContent>
            </Card>
          )}
        </section>
      </main>
    </div>
  )
}

interface NotificationRowProps {
  notification: Notification & { message?: string; isUnread?: boolean }
  onMarkRead: (id: string) => void
}

function NotificationRow({ notification, onMarkRead }: NotificationRowProps) {
  const { t } = useTranslation()
  const Icon = getNotificationIcon(notification.type)
  const navigate = useNavigate()
  const handleMarkRead = useCallback(() => {
    if (notification.isRead) return
    onMarkRead(notification.id)
  }, [notification.id, notification.isRead, onMarkRead])

  const handleView = useCallback(() => {
    // Помечаем уведомление как прочитанное при переходе
    if (!notification.isRead) {
      onMarkRead(notification.id)
    }
    const path = getNotificationNavigationPath(notification)
    
    // Если путь содержит хеш (для комментариев), используем специальную навигацию
    if (path.includes('#')) {
      const [basePath, hash] = path.split('#')
      navigate(basePath)
      // Прокручиваем к комментарию после загрузки страницы
      const scrollToComment = () => {
        const element = document.getElementById(hash)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          // Подсвечиваем комментарий на короткое время
          element.classList.add('highlight-comment')
          setTimeout(() => {
            element.classList.remove('highlight-comment')
          }, 2000)
          return true
        }
        return false
      }
      
      // Пробуем сразу, если страница уже загружена
      setTimeout(() => {
        if (!scrollToComment()) {
          // Если элемент еще не загружен, ждем еще немного
          setTimeout(() => {
            scrollToComment()
          }, 1000)
        }
      }, 500)
    } else {
      navigate(path)
    }
  }, [notification, navigate, onMarkRead])

  // Функция для обрезки названия статьи
  const truncateTitle = (title: string, maxLength: number = 60) => {
    if (title.length <= maxLength) return title
    return title.slice(0, maxLength) + '...'
  }

  // Определяем, нужно ли показывать название статьи сразу после сообщения
  const shouldShowArticleTitleInline = ['comment', 'comment_reply', 'article_like', 'article_published'].includes(notification.type)

  return (
    <Card
      className={cn(
        'border border-border/70 transition hover:border-primary/50 hover:shadow-sm relative',
        !notification.isRead && 'border-primary/60 bg-primary/5',
        notification.isRead && 'opacity-75'
      )}
    >
      <CardContent className="flex flex-col gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-4 pr-16 sm:pr-20">
        <div className="flex flex-1 items-start gap-2 sm:gap-3 md:gap-4">
          <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shrink-0">
            <AvatarImage src={notification.actor.avatar} alt={notification.actor.username} />
            <AvatarFallback className="bg-primary/10 text-primary">
            <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1 sm:space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-x-1.5 sm:gap-x-2 gap-y-0.5 sm:gap-y-1">
              <span className="text-xs sm:text-sm font-semibold text-foreground">{notification.actor.username}</span>
              <span className="text-xs text-muted-foreground/60">·</span>
              <span className="text-xs text-muted-foreground/60">
                {new Date(notification.createdAt).toLocaleString(undefined, {
                  hour: '2-digit',
                  minute: '2-digit',
                  day: 'numeric',
                  month: 'short',
                })}
              </span>
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              {notification.message}
              {shouldShowArticleTitleInline && notification.article?.title && (
                <span className="ml-1.5 sm:ml-2 font-medium text-foreground/90">
                  "{truncateTitle(notification.article.title)}"
                </span>
              )}
            </div>
            {notification.comment?.text && (
              <div className="mt-1.5 sm:mt-2 rounded-md bg-muted/40 px-2 sm:px-3 py-1.5 sm:py-2">
                <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground line-clamp-2">
                  {notification.comment.text}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      {/* Кнопки в правом верхнем углу */}
      <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex items-center gap-1 sm:gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs h-6 sm:h-7 px-1.5 sm:px-2 gap-1"
          onClick={handleView}
        >
          <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          <span className="hidden sm:inline">{t('notifications.view')}</span>
        </Button>
        <Button
          variant={!notification.isRead ? 'default' : 'outline'}
          size="icon"
          className="h-6 w-6 sm:h-7 sm:w-7"
          onClick={handleMarkRead}
          disabled={notification.isRead}
          aria-label={!notification.isRead ? t('notifications.markAsRead') : t('notifications.alreadyRead')}
        >
          <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        </Button>
      </div>
    </Card>
  )
}
