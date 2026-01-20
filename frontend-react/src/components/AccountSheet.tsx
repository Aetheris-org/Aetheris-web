import { useState, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Bell,
  Bookmark,
  FileText,
  HelpCircle,
  LogOut,
  PenSquare,
  Settings,
  User,
  Flame,
  Award,
  Users,
  MessageSquare,
  TrendingUp,
  Sparkles,
} from 'lucide-react'
import { logger } from '@/lib/logger'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/stores/authStore'
import { useGamificationStore } from '@/stores/gamificationStore'
import { FriendsSheet } from '@/components/FriendsSheet'
import { StatsSheet } from '@/components/StatsSheet'
import { useTranslation } from '@/hooks/useTranslation'
import { useQuery } from '@tanstack/react-query'
import { getUnreadCount } from '@/api/notifications'
import { getBookmarksCount } from '@/api/bookmarks'
import { normalizeR2Url } from '@/lib/r2-url-helper'

export function AccountSheet() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [friendsSheetOpen, setFriendsSheetOpen] = useState(false)
  const [statsSheetOpen, setStatsSheetOpen] = useState(false)
  const { user, logout } = useAuthStore((state) => ({
    user: state.user,
    logout: state.logout,
  }))
  const { data: unreadNotifications = 0 } = useQuery({
    queryKey: ['notifications', 'unreadCount'],
    queryFn: getUnreadCount,
    enabled: !!user, // Запрашиваем только если пользователь авторизован
    staleTime: 1 * 60 * 1000, // 1 минута - счетчик обновляется чаще
    refetchOnMount: true, // Рефетчить при монтировании, если данные устарели
    refetchOnWindowFocus: true, // Рефетчить при фокусе окна, если данные устарели
  })
  const { data: readingListCount = 0 } = useQuery({
    queryKey: ['bookmarks', 'count'],
    queryFn: getBookmarksCount,
    enabled: !!user, // Запрашиваем только если пользователь авторизован
    staleTime: 1 * 60 * 1000, // 1 минута - счетчик обновляется чаще
    refetchOnMount: true, // Рефетчить при монтировании, если данные устарели
    refetchOnWindowFocus: true, // Рефетчить при фокусе окна, если данные устарели
  })
  const { level, xpIntoLevel, xpForLevel, streakDays, achievements } = useGamificationStore((state) => ({
    level: state.level,
    xpIntoLevel: state.xpIntoLevel,
    xpForLevel: state.xpForLevel,
    streakDays: state.streakDays,
    achievements: state.achievements,
  }))

  const unlockedAchievementsCount = achievements.filter((a) => a.unlocked).length

  const xpProgress = xpForLevel > 0 ? Math.min(100, Math.round((xpIntoLevel / xpForLevel) * 100)) : 0

  const initials = useMemo(() => {
    if (!user?.nickname) return ''
    return user.nickname
      .split(' ')
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('')
  }, [user?.nickname])

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      logger.error('Failed to logout:', error)
    }
  }

  if (!user) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => {
          const currentPath = location.pathname + location.search
          logger.debug('🔐 Sign in clicked, current path:', currentPath)
          // Не сохраняем redirect если уже на странице авторизации
          if (currentPath !== '/auth' && currentPath !== '/auth?') {
            const redirectUrl = `/auth?redirect=${encodeURIComponent(currentPath)}`
            logger.debug('🔗 Navigating to auth with redirect:', redirectUrl)
            navigate(redirectUrl)
          } else {
            logger.debug('🔗 Navigating to auth without redirect')
            navigate('/auth')
          }
        }}
        className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm whitespace-nowrap"
      >
        {t('accountSheet.signIn')}
      </Button>
    )
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          className="relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center overflow-hidden rounded-full border border-border/60 bg-muted transition hover:border-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shrink-0"
          aria-label={t('accountSheet.openMenu')}
        >
          {user.avatar ? (
            <img
              key={user.avatar}
              src={(() => { const u = normalizeR2Url(user.avatar) || user.avatar; const sep = u && u.includes('?') ? '&' : '?'; return `${u || ''}${sep}v=${user.updatedAt || ''}`; })()}
              alt={user.nickname}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-xs sm:text-sm font-semibold text-primary">{initials}</span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[360px] sm:w-[420px] overflow-y-auto [&>button]:hidden">
        <div className="space-y-6">
          {/* Compact Profile */}
          <div className="flex items-center justify-between gap-3 pb-4 border-b border-border/60">
            <SheetClose asChild>
              <button
                type="button"
                onClick={() => navigate(`/profile/${user.uuid || user.id}`)}
                className="flex min-w-0 flex-1 items-center gap-3 rounded-md p-1 transition-colors hover:bg-muted/50 text-left"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border/60 bg-background text-sm font-semibold text-primary">
                  {user.avatar ? (
                    <img
                      key={user.avatar}
                      src={(() => { const u = normalizeR2Url(user.avatar) || user.avatar; const sep = u && u.includes('?') ? '&' : '?'; return `${u || ''}${sep}v=${user.updatedAt || ''}`; })()}
                      alt={user.nickname}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials || 'AU'
                  )}
                </div>
                <h2 className="truncate text-sm font-semibold leading-tight text-foreground">{user.nickname}</h2>
              </button>
            </SheetClose>
            <Badge variant="outline" className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border-primary/50 px-2.5 py-1 text-xs text-primary">
              <Award className="h-3 w-3" />
              {level}
            </Badge>
          </div>

          {/* Quick Stats Preview: XP, стрик, уведомления */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setStatsSheetOpen(true)}
              className="flex flex-col items-center gap-1.5 rounded-md border border-border/60 bg-background p-3 hover:bg-muted/50 transition-colors"
            >
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">{xpProgress}%</span>
              <span className="text-[10px] text-muted-foreground">XP</span>
            </button>
            <button
              onClick={() => setStatsSheetOpen(true)}
              className="flex flex-col items-center gap-1.5 rounded-md border border-border/60 bg-background p-3 hover:bg-muted/50 transition-colors"
            >
              <Flame className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">{streakDays}</span>
              <span className="text-[10px] text-muted-foreground">{t('accountSheet.days', { count: streakDays })}</span>
            </button>
            <SheetClose asChild>
              <button
                onClick={() => navigate('/notifications')}
                className="relative flex flex-col items-center gap-1.5 rounded-md border border-border/60 bg-background p-3 hover:bg-muted/50 transition-colors"
              >
                <Bell className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">{unreadNotifications}</span>
                <span className="text-[10px] text-muted-foreground">{t('accountSheet.notifications')}</span>
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </button>
            </SheetClose>
          </div>

          {/* View Full Stats Button */}
          <Button
            variant="outline"
            className="w-full gap-2 border-border/60"
            onClick={() => setStatsSheetOpen(true)}
          >
            <TrendingUp className="h-4 w-4" />
            {t('accountSheet.viewStats')}
          </Button>

          {/* Quick Actions */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t('accountSheet.quickActions')}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <SheetClose asChild>
                <Button
                  className="justify-start gap-2"
                  onClick={() => navigate(`/profile/${user.uuid || user.id}`)}
                >
                  <User className="h-4 w-4" />
                  {t('accountSheet.viewProfile')}
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button
                  variant="outline"
                  className="justify-start gap-2"
                  onClick={() => navigate('/create')}
                >
                  <PenSquare className="h-4 w-4" />
                  {t('accountSheet.writeStory')}
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button
                  variant="outline"
                  className="justify-start gap-2 border-dashed border-muted-foreground/40 opacity-20 hover:opacity-100 transition-opacity"
                  onClick={() => setFriendsSheetOpen(true)}
                >
                  <Users className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-left truncate">{t('accountSheet.friends')}</span>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button
                  variant="outline"
                  className="justify-start gap-2"
                  onClick={() =>
                    navigate('/settings/profile', {
                      state: { from: location.pathname },
                    })
                  }
                >
                  <Settings className="h-4 w-4" />
                  {t('accountSheet.settings')}
                </Button>
              </SheetClose>
            </div>
            <SheetClose asChild>
              <Button
                variant="outline"
                className="w-full justify-center gap-2 border-border/60"
                onClick={() => navigate('/achievements')}
              >
                <Sparkles className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-center truncate">{t('accountSheet.viewAchievements')}</span>
                {unlockedAchievementsCount > 0 && (
                  <Badge variant="secondary" className="rounded-full px-2 py-0 text-xs">
                    {unlockedAchievementsCount}
                  </Badge>
                )}
              </Button>
            </SheetClose>
          </section>

          <Separator />

          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t('accountSheet.keepExploring')}
            </h3>
            <div className="grid gap-2">
              <SheetClose asChild>
                <Button
                  variant="ghost"
                  className="justify-between gap-2"
                  onClick={() => navigate('/reading-list')}
                >
                  <span className="flex items-center gap-2">
                    <Bookmark className="h-4 w-4" />
                    {t('accountSheet.readingList')}
                  </span>
                  {readingListCount > 0 && (
                    <Badge variant="secondary" className="rounded-md px-2 py-0 text-xs font-medium">
                      {readingListCount}
                    </Badge>
                  )}
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button
                  variant="ghost"
                  className="justify-start gap-2"
                  onClick={() => navigate('/drafts')}
                >
                  <FileText className="h-4 w-4" />
                  {t('accountSheet.drafts')}
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button
                  variant="ghost"
                  className="justify-start gap-2 border-dashed border-muted-foreground/30 opacity-20 hover:opacity-100 transition-opacity"
                  onClick={() => navigate('/feedback')}
                >
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-left truncate">{t('accountSheet.feedback')}</span>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button
                  variant="ghost"
                  className="justify-start gap-2 border-dashed border-muted-foreground/30 opacity-20 hover:opacity-100 transition-opacity"
                  onClick={() => navigate('/help')}
                >
                  <HelpCircle className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-left truncate">{t('accountSheet.helpCenter')}</span>
                </Button>
              </SheetClose>
            </div>
          </section>
        </div>

        <SheetFooter className="mt-8 border-t border-border/60 pt-6">
          <Button 
            variant="outline" 
            className="w-full gap-2 border-border/60 hover:bg-muted/50 hover:border-border" 
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            {t('accountSheet.signOut')}
          </Button>
        </SheetFooter>
      </SheetContent>
      <FriendsSheet open={friendsSheetOpen} onOpenChange={setFriendsSheetOpen} />
      <StatsSheet open={statsSheetOpen} onOpenChange={setStatsSheetOpen} />
    </Sheet>
  )
}

