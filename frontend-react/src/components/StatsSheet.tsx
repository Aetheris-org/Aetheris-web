import { useNavigate } from 'react-router-dom'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationsStore, selectUnreadCount } from '@/stores/notificationsStore'
import { useGamificationStore } from '@/stores/gamificationStore'
import { Flame, Award, Bell, TrendingUp, Sparkles } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

interface StatsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StatsSheet({ open, onOpenChange }: StatsSheetProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuthStore((state) => ({
    user: state.user,
  }))
  const unreadNotifications = useNotificationsStore(selectUnreadCount)
  const { level, xpIntoLevel, xpForLevel, streakDays, experience } = useGamificationStore((state) => ({
    level: state.level,
    xpIntoLevel: state.xpIntoLevel,
    xpForLevel: state.xpForLevel,
    streakDays: state.streakDays,
    experience: state.experience,
  }))

  const xpProgress = xpForLevel > 0 ? Math.min(100, Math.round((xpIntoLevel / xpForLevel) * 100)) : 0
  const xpRemaining = Math.max(xpForLevel - xpIntoLevel, 0)

  const initials = user?.nickname
    ? user.nickname
        .split(' ')
        .map((part) => part.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('')
    : 'AU'

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[360px] sm:w-[420px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t('accountSheet.stats')}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Profile Summary */}
          <Card className="border border-border/60 bg-card/90 shadow-md">
            <CardContent className="p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border/60 bg-background text-base font-semibold text-primary">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.nickname} className="h-full w-full object-cover" />
                    ) : (
                      initials
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-semibold leading-tight text-foreground">{user?.nickname}</h2>
                    <p className="truncate text-xs text-muted-foreground">
                      {t('accountSheet.signedInAs')} {user?.email || '—'}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="ml-auto flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border-primary/50 px-3 py-1 text-xs text-primary">
                  <Award className="h-3 w-3" />
                  {t('accountSheet.level', { level })}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* XP Progress */}
          <Card className="border border-border/60 bg-card/90">
            <CardContent className="p-5 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  <span>{t('accountSheet.progressToNextLevel')}</span>
                  <span>{xpProgress}%</span>
                </div>
                <Progress value={xpProgress} className="h-2" />
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{t('accountSheet.xpProgress', { current: xpIntoLevel, total: xpForLevel })}</span>
                  <span>{t('accountSheet.xpRemaining', { xp: xpRemaining })}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid gap-3 sm:grid-cols-2">
            <Card className="border border-border/60 bg-card/90">
              <CardContent className="p-4">
                <div className="flex flex-col gap-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {t('accountSheet.dailyStreak')}
                  </p>
                  <p className="flex items-center gap-1 text-2xl font-semibold text-foreground">
                    <Flame className="h-5 w-5 text-primary" />
                    {t('accountSheet.days', { count: streakDays })}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {t('accountSheet.streakDescription')}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/60 bg-card/90">
              <CardContent className="p-4">
                <div className="flex flex-col gap-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {t('accountSheet.notifications')}
                  </p>
                  <p className="flex items-center gap-2 text-2xl font-semibold text-foreground">
                    <Bell className="h-5 w-5 text-primary" />
                    {unreadNotifications}
                  </p>
                  <SheetClose asChild>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-1 h-8 w-full justify-center rounded-md border border-primary/20 bg-muted/10 text-[11px] font-medium text-primary hover:bg-primary/15"
                      onClick={() => navigate('/notifications')}
                    >
                      {t('accountSheet.reviewInbox')}
                    </Button>
                  </SheetClose>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lifetime Experience */}
          <Card className="border border-border/60 bg-card/90">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                    {t('accountSheet.lifetimeExperience')}
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {experience} XP
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary/50" />
              </div>
            </CardContent>
          </Card>

          {/* Achievements Preview */}
          <SheetClose asChild>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => navigate('/achievements')}
            >
              <Sparkles className="h-4 w-4" />
              {t('accountSheet.viewAchievements')}
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  )
}





