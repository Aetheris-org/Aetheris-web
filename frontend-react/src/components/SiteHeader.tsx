import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ThemeToggle'
import { AccountSheet } from '@/components/AccountSheet'
import { cn } from '@/lib/utils'

const mainNav = [
  { label: 'Forum', path: '/' },
  { label: 'Networking', path: '/networking' },
  { label: 'Courses', path: '/courses' },
  { label: 'Developers', path: '/developers' },
]

export function SiteHeader() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="text-xl font-semibold tracking-tight"
            onClick={() => navigate('/')}
            aria-label="Go to Aetheris home"
          >
            Aetheris
          </button>

          <nav className="hidden items-center gap-1 md:flex">
            {mainNav.map((item) => {
              const isActive =
                item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.path)

              return (
                <Button
                  key={item.path}
                  asChild
                  variant={isActive ? 'secondary' : 'ghost'}
                  size="sm"
                  className={cn('font-medium', isActive && 'shadow-sm')}
                >
                  <Link to={item.path}>{item.label}</Link>
                </Button>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <AccountSheet />
        </div>
      </div>
    </header>
  )
}

