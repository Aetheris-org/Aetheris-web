import { useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Bell,
  MessageCircle,
  Heart,
  BookmarkCheck,
  Sparkles,
  Users,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/ThemeToggle'
import { AccountSheet } from '@/components/AccountSheet'
import { cn } from '@/lib/utils'
import {
  useNotificationsStore,
  selectNotifications,
  selectUnreadCount,
} from '@/stores/notificationsStore'
import type { NotificationCategory, NotificationType, Notification } from '@/types/notification'
import { useTranslation } from '@/hooks/useTranslation'

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case 'comment':
      return MessageCircle
    case 'reaction':
      return Heart
    case 'bookmark':
      return BookmarkCheck
    case 'follow':
      return Users
    case 'system':
    default:
      return Sparkles
  }
}

export default function NotificationsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const notifications = useNotificationsStore(selectNotifications)
  const unreadCount = useNotificationsStore(selectUnreadCount)
  const markAllAsRead = useNotificationsStore((state) => state.markAllAsRead)
  const markAsRead = useNotificationsStore((state) => state.markAsRead)

  const categoryLabels: Record<NotificationCategory, string> = {
    today: t('notifications.groups.today'),
    'this-week': t('notifications.groups.thisWeek'),
    earlier: t('notifications.groups.earlier'),
  }

  const groupedNotifications = useMemo(() => {
    return notifications.reduce<Record<NotificationCategory, Notification[]>>(
      (acc, notification) => {
        acc[notification.category] = acc[notification.category] || []
        acc[notification.category].push(notification)
        return acc
      },
      {
        today: [],
        'this-week': [],
        earlier: [],
      }
    )
  }, [notifications])

  const handleMarkRead = useCallback((id: number) => {
    markAsRead(id)
  }, [markAsRead])

  return (
    <div className="min-h-screen app-surface">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('notifications.back')}
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="text-lg font-semibold">{t('notifications.title')}</h1>
              <p className="text-xs text-muted-foreground">
                {t('notifications.description')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              <Check className="h-4 w-4" />
              {t('notifications.markAllAsRead')}
            </Button>
            <ThemeToggle />
            <AccountSheet />
          </div>
        </div>
      </header>

      <main className="container py-8">
        <section className="space-y-6">
          <Card className="border-border/70 bg-muted/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base font-semibold">{t('notifications.inboxOverview')}</CardTitle>
                <CardDescription>
                  {unreadCount > 0
                    ? t('notifications.unreadCount', { count: unreadCount })
                    : t('notifications.allCaughtUp')}
                </CardDescription>
              </div>
              <Badge variant={unreadCount > 0 ? 'default' : 'secondary'} className="rounded-md">
                {unreadCount > 0 ? t('notifications.new', { count: unreadCount }) : t('notifications.zeroNew')}
              </Badge>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <Badge variant="secondary" className="rounded-md px-3 py-1">
                {t('notifications.categories.comments')}
              </Badge>
              <Badge variant="secondary" className="rounded-md px-3 py-1">
                {t('notifications.categories.reactions')}
              </Badge>
              <Badge variant="secondary" className="rounded-md px-3 py-1">
                {t('notifications.categories.editorial')}
              </Badge>
              <Badge variant="secondary" className="rounded-md px-3 py-1">
                {t('notifications.categories.followers')}
              </Badge>
            </CardContent>
          </Card>

        {/* TODO: Replace grouping logic with server-side pagination once Strapi notifications API is implemented. */}
          {(['today', 'this-week', 'earlier'] as NotificationCategory[]).map((category) => {
            const notifications = groupedNotifications[category]
            if (!notifications || notifications.length === 0) {
              return null
            }

            return (
              <div key={category} className="space-y-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    {categoryLabels[category]}
                  </h2>
                  <Separator className="flex-1" />
                </div>
                <div className="space-y-3">
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

          {notifications.length === 0 && (
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
  notification: NotificationItem
  onMarkRead: (id: number) => void
}

function NotificationRow({ notification, onMarkRead }: NotificationRowProps) {
  const { t } = useTranslation()
  const Icon = getNotificationIcon(notification.type)
  const navigate = useNavigate()
  const handleMarkRead = useCallback(() => {
    if (!notification.isUnread) return
    onMarkRead(notification.id)
  }, [notification.id, notification.isUnread, onMarkRead])

  return (
    <Card
      className={cn(
        'border border-border/70 transition hover:border-primary/50 hover:shadow-sm',
        notification.isUnread && 'border-primary/60 bg-primary/5'
      )}
    >
      <CardContent className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-start gap-4">
          <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
              <span className="font-medium text-foreground">{notification.actor}</span>
              <span className="text-muted-foreground">{notification.message}</span>
            </div>
            {notification.meta && (
              <p className="rounded-md border border-dashed border-border/70 bg-background/80 p-3 text-xs leading-relaxed text-muted-foreground">
                {notification.meta}
              </p>
            )}
            <div className="text-xs text-muted-foreground/80">
              {new Date(notification.createdAt).toLocaleString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
                day: 'numeric',
                month: 'short',
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => {
              // TODO: Wire up contextual navigation for each notification type (articles, profiles, etc.)
              navigate('/')
            }}
          >
            {t('notifications.view')}
          </Button>
          <Button
            variant={notification.isUnread ? 'default' : 'outline'}
            size="icon"
            className="h-8 w-8"
            onClick={handleMarkRead}
            disabled={!notification.isUnread}
            aria-label={notification.isUnread ? t('notifications.markAsRead') : t('notifications.alreadyRead')}
          >
            <Check className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}


