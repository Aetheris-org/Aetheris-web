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
  Sparkles,
  User,
  Flame,
  Award,
  Users,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationsStore, selectUnreadCount } from '@/stores/notificationsStore'
import { selectReadingListCount, useReadingListStore } from '@/stores/readingListStore'
import { useGamificationStore } from '@/stores/gamificationStore'
import { Progress } from '@/components/ui/progress'
import { FriendsSheet } from '@/components/FriendsSheet'

export function AccountSheet() {
  const navigate = useNavigate()
  const location = useLocation()
  const [friendsSheetOpen, setFriendsSheetOpen] = useState(false)
  const { user, logout } = useAuthStore((state) => ({
    user: state.user,
    logout: state.logout,
  }))
  const unreadNotifications = useNotificationsStore(selectUnreadCount)
  const readingListCount = useReadingListStore(selectReadingListCount)
  const { level, xpIntoLevel, xpForLevel, streakDays, experience } = useGamificationStore((state) => ({
    level: state.level,
    xpIntoLevel: state.xpIntoLevel,
    xpForLevel: state.xpForLevel,
    streakDays: state.streakDays,
    experience: state.experience,
  }))

  const xpProgress = xpForLevel > 0 ? Math.min(100, Math.round((xpIntoLevel / xpForLevel) * 100)) : 0
  const xpRemaining = Math.max(xpForLevel - xpIntoLevel, 0)

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
      console.error('Failed to logout:', error)
    }
  }

  if (!user) {
    return (
      <Button variant="outline" size="sm" onClick={() => navigate('/auth')}>
        Sign In
      </Button>
    )
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-border/60 bg-muted transition hover:border-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Open account menu"
        >
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.nickname}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-sm font-semibold text-primary">{initials}</span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[360px] sm:w-[420px] overflow-y-auto">
        <SheetHeader className="items-start space-y-2">
          <SheetTitle>Workspace hub</SheetTitle>
          <SheetDescription>
            Review your profile at a glance, jump back into writing, and manage your account.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <Card className="border border-border/60 bg-card/90 shadow-md">
            <CardContent className="space-y-5 p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border/60 bg-background text-base font-semibold text-primary">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.nickname} className="h-full w-full object-cover" />
                    ) : (
                      initials || 'AU'
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-semibold leading-tight text-foreground">{user.nickname}</h2>
                    <div className="group relative max-w-full">
                      <p
                        className="truncate text-xs text-muted-foreground"
                        title={user.email ? `Signed in as ${user.email}` : undefined}
                      >
                        Signed in as {user.email}
                      </p>
                      {user.email && (
                        <div className="pointer-events-none absolute left-0 top-full z-20 mt-1 w-max max-w-[280px] rounded-md border border-border/60 bg-card/95 px-2 py-1 text-[11px] font-medium text-foreground shadow-lg opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                          {user.email}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="ml-auto flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border-primary/50 px-3 py-1 text-xs text-primary">
                  <Award className="h-3 w-3" />
                  Level {level}
                </Badge>
              </div>

              <div className="space-y-3 rounded-xl border border-border/50 bg-background/70 p-4">
                <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  <span>Progress to next level</span>
                  <span>{xpProgress}%</span>
                </div>
                <Progress value={xpProgress} className="h-2" />
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>
                    {xpIntoLevel} / {xpForLevel} XP this level
                  </span>
                  <span>{xpRemaining} XP remaining</span>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-2 rounded-lg border border-border/50 bg-muted/10 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Daily streak
                  </p>
                  <p className="flex items-center gap-1 text-base font-semibold text-foreground">
                    <Flame className="h-4 w-4 text-primary" />
                    {streakDays} day{streakDays === 1 ? '' : 's'}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Stay consistent to keep rewards flowing.
                  </p>
                </div>
                <div className="flex flex-col gap-2 rounded-lg border border-border/50 bg-muted/10 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Notifications
                  </p>
                  <p className="flex items-center gap-2 text-base font-semibold text-foreground">
                    <Bell className="h-4 w-4 text-primary" />
                    {unreadNotifications}
                  </p>
                  <SheetClose asChild>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-1 h-8 w-full justify-center rounded-md border border-primary/20 bg-muted/10 text-[11px] font-medium text-primary hover:bg-primary/15 focus-visible:ring-1 focus-visible:ring-primary/30"
                      onClick={() => navigate('/notifications')}
                    >
                      Review inbox
                    </Button>
                  </SheetClose>
                </div>
              </div>

              <div className="rounded-lg border border-border/50 bg-muted/10 p-3 text-[11px] text-muted-foreground">
                <span className="font-medium text-foreground">Lifetime experience:</span>{' '}
                {experience} XP earned across Aetheris.
              </div>
            </CardContent>
          </Card>

          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Quick actions
            </h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <SheetClose asChild>
                <Button
                  className="justify-start gap-2"
                  onClick={() => navigate(`/profile/${user.id}`)}
                >
                  <User className="h-4 w-4" />
                  View profile
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button
                  variant="outline"
                  className="justify-start gap-2"
                  onClick={() => navigate('/create')}
                >
                  <PenSquare className="h-4 w-4" />
                  Write a story
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button
                  variant="outline"
                  className="justify-start gap-2"
                  onClick={() => setFriendsSheetOpen(true)}
                >
                  <Users className="h-4 w-4" />
                  Friends
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button
                  variant="outline"
                  className="justify-start gap-2"
                  onClick={() => navigate('/achievements')}
                >
                  <Sparkles className="h-4 w-4" />
                  Achievements
                </Button>
              </SheetClose>
            </div>
            <SheetClose asChild>
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() =>
                  navigate('/settings/profile', {
                    state: { from: location.pathname },
                  })
                }
              >
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </SheetClose>
          </section>

          <Separator />

          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Keep exploring
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
                    Reading list
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
                  Drafts
                </Button>
              </SheetClose>
              <Button
                variant="ghost"
                className="justify-start gap-2"
                onClick={() => navigate('/help')}
              >
                <HelpCircle className="h-4 w-4" />
                Help center
              </Button>
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
            Sign out
          </Button>
        </SheetFooter>
      </SheetContent>
      <FriendsSheet open={friendsSheetOpen} onOpenChange={setFriendsSheetOpen} />
    </Sheet>
  )
}

