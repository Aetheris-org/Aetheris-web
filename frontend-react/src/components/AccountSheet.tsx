import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Bell,
  Bookmark,
  BookOpen,
  HelpCircle,
  LogOut,
  Palette,
  PenSquare,
  Settings,
  Shield,
  Sparkles,
  User,
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationsStore, selectUnreadCount } from '@/stores/notificationsStore'
import {
  selectReadingListCount,
  useReadingListStore,
} from '@/stores/readingListStore'

export function AccountSheet() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore((state) => ({
    user: state.user,
    logout: state.logout,
  }))
  const unreadNotifications = useNotificationsStore(selectUnreadCount)
  const readingListCount = useReadingListStore(selectReadingListCount)

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
          <Card className="border border-border/60 bg-gradient-to-br from-primary/8 via-primary/5 to-transparent">
            <CardContent className="flex flex-col gap-4 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border/60 bg-background text-lg font-semibold text-primary">
                  {initials || 'AU'}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold tracking-tight text-foreground">
                      {user.nickname}
                    </h2>
                    <Badge variant="secondary" className="gap-1">
                      <Sparkles className="h-3 w-3" />
                      {user.role === 'admin' ? 'Admin' : 'Creator'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Signed in as {user.email}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="gap-1">
                      <PenSquare className="h-3 w-3" />
                      {user.articlesCount ?? 0} articles
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Sparkles className="h-3 w-3 text-primary" />
                      Reputation {user.reputation ?? 0}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  {
                    label: 'Followers',
                    value: user.followersCount ?? 0,
                  },
                  {
                    label: 'Reactions',
                    value: user.likesReceived ?? 0,
                  },
                  {
                    label: 'Views',
                    value: user.viewsReceived ?? 0,
                  },
                ].map((stat) => (
                  <Card key={stat.label} className="border border-border/40 bg-background/80 shadow-none">
                    <CardContent className="space-y-1 p-3">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        {stat.label}
                      </p>
                      <p className="text-lg font-semibold text-foreground">{stat.value}</p>
                    </CardContent>
                  </Card>
                ))}
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
                  variant="secondary"
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
              <SheetClose asChild>
                <Button
                  variant="outline"
                  className="justify-between gap-2"
                  onClick={() => navigate('/notifications')}
                >
                  <span className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Notifications
                  </span>
                  {unreadNotifications > 0 && (
                    <Badge variant="secondary" className="rounded-md px-2 py-0 text-xs font-medium">
                      {unreadNotifications}
                    </Badge>
                  )}
                </Button>
              </SheetClose>
            </div>
          </section>

          <Separator />

          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Workspace tools
            </h3>
            <Card className="border border-border/60 bg-muted/20">
              <CardContent className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Appearance</p>
                    <p className="text-xs text-muted-foreground">
                      Instantly switch between light and dark mode.
                    </p>
                  </div>
                  <ThemeToggle />
                </div>
                <SheetClose asChild>
                  <Button
                    variant="ghost"
                    className="justify-start gap-2"
                    onClick={() =>
                      navigate('/settings/appearance', {
                        state: { from: location.pathname },
                      })
                    }
                  >
                    <Palette className="h-4 w-4" />
                    Customize appearance
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button
                    variant="ghost"
                    className="justify-start gap-2"
                    onClick={() =>
                      navigate('/settings/privacy', {
                        state: { from: location.pathname },
                      })
                    }
                  >
                    <Shield className="h-4 w-4" />
                    Privacy preferences
                  </Button>
                </SheetClose>
              </CardContent>
            </Card>
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Activity highlights
            </h3>
            <Card className="border border-border/60 bg-card/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Recent notifications</CardTitle>
                <CardDescription>Quick glimpse at what&apos;s happening right now.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 p-4 pt-0">
                {[
                  {
                    title: 'New comment on your article',
                    excerpt: '“Loved the part about state machines. Have you tried ...”',
                  },
                  {
                    title: '2 new followers joined your audience',
                    excerpt: 'Stay in touch with your readers and keep them engaged.',
                  },
                ].map((item, index) => (
                  <div key={item.title} className="rounded-lg border border-border/50 bg-background/70 p-3">
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{item.excerpt}</p>
                  </div>
                ))}
                <SheetClose asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-center gap-2"
                    onClick={() => navigate('/notifications')}
                  >
                    <BookOpen className="h-4 w-4" />
                    Open notifications center
                  </Button>
                </SheetClose>
              </CardContent>
            </Card>
          </section>

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
              <Button
                variant="ghost"
                className="justify-start gap-2"
                onClick={() =>
                  window.open('https://docs.aetheris.dev/support', '_blank', 'noopener')
                }
              >
                <HelpCircle className="h-4 w-4" />
                Help center
              </Button>
            </div>
          </section>
        </div>

        <SheetFooter className="mt-8 border-t border-border/60 pt-6">
          <Button variant="destructive" className="w-full gap-2" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

