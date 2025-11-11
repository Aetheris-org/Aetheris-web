import { useLocation, useNavigate } from 'react-router-dom'
import { Compass, MessageSquare, UsersRound, GraduationCap, Code2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ThemeToggle'
import { AccountSheet } from '@/components/AccountSheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const destinations = [
  {
    label: 'Forum',
    description: 'Community debates, retrospectives, and shipping notes.',
    icon: MessageSquare,
    path: '/',
  },
  {
    label: 'Networking',
    description: 'Opportunities, mentors, and verified partner teams.',
    icon: UsersRound,
    path: '/networking',
  },
  {
    label: 'Courses',
    description: 'Guided tracks, workshops, and cohort-based learning.',
    icon: GraduationCap,
    path: '/courses',
  },
  {
    label: 'Developers',
    description: 'Toolkits, changelog, and integration playbooks.',
    icon: Code2,
    path: '/developers',
  },
]

export function SiteHeader() {
  const location = useLocation()
  const navigate = useNavigate()

  const activeDestination = destinations.find((item) =>
    item.path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(item.path)
  )
  const ActiveIcon = activeDestination?.icon ?? Compass

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="text-xl font-semibold tracking-tight"
            onClick={() => navigate('/')}
            aria-label="Go to Aetheris home"
          >
            Aetheris
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                aria-label="Select section"
              >
                <ActiveIcon className="h-4 w-4" />
                {activeDestination?.label ?? 'Explore'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72" align="start">
              <DropdownMenuLabel className="text-xs uppercase tracking-wide text-muted-foreground">
                Navigate to a section
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {destinations
              .filter((item) =>
                activeDestination ? item.path !== activeDestination.path : true
              )
              .map((item) => {
                const Icon = item.icon
                return (
                  <DropdownMenuItem
                    key={item.path}
                    className="flex items-start gap-3 rounded-lg py-3 focus:bg-muted"
                    onSelect={(event) => {
                      event.preventDefault()
                      navigate(item.path)
                    }}
                  >
                    <Icon className="mt-0.5 h-4 w-4 text-foreground" />
                    <span className="flex flex-col gap-1">
                      <span className="text-sm font-semibold leading-tight text-foreground">{item.label}</span>
                      <span className="text-xs text-muted-foreground">{item.description}</span>
                    </span>
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <AccountSheet />
        </div>
      </div>
    </header>
  )
}

