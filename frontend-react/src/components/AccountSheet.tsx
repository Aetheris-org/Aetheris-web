import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Bell, PenSquare, Settings, User } from 'lucide-react'
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
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationsStore, selectUnreadCount } from '@/stores/notificationsStore'

export function AccountSheet() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore((state) => ({
    user: state.user,
    logout: state.logout,
  }))
  const unreadNotifications = useNotificationsStore(selectUnreadCount)

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
      <SheetContent side="right" className="w-[340px] sm:w-[400px]">
        <SheetHeader className="items-start space-y-3">
          <SheetTitle>Account overview</SheetTitle>
          <SheetDescription>
            Manage your profile, quickly create new content, and stay in control of your account.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="flex items-center gap-4 rounded-lg border border-dashed p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
              {initials || 'AU'}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium leading-tight text-muted-foreground">Signed in as</p>
              <p className="text-lg font-semibold text-foreground">{user.nickname}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">Quick actions</h3>
            <div className="grid gap-3">
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
                  variant="ghost"
                  className="justify-start gap-2"
                  onClick={() =>
                    navigate('/settings/profile', {
                      state: { from: location.pathname },
                    })
                  }
                >
                  <Settings className="h-4 w-4" />
                  Account settings
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button
                  variant="ghost"
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
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-muted-foreground">Appearance</p>
              <ThemeToggle />
            </div>
            <p className="text-xs text-muted-foreground">
              Switch between light and dark mode to match your workspace.
            </p>
          </div>
        </div>

        <SheetFooter className="pt-6">
          <Button variant="destructive" className="w-full" onClick={handleLogout}>
            Sign out
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

